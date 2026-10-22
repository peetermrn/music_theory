# Design

## Context

The app is a Vite + React client with no tests. Most behaviour lives in pure modules (theory.js, shapes.js, ear.js, pitch.js, play.js, runs.js) that take plain values and return plain values. The rest lives in page components that read `localStorage`, call `audio.js` for sound, call `useMic` in Mic.jsx for the microphone, use `requestAnimationFrame` and timers, and scroll with `window.scrollTo`. Questions are random: the generators call `Math.random`, and some take a `spec` that rebuilds one question exactly.

## Goals / Non-Goals

**Goals:**
- Every spec scenario that can be checked without a real device has a test.
- Tests read like the spec: `describe("<capability>")` > `describe("Requirement: ...")` > `it("<scenario>")`.
- The suite runs in a few seconds and gives the same result every time.

**Non-Goals:**
- Changing any file under `src/` to make it easier to test. If a test needs a seam, it uses one the code already has (exports, props, module boundaries).
- Snapshot tests. They check markup, not behaviour, and break on every visual change.

## Decisions

### Vitest, with a config of its own
Vitest reuses Vite's transform, so JSX and ES modules work with no Babel or extra config. The alternative, Jest, needs its own transform setup for ESM and JSX. The test config is a separate `vitest.config.js` with only the React plugin, so the PWA plugin and its service worker build stay out of the tests.

### Logic in node, pages in jsdom
Logic test files run in node. A page test file opts in to jsdom with a `// @vitest-environment jsdom` first line. Pages are rendered with Testing Library and found by what the user sees: text, roles and labels.

### Random questions: check rules over many draws, and pin known ones
A spec rule that holds for every question (four distinct choices, the answer among them, a pentatonic question's position is 1st to 5th) is checked over a few hundred generated questions, which covers every key and mode many times over. A spec scenario about one question ("What is the 5th note of A major?") builds that question through its `spec` argument. Page tests that need to answer correctly wrap the module's generator with `vi.mock(..., importOriginal)` and read the answer of the question just made; the page itself is unchanged.

### Fakes at the module boundaries
- **Sound:** page tests mock `audio.js` and assert on the steps passed to `play()`, the gap and the voice. `audio.js` itself is tested against a fake `AudioContext` and `fetch`, checking start times, voices, `stop()`, and staying silent without Web Audio or recordings.
- **Microphone:** `useMic` is tested once against fake `getUserMedia`, `AudioContext` and visibility events. Pages that listen are tested with `useMic` replaced by a fake that hands the page's listen callback to the test, which then feeds it generated samples (Tuner) or calls the note callback directly (Play on guitar, Scale runs, by wrapping `listener` from play.js).
- **Time:** Vitest's fake timers drive the speed-game countdown, the auto-advance of Play on guitar, the tuner's dimming and the metronome's scheduler. `performance.now` is faked with them, so answer times are exact.
- **Storage:** `localStorage` is cleared before each test. Blocked storage is a `localStorage` whose methods throw.

### Generated sound for pitch detection and the listener
`detect()` and `listener()` are fed sine tones and decaying, harmonic-rich plucks generated at 48 kHz in 4096-sample frames 50 ms apart, as `useMic` delivers them. That checks the tuner's 2-cent accuracy, the bass octave guard, the silence floor, a held note counting once, a re-pluck counting again, and the app's own sound being muted, without a microphone.

### Stored-value modules are re-imported
Mic.jsx reads the stored sensitivity when it is first imported. Tests of "kept on the device" set `localStorage` and then re-import the module with `vi.resetModules()`.

## Risks / Trade-offs

- [jsdom has no layout] → Tests of "fits a phone" and "no horizontal scroll" stay manual. The suite checks the structure behind them only where the spec names it (for example two columns for more than five ear choices).
- [Generated tones are cleaner than a guitar] → The listener tests use plucks with harmonics, decay and noise-free onsets; real-guitar checks stay in the manual task of each change.
- [Random draws could miss a rare bad question] → Loops are sized to cover every key and position several times; anything found later gets a pinned test.
- [Faked modules drift from the real ones] → Fakes keep the real module's other exports (`importOriginal`) and replace only sound, microphone or timing.
