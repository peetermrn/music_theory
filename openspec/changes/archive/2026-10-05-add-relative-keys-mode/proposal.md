# Proposal

## Why

Knowing that G major and E minor share the same notes is one of the most useful facts for jamming: it tells you which pentatonic or minor scale fits a song in a major key, and the reverse. The app drills each key on its own but never asks how major and minor keys pair up.

## What Changes

- A new mode, **Relatives**, is added under the "Keys" heading. It asks for the relative minor of a major key and the relative major of a minor key, 24 questions in total.
- Relatives uses the normal quiz flow (10 questions, four choices, feedback, Review mistakes) and has a speed game and a stored best score like every other mode.
- Wrong answers are the mistakes a learner actually makes: the parallel key (G minor for G major), a key on another degree of the same scale, and a key a semitone away from the right one.
- **Relatives joins Mixed mode.** Mixed now shuffles Notes, Scales, Chords and Relatives questions, in normal sessions and in speed games. This alters an existing mode on purpose.
- The cheat sheet gains the rule for finding a relative key.

### Out of scope

- Other scales (pentatonic, blues, harmonic minor) and the scale selection chips. Those are the follow-up change `add-scale-selection`.
- Parallel keys, key signatures and the circle of fifths as question topics.
- Any change to Notes, Scales, Chords, Guitar or Bass questions.
- Resetting the stored Mixed best score, even though Mixed now contains a new question type.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `theory-questions`: adds the "Relatives mode" requirement; "Mixed mode" now includes Relatives questions.
- `quiz-session`: "Mode selection" lists Relatives under "Keys".
- `speed-mode`: "Starting a speed game" lists Relatives; the Mixed scenario in "Same questions as the normal mode" includes Relatives questions.
- `cheat-sheet`: "Cheat sheet content" includes the relative-key rule.

## Impact

- `src/theory.js`: a new question kind in `makeQuestion`, and Mixed picks from four kinds.
- `src/App.jsx`: a new entry in the "Keys" section, its label in the results breakdown, and two lines in the cheat sheet.
- `src/styles.css`: the "Keys" grid now holds five cards, so the last one needs a layout rule.
- `localStorage`: one new key, `theory-quiz.best.relatives`. No dependencies are added.
