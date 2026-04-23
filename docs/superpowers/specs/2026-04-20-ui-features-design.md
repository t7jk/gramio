# UI Features Design

**Date:** 2026-04-20

## Goal

Improve the EngLearn lesson UX with: vertical answer layout, auto-advance on correct answer, theory/examples screens before questions, time and answer statistics, and keyboard input (1/2/3).

## Features

### 1. Answer Layout — Vertical, Taller Buttons

`#answers-grid` changes from `grid-template-columns: 1fr 1fr` to `grid-template-columns: 1fr` (single column, always). The `@media (max-width: 480px)` override for this becomes redundant and is removed.

`.answer-btn` padding increases from `1rem 0.5rem` to `1.4rem 0.5rem`.

### 2. Auto-Advance After Correct Answer

- Correct answer: feedback shown, "Next →" button stays hidden, `setTimeout(showQuestion, 2000)` fires automatically.
- Wrong answer: feedback shown, "Next →" button appears as before (manual advance).
- The 2s timer is cancelled if the user navigates away (back to menu).

### 3. Theory and Examples Screens

#### JSON Format Extension

New optional top-level field `theory` in lesson files:

```json
{
  "title": "Present Perfect I – Twierdzące",
  "theory": {
    "explanation": "...",
    "examples": [
      { "sentence": "She has visited Paris.", "explanation": "have/has + past participle (3rd person singular → has)" },
      { "sentence": "They have finished the project.", "explanation": "have/has + past participle (plural → have)" },
      { "sentence": "I have never eaten sushi.", "explanation": "never goes between have and past participle" }
    ]
  },
  "questions": [...]
}
```

`theory.examples` always has exactly 3 items when present. If `theory` field is absent, both extra screens are skipped.

#### Lesson Flow With Theory

```
[theory-view] → [examples-view] → [question-area]
```

- `theory-view`: displays `theory.explanation` text + "Dalej →" button
- `examples-view`: displays 3 example cards (sentence + explanation each) + "Dalej →" button  
- `question-area`: existing question/answer flow

All three sub-sections live inside `#screen-lesson`. Only one is visible at a time.

The lesson timer starts when the first question is shown (not at theory screen).

#### HTML Changes (`index.php`)

Add before `#question-area`:

```html
<div id="theory-view" class="hidden">
  <div id="theory-text" class="theory-text"></div>
  <button class="btn btn-primary btn-full" id="btn-theory-next">Dalej →</button>
</div>

<div id="examples-view" class="hidden">
  <div id="examples-list" class="examples-list"></div>
  <button class="btn btn-primary btn-full" id="btn-examples-next">Dalej →</button>
</div>
```

#### `startLesson` Flow Change

```
if (data.theory) show theory-view
else show question-area directly
```

### 4. Time and Answer Statistics

#### Client-Side Tracking

- `lessonStartTime`: set to `Date.now()` when first question is shown
- `sessionCorrect`, `sessionWrong`: counters reset at lesson start, incremented in `handleAnswer`

#### New API Endpoint: `lesson_complete`

Called when all questions in a session are answered (i.e., `lessonQuestions.length === 0`).

**Request:** `POST api.php?action=lesson_complete`
```json
{
  "user": "Alice",
  "lesson": "Present Perfect I – Twierdzące",
  "correct": 8,
  "wrong": 3,
  "time_ms": 95000
}
```

**Response:** `{ "success": true }`

#### Profile JSON Schema Extension

```json
{
  "name": "Alice",
  "points": 42,
  "total_time_ms": 3600000,
  "lessons": {
    "Present Perfect I – Twierdzące": {
      "learned": [1, 2, 3],
      "points": 5,
      "correct_total": 12,
      "wrong_total": 4,
      "time_ms": 180000
    }
  }
}
```

`correct_total`, `wrong_total`, `time_ms` accumulate across sessions. `total_time_ms` is the sum across all lessons.

#### Profile Modal Changes

Table header:

| Lekcja | Pytań | Opanowane | % | Poprawne | Błędne | Czas |
|--------|-------|-----------|---|----------|--------|------|

Time displayed as `mm:ss` (e.g. `3:07`). Total time shown below table.

#### `profile` API Response Extension

Each stats entry gains: `correct_total`, `wrong_total`, `time_ms`. Response gains: `total_time_ms`.

#### `reset_lesson` Behavior

When resetting a lesson, subtract its `time_ms` from `total_time_ms`, zero out `correct_total`, `wrong_total`, `time_ms`.

### 5. Keyboard Input (1/2/3)

A `keydown` listener is added on `document` when a question is displayed and removed after an answer is given.

- Key `1` → clicks the 1st `.answer-btn` in DOM order (visual top)
- Key `2` → clicks the 2nd `.answer-btn`
- Key `3` → clicks the 3rd `.answer-btn`

The listener also works on theory/examples screens: no effect (only active during questions).

The listener is also removed when navigating back to menu (btn-back click).

## Files Changed

| File | Change |
|---|---|
| `style.css` | answers-grid 1-column, taller answer-btn, theory/examples styles |
| `index.php` | Add `#theory-view`, `#examples-view` HTML; extend profile table |
| `app.js` | Auto-advance, theory flow, time+stats tracking, keyboard listener |
| `api.php` | New `lesson_complete` action; extend `profile` and `reset_lesson` |
| `data/*.json` | Add `theory` field to all reorganized lesson files |

## Out of Scope

- No server-side time validation (trust client)
- No per-question timing
- No "streak" or gamification beyond existing points
