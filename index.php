<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>EngLearn</title>
  <link rel="stylesheet" href="style.css"/>
</head>
<body>

<div id="app">

  <!-- SCREEN: MENU -->
  <div id="screen-menu" class="screen active">
    <div class="container">
      <h1>EngLearn</h1>
      <div class="menu-actions">
        <button class="btn btn-primary" id="btn-goto-users">Users</button>
        <button class="btn btn-outline" id="btn-profile">Profile</button>
      </div>
      <hr/>
      <div id="lessons-list" class="lessons-list">
        <p class="hint">Select a user to see progress.</p>
      </div>
    </div>
  </div>

  <!-- SCREEN: USERS -->
  <div id="screen-users" class="screen">
    <div class="container">
      <h1>Users</h1>
      <button class="btn btn-outline btn-back-users" id="btn-users-back">← Back</button>
      <hr/>
      <label class="field-label">Select user</label>
      <select id="user-select">
        <option value="">-- select --</option>
      </select>
      <hr/>
      <label class="field-label">New user</label>
      <div class="user-add-row">
        <input type="text" id="new-user-input" placeholder="Name" maxlength="50"/>
        <button class="btn btn-primary" id="btn-add-user">Add</button>
      </div>
      <div class="user-del-row">
        <button class="btn btn-danger" id="btn-delete-user">Delete selected</button>
      </div>
      <hr/>
      <div class="user-del-row">
        <button class="btn btn-outline" id="btn-logout">Log out</button>
      </div>
    </div>
  </div>

  <!-- SCREEN: LESSON -->
  <div id="screen-lesson" class="screen">
    <div class="container">
      <div class="lesson-header">
        <button class="btn btn-sm btn-outline" id="btn-back">← Menu</button>
        <span id="lesson-title-bar"></span>
        <span id="lesson-progress"></span>
      </div>
      <div class="progress-bar-wrap"><div id="progress-bar" class="progress-bar"></div></div>

      <div id="question-area">
        <div id="question-text" class="question-text"></div>
        <div id="answers-grid" class="answers-grid"></div>
        <div id="feedback" class="feedback hidden"></div>
        <button id="btn-next" class="btn btn-primary btn-next hidden">Next question →</button>
      </div>

      <div id="lesson-done" class="lesson-done hidden">
        <div class="done-icon">✓</div>
        <h2>Well done! Lesson complete!</h2>
        <p>All questions mastered.</p>
        <button class="btn btn-primary" id="btn-done-back">Back to menu</button>
      </div>
    </div>
  </div>

</div>

<!-- MODAL: PROFILE -->
<div id="modal-profile" class="modal hidden">
  <div class="modal-box">
    <button class="modal-close" id="btn-close-profile">✕</button>
    <h2 id="profile-name"></h2>
    <p id="profile-points" class="profile-points"></p>
    <table id="profile-table" class="profile-table">
      <thead><tr><th>Lesson</th><th>Total</th><th>Learned</th><th>%</th></tr></thead>
      <tbody></tbody>
    </table>
  </div>
</div>

<script src="app.js"></script>
</body>
</html>
