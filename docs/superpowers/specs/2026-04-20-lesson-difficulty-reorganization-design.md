# Lesson Difficulty Reorganization Design

**Date:** 2026-04-20

## Goal

Reorganize lesson JSON files so that difficulty increases progressively across parts (Part I easiest → Part V hardest). Group questions by sentence type (affirmative, negative, question) to support step-by-step learning.

## Current State

15 lesson files across 6 topic areas. Parts within each topic were split arbitrarily (20 questions each) with no consistent difficulty gradient and mixed sentence types in every file.

Topic areas:
- Present Perfect (I, II)
- Present Perfect – for and since (I, II)
- Present Simple – ever, never, already, yet (I, II) ← misnomer; these are Present Perfect questions
- Past Perfect (I, II)
- Future Perfect (I, II)
- Irregular Verbs – Past Participle (I–V)

## New Structure

### Present Perfect – 5 parts

Source questions: all from current `Present Perfect I`, `Present Perfect II`, `Present Perfect – for and since I/II`, and `Present Simple – ever, never, already, yet I/II`.

| File | Title | Content |
|---|---|---|
| `Present Perfect I.json` | Present Perfect I – Twierdzące | Affirmative: `have/has + past participle`. Simple, common verbs. |
| `Present Perfect II.json` | Present Perfect II – Przeczenia | Negative: `haven't/hasn't + past participle`. |
| `Present Perfect III.json` | Present Perfect III – Pytania | Questions: `Have/Has + subject + past participle?` |
| `Present Perfect IV.json` | Present Perfect IV – Mieszane | Mixed affirmative + negative + question, common verbs. |
| `Present Perfect V.json` | Present Perfect V – Przysłówki i czas trwania | Adverbs (ever, never, already, just, yet) and for/since. |

Existing `Present Perfect – for and since I/II` and `Present Simple – ever, never, already, yet I/II` are **deleted** (content merged into I–V above).

### Past Perfect – 3 parts

Source questions: all from current `Past Perfect I` and `Past Perfect II`.

| File | Title | Content |
|---|---|---|
| `Past Perfect I.json` | Past Perfect I – Twierdzące | Affirmative: `had + past participle`. Simple context sentences. |
| `Past Perfect II.json` | Past Perfect II – Przeczenia i Pytania | Negative `hadn't` + questions `Had...?` |
| `Past Perfect III.json` | Past Perfect III – Mieszane | Mixed, complex sentences with `by the time`, `before/after`, `already`. |

### Future Perfect – 3 parts

Source questions: all from current `Future Perfect I` and `Future Perfect II`.

| File | Title | Content |
|---|---|---|
| `Future Perfect I.json` | Future Perfect I – Twierdzące | Affirmative: `will have + past participle`. Clear time expressions. |
| `Future Perfect II.json` | Future Perfect II – Przeczenia i Pytania | Negative `won't have` + questions `Will...have...?` |
| `Future Perfect III.json` | Future Perfect III – Mieszane | Mixed, complex contexts. |

### Irregular Verbs – Past Participle – 5 parts (unchanged count)

The existing I–V ordering already progresses from most-common to rare verbs. No restructuring needed — only question ordering within each file will be verified for difficulty gradient (easier distractors first, trickier ones later).

## Difficulty Criteria (per question)

A question is **easier** when:
- The correct answer is a common, high-frequency word
- Distractors are clearly wrong (e.g., a present tense form vs past participle)
- The sentence structure is short and unambiguous

A question is **harder** when:
- The correct answer is a less-common irregular form
- Distractors include the simple past form (e.g., `spoke` vs `spoken`)
- The sentence has a subordinate clause or complex time expression
- The adverb/preposition choice requires understanding of usage rules (for vs since)

## Files to Delete

- `Present Perfect – for and since I.json`
- `Present Perfect – for and since II.json`
- `Present Simple – ever, never, already, yet I.json`
- `Present Simple – ever, never, already, yet II.json`

## Files to Create

- `Present Perfect III.json`
- `Past Perfect III.json`
- `Future Perfect II.json` (already exists — will be overwritten)
- `Future Perfect III.json`

## Question ID Policy

IDs are renumbered 1–N sequentially within each new file.
