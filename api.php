<?php
session_start();

header('Content-Type: application/json; charset=utf-8');

define('DATA_DIR', __DIR__ . '/data/');
define('PROFILES_DIR', __DIR__ . '/profiles/');

function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function profileFilePath($name) {
    return PROFILES_DIR . preg_replace('/[^a-zA-Z0-9_\-]/', '_', $name) . '.json';
}

function readProfile($name) {
    $file = profileFilePath($name);
    if (!file_exists($file)) return ['name' => $name, 'lessons' => [], 'points' => 0];
    return json_decode(file_get_contents($file), true);
}

function saveProfile($profile) {
    $file = profileFilePath($profile['name']);
    file_put_contents($file, json_encode($profile, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
}

function sessionUser() {
    $u = $_SESSION['gramio_user'] ?? '';
    return is_string($u) ? trim($u) : '';
}

function requireSessionUser() {
    $u = sessionUser();
    if ($u === '') jsonResponse(['error' => 'Unauthorized'], 401);
    return $u;
}

function validateUserName($name) {
    $name = strtolower(trim($name));
    if ($name === '' || strlen($name) > 50) return null;
    if (!preg_match('/^[a-z0-9_\-]+$/', $name)) return null;
    return $name;
}

function validatePin($pin) {
    if (!is_string($pin) || strlen($pin) !== 4 || !ctype_digit($pin)) return null;
    return $pin;
}

function getLessons() {
    $files = glob(DATA_DIR . '*.json');
    $lessons = [];
    foreach ($files as $f) {
        $data = json_decode(file_get_contents($f), true);
        if ($data) $lessons[] = ['title' => $data['title'], 'file' => basename($f), 'total' => count($data['questions'])];
    }
    usort($lessons, fn($a, $b) => strcmp($a['title'], $b['title']));
    return $lessons;
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

if ($action === 'whoami' && $method === 'GET') {
    $u = sessionUser();
    jsonResponse(['user' => $u !== '' ? $u : null]);
}

if ($action === 'register' && $method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $name = validateUserName($body['name'] ?? '');
    $pin = validatePin($body['pin'] ?? null);
    if (!$name || !$pin) jsonResponse(['error' => 'Invalid name or PIN'], 400);

    $file = profileFilePath($name);
    if (file_exists($file)) jsonResponse(['error' => 'User exists'], 409);

    $profile = [
        'name' => $name,
        'pin_hash' => password_hash($pin, PASSWORD_DEFAULT),
        'lessons' => [],
        'points' => 0,
    ];
    saveProfile($profile);
    $_SESSION['gramio_user'] = $name;
    jsonResponse(['success' => true, 'user' => $name]);
}

if ($action === 'login' && $method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $name = validateUserName($body['name'] ?? '');
    $pin = validatePin($body['pin'] ?? null);
    if (!$name || !$pin) jsonResponse(['error' => 'Invalid name or PIN'], 400);

    $profile = readProfile($name);
    $hash = $profile['pin_hash'] ?? null;
    if (!$hash || !password_verify($pin, $hash)) {
        jsonResponse(['error' => 'Invalid username or PIN'], 401);
    }

    $_SESSION['gramio_user'] = $name;
    jsonResponse(['success' => true, 'user' => $name]);
}

if ($action === 'logout' && $method === 'POST') {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
    jsonResponse(['success' => true]);
}

if ($action === 'lessons' && $method === 'GET') {
    $lessons = getLessons();
    $user = sessionUser();
    if ($user !== '') {
        $profile = readProfile($user);
        foreach ($lessons as &$lesson) {
            $learned = $profile['lessons'][$lesson['title']]['learned'] ?? [];
            $lesson['learned'] = count($learned);
        }
    } else {
        foreach ($lessons as &$lesson) $lesson['learned'] = 0;
    }
    jsonResponse($lessons);
}

if ($action === 'lesson' && $method === 'GET') {
    $name = $_GET['name'] ?? '';
    $file = DATA_DIR . $name;
    if (!file_exists($file) || strpos(realpath($file), realpath(DATA_DIR)) !== 0) {
        jsonResponse(['error' => 'Lesson not found'], 404);
    }
    $data = json_decode(file_get_contents($file), true);
    $user = sessionUser();
    $profile = $user !== '' ? readProfile($user) : ['lessons' => []];
    $learned = $profile['lessons'][$data['title']]['learned'] ?? [];
    $questions = array_filter($data['questions'], fn($q) => !in_array($q['id'], $learned));
    $questions = array_values($questions);
    shuffle($questions);
    $theory = $data['theory'] ?? null;
    jsonResponse([
        'title' => $data['title'],
        'questions' => $questions,
        'total' => count($data['questions']),
        'learned' => count($learned),
        'theory' => $theory,
    ]);
}

if ($action === 'answer' && $method === 'POST') {
    $user = requireSessionUser();
    $body = json_decode(file_get_contents('php://input'), true);
    $lessonTitle = $body['lesson'] ?? '';
    $questionId = (int)($body['question_id'] ?? 0);
    $correct = (bool)($body['correct'] ?? false);

    if (!$lessonTitle) jsonResponse(['error' => 'Missing params'], 400);

    $profile = readProfile($user);
    if (!isset($profile['lessons'][$lessonTitle])) {
        $profile['lessons'][$lessonTitle] = ['learned' => [], 'points' => 0];
    }

    if ($correct) {
        if (!in_array($questionId, $profile['lessons'][$lessonTitle]['learned'])) {
            $profile['lessons'][$lessonTitle]['learned'][] = $questionId;
            $profile['lessons'][$lessonTitle]['points'] = ($profile['lessons'][$lessonTitle]['points'] ?? 0) + 1;
            $profile['points'] = ($profile['points'] ?? 0) + 1;
        }
    } else {
        $profile['lessons'][$lessonTitle]['learned'] = array_values(
            array_filter($profile['lessons'][$lessonTitle]['learned'], fn($id) => $id !== $questionId)
        );
        $profile['lessons'][$lessonTitle]['errors'] = ($profile['lessons'][$lessonTitle]['errors'] ?? 0) + 1;
        $profile['total_errors'] = ($profile['total_errors'] ?? 0) + 1;
    }
    saveProfile($profile);
    jsonResponse(['success' => true, 'learned' => count($profile['lessons'][$lessonTitle]['learned'])]);
}

if ($action === 'lesson_complete' && $method === 'POST') {
    $user = requireSessionUser();
    $body = json_decode(file_get_contents('php://input'), true);
    $lessonTitle = $body['lesson'] ?? '';
    $timeMs = (int)($body['time_ms'] ?? 0);
    if (!$lessonTitle) jsonResponse(['error' => 'Missing params'], 400);
    $profile = readProfile($user);
    if (!isset($profile['lessons'][$lessonTitle])) {
        $profile['lessons'][$lessonTitle] = ['learned' => [], 'points' => 0];
    }
    $profile['lessons'][$lessonTitle]['time_ms'] = ($profile['lessons'][$lessonTitle]['time_ms'] ?? 0) + $timeMs;
    $profile['total_time_ms'] = ($profile['total_time_ms'] ?? 0) + $timeMs;
    saveProfile($profile);
    jsonResponse(['success' => true]);
}

if ($action === 'reset_lesson' && $method === 'POST') {
    $user = requireSessionUser();
    $body = json_decode(file_get_contents('php://input'), true);
    $lessonTitle = $body['lesson'] ?? '';
    if (!$lessonTitle) jsonResponse(['error' => 'Missing params'], 400);
    $profile = readProfile($user);
    if (isset($profile['lessons'][$lessonTitle])) {
        $pts = $profile['lessons'][$lessonTitle]['points'] ?? 0;
        $timeMs = $profile['lessons'][$lessonTitle]['time_ms'] ?? 0;
        $errors = $profile['lessons'][$lessonTitle]['errors'] ?? 0;
        $profile['points'] = max(0, ($profile['points'] ?? 0) - $pts);
        $profile['total_time_ms'] = max(0, ($profile['total_time_ms'] ?? 0) - $timeMs);
        $profile['total_errors'] = max(0, ($profile['total_errors'] ?? 0) - $errors);
        $profile['lessons'][$lessonTitle] = ['learned' => [], 'points' => 0, 'time_ms' => 0, 'errors' => 0];
        saveProfile($profile);
    }
    jsonResponse(['success' => true]);
}

if ($action === 'profile' && $method === 'GET') {
    $user = requireSessionUser();
    $profile = readProfile($user);
    $lessons = getLessons();
    $stats = [];
    foreach ($lessons as $l) {
        $learned = count($profile['lessons'][$l['title']]['learned'] ?? []);
        $timeMs = $profile['lessons'][$l['title']]['time_ms'] ?? 0;
        $errors = $profile['lessons'][$l['title']]['errors'] ?? 0;
        $stats[] = ['title' => $l['title'], 'total' => $l['total'], 'learned' => $learned, 'time_ms' => $timeMs, 'errors' => $errors];
    }
    jsonResponse(['name' => $profile['name'], 'points' => $profile['points'] ?? 0, 'total_time_ms' => $profile['total_time_ms'] ?? 0, 'total_errors' => $profile['total_errors'] ?? 0, 'stats' => $stats]);
}

jsonResponse(['error' => 'Unknown action'], 400);
