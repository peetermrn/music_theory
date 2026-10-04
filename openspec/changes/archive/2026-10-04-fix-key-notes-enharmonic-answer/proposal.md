# Proposal

## Why

In Key Notes mode ("Which note does NOT belong to X?") the supposedly wrong note is sometimes a note of the key under another spelling, for example "Which note does NOT belong to Eb major?" with the answer D#. A sample of 20,000 generated questions showed this in 3,525 of them (about 18%), so roughly one question in six has no truly correct answer and teaches the wrong thing.

## What Changes

- The odd note out in a Key Notes question is always a different pitch from every note of the key, not merely a different spelling.
- The odd note out is never spelled B#, E#, Cb or Fb, since those read as trick spellings of natural notes rather than as real out-of-key notes.
- The three in-key choices, the prompt wording and the mode's place in the menu stay as they are.

Out of scope:

- Any change to Notes, Scales, Chords, Mixed, Guitar or Bass question generation, including the similar semitone-neighbour distractors used in Notes mode.
- Adding a test framework.
- Key Notes stays out of Mixed mode, as today.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `theory-questions`: the "Key Notes mode" requirement is tightened so the odd note out must differ in pitch from every note of the key and must avoid the B#, E#, Cb and Fb spellings.

## Impact

- `src/theory.js`: the Key Notes branch of question generation (one line today).
- No UI, dependency, data or storage changes. Review mistakes keeps working because a missed question already stores its odd note.
