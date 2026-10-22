# Tasks

## 1. Set up

- [ ] 1.1 Add `vitest`, `jsdom`, `@testing-library/react` and `@testing-library/dom` as dev dependencies, `npm test` and `npm run test:watch` scripts, `vitest.config.js` (React plugin only) and `tests/setup.js` (clean storage, `scrollTo`, `PointerEvent` and `requestAnimationFrame` for jsdom). Verify `npm test` runs and `npm run build` still passes.
- [ ] 1.2 Add shared helpers in `tests/helpers/`: generated tones and plucks in microphone-sized frames, blocked storage, and a fake `AudioContext`. Verify they are used by at least one test each.

## 2. Logic tests

- [ ] 2.1 `theory-questions`, `scale-selection` (generator side) and `fretboard-questions`: spelling of all 24 keys and their pentatonics, every mode's prompt, answer and distractor rules, Mixed, review rebuild from `spec`. Verify every scenario of those specs has a test and `npm test` passes.
- [ ] 2.2 `ear-training`, `ear-chords`, `ear-degrees` (exercise data and questions) and the sound engine in `audio.js`. Verify levels, notes, controls, previews and demos match the specs.
- [ ] 2.3 `tuner` (pitch.js), `play-on-guitar` (questions and listener) and `mic-sensitivity` (silence floor) with generated sound. Verify the tuner's scenarios read within 2 cents and the listener counts held notes once per pluck.
- [ ] 2.4 `visuals` (shapes) and `scale-runs` (runs, following, cell states, suggestion, storage). Verify every listed shape and every run scenario.

## 3. Page tests

- [ ] 3.1 Home screen, quiz sessions, speed games, scale chips, cheat sheet and How it works (`quiz-session`, `speed-mode`, `scale-selection`, `cheat-sheet`, `app-help`). Verify with `npm test`.
- [ ] 3.2 Ear-training pages and sessions, including the ear cheat sheets. Verify with `npm test`.
- [ ] 3.3 Visuals, Scale runs, Play on guitar, Metronome, Tuner, the sensitivity panel and `useMic`. Verify with `npm test`.
- [ ] 3.4 `app-platform`: no network for questions, PWA manifest and offline recordings, and screens opening at the top. Verify with `npm test`.

## 4. Project rules and checks

- [ ] 4.1 Update `openspec/config.yaml`: the suite is how changes are verified, alongside the build and playing the mode, and spec changes update the capability's tests. Verify `openspec validate --all` passes.
- [ ] 4.2 Check that each of the 17 capabilities has a test file named after it, that a deliberate break (G major spelled wrong) fails `npm test` with a non-zero exit, and that `dist/` after `npm run build` contains no test code.
- [ ] 4.3 Run `npm test` and `npm run build` and verify both pass. Then play a Notes session, an interval-training level and the Tuner in `npm run dev` to confirm the app is unchanged.

## Workflow follow-up

- Archive the change and sync the `test-suite` spec into `openspec/specs/`.
