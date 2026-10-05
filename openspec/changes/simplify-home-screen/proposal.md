# Proposal

## Why

Key Notes mode asks the user to spot a note that does not fit a key, which is not a skill worth drilling and is not enjoyable to play. With it gone, the home screen is also a good moment to group the remaining modes so that the two fretboard modes read as one topic.

## What Changes

- **BREAKING**: Remove the Key Notes mode completely: its home screen entry, its question generation and its results label.
- Group the home screen into two labelled sections, both visible at once with no extra tap:
  - "Keys": Notes, Scales, Chords, Mixed
  - "Memorize the fretboard": Guitar, Bass
- Mixed mode is unchanged in content (Notes, Scales, Chords). No new question type is added, so nothing joins Mixed mode.

### Out of scope

- Speed mode, hearts, countdowns or stored best scores (planned as a separate change).
- A submenu or any extra navigation level.
- Any change to how Notes, Scales, Chords, Guitar or Bass questions are generated.
- Any change to the quiz flow, results screen, Review mistakes or cheat sheet.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `quiz-session`: the "Mode selection" requirement no longer lists Key Notes and now requires the two home screen sections.
- `theory-questions`: the "Key Notes mode" requirement is removed, and "Mixed mode" no longer refers to it.

## Impact

- `src/App.jsx`: mode list, results label map and home screen markup.
- `src/theory.js`: the Key Notes branch of question generation and the helper used only by it.
- `src/styles.css`: a style for section headings on the home screen.
- `openspec/specs/theory-questions/spec.md`: the Purpose line names Key Notes and needs a hand edit, because spec deltas cannot change a Purpose.
- No dependencies, storage or build configuration change.
