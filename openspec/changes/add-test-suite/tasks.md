# Tasks

## 1. Set up

- [x] 1.1 Add `vitest`, `jsdom`, `@testing-library/react` and `@testing-library/dom` as dev dependencies, `npm test` and `npm run test:watch` scripts, `vitest.config.js` (React plugin only) and `tests/setup.js` (clean storage before each test, and `scrollTo` and `PointerEvent` for jsdom). Verify `npm test` runs and `npm run build` still passes.
- [x] 1.2 Add shared helpers in `tests/helpers/`: generated tones and plucks in microphone-sized frames, blocked storage, and a fake `AudioContext`. Verify they are used by at least one test each.

## 2. Logic tests

- [x] 2.1 `theory-questions`, `scale-selection` (generator side) and `fretboard-questions`: spelling of all 24 keys and their pentatonics, every mode's prompt, answer and distractor rules, Mixed, review rebuild from `spec`. Verify every scenario of those specs has a test and `npm test` passes.
- [x] 2.2 `ear-training`, `ear-chords`, `ear-degrees` (exercise data and questions) and the sound engine in `audio.js`. Verify levels, notes, controls, previews and demos match the specs.
- [x] 2.3 `tuner` (pitch.js), `play-on-guitar` (questions and listener) and `mic-sensitivity` (silence floor) with generated sound. Verify the tuner's scenarios read within 2 cents and the listener counts held notes once per pluck.
- [x] 2.4 `visuals` (shapes) and `scale-runs` (runs, following, cell states, suggestion, storage). Verify every listed shape and every run scenario.

## 3. Page tests

- [x] 3.1 Home screen, quiz sessions, speed games, scale chips, cheat sheet and How it works (`quiz-session`, `speed-mode`, `scale-selection`, `cheat-sheet`, `app-help`). Verify with `npm test`.
- [x] 3.2 Ear-training pages and sessions, including the ear cheat sheets. Verify with `npm test`.
- [x] 3.3 Visuals, Scale runs, Play on guitar, Metronome, Tuner, the sensitivity panel and `useMic`. Verify with `npm test`.
- [x] 3.4 `app-platform`: no network for questions, PWA manifest and offline recordings, and screens opening at the top. Verify with `npm test`.

## 4. Project rules and checks

- [x] 4.1 Update `openspec/config.yaml`: the suite is how changes are verified, alongside the build and playing the mode, and spec changes update the capability's tests. Verify `openspec validate --all` passes.
  - Also a tasks rule: every change adds or updates the tests of the requirements it touches.
- [x] 4.2 Check that each of the 17 capabilities has a test file named after it, that a deliberate break (G major spelled wrong) fails `npm test` with a non-zero exit, and that `dist/` after `npm run build` contains no test code.
  - Every capability has its file, and tests/test-suite.test.js checks that every requirement and scenario has a test of its name. Deliberate breaks each failed the suite: F# spelled Fb, a wrong major-scale interval, a 0.8 speed factor, 9-question sessions, due after 6 days, a listener that counts unsettled notes, no octave guard, a -50 dBFS default, no accent, a wrong Level 3, a changed shape tie-break, and the Major / Minor switch respelling F# major's relative. `dist/` has no test code.
- [x] 4.3 Run `npm test` and `npm run build` and verify both pass. Then play a Notes session, an interval-training level and the Tuner in `npm run dev` to confirm the app is unchanged.
  - 579 tests pass in about 30 s, five runs in a row; the build passes. No file under `src/` changed. Played in headless Chromium at 360 px (a Notes question, Level 1 of interval training, the Tuner with a fake microphone): all work, no page errors, no horizontal scroll. Not yet played on the phone.

## Workflow follow-up

- Archive the change and sync the `test-suite` spec into `openspec/specs/`.
