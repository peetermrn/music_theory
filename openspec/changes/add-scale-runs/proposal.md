# Proposal

## Why

The goal is to know the major and minor scales all over the neck, well enough to play them up and down and to improvise anywhere. The app teaches the facts (the notes of a key, where a note is) and the Visuals page shows the shapes, but nothing makes the user actually play a shape and checks it. Play on guitar already hears single notes reliably. Using it to follow a whole scale run turns the shapes into something to grind, and a map of the keys and positions shows how much of the neck is learned.

## What Changes

- New **"Scale runs"** entry under "Play on guitar", after "Play it back". Unlike the other three entries it opens a page instead of starting a session, because the page holds the map.
- **The Scale runs page** shows a **map**: one row per key and one column per position, 1 to 5. A Major / Minor switch picks which 12 keys are shown, so there are 60 major and 60 minor cells. Each cell shows how far it has got:
  - not started
  - **seen**: a clean run with the shape shown
  - **known**: a clean run from memory
  - **due**: known, but last played cleanly more than a week ago
- A **"Next run"** button starts the run the app suggests. Tapping a cell starts that run instead.
- **A run** names a key and a position, for example "G major, position 2", and asks the user to play every note of that shape from its lowest note to its highest and back down. Shapes are the five-position 7-note shapes the Visuals page already draws, for guitar.
  - The app listens and follows the run note by note. The right next note moves the run on with one pluck. The twice-in-a-row rule of the other entries does not apply.
  - Any other note is a mistake. It is named ("F is not next"), and the run waits for the right note.
  - A **clean run** is one with no mistakes and no Show me.
- **Shown and from memory:**
  - The first time, the run is **shown**: the shape is drawn on a fretboard with degree labels, and each note lights up as it is played.
  - Once a cell is seen, the run is **from memory**: only the key, the position and a note count are shown.
  - "Show me" reveals the shape during a run from memory. The run goes on, but it can then only count as seen.
- **The suggestion** puts due cells first, then seen cells, then cells not yet started, then other known cells, oldest first. New cells come key by key in the order of the home screen's keys (C, G, D, ... for major) and positions 1 to 5 within a key. That way the first key is covered across the whole neck before the next key starts.
- **After a run** the result shows whether it was clean, the mistakes, the time taken, and what the cell is now. It offers "Next run", "Again" and a way back to the page.
- **Storage:** the map is stored on the device and kept between visits, as best scores are. If storage fails, the runs still work, and the map just starts empty each time.
- **"How it works"** lists the new entry and explains runs and the map.

Nothing joins Mixed mode, and no existing mode or Play on guitar entry changes. The Visuals page is unchanged; its shape code is shared, not altered.

### Out of scope

- Three-notes-per-string shapes, pentatonic runs and bass. The map is the five positions of major and natural minor on guitar.
- Checking which string a note is played on. Only pitch is heard, so a note played at the same pitch elsewhere counts. A run played in a different place on the neck, at another octave, does not count.
- Timing, tempo and metronome tie-in. Runs are judged on the notes only, at the user's own pace.
- Runs across several positions, along one string, scale sequences (thirds, groups of four), or improvising over a drone. These are later changes that can build on runs and the map.
- A speed game, best scores or Review mistakes for runs.
- Filling a minor cell from a clean run of its relative major, or the other way round. They are the same notes, but the point is to know the shape from each key's own root and position number, so each cell is earned on its own.
- Following the "Scales" tick boxes.

## Capabilities

### New Capabilities
- `scale-runs`: the Scale runs page and its map, what a run is and how it is followed and judged, shown and from-memory runs, Show me, the suggestion order, the result, and how progress is stored.

### Modified Capabilities
- `play-on-guitar`: "Play on guitar entries" adds a fourth entry, "Scale runs", which opens its page instead of starting a session. Runs are defined by `scale-runs`.
- `quiz-session`: "Mode selection" lists "Scale runs" under "Play on guitar".
- `app-platform`: "Screens open at the top" adds the Scale runs page, a run and a run's result.
- `app-help`: "Lists every mode" adds the Scale runs entry. A new requirement explains runs and the map.

## Impact

- **Code:**
  - [src/App.jsx](../../../src/App.jsx): the home entry, opening the page, and the help text.
  - A new page and run component.
  - Run building and the map's stored state, using the position shapes from [src/Visuals.jsx](../../../src/Visuals.jsx). The shape code is moved somewhere both can import, without changing its output.
  - [src/play.js](../../../src/play.js): the listener is reused. Its pitch range is widened so that shapes up to the 15th fret of the high E string can be heard.
  - The `Fretboard` drawing is reused, with a way to mark played notes.
- **Dependencies:** none added.
- **Storage:** one more key in the device's local storage.
- **Permissions:** the same microphone permission Play on guitar already uses.
- **Risk:** a note counts only once it is held steadily (about 0.15–0.2 s), so very fast runs may lose notes. Runs are meant to be played slowly and cleanly. Implementation starts with a quick check at a few tempos.
