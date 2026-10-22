# Proposal

## Why

The specs in `openspec/specs/` are the source of truth, but nothing checks the app against them. Every change is verified by `npm run build` and by playing the affected mode by hand, so a change to shared code (theory.js, shapes.js, the listener, the session flow) can quietly break a mode nobody played that day. There are now 17 capabilities and a lot of their behaviour is exact and easy to state as a check: G major is G A B C D E F#, A minor position 1 is 5 7 8, 5 7 8, ..., a run of it is 33 notes, the first correct speed answer gives 18 seconds. A test suite that follows the specs scenario by scenario catches regressions in seconds and makes each spec's scenarios executable.

`openspec/config.yaml` says not to add a test framework unless a proposal argues for it. This is that proposal.

## What Changes

- A test command, `npm test`, that runs the whole suite once, offline, with no browser, microphone or speaker. `npm run test:watch` runs it while editing.
- **One test file per capability**, named after its spec (`tests/<capability>.test.js` or `.jsx`), with tests grouped by requirement and named after its scenarios. A failing test names the spec and scenario it checks.
- **Logic tests** for the pure modules: question generation and spelling (theory.js), shapes and positions (shapes.js), the ear-training exercises (ear.js), pitch detection and note maths (pitch.js), Play on guitar questions and the listener (play.js), and scale runs (runs.js). Pitch detection and the listener are fed generated tones and plucks, so the tuner's accuracy and the "held steadily, once per pluck" rules are checked without a microphone.
- **Page tests** that render the app's screens in a simulated browser and use them as the user would: home screen, quiz sessions, speed games, scale selection, cheat sheets, How it works, ear-training pages and sessions, Visuals, Scale runs, Play on guitar, Metronome, Tuner and the microphone sensitivity panel. Sound, the microphone and the audio clock are replaced by fakes that record what would be played or heard.
- **Project rules** in `openspec/config.yaml` change: the suite becomes part of verifying every change, and a change that adds or alters a requirement also updates that capability's tests.

No app behaviour changes, nothing joins Mixed mode, and no mode is altered. The built app is unchanged: test code and the test dependencies are not part of it.

### Out of scope

- Tests in a real browser or on a phone (layout at 360 px, no horizontal scroll, PWA install, offline use, touch dragging, the screen staying on). These stay manual; the suite checks what can be checked in a simulated browser, such as which elements are shown.
- Checking how things sound or look: the recordings, click sounds, colours and the CSS.
- Real-guitar accuracy of the listener and the tuner. The suite uses generated tones; real playing stays a manual check.
- Continuous integration. `npm test` is run by hand or by the agent, like `npm run build`.
- Coverage targets or reports.
- Fixing the long-requirement warnings that `openspec validate --strict` gives on existing specs.

## Capabilities

### New Capabilities
- `test-suite`: the automated checks of the app against its specs: how they are run, that they need no device or network, how they are organised by capability and scenario, and that they stay out of the built app.

### Modified Capabilities
None. No requirement of the app changes.

## Impact

- **Code:** new `tests/` folder and `vitest.config.js`. No file under `src/` changes.
- **Dependencies:** four development-only dependencies: `vitest` (runs the tests, built on the Vite the app already uses), `jsdom` (the simulated browser) and `@testing-library/react` with `@testing-library/dom` (render pages and find what the user sees). None of them is shipped in the app.
- **Project rules:** `openspec/config.yaml` context and the tasks rule mention `npm test`.
- **Risk:** tests that follow the implementation too closely make every refactor fail them. The tests check the specs' observable behaviour (prompts, answers, frets, what is shown and played) rather than internal names, and use the modules' public exports only.
