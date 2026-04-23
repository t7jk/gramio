# Auth + gość — plan implementacji

**Goal:** Gość ćwiczy lokalnie; Register/Login z PIN i sesją PHP; usunięcie ekranu Users; API używa sesji zamiast parametru `user` od klienta.

**Architecture:** `localStorage` dla profilu gościa (ten sam kształt co profil serwera); `api.php` — `session_start`, `register`, `login`, `logout`, `whoami`; chronione akcje czytają `$_SESSION['englearn_user']`.

**Tech Stack:** PHP 8+, vanilla JS, istniejący `index.php` / `style.css`.

---

### Task 1: Backend (`api.php`)

- [x] Sesja, `whoami`, `register`, `login`, `logout`
- [x] `pin_hash` w profilu; usunięcie `users`, `create_user`, `delete_user`
- [x] `lessons`, `lesson`, `answer`, `lesson_complete`, `reset_lesson`, `profile` — użytkownik wyłącznie z sesji

### Task 2: HTML (`index.php`)

- [x] Pasek gość vs zalogowany; ekrany Register i Login (2 kroki); usunięcie Users

### Task 3: Front (`app.js`)

- [x] `load/saveGuestProfile`, merge listy lekcji dla gościa
- [x] Odpowiedzi gościa bez API; zalogowany z `credentials: 'same-origin'`
- [x] Siatka PIN, init `whoami`

### Task 4: Style (`style.css`)

- [x] Siatka PIN, ekrany auth; usunięcie stylów Users (opcjonalnie uproszczone)
