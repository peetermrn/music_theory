# Proposal

## Why

Intervals and chord types are heard in isolation. Real music happens inside a key, and the most useful ear skill there is hearing where a note sits in that key: is it the tonic, the 3rd, the 5th? The app's Notes mode already asks "which note is on the 5th degree" on paper; this exercise trains the same idea by sound, and needs no perfect pitch because the app establishes the key first.

Guessing the key itself from a few notes was considered and dropped: three or four notes fit several keys, a major key and its relative minor share all their notes, and naming a key by ear needs perfect pitch.

This change builds on `add-ear-chords`, which must be applied first (it provides the shared exercise screen and chords that sound together).

## What Changes

- A third card under the "Ear training" heading on the home screen: **Degree training**, "Which degree of the key you hear". It opens a Degree training page with Level 1 to Level 4 and Custom.
- A degree question picks a random key, plays a short chord progression in that key that ends on its home chord, pauses, and then plays one note of the key's scale. The user picks which degree that note is: 1st to 7th.
- The key changes with every question, so the note has to be heard against the progression and cannot be remembered by its pitch.
- Levels:
  1. major keys: 1st, 3rd, 5th
  2. major keys: adds 2nd, 4th
  3. major keys: adds 6th, 7th (all seven)
  4. minor keys: all seven degrees of the natural minor scale
- The question says whether the key is major or minor, but not which key it is.
- **Custom** lets the user choose major or minor keys and tick any two or more of the seven degrees, for example only the 1st, 3rd and 5th in minor. Remembered on the device.
- Three sound buttons on the question: **Play again** (progression, then the note), **Key** (the progression alone) and **Note** (the note alone).
- After answering, the feedback also names the key and the note, for example "The 5th of D major is A", which ties the sound back to the Notes mode. Tapping any answer choice then plays that degree's note in the same key, so a wrong pick can be compared with the right one.
- Everything else works as in the other ear-training exercises: 10 questions, no time limit, the shared piano/guitar sound choice, a results screen broken down per degree, no speed game, no "Review mistakes", and Quit or Finish returns to the Degree training page.
- The 💡 button in a degree session opens a degree cheat sheet: each degree with its name (tonic, supertonic, ...) and a short description of how it feels in the key, and each row plays the progression and that degree in a fixed key.
- "How it works" lists Degree training and explains it.

Degree questions do **not** join Mixed mode.

### Out of scope

- Naming the key by ear, and any question whose answer is a note name
- Notes outside the key (chromatic notes), and the harmonic minor and pentatonic scales
- More than one note after the progression (melodies), and notes in other octaves than the one above the tonic
- Recognising which chord of the key is played (the ear version of the Chords mode)
- Keeping one key for a whole session
- A choice of progression; there is one for major keys and one for minor keys
- Saved scores or progress per level, locking of levels, a speed game, Review mistakes
- Any change to interval training, chord training or the quiz modes

## Capabilities

### New Capabilities
- `ear-degrees`: scale-degree recognition by ear: its home entry and page, how the key is established, the note that is asked, the levels and Custom selection, the sound controls, the answer choices, the feedback that names key and note, and which interval-training session rules it shares.

### Modified Capabilities
- `cheat-sheet`: new requirement for the degree cheat sheet's content. (Which sheet the 💡 button opens is already defined per exercise by `add-ear-chords`; the access requirement gains a scenario for degree sessions.)
- `app-help`: new requirement that the overlay explains degree training.

## Impact

- `src/ear.js`: degree data, levels, the key and progression voicing, and the degree question generator, added as a third entry in the exercise list.
- `src/Ear.jsx`: the shared exercise screen learns two small things: a selection can carry a variant (major or minor) besides its ticked items, and the feedback can carry an extra line supplied by the exercise.
- `src/audio.js`: a step can be a rest, for the pause between the progression and the note.
- `src/theory.js`: one helper that turns a note name into its pitch number is exported; no behaviour change. Key names and note spellings come from the existing `KEYS` and `scale`.
- `src/App.jsx`: only the help text; the home card comes from the exercise list.
- `src/styles.css`: the major/minor switch in Custom.
- Purpose line of the main `cheat-sheet` spec, edited by hand.
- One new `localStorage` key for the degree Custom selection.
- No new dependencies, no new recordings, no backend; works offline as before.
