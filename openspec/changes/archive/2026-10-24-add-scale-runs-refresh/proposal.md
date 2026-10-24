# Proposal

## Why

There is no way to play a learned shape again without risking its progress. Every run of a cell counts: tapping C major, position 3 on the map to warm up or check it is still there decides the cell's state, and one slip turns a known cell back to seen. Scale runs need a way to refresh memory that plays what has been learned and leaves the map alone.

It also fills a gap in when known shapes come back. A known cell only returns once it is due, a week after its last clean run from memory, and "Next run" moves on to new keys until then. After all five positions of one key are learned, nothing asks for them while the next key is learned, and they fall due on the same day.

Two smaller fixes come with it, both in what a run says after a wrong note. A note of the right name in the wrong octave is reported as "E is not next", which reads as if E were the wrong note. And a run from memory that starts on the wrong note gives no cue to where the position begins, which is the hardest part to recall in a new key.

## What Changes

- **"Refresh known"** button on the Scale runs page, below "Next run", naming how many runs it plays, for example "Refresh known: 6 runs". It is not shown while no cell is known or due.
- **A refresh** takes the cells that are known or due (not seen or not started), from both major and minor keys, in a random order, at most 10 of them, each once. Each is a run from memory with Show me, like any other run from memory, but the run bar says "Refresh 3 of 6" instead of "From memory".
- **A refresh changes nothing.** No cell's state or the day of its last clean run changes, whatever happens in the run. A due cell stays due after a clean refresh run, and a known cell stays known after a run with mistakes. "Next run" and the map are the same after a refresh as before it.
- **After each refresh run** a short result shows whether it was clean, the mistakes, the time and the cell, without the line saying what the cell is now. It offers "Next: <cell>" for the next run of the refresh, "Again", and "End refresh" back to the Scale runs page. After the last run there is no "Next" and no summary screen: "Again" and the way back to the page remain.
- **Quit** during a refresh run ends the refresh and returns to the Scale runs page.
- **Right note, wrong octave.** In every run, a wrong note with the same name as the next note says which way to go, for example "E is too high: play a lower E", instead of "E is not next". It is still a mistake, as now. This changes existing runs.
- **A cue for where a position starts.** In every run from memory, a wrong note before the first note of the run has counted also says which note the position starts on, for example "F is not next. Position 2 starts on D". The shape stays hidden. When the wrong note is already the start note in the wrong octave, only the octave message is shown, since the cue would add nothing. This changes existing runs from memory, not only refresh runs: a wrong first note already makes the run not clean, so the cue never helps a run count as clean.
- **"How it works"** mentions the refresh.
- Positions keep their numbers ("position 1" to "position 5"); no CAGED or other shape names are added.

Nothing joins Mixed mode. No other mode changes.

### Out of scope

- Spaced repetition with growing intervals. The 7-day due rule and the "Next run" order stay as they are. Growing intervals are a likely later change.
- Including seen or not-started cells in a refresh, choosing which keys or positions it uses, or weighting the random order towards older or due cells.
- A summary of the refresh, or any record of how refresh runs went.
- Letting a clean refresh run update a cell's day or state.
- Counting a note in the wrong octave as anything but a mistake.
- A start cue after the first note, a cue in shown runs, or a cue that names the fret or string.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `scale-runs`: "Scale runs page" adds the "Refresh known" button. "Following a run" names a wrong octave as too high or too low. "Quitting a run" ends a refresh. New requirements: "Refresh known" (which cells and in what order, no change to any cell), "Refresh result" (the result between refresh runs and after the last) and "Where a position starts" (the start cue in runs from memory).
- `app-help`: "Explains Scale runs" mentions the refresh.

## Impact

- **Code:**
  - [src/runs.js](../../../src/runs.js): picking the cells of a refresh, the note a position starts on, and the wording of a wrong note, as pure functions.
  - [src/Runs.jsx](../../../src/Runs.jsx): the button, the refresh run bar, the refresh result, skipping `settle` and storage for refresh runs, and the new wrong-note messages.
  - [src/App.jsx](../../../src/App.jsx): the "How it works" text.
- **Tests:** every new function and every new branch in the page gets a test. [tests/scale-runs.test.jsx](../../../tests/scale-runs.test.jsx) and [tests/app-help.test.jsx](../../../tests/app-help.test.jsx) gain tests for each added and changed requirement and scenario.
- **Storage:** the stored map's format is unchanged, and a refresh never writes to it.
- **Dependencies:** none added.
