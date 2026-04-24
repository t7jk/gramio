# Gramio

English grammar practice app with lesson-based exercises and progress tracking.

## What it does

- **Lesson browser** — lists grammar topics organized by level (Present Simple, Past Perfect, Passive, Articles, Irregular Verbs, etc.)
- **Fill-in exercises** — each lesson presents sentences with gaps; the user types the correct form and gets instant feedback
- **Progress tracking** — completed lessons are marked; incorrect answers are recorded so the user can retry them
- **Guest mode** — practice without an account; progress stored in localStorage
- **Accounts** — register/login with a PIN; progress synced server-side across devices

## Tech stack

- PHP 8 + vanilla JS (no framework)
- JSON files as lesson data (`data/`)
- User profiles stored as JSON files server-side (`profiles/`)

## Lesson data format

Each file in `data/` is a JSON array of exercise objects:

```json
[
  {
    "sentence": "She ___ to school every day.",
    "answer": "goes",
    "hint": "Present Simple – 3rd person singular"
  }
]
```

## Adding new lessons

Use `add_theory.py` to generate or import lesson sets, then drop the resulting JSON file into `data/`.

## Deployment

Copy `index.php`, `api.php`, `app.js`, `style.css`, and the `data/` directory to your web server root. The `profiles/` directory must be writable by the web server.
