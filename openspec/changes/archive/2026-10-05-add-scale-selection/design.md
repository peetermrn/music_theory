# Design

## Context

`scale(root, type)` in `src/theory.js` spells a scale by giving each note the next letter name, which is only correct for seven-note scales. `makeQuestion(mode, spec)` picks a key by index into `KEYS`, and that index is what `spec` stores for Review mistakes. Best scores live in `localStorage` under `theory-quiz.best.<mode>`. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Pentatonic scales with correct spelling, without rewriting the spelling code.
- A selection that changes nothing until the user touches it.
- Adding a later scale group (blues, harmonic minor, modes) is a data entry plus a chip.

**Non-Goals:**
- A general scale-formula engine with altered degrees. The blues scale will need one; it is designed in that change.

## Decisions

**A pentatonic is defined as a subset of a seven-note parent scale.** Major pentatonic is positions 1 2 3 5 6 of the major scale; minor pentatonic is positions 1 3 4 5 7 of the natural minor scale. The parent is spelled by the existing code and the subset is taken from it, so spelling is correct in every key with no new logic. It also hands the distractor code the left-out notes directly. Alternative considered: degree formulas with accidentals (1 b3 4 5 b7), which is more general but only needed for the blues note.

**Scale groups are data.** Each group has an id, a chip label and the scales it contains:

| Group id | Chip | Scales | Roots |
|---|---|---|---|
| `major-minor` | Major & minor | major, natural minor | 12 major, 12 minor |
| `pentatonic` | Pentatonic | major pentatonic, minor pentatonic | 12 major, 12 minor |

A question's key is drawn evenly from all root-and-scale pairs of the selected groups, so with both chips on half the Notes questions are pentatonic.

**`makeQuestion` receives the selected groups as an argument.** `src/theory.js` stays free of storage and UI state. Chords and Relatives ignore the argument.

**`spec` stores root and scale id, not an index into `KEYS`.** Review mistakes then rebuilds the same question regardless of the selection.

**Prompts name the scale in full:** "What is the 3rd note of A minor pentatonic?" and "Which set of notes is the A minor pentatonic scale?". The existing wording says "note", not "degree", so the 3rd note of A minor pentatonic is unambiguously D.

**Pentatonic distractors.**
- Notes: other notes of the same pentatonic, one of the two parent-scale notes it leaves out, and a semitone neighbour of the answer.
- Scales: the correct five notes with one note replaced by a left-out parent note (A C D E **F**), or with one note moved a semitone. Every choice keeps the root first and stays in ascending order.

**Chips are plain toggle buttons above the mode cards**, labelled "Scales". Tapping the only chip that is on does nothing. Alternative considered: a modal or settings screen, rejected because every mode must still start in one tap.

**Storage.**
- Selection: `theory-quiz.scales`, the selected group ids joined with `+` in a fixed order. Missing, unreadable or unknown values fall back to `major-minor`.
- Best score for Notes, Scales and Mixed: `theory-quiz.best.<mode>` when only `major-minor` is selected, which is today's key, so existing scores carry over. Otherwise `theory-quiz.best.<mode>.<selection>`, for example `theory-quiz.best.notes.pentatonic`.
- Chords, Relatives, Guitar and Bass keep their single key.

## Risks / Trade-offs

- [The chip row sits above Chords and Relatives, which ignore it] → The row is labelled "Scales" and prompts always name the scale. If it confuses in use, the card descriptions can say so.
- [A pentatonic Scales answer has five notes and its distractors differ by a single note] → That is the intended difficulty, the same as the seven-note questions.
- [More best-score keys] → Three selections times three modes at most with two chips. Each is one small number.
- [The subset model cannot express the blues scale] → Accepted. The later change extends a scale definition with one added note; nothing here blocks it.

## Migration Plan

No migration. Existing best scores are read from their current keys under the default selection. Removing the feature leaves the extra keys unused.
