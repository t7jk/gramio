const API = 'api.php';
const GUEST_STORAGE_KEY = 'englearn_guest_profile';
const GUEST_COOKIE = 'englearn_guest';

const PIN_DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

let isLoggedIn = false;
let currentLesson = null;
let lessonQuestions = [];
let lessonIndex = 0;
let lessonTotal = 0;
let lessonLearned = 0;
let answered = false;
let lessonStartTime = 0;

const registerPin = [null, null, null, null];
const loginPin = [null, null, null, null];
let loginUserName = '';

// ---- DOM ----
const screenMenu = document.getElementById('screen-menu');
const screenRegister = document.getElementById('screen-register');
const screenLogin = document.getElementById('screen-login');
const screenLesson = document.getElementById('screen-lesson');
const screenProfile = document.getElementById('screen-profile');

const authBarGuest = document.getElementById('auth-bar-guest');
const authBarUser = document.getElementById('auth-bar-user');

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
const theoryView = document.getElementById('theory-view');
const examplesView = document.getElementById('examples-view');
const theoryText = document.getElementById('theory-text');
const examplesList = document.getElementById('examples-list');
const registerPinGrid = document.getElementById('register-pin-grid');
const registerPinPreview = document.getElementById('register-pin-preview');
const loginPinGrid = document.getElementById('login-pin-grid');
const loginPinPreview = document.getElementById('login-pin-preview');

// ---- Guest profile (mirrors server profile shape) ----
function emptyGuestProfile() {
  return { name: '', lessons: {}, points: 0, total_time_ms: 0 };
}

function normalizeGuestProfile(p) {
  if (!p || typeof p !== 'object') return emptyGuestProfile();
  return {
    name: typeof p.name === 'string' ? p.name : '',
    lessons: p.lessons && typeof p.lessons === 'object' ? p.lessons : {},
    points: Number(p.points) || 0,
    total_time_ms: Number(p.total_time_ms) || 0,
  };
}

function loadGuestProfile() {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    if (raw) return normalizeGuestProfile(JSON.parse(raw));
  } catch (_) { /* ignore */ }
  try {
    const m = document.cookie.match(/(?:^|; )englearn_guest=([^;]*)/);
    if (m) {
      const decoded = decodeURIComponent(m[1]);
      const p = normalizeGuestProfile(JSON.parse(decoded));
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(p));
      return p;
    }
  } catch (_) { /* ignore */ }
  return emptyGuestProfile();
}

function saveGuestProfile(profile) {
  const p = normalizeGuestProfile(profile);
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(p));
  try {
    const s = JSON.stringify(p);
    if (s.length < 3500) {
      document.cookie =
        `${GUEST_COOKIE}=${encodeURIComponent(s)}; path=/; SameSite=Lax; max-age=${86400 * 365}`;
    }
  } catch (_) { /* ignore */ }
}

function clearGuestStorage() {
  localStorage.removeItem(GUEST_STORAGE_KEY);
  document.cookie = `${GUEST_COOKIE}=; path=/; max-age=0`;
}

function ensureGuestLesson(g, title) {
  if (!g.lessons[title]) g.lessons[title] = { learned: [], points: 0, time_ms: 0 };
  return g.lessons[title];
}

// ---- API ----
async function api(action, params = {}, body = null) {
  const qs = new URLSearchParams({ action, ...params }).toString();
  const opts = body
    ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    : {};
  const res = await fetch(`${API}?${qs}`, { ...opts, credentials: 'same-origin' });
  return res.json();
}

async function whoami() {
  const r = await api('whoami');
  return r.user || null;
}

function showScreen(name) {
  screenMenu.classList.toggle('active', name === 'menu');
  screenRegister.classList.toggle('active', name === 'register');
  screenLogin.classList.toggle('active', name === 'login');
  screenLesson.classList.toggle('active', name === 'lesson');
  screenProfile.classList.toggle('active', name === 'profile');
}

function updateAuthChrome() {
  authBarGuest.classList.toggle('hidden', isLoggedIn);
  authBarUser.classList.toggle('hidden', !isLoggedIn);
}

function pinPreview(pin) {
  return pin.map((d) => (d == null ? '·' : d)).join('');
}

function pinString(pin) {
  if (pin.some((d) => d == null)) return null;
  return pin.join('');
}

function renderPinGrid(container, pin, onChange) {
  container.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'pin-grid-cols';
  for (let col = 0; col < 4; col++) {
    const colEl = document.createElement('div');
    colEl.className = 'pin-col';
    PIN_DIGITS.forEach((d) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pin-key';
      if (pin[col] === d) btn.classList.add('selected');
      btn.textContent = d;
      btn.addEventListener('click', () => {
        pin[col] = d;
        onChange();
      });
      colEl.appendChild(btn);
    });
    wrap.appendChild(colEl);
  }
  container.appendChild(wrap);
}

function refreshRegisterPinUI() {
  renderPinGrid(registerPinGrid, registerPin, () => refreshRegisterPinUI());
  registerPinPreview.textContent = pinPreview(registerPin);
}

function refreshLoginPinUI() {
  renderPinGrid(loginPinGrid, loginPin, () => refreshLoginPinUI());
  loginPinPreview.textContent = pinPreview(loginPin);
}

function setAuthError(el, msg) {
  if (!msg) {
    el.classList.add('hidden');
    el.textContent = '';
    return;
  }
  el.textContent = msg;
  el.classList.remove('hidden');
}

// ---- Lessons list UI ----
function renderLessonsList(lessons) {
  lessonsList.innerHTML = '';
  lessons.forEach((l) => {
    const done = l.learned >= l.total;
    const pct = l.total > 0 ? Math.round((l.learned / l.total) * 100) : 0;
    const badge = done
      ? '<span class="lesson-badge">Done</span>'
      : l.learned === 0
        ? '<span class="lesson-badge not-started">New</span>'
        : `<span class="lesson-badge">${pct}%</span>`;

    const card = document.createElement('div');
    card.className = 'lesson-card' + (done ? ' done' : '');
    card.innerHTML = `
      <div class="lesson-info">
        <div class="lesson-name">${l.title}</div>
        <div class="lesson-stats">${l.learned} / ${l.total}</div>
      </div>
      ${badge}
      <div class="lesson-actions">
        <button type="button" class="btn btn-sm btn-primary start-btn" data-file="${l.file}" data-title="${l.title}" ${done ? 'disabled' : ''}>Start</button>
        <button type="button" class="btn btn-sm btn-outline reset-btn" data-title="${l.title}">↺</button>
      </div>`;
    lessonsList.appendChild(card);
  });

  lessonsList.querySelectorAll('.start-btn').forEach((btn) => {
    btn.addEventListener('click', () => startLesson(btn.dataset.file, btn.dataset.title));
  });
  lessonsList.querySelectorAll('.reset-btn').forEach((btn) => {
    btn.addEventListener('click', () => resetLesson(btn.dataset.title));
  });
}

async function loadLessons() {
  const lessons = await api('lessons');
  if (!isLoggedIn) {
    const g = loadGuestProfile();
    lessons.forEach((l) => {
      const learned = g.lessons[l.title]?.learned ?? [];
      l.learned = learned.length;
    });
  }
  if (!lessons.length) {
    lessonsList.innerHTML = '<p class="hint">No lessons available.</p>';
    return;
  }
  renderLessonsList(lessons);
}

async function refreshSessionAndUI() {
  const u = await whoami();
  isLoggedIn = !!u;
  updateAuthChrome();
  if (isLoggedIn) clearGuestStorage();
  await loadLessons();
}

// ---- Register ----
document.getElementById('btn-open-register').addEventListener('click', () => {
  registerPin.fill(null);
  document.getElementById('register-name').value = '';
  setAuthError(document.getElementById('register-error'), '');
  refreshRegisterPinUI();
  showScreen('register');
});

document.getElementById('btn-register-back').addEventListener('click', () => {
  showScreen('menu');
});

document.getElementById('btn-register-pin-clear').addEventListener('click', () => {
  registerPin.fill(null);
  refreshRegisterPinUI();
});

document.getElementById('btn-register-submit').addEventListener('click', async () => {
  const name = document.getElementById('register-name').value.trim();
  const pin = pinString(registerPin);
  setAuthError(document.getElementById('register-error'), '');
  if (!name) {
    setAuthError(document.getElementById('register-error'), 'Enter a username.');
    return;
  }
  if (!pin) {
    setAuthError(document.getElementById('register-error'), 'Choose 4 digits (one per column).');
    return;
  }
  const r = await api('register', {}, { name, pin });
  if (r.error) {
    setAuthError(document.getElementById('register-error'), r.error);
    return;
  }
  clearGuestStorage();
  await refreshSessionAndUI();
  showScreen('menu');
});

// ---- Login ----
const loginStepName = document.getElementById('login-step-name');
const loginStepPin = document.getElementById('login-step-pin');

document.getElementById('btn-open-login').addEventListener('click', () => {
  loginUserName = '';
  loginPin.fill(null);
  document.getElementById('login-name').value = '';
  setAuthError(document.getElementById('login-error-step1'), '');
  setAuthError(document.getElementById('login-error-step2'), '');
  loginStepName.classList.remove('hidden');
  loginStepPin.classList.add('hidden');
  showScreen('login');
});

document.getElementById('btn-login-back').addEventListener('click', () => {
  showScreen('menu');
});

document.getElementById('btn-login-next').addEventListener('click', () => {
  const name = document.getElementById('login-name').value.trim();
  setAuthError(document.getElementById('login-error-step1'), '');
  if (!name) {
    setAuthError(document.getElementById('login-error-step1'), 'Enter your username.');
    return;
  }
  loginUserName = name;
  document.getElementById('login-name-display').textContent = name;
  loginPin.fill(null);
  refreshLoginPinUI();
  loginStepName.classList.add('hidden');
  loginStepPin.classList.remove('hidden');
  setAuthError(document.getElementById('login-error-step2'), '');
});

document.getElementById('btn-login-step-back').addEventListener('click', () => {
  loginStepPin.classList.add('hidden');
  loginStepName.classList.remove('hidden');
  setAuthError(document.getElementById('login-error-step2'), '');
});

document.getElementById('btn-login-pin-clear').addEventListener('click', () => {
  loginPin.fill(null);
  refreshLoginPinUI();
});

document.getElementById('btn-login-submit').addEventListener('click', async () => {
  const pin = pinString(loginPin);
  setAuthError(document.getElementById('login-error-step2'), '');
  if (!loginUserName) {
    setAuthError(document.getElementById('login-error-step2'), 'Go back and enter username.');
    return;
  }
  if (!pin) {
    setAuthError(document.getElementById('login-error-step2'), 'Choose 4 digits (one per column).');
    return;
  }
  const r = await api('login', {}, { name: loginUserName, pin });
  if (r.error) {
    setAuthError(document.getElementById('login-error-step2'), r.error);
    return;
  }
  clearGuestStorage();
  loginStepPin.classList.add('hidden');
  loginStepName.classList.remove('hidden');
  await refreshSessionAndUI();
  showScreen('menu');
});

document.getElementById('btn-logout').addEventListener('click', async () => {
  await api('logout', {}, {});
  await refreshSessionAndUI();
  showScreen('menu');
});

// ---- Lesson flow ----
async function resetLesson(title) {
  if (!confirm(`Reset progress for "${title}"?`)) return;
  if (isLoggedIn) {
    await api('reset_lesson', {}, { lesson: title });
    loadLessons();
    return;
  }
  const g = loadGuestProfile();
  if (g.lessons[title]) {
    const pts = g.lessons[title].points ?? 0;
    const timeMs = g.lessons[title].time_ms ?? 0;
    g.points = Math.max(0, (g.points ?? 0) - pts);
    g.total_time_ms = Math.max(0, (g.total_time_ms ?? 0) - timeMs);
    g.lessons[title] = { learned: [], points: 0, time_ms: 0 };
    saveGuestProfile(g);
  }
  loadLessons();
}

async function startLesson(file, title) {
  const data = await api('lesson', { name: file });
  if (data.error) {
    alert(data.error);
    return;
  }

  let questions = data.questions;
  let learnedCount = data.learned;

  if (!isLoggedIn) {
    const g = loadGuestProfile();
    const learnedIds = new Set(g.lessons[title]?.learned ?? []);
    questions = data.questions.filter((q) => !learnedIds.has(q.id));
    learnedCount = learnedIds.size;
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }
  }

  if (!questions.length) {
    alert('No questions left in this lesson!');
    return;
  }

  currentLesson = { file, title };
  lessonQuestions = questions;
  lessonIndex = 0;
  lessonTotal = data.total;
  lessonLearned = learnedCount;

  lessonTitleBar.textContent = title;
  questionArea.classList.add('hidden');
  theoryView.classList.add('hidden');
  examplesView.classList.add('hidden');
  lessonDone.classList.add('hidden');
  showScreen('lesson');

  if (data.theory) {
    theoryText.textContent = data.theory.explanation;
    examplesList.innerHTML = '';
    data.theory.examples.forEach((ex) => {
      const card = document.createElement('div');
      card.className = 'example-card';
      card.innerHTML = `<div class="example-sentence">${ex.sentence}</div><div class="example-explanation">${ex.explanation}</div>`;
      examplesList.appendChild(card);
    });
    theoryView.classList.remove('hidden');
  } else {
    lessonStartTime = Date.now();
    questionArea.classList.remove('hidden');
    showQuestion();
  }
}

let keyHandler = null;

function showQuestion() {
  if (lessonIndex >= lessonQuestions.length) {
    showDone();
    return;
  }
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
    btn.type = 'button';
    btn.className = 'answer-btn';
    btn.textContent = text;
    btn.addEventListener('click', () => handleAnswer(idx === q.correct, idx, q));
    answersGrid.appendChild(btn);
  });

  if (keyHandler) document.removeEventListener('keydown', keyHandler);
  keyHandler = (e) => {
    const n = { 1: 0, 2: 1, 3: 2 }[e.key];
    if (n === undefined) return;
    const btns = answersGrid.querySelectorAll('.answer-btn');
    if (btns[n]) btns[n].click();
  };
  document.addEventListener('keydown', keyHandler);
}

async function handleAnswer(correct, chosenIdx, q) {
  if (answered) return;
  answered = true;
  if (keyHandler) {
    document.removeEventListener('keydown', keyHandler);
    keyHandler = null;
  }

  const buttons = answersGrid.querySelectorAll('.answer-btn');
  buttons.forEach((b) => {
    b.disabled = true;
  });

  const chosen = [...buttons].find((b) => b.textContent === q.answers[chosenIdx]);
  const correctBtn = [...buttons].find((b) => b.textContent === q.answers[q.correct]);

  if (correct) {
    chosen.classList.add('correct');
    buttons.forEach((b) => {
      if (b !== chosen) b.classList.add('hidden');
    });
    feedback.textContent = '✓ Correct!';
    feedback.className = 'feedback correct-msg';
  } else {
    buttons.forEach((b) => {
      if (b !== correctBtn) b.classList.add('hidden');
    });
    correctBtn.classList.add('correct');
    feedback.textContent = `✗ Wrong! Correct: "${q.answers[q.correct]}"`;
    feedback.className = 'feedback wrong-msg';
  }

  if (isLoggedIn) {
    await api('answer', {}, { lesson: currentLesson.title, question_id: q.id, correct });
  } else {
    const g = loadGuestProfile();
    const le = ensureGuestLesson(g, currentLesson.title);
    if (correct) {
      if (!le.learned.includes(q.id)) {
        le.learned.push(q.id);
        le.points = (le.points ?? 0) + 1;
        g.points = (g.points ?? 0) + 1;
      }
    } else {
      le.learned = le.learned.filter((id) => id !== q.id);
    }
    saveGuestProfile(g);
  }

  if (correct) {
    lessonLearned++;
    lessonQuestions.splice(lessonIndex, 1);
  } else {
    lessonIndex++;
    if (lessonIndex >= lessonQuestions.length) lessonIndex = 0;
  }

  if (lessonQuestions.length === 0) {
    if (correct) setTimeout(showDone, 3000);
    else showDone();
  } else if (correct) {
    setTimeout(() => {
      btnNext.classList.add('hidden');
      showQuestion();
    }, 3000);
  } else {
    btnNext.classList.remove('hidden');
  }
}

btnNext.addEventListener('click', () => {
  btnNext.classList.add('hidden');
  showQuestion();
});

document.getElementById('btn-theory-next').addEventListener('click', () => {
  theoryView.classList.add('hidden');
  examplesView.classList.remove('hidden');
});

document.getElementById('btn-examples-next').addEventListener('click', () => {
  examplesView.classList.add('hidden');
  lessonStartTime = Date.now();
  questionArea.classList.remove('hidden');
  showQuestion();
});

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

async function showDone() {
  const elapsed = Date.now() - lessonStartTime;
  if (isLoggedIn) {
    await api('lesson_complete', {}, { lesson: currentLesson.title, time_ms: elapsed });
  } else {
    const g = loadGuestProfile();
    const le = ensureGuestLesson(g, currentLesson.title);
    le.time_ms = (le.time_ms ?? 0) + elapsed;
    g.total_time_ms = (g.total_time_ms ?? 0) + elapsed;
    saveGuestProfile(g);
  }
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

// ---- Profile screen ----
document.getElementById('btn-profile').addEventListener('click', async () => {
  const data = await api('profile');
  if (data.error) {
    alert(data.error);
    return;
  }
  document.getElementById('profile-name').textContent = data.name;
  document.getElementById('profile-points').textContent =
    `Total points: ${data.points} | Total time: ${formatTime(data.total_time_ms || 0)}`;
  const tbody = document.querySelector('#profile-table tbody');
  tbody.innerHTML = '';
  data.stats.forEach((s) => {
    const pct = s.total > 0 ? Math.round((s.learned / s.total) * 100) : 0;
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${s.title}</td><td>${s.total}</td><td>${s.learned}</td><td>${pct}%</td><td>${formatTime(s.time_ms || 0)}</td>`;
    tbody.appendChild(tr);
  });
  showScreen('profile');
});

document.getElementById('btn-profile-back').addEventListener('click', () => {
  showScreen('menu');
});

// ---- Init ----
refreshRegisterPinUI();
refreshLoginPinUI();
refreshSessionAndUI();
