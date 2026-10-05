# Proposal

## Why

Notes and Scales only cover the major and natural minor scales, but the scales used most when improvising on guitar and bass are the pentatonics. There is also no way to choose what to drill, so a newly added scale would either be forced on every session or diluted to a fraction of the questions.

## What Changes

- The home screen gains a row of **scale chips** at the top of the "Keys" section: "Major & minor" and "Pentatonic". Each chip is an independent toggle, at least one is always on, and the choice is remembered on the device.
- With only "Major & minor" on, which is the default, every mode behaves exactly as it does today.
- **Major pentatonic and minor pentatonic** are added as scales. Notes and Scales draw their questions from the scales whose chips are on, in normal sessions and in speed games.
- **Mixed follows the chips** for its Notes and Scales questions. Its Chords and Relatives questions stay major and natural minor. This alters an existing mode on purpose.
- Chords and Relatives ignore the chips.
- No new question type is added, so nothing new joins Mixed.
- Wrong answers for pentatonic questions use the notes the pentatonic leaves out of its parent scale, which is the mistake a learner actually makes.
- The best speed score of Notes, Scales and Mixed is kept separately for each chip selection. Scores already stored keep counting for the default selection.
- The cheat sheet gains the two pentatonic scales.

### Out of scope

- Blues and harmonic minor scales. They need spelling decisions of their own and are a later change that adds chips to the same row.
- Modes such as Dorian and Mixolydian.
- Choosing which question types Mixed contains.
- Chords built from pentatonic scales, and pentatonic questions in Relatives.
- Fretboard scale shapes.
- A settings screen. The chips are the only option.

## Capabilities

### New Capabilities

- `scale-selection`: the scale chips on the home screen: which groups exist, toggling, the default, remembering the choice, and which modes it applies to.

### Modified Capabilities

- `theory-questions`: adds "Pentatonic scales"; "Supported keys", "Notes mode", "Scales mode" and "Mixed mode" are extended to the selected scales.
- `speed-mode`: "Best score" is kept per chip selection for Notes, Scales and Mixed.
- `cheat-sheet`: "Cheat sheet content" includes the pentatonic scales.

## Impact

- `src/theory.js`: scale definitions that are not seven notes long, question generation that takes the selected scale groups, and new distractor rules for pentatonics.
- `src/App.jsx`: chip row, reading and writing the selection, best-score keys that depend on the selection, cheat sheet entries.
- `src/styles.css`: chip row.
- `localStorage`: one new key for the selection, and additional best-score keys for non-default selections. No dependencies are added.
- **Depends on `add-relative-keys-mode` being applied and archived first.** The "Mixed mode" and "Cheat sheet content" deltas here are written on top of that change's versions.
