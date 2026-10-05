# Tasks

## 1. Shared exercise screen (no behaviour change)

- [x] 1.1 In `src/ear.js`, describe interval training as an exercise object (id, title, desc, items, levels, customKey `theory-quiz.ear-custom`, customDefault, question, controls, preview, demo, prompt, sheetTitle, noun) and export it in an `EXERCISES` list; verify with a `node -e` loop of 200 questions for Level 1 that the answer is always among the level's items and the two notes are the right distance apart
- [x] 1.2 Rewrite `src/Ear.jsx` to take an `exercise` prop and build the page, Custom chips, session, sound buttons, feedback, results and cheat sheet from it, with no interval-specific code left; in `src/App.jsx` replace the boolean `ear` with the open exercise id and render the home cards and help entries from `EXERCISES`; verify with `npm run build` and `grep -n -i interval src/Ear.jsx` returning nothing
- [x] 1.3 Check interval training against its spec in `npm run dev`: six levels, a Custom selection stored before this change still ticked, Play both / 1st note / 2nd note, tapping choices after answering, results per interval, the cheat sheet playing from middle C, Quit and Finish returning to the Interval training page; verify each behaves as before the rewrite

## 2. Notes sounding together

- [x] 2.1 Change `play` in `src/audio.js` to take steps (a note or an array of notes that start together) and an optional gap, scaling simultaneous notes by `1 / sqrt(n)`; verify with `npm run build` and that an interval question still plays its two notes one after the other with the same timing as before

## 3. Chord data and questions

- [x] 3.1 Add `CHORDS` (nine types with id, name, semitones, formula, description) and the five levels to `src/ear.js`; verify with `node -e` that the level sizes are `[ 2, 3, 4, 7, 9 ]` and every type's semitones match the table in design decision 3
- [x] 3.2 Add the chord exercise object with its question generator (root between MIDI 48 and 60), controls (Play again, One by one, Together), preview and demo, and add it to `EXERCISES`; verify with a `node -e` loop of 200 Level 5 questions that every answer is among the nine types, every note is between 48 and 71, and the played notes equal root plus the type's semitones

## 4. Chord training screens

- [x] 4.1 Confirm the home screen shows "Chord training" beside "Interval training" under "Ear training" with no ⚡ entry, and that it opens a page titled "Chord training" with five level cards and nine Custom tick boxes; verify that the page opens silently, Start is disabled with one tick, and the ticks survive a reload without changing the interval Custom selection
- [x] 4.2 Play a Level 1 and a Level 5 session; verify that each question plays by itself one note at a time and then together, that One by one and Together each play only that, that rapid taps restart the sound, that Quit silences it and returns to the Chord training page, and that Level 5 shows nine choices in the fixed order
- [x] 4.3 Check feedback and comparing; verify that a wrong answer reads "You picked X, it was Y", that tapping two different choices afterwards plays those chord types from the same root without changing the score or the marked buttons, and that no note name appears anywhere
- [x] 4.4 Check the chord cheat sheet from 💡; verify nine rows with formula and description, that a row plays its chord from middle C, that closing stops the sound, and that the question underneath is still unanswered
- [x] 4.5 Check the layout in the browser's device toolbar at 360 x 740; verify that a Level 5 question shows all nine choices and the three sound buttons without scrolling, that Next is reachable after answering, and that "Half-diminished" fits its button
- [x] 4.6 Tune by ear on a phone: the gap between single notes, the pause before the full chord, and the chord's volume against a single note, on piano and on guitar; verify that a four-note chord does not distort at full volume and that chords on the lowest roots are clear enough to tell major from minor

## 5. Help and spec purposes

- [x] 5.1 Add chord training to the "How it works" overlay: its entry under "Ear training" and a short explanation (own page, five levels and Custom, one by one then together, the answer is the type, replaying, tapping choices after answering, no speed game or Review mistakes); verify each point is stated and that the existing "Chords" mode entry is unchanged
- [x] 5.2 Reword the Purpose lines of `openspec/specs/ear-training/spec.md` and `openspec/specs/cheat-sheet/spec.md` as described in design decision 6; verify with `openspec validate --specs --strict`

## 6. Integration check

- [x] 6.1 Run `npm run build`, then in `npm run dev` play a full chord-training Level 1, Level 5 and Custom session, one on piano and one on guitar, a full interval-training session, and one normal session of the "Chords" quiz mode to confirm it is unchanged
- [x] 6.2 Run `npm run preview`, load the app once, switch the browser to offline and confirm a chord-training session still plays on piano and on guitar
