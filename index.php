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
      <div class="menu-actions hidden" id="auth-bar-guest">
        <button type="button" class="btn btn-primary" id="btn-open-register">Register</button>
        <button type="button" class="btn btn-outline" id="btn-open-login">Login</button>
      </div>
      <div class="menu-actions hidden" id="auth-bar-user">
        <button type="button" class="btn btn-primary" id="btn-profile">Profile</button>
        <button type="button" class="btn btn-outline" id="btn-logout">Log out</button>
      </div>
      <hr/>
      <div id="lessons-list" class="lessons-list">
        <p class="hint">Loading…</p>
      </div>
    </div>
  </div>

  <!-- SCREEN: REGISTER -->
  <div id="screen-register" class="screen">
    <div class="container">
      <h1>Register</h1>
      <button type="button" class="btn btn-outline btn-back-auth" id="btn-register-back">← Back</button>
      <hr/>
      <label class="field-label" for="register-name">Username</label>
      <input type="text" id="register-name" class="auth-input" placeholder="Username" maxlength="50" autocomplete="username"/>
      <p class="field-label">Choose a 4-digit PIN (tap one digit per column)</p>
      <div id="register-pin-grid" class="pin-grid" aria-label="PIN entry"></div>
      <p id="register-pin-preview" class="pin-preview" aria-live="polite"></p>
      <div class="auth-actions">
        <button type="button" class="btn btn-outline" id="btn-register-pin-clear">Clear PIN</button>
        <button type="button" class="btn btn-primary" id="btn-register-submit">Create account</button>
      </div>
      <p id="register-error" class="auth-error hidden" role="alert"></p>
    </div>
  </div>

  <!-- SCREEN: LOGIN -->
  <div id="screen-login" class="screen">
    <div class="container">
      <h1>Login</h1>
      <button type="button" class="btn btn-outline btn-back-auth" id="btn-login-back">← Back</button>
      <hr/>
      <div id="login-step-name">
        <label class="field-label" for="login-name">Username</label>
        <input type="text" id="login-name" class="auth-input" placeholder="Username" maxlength="50" autocomplete="username"/>
        <button type="button" class="btn btn-primary btn-full auth-next" id="btn-login-next">Next →</button>
        <p id="login-error-step1" class="auth-error hidden" role="alert"></p>
      </div>
      <div id="login-step-pin" class="hidden">
        <p class="field-label">PIN for <strong id="login-name-display"></strong></p>
        <p class="hint pin-hint">Tap one digit in each column.</p>
        <div id="login-pin-grid" class="pin-grid" aria-label="PIN entry"></div>
        <p id="login-pin-preview" class="pin-preview" aria-live="polite"></p>
        <div class="auth-actions">
          <button type="button" class="btn btn-outline" id="btn-login-pin-clear">Clear PIN</button>
          <button type="button" class="btn btn-outline" id="btn-login-step-back">← Change user</button>
          <button type="button" class="btn btn-primary" id="btn-login-submit">Log in</button>
        </div>
        <p id="login-error-step2" class="auth-error hidden" role="alert"></p>
      </div>
    </div>
  </div>

  <!-- SCREEN: LESSON -->
  <div id="screen-lesson" class="screen">
    <div class="container">
      <div class="lesson-header">
        <button type="button" class="btn btn-sm btn-outline" id="btn-back">← Menu</button>
        <span id="lesson-title-bar"></span>
        <span id="lesson-progress"></span>
      </div>
      <div class="progress-bar-wrap"><div id="progress-bar" class="progress-bar"></div></div>

      <div id="theory-view" class="hidden">
        <div id="theory-text" class="theory-text"></div>
        <button type="button" class="btn btn-primary btn-full" id="btn-theory-next">Dalej →</button>
      </div>

      <div id="examples-view" class="hidden">
        <div id="examples-list" class="examples-list"></div>
        <button type="button" class="btn btn-primary btn-full" id="btn-examples-next">Dalej →</button>
      </div>

      <div id="question-area">
        <div id="question-text" class="question-text"></div>
        <div id="answers-grid" class="answers-grid"></div>
        <div id="feedback" class="feedback hidden"></div>
        <button type="button" id="btn-next" class="btn btn-primary btn-next hidden">Next question →</button>
      </div>

      <div id="lesson-done" class="lesson-done hidden">
        <div class="done-icon">✓</div>
        <h2>Well done! Lesson complete!</h2>
        <p>All questions mastered.</p>
        <button type="button" class="btn btn-primary" id="btn-done-back">Back to menu</button>
      </div>
    </div>
  </div>

  <!-- SCREEN: PROFILE -->
  <div id="screen-profile" class="screen">
    <div class="container">
      <h1>Profile</h1>
      <button type="button" class="btn btn-outline btn-back-auth" id="btn-profile-back">← Back</button>
      <hr/>
      <h2 id="profile-name"></h2>
      <p id="profile-points" class="profile-points"></p>
      <table id="profile-table" class="profile-table">
        <thead><tr><th>Lesson</th><th>Total</th><th>Learned</th><th>%</th><th>Time</th></tr></thead>
        <tbody></tbody>
      </table>
    </div>
  </div>

</div>

<script src="app.js"></script>
</body>
</html>
