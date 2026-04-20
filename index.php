<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>EngLearn – Nauka angielskiego</title>
  <link rel="stylesheet" href="style.css"/>
</head>
<body>

<div id="app">

  <!-- SCREEN: MENU -->
  <div id="screen-menu" class="screen active">
    <div class="container">
      <h1>EngLearn</h1>
      <p class="subtitle">Nauka angielskiego</p>

      <div class="user-bar">
        <div class="user-select-row">
          <select id="user-select">
            <option value="">-- wybierz użytkownika --</option>
          </select>
          <button class="btn btn-sm btn-outline" id="btn-profile">Profil</button>
        </div>
        <div class="user-actions">
          <input type="text" id="new-user-input" placeholder="Imię nowego użytkownika" maxlength="50"/>
          <button class="btn btn-sm btn-primary" id="btn-add-user">Dodaj</button>
          <button class="btn btn-sm btn-danger" id="btn-delete-user">Usuń</button>
        </div>
      </div>

      <hr/>

      <h2>Dostępne lekcje</h2>
      <div id="lessons-list" class="lessons-list">
        <p class="hint">Wybierz użytkownika, aby zobaczyć postęp.</p>
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
        <button id="btn-next" class="btn btn-primary btn-next hidden">Następne pytanie →</button>
      </div>

      <div id="lesson-done" class="lesson-done hidden">
        <div class="done-icon">🎉</div>
        <h2>Brawo! Lekcja ukończona!</h2>
        <p>Wszystkie pytania zostały opanowane.</p>
        <button class="btn btn-primary" id="btn-done-back">Wróć do menu</button>
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
      <thead><tr><th>Lekcja</th><th>Razem</th><th>Nauczone</th><th>%</th></tr></thead>
      <tbody></tbody>
    </table>
  </div>
</div>

<script src="app.js"></script>
</body>
</html>
