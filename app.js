const API = 'api.php';

let currentUser = localStorage.getItem('englearn_user') || '';
let currentLesson = null;
let lessonQuestions = [];
let lessonIndex = 0;
let lessonTotal = 0;
let lessonLearned = 0;
let answered = false;

// ---- DOM refs ----
const screenMenu = document.getElementById('screen-menu');
const screenLesson = document.getElementById('screen-lesson');
const userSelect = document.getElementById('user-select');
const newUserInput = document.getElementById('new-user-input');
const lessonsList = document.getElementById('lessons-list');
const lessonTitleBar = document.getElementById('lesson-title-bar');
const lessonProgress = document.getElementById('lesson-progress');
const progressBar = document.getElementById('progress-bar');
const questionText = document.getElementById('question-text');
const answersGrid = document.getElementById('answers-grid');
const feedback = document.getElementById('feedback');
const btnNext = document.getElementById('btn-next');
const questionArea = document.getElementById('question-area');
const lessonDone = document.getElementById('lesson-done');
const modalProfile = document.getElementById('modal-profile');

// ---- Utilities ----
async function api(action, params = {}, body = null) {
  const qs = new URLSearchParams({ action, ...params }).toString();
  const opts = body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {};
  const res = await fetch(`${API}?${qs}`, opts);
  return res.json();
}

function showScreen(name) {
  screenMenu.classList.toggle('active', name === 'menu');
  screenLesson.classList.toggle('active', name === 'lesson');
}

// ---- Users ----
async function loadUsers() {
  const users = await api('users');
  userSelect.innerHTML = '<option value="">-- wybierz użytkownika --</option>';
  users.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u;
    opt.textContent = u;
    if (u === currentUser) opt.selected = true;
    userSelect.appendChild(opt);
  });
  if (currentUser) loadLessons();
}

userSelect.addEventListener('change', () => {
  currentUser = userSelect.value;
  localStorage.setItem('englearn_user', currentUser);
  loadLessons();
});

document.getElementById('btn-add-user').addEventListener('click', async () => {
  const name = newUserInput.value.trim();
  if (!name) return;
  const r = await api('create_user', {}, { name });
  if (r.error) { alert(r.error); return; }
  newUserInput.value = '';
  currentUser = name;
  localStorage.setItem('englearn_user', currentUser);
  await loadUsers();
});

document.getElementById('btn-delete-user').addEventListener('click', async () => {
  if (!currentUser) { alert('Wybierz użytkownika.'); return; }
  if (!confirm(`Usunąć użytkownika "${currentUser}"?`)) return;
  await api('delete_user', {}, { name: currentUser });
  currentUser = '';
  localStorage.removeItem('englearn_user');
  await loadUsers();
  lessonsList.innerHTML = '<p class="hint">Wybierz użytkownika, aby zobaczyć postęp.</p>';
});

// ---- Lessons ----
async function loadLessons() {
  if (!currentUser) { lessonsList.innerHTML = '<p class="hint">Wybierz użytkownika, aby zobaczyć postęp.</p>'; return; }
  const lessons = await api('lessons', { user: currentUser });
  lessonsList.innerHTML = '';
  lessons.forEach(l => {
    const done = l.learned >= l.total;
    const card = document.createElement('div');
    card.className = 'lesson-card' + (done ? ' done' : '');

    const pct = l.total > 0 ? Math.round((l.learned / l.total) * 100) : 0;
    const badge = done
      ? '<span class="lesson-badge">Ukończona ✓</span>'
      : (l.learned === 0 ? '<span class="lesson-badge not-started">Nowa</span>' : `<span class="lesson-badge" style="background:#0ea5e9">${pct}%</span>`);

    card.innerHTML = `
      <div class="lesson-info">
        <div class="lesson-name">${l.title}</div>
        <div class="lesson-stats">Nauczonych: ${l.learned} / ${l.total}</div>
      </div>
      ${badge}
      <div class="lesson-actions">
        <button class="btn btn-sm btn-primary start-btn" data-file="${l.file}" data-title="${l.title}" ${done ? 'disabled' : ''}>Start</button>
        <button class="btn btn-sm btn-outline reset-btn" data-title="${l.title}" title="Resetuj postęp">↺</button>
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
  if (!confirm(`Skasować postęp lekcji "${title}"?`)) return;
  await api('reset_lesson', {}, { user: currentUser, lesson: title });
  loadLessons();
}

// ---- Lesson flow ----
async function startLesson(file, title) {
  const data = await api('lesson', { name: file, user: currentUser });
  if (!data.questions || data.questions.length === 0) {
    alert('Brak pytań do nauki w tej lekcji!');
    return;
  }
  currentLesson = { file, title };
  lessonQuestions = data.questions;
  lessonIndex = 0;
  lessonTotal = data.total;
  lessonLearned = data.learned;

  lessonTitleBar.textContent = title;
  questionArea.classList.remove('hidden');
  lessonDone.classList.add('hidden');
  showScreen('lesson');
  showQuestion();
}

function showQuestion() {
  if (lessonIndex >= lessonQuestions.length) {
    showDone();
    return;
  }
  const q = lessonQuestions[lessonIndex];
  answered = false;

  const remaining = lessonQuestions.length - lessonIndex;
  lessonProgress.textContent = `${remaining} pozostało`;
  const learnedNow = lessonTotal - remaining;
  progressBar.style.width = ((learnedNow / lessonTotal) * 100) + '%';

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
}

async function handleAnswer(correct, chosenIdx, q) {
  if (answered) return;
  answered = true;

  const buttons = answersGrid.querySelectorAll('.answer-btn');
  buttons.forEach(b => b.disabled = true);

  const chosen = [...buttons].find(b => b.textContent === q.answers[chosenIdx]);
  const correctBtn = [...buttons].find(b => b.textContent === q.answers[q.correct]);

  if (correct) {
    chosen.classList.add('correct');
    feedback.textContent = '✓ Poprawna odpowiedź!';
    feedback.className = 'feedback correct-msg';
  } else {
    chosen.classList.add('wrong');
    correctBtn.classList.add('correct');
    feedback.textContent = `✗ Błąd! Poprawna: "${q.answers[q.correct]}"`;
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
    setTimeout(showDone, 1200);
  } else {
    btnNext.classList.remove('hidden');
  }
}

btnNext.addEventListener('click', () => {
  btnNext.classList.add('hidden');
  showQuestion();
});

function showDone() {
  questionArea.classList.add('hidden');
  lessonDone.classList.remove('hidden');
  progressBar.style.width = '100%';
  lessonProgress.textContent = 'Ukończona!';
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
  if (!currentUser) { alert('Wybierz użytkownika.'); return; }
  const data = await api('profile', { user: currentUser });
  document.getElementById('profile-name').textContent = data.name;
  document.getElementById('profile-points').textContent = `Punkty łącznie: ${data.points}`;
  const tbody = document.querySelector('#profile-table tbody');
  tbody.innerHTML = '';
  data.stats.forEach(s => {
    const pct = s.total > 0 ? Math.round((s.learned / s.total) * 100) : 0;
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${s.title}</td><td>${s.total}</td><td>${s.learned}</td><td>${pct}%</td>`;
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
