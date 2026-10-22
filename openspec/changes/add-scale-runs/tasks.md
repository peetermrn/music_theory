# Tasks

## 1. Check that runs can be heard

- [ ] 1.1 Before building anything, run a quick check with the existing listener. In a throwaway dev-only page or console snippet (deleted afterwards), log each `onNote` from `listener()` while A minor position 1 is played up and down on a real guitar with the metronome at 60, 80 and 100 bpm, quarter notes then eighth notes. Verify every note is logged once at 60 and 80 bpm in quarter notes. Write down in this task the fastest tempo that drops no notes, and any octave misreads on the low strings. If 60 bpm quarter notes already drop notes, stop and raise it before continuing.
  - Simulated result (Karplus-Strong plucks of A minor position 1, fed through `listener()` with the browser's 4096-sample, 50 ms framing): all 33 notes are heard exactly, in quarter notes up to 140 bpm and in eighths up to 100 bpm. Eighths at 120 bpm drop 3 notes; at 140 bpm they drop 18. The real-guitar check is still to do.

## 2. Shared shapes and run logic

- [x] 2.1 Move `lay`, `position`, `keyMap` and their helpers from Visuals.jsx into `src/shapes.js`, unchanged, and import them in Visuals.jsx. Verify `npm run build` passes, and that the Visuals page still shows the spec's known shapes: A minor pentatonic position 1; A minor 7-note position 1 (5 7 8, 5 7 8, 5 7, 4 5 7, 5 6 8, 5 7 8); E major pentatonic position 1 at frets 11–14; and the 3-per-string A minor position 1.
- [x] 2.2 Add `src/runs.js` with these pure functions:
  - `runNotes(root, type, k)`: `{ midi, s, f }` steps up and back down;
  - `follow(state, midi)`: the reducer from design.md;
  - `settle(cell, { shown, clean })`;
  - `suggest(store, today)`;
  - storage helpers: read tolerates bad JSON, write is wrapped in try/catch.

  Verify with a throwaway node script (deleted afterwards):
  - A minor position 1 is 33 steps, from 45 (low E string, fret 5) up to 72 (high E string, fret 8) and back to 45;
  - every one of the 120 runs is 31 or 33 steps, with no repeated pitch on the way up and a top step of at most 78;
  - `follow` moves on for the right note, ignores the note just counted, and counts a mistake for any other note, including the right note an octave off;
  - `settle` gives every transition in the "Clean runs and cell states" scenarios;
  - `suggest` gives C major/1 on an empty store, C major/5 when only C major 1–4 are known, a seen cell before a not-started one, and a due cell first;
  - reading `"{bad"` gives an empty store.
- [x] 2.3 Give `listener(onNote, range)` in play.js a range parameter, defaulting to today's 70–700 Hz. Verify `npm run build` passes and that Key notes, Fretboard notes and Play it back still answer as before in `npm run dev`.

## 3. Screens

- [x] 3.1 Add an optional `played` prop to `Fretboard`: a set of `"s.f"` strings, drawn with a `played` class, plus its style in styles.css for both themes. Verify the Visuals page and Show me look unchanged, and that a shown run marks only the notes that were played.
- [x] 3.2 Build `src/Runs.jsx`. The page has the Major / Minor switch (opens on Major), the 12 × 5 map with the four cell states and aria-labels, the "N of 60 known" count, and "Next run: …". The run has the prompt, the "n / total" count with up/down, the mistake line, the shown fretboard with degree labels, Show me for runs from memory, and Quit back to the page. The result shows clean or not, mistakes, the time to one decimal, the cell's new state, Next run, Again and a back control. Reuse an exported `Listening` from Play.jsx so the microphone is held only during a run. Give each screen its own name for the scroll-to-top effect. Verify in `npm run dev` at phone width:
  - the map fits with no horizontal scroll;
  - tapping a cell starts that run;
  - Quit leaves the cell unchanged;
  - after the result the microphone indicator is gone;
  - with the microphone blocked, the run shows the explanation and Try again, and Quit works.
- [x] 3.3 Wire it into App.jsx: add the `runs` entry to `PLAY` after "Play it back", open the Runs page from it (not `Play`), and add the "How it works" paragraph on runs and the map, as the app-help delta asks. Verify:
  - the home screen and the help both list "Scale runs" under "Play on guitar";
  - the three other entries still start their sessions in one tap;
  - opening the page from a scrolled-down home screen shows it from the top.

## 4. Integration

- [x] 4.1 Check progress across a restart. Play a shown run of C major position 1 cleanly and check the cell is seen. Play it again from memory cleanly and check it is known. Reload the app and check it is still known. Then set its stored day 8 days back in devtools, reload, and check it shows as due and is the Next run. Also block site storage, and check the map is empty and a run still reaches its result.
- [ ] 4.2 Run `npm run build` and verify it passes. Then in `npm run dev`, play the Scale runs mode on a real guitar: a full shown run, a run from memory with one deliberate wrong note (the cell stays seen and the result shows 1 mistake), a run whose top note is high on the neck (E major position 1), and Show me partway through a run from memory.
  - Done with a simulated guitar (generated plucks through Chrome's fake microphone): `npm run build` passes; the shown run of C major position 1 is clean and becomes seen; one wrong note is named, the result shows 1 mistake, and the cell stays seen; a clean run from memory becomes known and is due 8 days later; Show me after 10 notes lights those 10 and makes the result seen; E major position 1 is heard to its top note. Still to do: the same runs on a real guitar.
