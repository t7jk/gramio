const API = 'api.php';

let currentUser = localStorage.getItem('englearn_user') || '';
let currentLesson = null;
let lessonQuestions = [];
let lessonIndex = 0;
let lessonTotal = 0;
let lessonLearned = 0;
let answered = false;
let lessonStartTime = 0;

// ---- DOM refs ----
const screenMenu   = document.getElementById('screen-menu');
const screenUsers  = document.getElementById('screen-users');
const screenLesson = document.getElementById('screen-lesson');
const userSelect   = document.getElementById('user-select');
const newUserInput = document.getElementById('new-user-input');
const lessonsList  = document.getElementById('lessons-list');
const btnGotoUsers = document.getElementById('btn-goto-users');
const lessonTitleBar = document.getElementById('lesson-title-bar');
const lessonProgress = document.getElementById('lesson-progress');
const progressBar  = document.getElementById('progress-bar');
const questionText = document.getElementById('question-text');
const answersGrid  = document.getElementById('answers-grid');
const feedback     = document.getElementById('feedback');
const btnNext      = document.getElementById('btn-next');
const questionArea = document.getElementById('question-area');
const lessonDone   = document.getElementById('lesson-done');
const modalProfile = document.getElementById('modal-profile');

// ---- Utilities ----
async function api(action, params = {}, body = null) {
  const qs = new URLSearchParams({ action, ...params }).toString();
  const opts = body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {};
  const res = await fetch(`${API}?${qs}`, opts);
  return res.json();
}

function showScreen(name) {
  screenMenu.classList.toggle('active',   name === 'menu');
  screenUsers.classList.toggle('active',  name === 'users');
  screenLesson.classList.toggle('active', name === 'lesson');
}

const btnProfile = document.getElementById('btn-profile');
const btnLogout  = document.getElementById('btn-logout');

function updateUserBtn() {
  btnGotoUsers.textContent = currentUser || 'Users';
  btnProfile.disabled = !currentUser;
  btnLogout.disabled  = !currentUser;
}

// ---- Users ----
async function loadUsers() {
  const users = await api('users');
  userSelect.innerHTML = '<option value="">-- select --</option>';
  users.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u;
    opt.textContent = u;
    if (u === currentUser) opt.selected = true;
    userSelect.appendChild(opt);
  });
  updateUserBtn();
  if (currentUser) loadLessons();
}

userSelect.addEventListener('change', () => {
  currentUser = userSelect.value;
  localStorage.setItem('englearn_user', currentUser);
  updateUserBtn();
});

document.getElementById('btn-add-user').addEventListener('click', async () => {
  const name = newUserInput.value.trim();
  if (!name) return;
  const r = await api('create_user', {}, { name });
  if (r.error) { alert('Error: ' + r.error); return; }
  newUserInput.value = '';
  currentUser = name;
  localStorage.setItem('englearn_user', currentUser);
  await loadUsers();
});

document.getElementById('btn-delete-user').addEventListener('click', async () => {
  if (!currentUser) { alert('Wybierz użytkownika.'); return; }
  if (!confirm(`Delete user "${currentUser}"?`)) return;
  await api('delete_user', {}, { name: currentUser });
  currentUser = '';
  localStorage.removeItem('englearn_user');
  await loadUsers();
  lessonsList.innerHTML = '<p class="hint">Select a user to see progress.</p>';
});

btnGotoUsers.addEventListener('click', () => showScreen('users'));

document.getElementById('btn-logout').addEventListener('click', () => {
  currentUser = '';
  localStorage.removeItem('englearn_user');
  updateUserBtn();
  lessonsList.innerHTML = '<p class="hint">Select a user to see progress.</p>';
  showScreen('menu');
});

document.getElementById('btn-users-back').addEventListener('click', () => {
  loadLessons();
  showScreen('menu');
});

// ---- Lessons ----
async function loadLessons() {
  if (!currentUser) {
    lessonsList.innerHTML = '<p class="hint">Select a user to see progress.</p>';
    return;
  }
  const lessons = await api('lessons', { user: currentUser });
  lessonsList.innerHTML = '';
  lessons.forEach(l => {
    const done = l.learned >= l.total;
    const pct = l.total > 0 ? Math.round((l.learned / l.total) * 100) : 0;
    const badge = done
      ? '<span class="lesson-badge">Done</span>'
      : (l.learned === 0
          ? '<span class="lesson-badge not-started">New</span>'
          : `<span class="lesson-badge">${pct}%</span>`);

    const card = document.createElement('div');
    card.className = 'lesson-card' + (done ? ' done' : '');
    card.innerHTML = `
      <div class="lesson-info">
        <div class="lesson-name">${l.title}</div>
        <div class="lesson-stats">${l.learned} / ${l.total}</div>
      </div>
      ${badge}
      <div class="lesson-actions">
        <button class="btn btn-sm btn-primary start-btn" data-file="${l.file}" data-title="${l.title}" ${done ? 'disabled' : ''}>Start</button>
        <button class="btn btn-sm btn-outline reset-btn" data-title="${l.title}">↺</button>
      </div>`;
    lessonsList.appendChild(card);
  });

  lessonsList.querySelectorAll('.start-btn').forEach(btn => {
    btn.addEventListener('click', () => startLesson(btn.dataset.file, btn.dataset.title));
  });
  lessonsList.querySelectorAll('.reset-btn').forEach(btn => {
    btn.addEventListener('click', () => resetLesson(btn.dataset.title));
  });
}

async function resetLesson(title) {
  if (!currentUser) return;
  if (!confirm(`Reset progress for "${title}"?`)) return;
  await api('reset_lesson', {}, { user: currentUser, lesson: title });
  loadLessons();
}

// ---- Lesson flow ----
async function startLesson(file, title) {
  const data = await api('lesson', { name: file, user: currentUser });
  if (!data.questions || data.questions.length === 0) {
    alert('No questions left in this lesson!');
    return;
  }
  currentLesson = { file, title };
  lessonQuestions = data.questions;
  lessonIndex = 0;
  lessonTotal = data.total;
  lessonLearned = data.learned;

  lessonStartTime = Date.now();
  lessonTitleBar.textContent = title;
  questionArea.classList.remove('hidden');
  lessonDone.classList.add('hidden');
  showScreen('lesson');
  showQuestion();
}

let keyHandler = null;

function showQuestion() {
  if (lessonIndex >= lessonQuestions.length) { showDone(); return; }
  const q = lessonQuestions[lessonIndex];
  answered = false;

  const remaining = lessonQuestions.length - lessonIndex;
  lessonProgress.textContent = `${remaining} left`;
  progressBar.style.width = (((lessonTotal - remaining) / lessonTotal) * 100) + '%';

  questionText.textContent = q.question;
  answersGrid.innerHTML = '';
  feedback.className = 'feedback hidden';
  btnNext.classList.add('hidden');

  const shuffled = q.answers.map((a, i) => ({ text: a, idx: i }));
  shuffled.sort(() => Math.random() - 0.5);

  shuffled.forEach(({ text, idx }) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = text;
    btn.addEventListener('click', () => handleAnswer(idx === q.correct, idx, q));
    answersGrid.appendChild(btn);
  });

  if (keyHandler) document.removeEventListener('keydown', keyHandler);
  keyHandler = (e) => {
    const n = { '1': 0, '2': 1, '3': 2 }[e.key];
    if (n === undefined) return;
    const btns = answersGrid.querySelectorAll('.answer-btn');
    if (btns[n]) btns[n].click();
  };
  document.addEventListener('keydown', keyHandler);
}

async function handleAnswer(correct, chosenIdx, q) {
  if (answered) return;
  answered = true;
  if (keyHandler) { document.removeEventListener('keydown', keyHandler); keyHandler = null; }

  const buttons = answersGrid.querySelectorAll('.answer-btn');
  buttons.forEach(b => b.disabled = true);

  const chosen     = [...buttons].find(b => b.textContent === q.answers[chosenIdx]);
  const correctBtn = [...buttons].find(b => b.textContent === q.answers[q.correct]);

  if (correct) {
    chosen.classList.add('correct');
    buttons.forEach(b => { if (b !== chosen) b.classList.add('hidden'); });
    feedback.textContent = '✓ Correct!';
    feedback.className = 'feedback correct-msg';
  } else {
    chosen.classList.add('wrong');
    correctBtn.classList.add('correct');
    feedback.textContent = `✗ Wrong! Correct: "${q.answers[q.correct]}"`;
    feedback.className = 'feedback wrong-msg';
  }

  await api('answer', {}, { user: currentUser, lesson: currentLesson.title, question_id: q.id, correct });

  if (correct) {
    lessonLearned++;
    lessonQuestions.splice(lessonIndex, 1);
  } else {
    lessonIndex++;
    if (lessonIndex >= lessonQuestions.length) lessonIndex = 0;
  }

  if (lessonQuestions.length === 0) {
    if (correct) setTimeout(showDone, 3000); else showDone();
  } else if (correct) {
    setTimeout(() => { btnNext.classList.add('hidden'); showQuestion(); }, 3000);
  } else {
    btnNext.classList.remove('hidden');
  }
}

btnNext.addEventListener('click', () => {
  btnNext.classList.add('hidden');
  showQuestion();
});

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

async function showDone() {
  const elapsed = Date.now() - lessonStartTime;
  await api('lesson_complete', {}, { user: currentUser, lesson: currentLesson.title, time_ms: elapsed });
  questionArea.classList.add('hidden');
  lessonDone.classList.remove('hidden');
  progressBar.style.width = '100%';
  lessonProgress.textContent = 'Complete!';
}

document.getElementById('btn-back').addEventListener('click', () => {
  showScreen('menu');
  loadLessons();
});

document.getElementById('btn-done-back').addEventListener('click', () => {
  showScreen('menu');
  loadLessons();
});

// ---- Profile modal ----
document.getElementById('btn-profile').addEventListener('click', async () => {
  const data = await api('profile', { user: currentUser });
  document.getElementById('profile-name').textContent = data.name;
  document.getElementById('profile-points').textContent = `Total points: ${data.points} | Total time: ${formatTime(data.total_time_ms || 0)}`;
  const tbody = document.querySelector('#profile-table tbody');
  tbody.innerHTML = '';
  data.stats.forEach(s => {
    const pct = s.total > 0 ? Math.round((s.learned / s.total) * 100) : 0;
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${s.title}</td><td>${s.total}</td><td>${s.learned}</td><td>${pct}%</td><td>${formatTime(s.time_ms || 0)}</td>`;
    tbody.appendChild(tr);
  });
  modalProfile.classList.remove('hidden');
});

document.getElementById('btn-close-profile').addEventListener('click', () => {
  modalProfile.classList.add('hidden');
});

modalProfile.addEventListener('click', e => {
  if (e.target === modalProfile) modalProfile.classList.add('hidden');
});

// ---- Init ----
loadUsers();
