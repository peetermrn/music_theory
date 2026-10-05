# Proposal

## Why

Interval training teaches the distance between two notes. The next step for the ear is hearing what kind of chord three or four notes make: major or minor first, then diminished, augmented and the seventh chords. The app's Chords mode already asks which triad sits on a degree on paper; this trains recognising those chord types by sound.

This change builds on `ear-training-home-section`, which must be applied first.

## What Changes

- A second card under the "Ear training" heading on the home screen: **Chord training**, "Which kind of chord you hear". It opens a Chord training page with Level 1 to Level 5 and Custom, laid out like the Interval training page.
- A chord question plays one chord from a random root: its notes one after another from the root upwards, then all of them together. The user picks the chord type. The question is the type (major, minor, ...), never the chord's name, which would need perfect pitch.
- Nine chord types, all in root position with the notes as close together as possible:
  - triads: major, minor, diminished, augmented
  - sevenths: dominant 7th, major 7th, minor 7th, half-diminished, diminished 7th
- Levels add types step by step, and each level shows all of its types as answer choices in a fixed order:
  1. major, minor
  2. adds diminished
  3. adds augmented
  4. adds dominant 7th, major 7th, minor 7th
  5. adds half-diminished, diminished 7th (all 9)
- **Custom** lets the user tick any two or more of the nine types, remembered on the device separately from the interval selection.
- Three sound buttons on the question: **Play again** (one by one, then together), **One by one** and **Together**.
- After answering, tapping any answer choice plays that chord type from the same root, so a wrong pick can be compared with the right one.
- Everything else works as in interval training: 10 questions, no time limit, the shared piano/guitar sound choice, a results screen broken down per chord type, no speed game, no "Review mistakes", and Quit or Finish returns to the Chord training page.
- The 💡 button in a chord session opens a chord cheat sheet: each type with its formula (for example `1 ♭3 5`) and a short description, and each row plays the chord when tapped.
- "How it works" lists Chord training and explains it.
- Notes can now sound at the same time. Interval training is not changed by this: its two notes are still played one after the other.

Chord questions do **not** join Mixed mode.

### Out of scope

- Inversions and spread-out voicings; every chord is in root position, close together
- Naming the root or the chord ("C minor"), and chord progressions
- Other chord types (suspended, 6th, 9th and beyond)
- Buttons for single notes of the chord
- Playing the two notes of an interval together in interval training
- Saved scores or progress per level, locking of levels, a speed game, Review mistakes
- Degree training, which is the next change (`add-ear-degrees`)
- Any change to the quiz modes, including the existing "Chords" mode

## Capabilities

### New Capabilities
- `ear-chords`: chord-type recognition by ear: its home entry and page, the chord types and levels, the Custom selection, what is played, the sound controls, the answer choices, and which interval-training session rules it shares.

### Modified Capabilities
- `cheat-sheet`: the 💡 button in an ear-training session opens the cheat sheet of the exercise being played; new requirement for the chord cheat sheet's content.
- `app-help`: new requirement that the overlay explains chord training.

## Impact

- `src/ear.js`: chord types, chord levels and the chord question generator; the interval data is wrapped in the same "exercise" description so one screen can run both.
- `src/Ear.jsx`: becomes one shared exercise screen (page, session, results, cheat sheet) driven by an exercise description, instead of being written for intervals only. Interval training must behave exactly as before.
- `src/audio.js`: `play` accepts several notes sounding together, with their volume reduced so a four-note chord does not distort.
- `src/App.jsx`: the second card, which exercise is open, and the help text.
- `src/styles.css`: at most small additions; the nine choices use the existing two-column answer grid.
- Purpose lines of the main `ear-training` and `cheat-sheet` specs, edited by hand because a delta cannot change them.
- One new `localStorage` key for the chord Custom selection. The interval Custom selection and the sound choice keep their keys.
- No new dependencies, no new recordings, no backend; works offline as before.
