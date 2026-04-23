---
name: englearn-server-deploy
description: >-
  Runs repository script deploy.sh to publish EngLearn from ~/englearn to
  /var/www/html/englearn without overwriting profiles. Use when the user asks
  to deploy EngLearn to the server, publish to WWW, or sync after git pull—
  always prefer deploy.sh over ad-hoc copy or rsync.
---

# EngLearn — deploy na serwer (WWW)

## Najważniejsze: skrypt `deploy.sh`

W repozytorium jest już skrypt **[`deploy.sh`](../../../deploy.sh)** w katalogu głównym projektu. **To on wykonuje właściwy deploy** — kopiuje tylko to, co trzeba, i **nie dotyka `profiles/`** na serwerze.

**Zasada dla agenta:** nie składać własnej listy `cp` ani `rsync` od zera, jeśli można uruchomić `deploy.sh` (na maszynie, gdzie istnieją ścieżki źródłowa i docelowa). Zmiany w zakresie kopiowanych plików wprowadzaj w **`deploy.sh`**, a potem odpalaj ten skrypt.

## Cel

Skopiować **tylko niezbędne pliki aplikacji** z `~/englearn` do `/var/www/html/englearn`. **Katalogu `profiles/` nie synchronizować ani nie nadpisywać** — na serwerze zostają konta i postępy.

## Ścieżki (domyślne w skrypcie)

| Rola | Ścieżka |
|------|---------|
| Źródło (`SRC`) | `~/englearn` |
| Cel (`DST`) | `/var/www/html/englearn` |

## Co robi `deploy.sh` (skrót)

- Kopiuje: `index.php`, `api.php`, `app.js`, `style.css`, `data/*.json`
- Ustawia `chmod o+w` na `$DST/profiles/`
- **Nie kopiuje** `profiles/` z dev — więc dane użytkowników na serwerze pozostają

## Wykonanie

Na maszynie, na której **istnieją obie ścieżki** (zwykle serwer po `git pull` w `~/englearn`):

```bash
bash ~/englearn/deploy.sh
```

## Po wdrożeniu

- Sprawdź, że **`/var/www/html/englearn/profiles/`** istnieje i ma sensowne prawa zapisu dla WWW.

## Typowe błędy

- Odpalanie `deploy.sh` tam, gdzie **nie ma** `/var/www/html/englearn` — użyj SSH na serwer albo zmień `DST` w skrypcie świadomie.
- **`rsync --delete`** na cały katalog docelowy zamiast `deploy.sh` — ryzyko usunięcia lub nadpisania `profiles/`; **nie** stosuj takiego mirror deploy dla tej aplikacji.
