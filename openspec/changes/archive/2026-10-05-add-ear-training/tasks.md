# Tasks

## 1. Interval data and question generator

- [x] 1.1 Create `src/ear.js` exporting `INTERVALS` (semitones, name, description for all twelve) and `EAR_LEVELS` (six arrays); verify with `node -e "import('./src/ear.js').then(m => console.log(m.EAR_LEVELS.map(l => l.length)))"` printing `[ 2, 3, 5, 7, 9, 12 ]`
- [x] 1.2 Add `earQuestion(semis)` to `src/ear.js` returning `{ kind: "ear", prompt, answer, options, notes, id }` with options in ascending order and the low note between MIDI 48 and 60; verify with a `node -e` loop of 200 calls for `[4, 12]` that every answer is in options, options are always `["Major 3rd", "Octave"]`, and `notes[1] - notes[0]` matches the answer

## 2. Sound

- [x] 2.1 Create `src/audio.js` with a lazily created `AudioContext`, `play(notes)` (sequential notes, resumes the context, stops the previous sound first) and `stop()` (short fade); all calls guarded so a missing or blocked Web Audio API never throws; verify with `npm run build`
- [x] 2.2 Download the nine Salamander recordings (C3, Ds3, Fs3, A3, C4, Ds4, Fs4, A4, C5) from `https://tonejs.github.io/audio/salamander/` into `public/piano/`, confirm the set's licence and note the required credit, and add mp3 to `workbox.globPatterns` in `vite.config.js`; verify that `npm run build` lists the nine mp3 files among the precached entries
- [x] 2.3 Download the nine `guitar-acoustic` recordings (same note names) from `https://nbrosowsky.github.io/tonejs-instruments/samples/guitar-acoustic/` into `public/guitar/`, trim each with ffmpeg to about 3 seconds with a short fade-out, and note the required credit; verify that the nine files exist, total under 0.7 MB, and are listed among the precached entries by `npm run build`
- [x] 2.4 Add the sampled voices (piano and guitar) and `setVoice` to `src/audio.js`: load and decode a voice's recordings on first use, play each note from the nearest recording with a shifted playback rate, stay silent if loading fails; verify with `npm run build`
- [x] 2.5 Tune the tone, note length and gap constants of the two voices by ear once the question screen from group 4 can play them; verify that both notes are clearly separate, that restarting a note does not click, that piano and guitar notes a semitone from a recording sound in tune, and that the two voices are comfortable and similar in volume on a phone

## 3. Home button and Ear training page

- [x] 3.1 Add the `ear` state and the "Ear training" card to the home screen in `src/App.jsx` (below "Memorize the fretboard", full width, no ⚡ Speed button), and render `<Ear onExit>` from a new `src/Ear.jsx` when it is tapped; verify in `npm run dev` that the home screen shows one Ear training button and the existing cards unchanged, and that `git diff src/App.jsx` touches no quiz logic
- [x] 3.2 Build the Ear training page in `src/Ear.jsx`: back button, title, and six level cards with interval descriptions built from `EAR_LEVELS` and `INTERVALS`; verify that the page opens silently, lists six levels with the right intervals, and that back returns to the home screen with its scale boxes and best scores as they were
- [x] 3.3 Add the Custom section to the page: twelve tick boxes, a Start button disabled below two ticks, and the selection stored under `theory-quiz.ear-custom` (default minor 3rd and major 3rd); verify that Start is disabled with one tick and that the ticks survive a page reload

## 4. Session and question screen

- [x] 4.1 Add the session to `src/Ear.jsx`: 10 questions from `earQuestion`, repeat avoidance on `id`, the counter bar with Quit, answer timing, and answer buttons in fixed order; verify that tapping Level 1 shows question 1 of 10 with two choices, that Quit returns to the Ear training page, and that ticking tritone and perfect 5th in Custom starts a session with exactly those two choices
- [x] 4.2 Add the Play both, 1st note and 2nd note buttons and play the interval automatically when a question appears; call `stop()` on Quit, Next, Finish and unmount; verify that each question plays on arrival, each button plays what it says, rapid taps on one note restart it, and quitting mid-note silences it
- [x] 4.3 Add feedback: mark the pick and the answer, show "You picked X, it was Y", keep answer buttons tappable so they play their interval from the question's starting note, and show Next or Finish; verify that after a wrong answer tapping the pick and then the right answer plays the two different intervals and the score and marked buttons do not change
- [x] 4.4 Add the sound button to the top bar, switching between piano and guitar, store the choice under `theory-quiz.ear-sound` and apply it when `Ear` mounts; verify that each tap changes the icon and replays the interval in the other sound, the second tap returns to piano, the question stays unanswered, and the choice survives a page reload
- [x] 4.5 Style the Ear training page and question in `src/styles.css`: home button, sound buttons, compact prompt, and a two-column answer grid for more than five choices; verify in the browser's device toolbar at 360 x 740 that a Level 6 question shows all twelve choices and the sound buttons without scrolling, and that Next is reachable after answering

## 5. Results, cheat sheet, help and spec purposes

- [x] 5.1 Add the results screen to `src/Ear.jsx`: score, percentage, average answer time, per-interval tally sorted by size, Play again and Finish, no "Review mistakes"; verify that a Level 2 results screen lists Major 3rd, Perfect 5th and Octave with their counts, shows no Review mistakes after a miss, that Play again after a Custom session starts straight away with the same intervals, and that Finish returns to the Ear training page
- [x] 5.2 Add the `EarSheet` overlay (twelve rows with semitones and description, each playing its interval from middle C) and open it from 💡; verify that a row plays its interval, closing the sheet stops the sound, and the question underneath is still unanswered
- [x] 5.3 Update the "How it works" overlay in `src/App.jsx`: list the Ear training entry, and add an ear-training paragraph covering its page, levels and Custom, replaying, tapping choices after answering, the sound button and its two sounds, no speed game or Review mistakes, and the credits for the piano and guitar recordings; verify each of those points is stated and that the four-choices sentence is worded for the quiz modes only
- [x] 5.4 Reword the Purpose lines of `openspec/specs/speed-mode/spec.md`, `openspec/specs/quiz-session/spec.md` and `openspec/specs/cheat-sheet/spec.md` as described in design decision 8; verify with `openspec validate --specs --strict` and that none of the three still claims to cover every mode

## 6. Integration check

- [x] 6.1 Run `npm run build`, then in `npm run dev` play a full Level 1, Level 6 and Custom session, one on piano and one on guitar, and one normal session, one Review mistakes round and one speed game of an existing mode to confirm they are unchanged
- [x] 6.2 Run `npm run preview`, load the app once, switch the browser to offline and confirm an ear session still plays in piano and guitar
