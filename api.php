<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

define('DATA_DIR', __DIR__ . '/data/');
define('PROFILES_DIR', __DIR__ . '/profiles/');

function jsonResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function readProfile($name) {
    $file = PROFILES_DIR . preg_replace('/[^a-zA-Z0-9_\-]/', '_', $name) . '.json';
    if (!file_exists($file)) return ['name' => $name, 'lessons' => [], 'points' => 0];
    return json_decode(file_get_contents($file), true);
}

function saveProfile($profile) {
    $file = PROFILES_DIR . preg_replace('/[^a-zA-Z0-9_\-]/', '_', $profile['name']) . '.json';
    file_put_contents($file, json_encode($profile, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
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

if ($action === 'users' && $method === 'GET') {
    $files = glob(PROFILES_DIR . '*.json');
    $users = [];
    foreach ($files as $f) {
        $p = json_decode(file_get_contents($f), true);
        if ($p && isset($p['name'])) $users[] = $p['name'];
    }
    sort($users);
    jsonResponse($users);
}

if ($action === 'lessons' && $method === 'GET') {
    $user = $_GET['user'] ?? '';
    $lessons = getLessons();
    if ($user) {
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
    $user = $_GET['user'] ?? '';
    $file = DATA_DIR . $name;
    if (!file_exists($file) || strpos(realpath($file), realpath(DATA_DIR)) !== 0) {
        jsonResponse(['error' => 'Lesson not found'], 404);
    }
    $data = json_decode(file_get_contents($file), true);
    $profile = $user ? readProfile($user) : ['lessons' => []];
    $learned = $profile['lessons'][$data['title']]['learned'] ?? [];
    $questions = array_filter($data['questions'], fn($q) => !in_array($q['id'], $learned));
    $questions = array_values($questions);
    shuffle($questions);
    $theory = $data['theory'] ?? null;
    jsonResponse(['title' => $data['title'], 'questions' => $questions, 'total' => count($data['questions']), 'learned' => count($learned), 'theory' => $theory]);
}

if ($action === 'answer' && $method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $user = $body['user'] ?? '';
    $lessonTitle = $body['lesson'] ?? '';
    $questionId = (int)($body['question_id'] ?? 0);
    $correct = (bool)($body['correct'] ?? false);

    if (!$user || !$lessonTitle) jsonResponse(['error' => 'Missing params'], 400);

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
    }
    saveProfile($profile);
    jsonResponse(['success' => true, 'learned' => count($profile['lessons'][$lessonTitle]['learned'])]);
}

if ($action === 'create_user' && $method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $name = trim($body['name'] ?? '');
    if (!$name || strlen($name) > 50) jsonResponse(['error' => 'Invalid name'], 400);
    $file = PROFILES_DIR . preg_replace('/[^a-zA-Z0-9_\-]/', '_', $name) . '.json';
    if (file_exists($file)) jsonResponse(['error' => 'User exists'], 409);
    $profile = ['name' => $name, 'lessons' => [], 'points' => 0];
    saveProfile($profile);
    jsonResponse(['success' => true]);
}

if ($action === 'delete_user' && $method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $name = $body['name'] ?? '';
    $file = PROFILES_DIR . preg_replace('/[^a-zA-Z0-9_\-]/', '_', $name) . '.json';
    if (file_exists($file)) unlink($file);
    jsonResponse(['success' => true]);
}

if ($action === 'lesson_complete' && $method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $user = $body['user'] ?? '';
    $lessonTitle = $body['lesson'] ?? '';
    $timeMs = (int)($body['time_ms'] ?? 0);
    if (!$user || !$lessonTitle) jsonResponse(['error' => 'Missing params'], 400);
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
    $body = json_decode(file_get_contents('php://input'), true);
    $user = $body['user'] ?? '';
    $lessonTitle = $body['lesson'] ?? '';
    if (!$user || !$lessonTitle) jsonResponse(['error' => 'Missing params'], 400);
    $profile = readProfile($user);
    if (isset($profile['lessons'][$lessonTitle])) {
        $pts = $profile['lessons'][$lessonTitle]['points'] ?? 0;
        $timeMs = $profile['lessons'][$lessonTitle]['time_ms'] ?? 0;
        $profile['points'] = max(0, ($profile['points'] ?? 0) - $pts);
        $profile['total_time_ms'] = max(0, ($profile['total_time_ms'] ?? 0) - $timeMs);
        $profile['lessons'][$lessonTitle] = ['learned' => [], 'points' => 0, 'time_ms' => 0];
        saveProfile($profile);
    }
    jsonResponse(['success' => true]);
}

if ($action === 'profile' && $method === 'GET') {
    $user = $_GET['user'] ?? '';
    if (!$user) jsonResponse(['error' => 'Missing user'], 400);
    $profile = readProfile($user);
    $lessons = getLessons();
    $stats = [];
    foreach ($lessons as $l) {
        $learned = count($profile['lessons'][$l['title']]['learned'] ?? []);
        $timeMs = $profile['lessons'][$l['title']]['time_ms'] ?? 0;
        $stats[] = ['title' => $l['title'], 'total' => $l['total'], 'learned' => $learned, 'time_ms' => $timeMs];
    }
    jsonResponse(['name' => $profile['name'], 'points' => $profile['points'] ?? 0, 'total_time_ms' => $profile['total_time_ms'] ?? 0, 'stats' => $stats]);
}

jsonResponse(['error' => 'Unknown action'], 400);
