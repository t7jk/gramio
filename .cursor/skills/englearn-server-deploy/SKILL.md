---
name: englearn-server-deploy
description: >-
  Deploys EngLearn from ~/englearn to /var/www/html/englearn by copying only app
  and lesson data files; never touches profiles on the server. Use when the user
  asks to deploy EngLearn to the server, publish to /var/www/html/englearn, or
  run deploy after git pull.
---

# EngLearn — deploy na serwer (WWW)

## Cel

Skopiować **tylko niezbędne pliki aplikacji** z katalogu źródłowego na docelowy katalog serwera WWW. **Katalogu `profiles/` nie synchronizować ani nie nadpisywać** — na serwerze zostają konta użytkowników i postępy.

## Ścieżki

| Rola | Ścieżka |
|------|---------|
| Źródło | `~/englearn` |
| Cel (Apache / WWW) | `/var/www/html/englearn` |

## Co jest kopiowane

- `index.php`, `api.php`, `app.js`, `style.css`
- `data/*.json` (lekcje)

## Czego **nie** kopiować

- **`profiles/`** — pomijamy całkowicie (brak `cp`/`rsync` profili z dev na produkcję).
- Reszta repo (np. `docs/`, `.cursor/`, `deploy.sh`, `task.txt`) nie jest wymagana do działania strony — nie trzeba jej kopiować, chyba że użytkownik wyraźnie chce.

## Jak wykonać deploy

Na maszynie, na której **istnieją obie ścieżki** (zwykle serwer po `git pull` w `~/englearn`):

```bash
bash ~/englearn/deploy.sh
```

Skrypt jest kanoniczną listą plików: [deploy.sh](../../../deploy.sh) (katalog główny repozytorium `englearn`).

## Po wdrożeniu

- Upewnij się, że **`/var/www/html/englearn/profiles/`** istnieje i ma prawa zapisu dla procesu WWW (skrypt ustawia `chmod o+w` na ten katalog — dostosuj do polityki serwera jeśli trzeba).

## Typowe błędy

- Uruchamianie `deploy.sh` **lokalnie na PC**, gdy `DST` nie istnieje — wtedy użyj SSH na serwer i tam odpal skrypt, albo dostosuj `DST` / użyj `rsync` przez SSH według potrzeb.
- **`rsync --delete`** na cały katalog docelowy — może skasować `profiles/` na serwerze; przy deploy EngLearn **nie** używaj usuwania mirror dla `profiles/`.
