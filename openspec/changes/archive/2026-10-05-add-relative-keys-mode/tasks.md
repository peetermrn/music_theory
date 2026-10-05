# Tasks

## 1. Relatives questions

- [x] 1.1 In `src/theory.js`, add the `relatives` kind to `makeQuestion`: prompt by direction from the key's type, answer read from the 6th note (major) or 3rd note (minor) of the scale, `spec` of `{ kind, key }`; verify in the browser console that G major gives "E minor", C# minor gives "E major", F# major gives "D# minor" and Eb minor gives "Gb major"
- [x] 1.2 Build the distractors from the pool in design.md (parallel key, two other scale degrees, a semitone neighbour spelled as a usual key name); verify over 200 generated questions that every question has four distinct choices of the asked quality and that no choice is spelled E#, B#, Fb or Cb
- [x] 1.3 Add `relatives` to the kinds Mixed picks from; verify 100 generated Mixed questions contain all four kinds and no Guitar or Bass question

## 2. Home screen and results

- [x] 2.1 In `src/App.jsx`, add Relatives to the "Keys" section between Chords and Mixed and to `LABEL`; verify the card starts a 10-question Relatives session, its speed strip starts a speed game, and a Mixed results screen lists "Relatives" in the breakdown
- [x] 2.2 In `src/styles.css`, make the fifth "Keys" card (Mixed) span both columns; verify at phone width there is no gap or horizontal scrolling
- [x] 2.3 Verify Review mistakes on a Relatives session asks the same keys again with reshuffled choices, and that a finished Relatives speed game stores a best score that survives a reload

## 3. Cheat sheet

- [x] 3.1 Add a "Relative keys" entry to `CheatSheet` in `src/App.jsx` with the 6th-note and 3rd-note rule; verify it is shown, and reads the same, when opened on a Relatives question and on a Notes question

## 4. Integration

- [x] 4.1 Run `npm run build` and, in `npm run dev`, play one normal Relatives session, one Relatives speed game to game over, and one Mixed session; verify the build succeeds and play matches the specs
