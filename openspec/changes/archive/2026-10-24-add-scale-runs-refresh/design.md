# Design

## Context

Scale runs live in two files. [src/runs.js](../../../src/runs.js) holds the pure parts: the cells, `runNotes`, `follow`, `stateOf`, `settle`, `suggest` and storage. [src/Runs.jsx](../../../src/Runs.jsx) holds the page and the `Run` component. `Run` decides at mount whether it is from memory, follows notes with `follow`, and at the last note calls `settle` and `onSettle`, which writes the store, then shows its result. The page keeps one `listener` for its whole life, so a note ringing from one run does not count in the next, and it remounts `Run` with a counter key for every start, including Again.

The wrong-note line is built inline in `Run` as `${names.byPc[st.wrong % 12].name} is not next`. It uses only the pitch class, so a right note in the wrong octave reads "E is not next" while E is what the run wants. `follow` already treats it as a mistake, and keeps the wrong MIDI note in `st.wrong`, so the octave is there to compare.

A position's first note is always on the low E string, and it is the pentatonic note of the position's number: in C major, positions 1 to 5 start on C, D, E, G and A. Only position 1 starts on the root, so the cue names the note, not "the root". C major, position 3 starts on the open low E, so playing the E at the 12th fret is a likely slip, and the octave message covers it.

## Goals / Non-Goals

**Goals:**
- A refresh reuses `Run` as it is, so following, Show me, the microphone and the one shared listener behave exactly as in other runs.
- A refresh cannot write to the store by any path.
- Every new function and branch has a test that fails when it is broken.

**Non-Goals:**
- No change to `follow`, `settle`, `suggest`, `stateOf` or the stored format.

## Decisions

### The refresh set is drawn once, when the button is tapped
A pure `refreshSet(store, day)` in runs.js returns the cells whose `stateOf` is `"known"` or `"due"`, shuffled with Fisher–Yates on `Math.random` and cut to 10. The page keeps `{ cells, at }` while a refresh runs and `null` otherwise. Drawing once means Again and Next work on a fixed list, and the button's count comes from the same function. Shuffling with `sort(() => Math.random() - 0.5)`, as theory.js does for answer choices, was not used: it is biased and its result depends on the sort algorithm, which makes the "random order" tests harder to pin.

### `Run` gets an optional `refresh` prop instead of a second component
`refresh = { at, of, next }` (1-based place, size of the set, next cell or null). With it, the bar says "Refresh 3 of 6", the last note skips `settle` and `onSettle`, and the result renders the refresh buttons without the state line. Every cell in a refresh is known or due, and a refresh never writes the store, so `Run`'s existing rule already makes each refresh run from memory; forcing it as well would be code no test could tell apart from its absence, so it was left out. A separate `RefreshRun` component would duplicate the following, timing and Show me logic for a few lines of difference.

Skipping `settle` is what keeps a due cell due: `settle` would make it known with today's date after a clean run, and would turn it back to seen after a run with mistakes.

Quit and End refresh both call the page's back handler, which also clears the refresh. Again restarts the same cell with the same `at`. Next moves `at` on by one.

### The wrong-note line becomes a pure function
`mistake(cell, next, wrong, { cue })` in runs.js returns the line to show, and `Run` only decides `cue` (`st.i === 0 && memory && !revealed`):
- same pitch class as `next`, higher: "E is too high: play a lower E"; lower: "A is too low: play a higher A";
- otherwise "F is not next", followed by ". Position 2 starts on D" when `cue` is set.

The start note is `runNotes(...)[0]`, and every name comes from the key's `keyMap(...).byPc`, as the current line does, so they are spelled by the key (Gb in Eb minor). When the wrong note is the start note in another octave, the first branch applies and no cue is added, which is the "only the octave message" rule with no special case. The octave message applies to shown runs too, because it fixes the existing wording, not the cue. After Show me the run goes on as a shown run, so the cue no longer applies there.

Moving the line out of the JSX makes each branch testable with plain values, and keeps the page test to one check per scenario.

### Tests
- runs.js: `refreshSet` over fixed stores (known, due, seen, not-started, more than 10), with `Math.random` spied for a fixed order and real draws for "not always the same order". `mistake` for every branch: not next, too high, too low (including two octaves off), cue added, cue skipped for the start note in another octave, flat spelling.
- Runs.jsx: the page test file already stores fixtures, sets the system time and plays runs through the fake microphone with `playNotes`. Refresh tests store known and due cells, tap the button, play runs to their result, and compare `stored()`, the map and "Next run" before and after. The messages get one page test per scenario to show they reach the screen.
- app-help: one more sentence in the Scale runs paragraph, checked with `toContain` as the existing scenario does.
- A last check breaks each new branch by hand (the `refreshSet` filter and cap, the skipped `settle`, the cue condition, each `mistake` branch) and confirms a test fails, as was done for the test suite.

## Risks / Trade-offs

- [Ten runs is long for a 2–5 minute session] → Every result has End refresh, and Quit ends it too. Nothing is lost by stopping, because nothing is saved.
- [Refresh runs leave no trace] → Intended: the refresh is the way to play without affecting progress. A slip shows in that run's result; playing the cell from the map is what counts.
- [A due cell stays due after a clean refresh] → Intended: "Next run" keeps asking for it, and a run that counts is still one tap away.
- [The cue makes the first note easier to find] → It appears only after a wrong first note, which has already made the run not clean, so it never helps a run count as clean.
