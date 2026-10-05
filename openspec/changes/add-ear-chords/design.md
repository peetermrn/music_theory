# Design

## Context

See proposal.md for motivation and scope, and the delta specs for requirements. This design assumes `ear-training-home-section` is applied: the home screen has an "Ear training" section with one card, and `App` holds a boolean `ear` that swaps the home screen for `<Ear onExit>`.

`src/Ear.jsx` (about 190 lines) is written for intervals throughout: it imports `INTERVALS`, `EAR_LEVELS` and `earQuestion` directly, hard-codes the three sound buttons, the Custom storage key, the feedback wording, the results tally and the cheat sheet rows. `src/audio.js` exposes `play(notes)`, which schedules single notes one after another with a fixed gap; nothing can sound together. Its recordings cover C3 to C5, one every three semitones.

A third exercise (`add-ear-degrees`) follows this one and needs the same screens again.

## Goals / Non-Goals

**Goals:**
- One exercise screen that runs intervals and chords from a description of each, so the third exercise is data and a generator, not a third copy of the screen.
- Interval training behaves exactly as it does now, including its stored Custom selection.
- Chords reuse the existing recordings; nothing new to download.

**Non-Goals:**
- A general music engine. `play` gains simultaneous notes and nothing else.
- Sharing chord data with `theory.js`. The Chords quiz mode works with note names in a key; here a chord is a list of semitones above a root.
- Changing how intervals sound.

## Decisions

### 1. An exercise is a description; `Ear.jsx` is the one screen that runs it

`src/ear.js` exports `EXERCISES`, an ordered list. Each entry is a plain object:

```
id, title, desc              "chords", "Chord training", "Which kind of chord you hear"
items                        [{ id, name, sheet, desc }]  in answer-choice order; `sheet` is the cheat-sheet column
levels                       arrays of item ids
customKey, customDefault     localStorage key and the ids ticked at first
question(ids)                -> { answer, key, root, ... }   `key` is what repeat avoidance compares
controls                     [{ label, wide, steps(q) }]     the sound buttons; the first is what plays by itself
preview(q, id)               -> steps played when a choice is tapped after answering
demo(id)                     -> steps played from a cheat-sheet row
prompt, sheetTitle, noun     "Which chord is this?", "Chords", "chord type"
```

`Ear` takes `exercise` and `onExit` and contains no interval- or chord-specific code: the page, the Custom chips, the session, the feedback line, the results tally and the cheat sheet are all built from the description. Answer choices are `items` filtered to the session's ids, which gives the fixed order for free.

The interval exercise is today's behaviour expressed in this form: its `customKey` stays `theory-quiz.ear-custom` and its item ids stay the semitone counts, so a stored selection keeps working.

`App` replaces the boolean `ear` with the id of the open exercise (or `null`) and renders the home cards and the help entries from `EXERCISES`.

*Alternative considered:* a second component `EarChords.jsx` copied from `Ear.jsx`. Quicker today, but the degrees exercise would make it three copies of the session, results and sound-choice code. The earlier design accepted about 40 duplicated lines between `App` and `Ear` on the grounds that a third kind of session would be the moment to share; within ear training that moment is now.

### 2. Sound: steps that may hold several notes

`play(steps, gap)` replaces `play(notes)`. A step is one MIDI note or an array of notes that start together; steps are `gap` seconds apart (default the current 0.6, so interval calls are unchanged). Each note of a step still gets its own source and gain node, so `stop()` and the fades work as they do now.

Notes that sound together are each scaled by `1 / sqrt(n)`, which keeps a four-note chord at roughly the loudness of a single note and away from clipping. As now, the last step rings for the full note length and earlier steps end shortly after the next one starts.

A chord is played as `[root, third, fifth, (seventh), [all of them]]` with a shorter gap than intervals. Starting values, to be tuned by ear: 0.4 s between the single notes, the same before the full chord, and the full chord ringing 2.2 s.

*Alternative considered:* a `DynamicsCompressorNode` on the output instead of scaling. It handles any number of notes but colours every sound, including single notes that were tuned by ear in the last change.

### 3. Chord data and questions

```
CHORDS   9 entries: id, name, semitones above the root, formula, description
levels   [major, minor], +diminished, +augmented, +dominant 7th, major 7th, minor 7th, +half-diminished, diminished 7th
```

| Type | Semitones | Formula | Description |
|---|---|---|---|
| Major | 0 4 7 | 1 3 5 | bright, settled |
| Minor | 0 3 7 | 1 ♭3 5 | dark, sad |
| Diminished | 0 3 6 | 1 ♭3 ♭5 | tense, cramped |
| Augmented | 0 4 8 | 1 3 ♯5 | dreamy, unsettled |
| Dominant 7th | 0 4 7 10 | 1 3 5 ♭7 | bluesy, wants to move on |
| Major 7th | 0 4 7 11 | 1 3 5 7 | soft, jazzy, a little bittersweet |
| Minor 7th | 0 3 7 10 | 1 ♭3 5 ♭7 | mellow, smooth |
| Half-diminished | 0 3 6 10 | 1 ♭3 ♭5 ♭7 | dark and unresolved |
| Diminished 7th | 0 3 6 9 | 1 ♭3 ♭5 ♭♭7 | dramatic, tense all over |

The root is a random MIDI note from C3 to C4 (48 to 60), the same range as interval questions. The highest chord note is 11 semitones above the root, so nothing passes B4 and every note is within the recordings. Repeat avoidance compares `"<root>:<type>"`; Level 1 has 26 such combinations for 10 questions.

The cheat sheet plays every chord from middle C.

### 4. Screens

- **Home:** the "Ear training" section renders one card per exercise. Two cards sit side by side in the existing grid.
- **Chord training page:** the same page as interval training, built from the description: five level cards (Level 1 lists its types, later levels say what they add) and nine Custom tick boxes in two columns.
- **Question:** sound buttons come from `controls`: a full-width **Play again** and, under it, **One by one** and **Together**. For intervals the same slot holds Play both, 1st note and 2nd note as now.
- **Answers:** up to five choices use the single column, more use the existing compact two-column grid. Nine choices are five rows, one row fewer than the twelve intervals that already fit a 360 x 740 screen. The longest label is "Half-diminished".
- **Feedback:** `Not quite. You picked Major, it was Minor.` No note names anywhere.

### 5. Storage

- `theory-quiz.ear-chords-custom`: chord type ids joined with `+`, validated like the interval selection (unknown ids dropped, fewer than two falls back to major and minor).
- `theory-quiz.ear-custom` and `theory-quiz.ear-sound` are unchanged. The sound choice is read once and used by every exercise.

### 6. Purpose lines of existing specs

Edited by hand in `openspec/specs/`, as a delta cannot change a Purpose:

- `ear-training`: add that its session rules are also the base for the other ear-training exercises (`ear-chords`).
- `cheat-sheet`: "in ear training a list of intervals that can each be played" becomes a playable list of the exercise's intervals or chord types.

## Risks / Trade-offs

- [Rewriting `Ear.jsx` around a description could break interval training, which was just tuned and accepted] → The refactor is its own task group, finished and checked against intervals before any chord code is added.
- [Three- and four-note chords have a different number of notes, so in Levels 4 and 5 counting the notes narrows the answer to triads or sevenths] → Accepted: telling how many notes a chord has is part of the skill, and the hard part (which triad, which seventh) remains. Custom can drill sevenths alone.
- [Close chords on low roots can sound muddy, especially on guitar samples shifted by a semitone] → Judge in the tuning task; if needed move the 13-note root range up, by one semitone for seventh chords and by up to four for triads, which keeps every note within the recordings and the range at the octave the spec asks for.
- [Summed notes could distort on a phone speaker] → Per-note scaling as in decision 2; check at full phone volume in the tuning task.
- [Diminished 7th and half-diminished are hard to tell apart, and augmented has no clear "bottom"] → They are in the last levels, and Custom plus tapping the choices after answering exist for exactly this.
- [The home screen now has a quiz mode "Chords" and an exercise "Chord training"] → Different sections and different descriptions; the help text names both.
- [Answer time includes about 3 s of playback for a seventh chord] → Same trade-off as accepted for intervals: it is constant per chord size.

## Open Questions

- Exact gap between the single notes and before the full chord. Set by ear during implementation; no effect on specs or tasks.
