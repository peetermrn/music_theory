# Proposal

## Why

Every mode in the app trains theory on paper: names, spellings, positions. None of it trains the ear, so knowing that C to E is a major 3rd does not help recognise one when it is played. Interval recognition is the first step of ear training and fits the same short phone sessions the app is built for.

## What Changes

- One **Ear training** button on the home screen, below "Memorize the fretboard". It opens a separate Ear training page with Level 1 to Level 6 and Custom. Ear training is its own area with its own sessions, not another quiz mode.
- An ear question plays two notes one after the other, lower note first, from a random starting note. The user picks the interval.
- Levels add intervals step by step. Each level shows all of its intervals as answer choices, in a fixed order from smallest to largest:
  1. major 3rd, octave
  2. adds perfect 5th
  3. adds minor 3rd, perfect 4th
  4. adds minor 2nd, major 2nd
  5. adds minor 6th, major 6th
  6. adds tritone, minor 7th, major 7th (all 12)
- **Custom**, on the Ear training page, lets the user tick any two or more of the 12 intervals to drill, for example only minor 3rd against major 3rd. The selection is remembered on the device.
- The question screen plays the interval automatically and has three sound buttons: **Play both**, **1st note** and **2nd note**. Single notes can be tapped repeatedly to hum or sing against.
- After answering, the app names the picked and the correct interval, the sound buttons stay active, and tapping any answer choice plays that interval from the same starting note, so a wrong pick can be compared with the right one before tapping Next.
- Ear sessions have 10 questions and no time limit, and end with a results screen like the quiz one (score, percentage, average answer time), broken down per interval. They have **no speed game** and **no "Review mistakes"**. Quitting or finishing returns to the Ear training page.
- The 💡 button in an ear session opens a separate ear cheat sheet: each interval with its size in semitones and a short description, and each row plays the interval when tapped.
- The "How it works" overlay explains ear training.
- Two sounds to choose from: a sampled piano (the default) and a sampled acoustic guitar. A sound button on the ear question screen switches between them and shows the current one, and the choice is remembered on the device.
- Piano and guitar each use nine short recordings (about 1.1 MB for both together) that ship with the app and are cached for offline use. No new dependency. A synthesized tone was built first and dropped after listening to it.

Ear questions do **not** join Mixed mode.

### Out of scope

- Descending intervals, and both notes sounding at the same time
- Chord quality, scale type, degree-in-key and key recognition
- Saved scores or progress per level, and locking of levels
- Song mnemonics for intervals
- Holding a note button for a continuous note; single notes are replayed by tapping again
- Sounds other than piano and acoustic guitar, including a synthesized tone
- A speed game or Review mistakes for ear training
- Any change to the existing modes, their questions or their best scores

## Capabilities

### New Capabilities
- `ear-training`: interval recognition by ear: its own page, the levels and Custom selection, what is played, the sound controls and sound choice, the answer choices, feedback that lets the user listen again, and its own session and results rules.

### Modified Capabilities
- `quiz-session`: the home screen gains the Ear training entry, and the capability states that ear training is not a quiz mode, so its rules (four choices, Review mistakes, returning to the home screen) do not apply to ear sessions.
- `speed-mode`: no speed game is offered for ear training.
- `cheat-sheet`: the 💡 button opens the ear cheat sheet in an ear session; new requirement for its content.
- `app-help`: the overlay lists the Ear training entry and explains ear training separately from normal sessions.
- `app-platform`: the phone-first layout requirement allows two columns of buttons, and its scenario no longer assumes every question has four answers.

## Impact

- `src/audio.js` (new): sound with the browser's Web Audio API, playing the piano and guitar samples.
- `public/piano/` (new): nine piano recordings from the Salamander Grand Piano set, which requires a credit.
- `public/guitar/` (new): nine acoustic guitar recordings from the tonejs-instruments collection (CC BY 3.0, requires a credit), trimmed to a few seconds each.
- `vite.config.js`: the offline cache also includes the piano and guitar recordings.
- `src/ear.js` (new): interval names, level definitions and the ear question generator.
- `src/Ear.jsx` (new): the Ear training page, its session, results and cheat sheet.
- `src/App.jsx`: the Ear training button, switching to the Ear training page, and the help text. The existing quiz code is not touched.
- `src/theory.js`: no change.
- `src/styles.css`: Ear training button and page, sound buttons, compact two-column answer grid, cheat-sheet rows.
- Purpose lines of the main `speed-mode`, `quiz-session` and `cheat-sheet` specs, which a delta cannot change: reworded by hand as part of this change so they stop saying "every mode".
- Two new `localStorage` keys: the Custom selection and the chosen sound.
- No new dependencies, no backend, and it keeps working offline. The app download grows by about 1.2 MB.
