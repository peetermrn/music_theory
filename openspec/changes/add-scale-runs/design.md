# Design

## Context

See proposal.md for the motivation. These existing pieces do most of the work:

- **Shapes.** [src/Visuals.jsx](../../../src/Visuals.jsx) already builds the five-position 7-note shapes: `position(root, type, penta, system, k, tuning)` returns the frets of each string, and `keyMap()` returns names and degrees for each pitch class. Both are pure functions, but they live in a component file.
- **Range of the shapes.** For all 24 keys and 5 positions on guitar, each shape has 16 or 17 notes, no pitch appears twice in a shape, and the highest note is at the 15th fret of the high E string (F#5, about 740 Hz). So a shape played in pitch order is one fixed sequence, and each pitch in it belongs to exactly one string and fret.
- **Listening.** `listener(onNote)` in [src/play.js](../../../src/play.js) gives one callback per pluck, steadied over 3 analyses taken 50 ms apart. Its pitch range is fixed at 70–700 Hz.
- **The session screen.** [src/Play.jsx](../../../src/Play.jsx) shows the pattern for a session screen. The microphone is held by a `Listening` child that is mounted only on a question, the listener lives for the whole session, and the screen is scrolled to the top on each screen change.
- **The fretboard drawing.** `Fretboard` draws a shape with full and dimmed marks, but cannot yet mark notes as played.
- **Storage.** [src/App.jsx](../../../src/App.jsx) already stores best scores and the scale selection in `localStorage`, wrapped in try/catch.

## Goals / Non-Goals

**Goals:**
- The run logic (building a run, following it note by note, the cell changes, the suggestion) is pure functions with no React or Web Audio, so it can be checked with node on made-up input, as `pitch.js` and the shapes are.
- Visuals and the three existing Play on guitar entries behave exactly as before.

**Non-Goals:**
- Any change to the pitch detector itself (`pitch.js`) or to the steadiness rules of the listener.
- A general progress or spaced-repetition system for other modes. The map's store belongs to scale runs only.

## Decisions

### Move the shape code into its own module
`lay`, `position`, `keyMap` and their small helpers move unchanged from Visuals.jsx into a new pure module, `src/shapes.js`. Visuals.jsx imports them from there. Runs import the same functions, so a run always uses the shape Visuals draws.
*Alternative:* import them from Visuals.jsx. That works with Vite, but it ties the run logic to a component file and stops node from loading it for checks.

### A run is a list of fretted notes
`runNotes(root, type, k)` takes `position(root, type, false, "five", k, TUNING.guitar)`, turns each string and fret into `{ midi, s, f }`, sorts by pitch, and appends the same list reversed without its top note. Every run has 31 or 33 notes.
Each step knows its string and fret. So when a pitch is counted, the shown fretboard marks exactly the dot that was expected, even though the microphone only hears pitch.

### Following a run is a small reducer
`follow(state, midi)` returns the next state, where state is `{ i, mistakes, wrong }`:
- If `midi === run[i].midi`, then `i + 1`.
- If `midi === run[i - 1]?.midi`, the state is unchanged (the same note heard again).
- Otherwise `mistakes + 1` and `wrong = midi`, for the "F is not next" message, named with sharps or flats to match the key.

The run is over when `i === run.length`. Whether Show me was used, whether the run started shown, and the times of the first and last notes are kept in the component.
The twice-in-a-row rule of Play.jsx is deliberately not used. A run has only one right next note, so there is nothing to search for, and a second pluck on every note would make runs twice as slow.

### The listener's range becomes a parameter
`listener(onNote, floor, range = RANGE)` keeps 70–700 Hz as the default for the existing entries; `floor` is the microphone sensitivity setting, which runs share with the rest of Play on guitar, gear button included. Runs pass `[70, 800]`, which covers F#5 at 740 Hz with a margin.
*Alternative:* raise the shared range. That would be simpler, but it changes the existing entries' detection for no gain to them, and the project rule is to leave existing modes alone.

### Progress store
There is one `localStorage` key, `scale-runs`, holding JSON shaped like `{ "C major/1": { state: "seen" | "known", day: "2026-10-22" } }`. A missing cell is not started. "Due" is never stored: it is worked out from `day` when the page is drawn, as more than 7 days before today in local time.
Reading tolerates anything: bad JSON, a missing key or an unknown state gives an empty map. Writing is wrapped in try/catch, as best scores are. Keys are written as `KEYS` names them (Db major, C# minor), so the spelling matches the prompt.
The cell changes are one pure function, `settle(cell, { shown, clean })`, which follows the "Clean runs and cell states" requirement.

### Suggestion is one pass over a fixed order
`suggest(store, today)` builds the 120 cells once, in `KEYS` order (all majors, then all minors) with positions 1 to 5 within a key. It then picks a cell in this order:
1. The due cell with the oldest `day`.
2. Otherwise the first seen cell.
3. Otherwise the first cell not started.
4. Otherwise the known cell with the oldest `day`.

With 120 cells this is cheap enough to run on every render.

### Screens and components
A new `src/Runs.jsx` holds two parts:
- The page: the Major / Minor switch, the map grid, and Next run.
- `Run`: the prompt, the count and direction, the mistake line, an optional `Fretboard`, Show me, Quit, and the result.

App.jsx adds `["runs", "Scale runs", "Play a position up and back, then from memory"]` to `PLAY`. That one change lists it on the home screen and in the help. Tapping it opens the Runs page through its own state instead of `setPlayKind`, because `Play` handles the other three.
`Listening` is exported from Play.jsx and reused, so the microphone is held only while a run is on screen. Each of page, run and result is its own named screen for the scroll-to-top effect, as Play.jsx does. Playing a note does not change the screen name, so following a run never scrolls.

### Played marks on the fretboard
`Fretboard` gets an optional `played` prop: a set of `"s.f"` strings. A mark in that set gets a `played` class, styled as a filled, brighter dot. Without the prop, as on Visuals and in Show me, nothing changes.
Labels are degrees. In a run, knowing that the note is the 3 or the b7 is the point, and the key name in the prompt already gives the note names.

### The map on a phone
The map is a CSS grid of a key-name column plus five position columns. At 360 px wide that is about 50 px per cell, so the whole map fits without horizontal scrolling. Each cell is a button with an `aria-label` such as "C major, position 1, known". State is not shown by colour alone:
- not started: an empty outline
- seen: half filled
- known: filled
- due: filled with a dashed outline

## Risks / Trade-offs

- **Fast runs lose notes.** A note counts only after it is held for about 150–200 ms, so quick runs may skip notes, and a skipped note makes the next one a "mistake". → Runs are presented as slow, clean practice, and the help says so. The first implementation task checks a run at a few tempos with the metronome. If even slow eighth notes drop, the steadiness rule for runs gets revisited in its own change.
- **Octave errors on low strings cost a clean run.** If the detector reads a weak low note an octave up, that counts as a mistake, and the cell stays as it was. → The listener already has an octave check that the tuner and Play on guitar rely on. Manual testing watches for this on the low E and A strings. If it happens, ignoring an exact octave of the expected note would be a spec change, proposed separately.
- **A string left ringing.** A note from another string can ring into the next one. The listener counts only new plucks or a changed held note, so ringing alone does not add notes, but a loud neighbour can be read as the note. → Accepted. Playing each note cleanly is part of the practice.
- **Pitch only, not the string.** A note at the same pitch on another string counts. → Accepted and stated in the help, as for Fretboard notes. The shapes have no repeated pitch, so the run still has to cover the right range of the neck.
- **Two map entries for one shape.** C major position 1 and A minor position 2 are the same notes, so the minor half of the map can feel like repeat work. → A deliberate choice (see the proposal's out-of-scope list). It is easy to revisit, because only `settle` and `suggest` would change.

## Migration Plan

Nothing to migrate. The new storage key starts empty, and removing the feature leaves an unused key behind.
