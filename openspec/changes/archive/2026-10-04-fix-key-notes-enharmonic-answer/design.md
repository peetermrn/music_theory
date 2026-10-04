# Design

## Context

The odd note out is currently made by taking one random note of the scale and moving it a semitone (sharp notes go down, flat notes go up, naturals go either way). Nothing checks whether the result lands on another note of the key, which is the cause described in proposal.md.

## Goals / Non-Goals

**Goals:**
- Every generated odd note out satisfies the modified "Key Notes mode" requirement.
- The odd note still shares a letter with a key note, so it stays a plausible, slightly tricky choice.

**Non-Goals:**
- Changing how the three in-key choices are picked.
- Touching the shared semitone helper's behaviour for other modes.

## Decisions

**Build the list of valid odd notes, then pick one.** For the chosen key, compute every semitone neighbour of its seven notes, drop any whose pitch matches a key note and any spelled B#, E#, Cb or Fb, and pick at random from what is left.
- Alternative, regenerate until valid: simpler to write but hides the rule in a loop and has no guaranteed end.
- Alternative, pick any of the five out-of-key pitches and choose a spelling: needs a new rule for sharp versus flat spelling per key, which is more code for no gain.

Every major and natural minor key leaves several valid candidates (five pitches are always outside the key and each sits next to a key note), so the list is never empty.

**Keep stored review answers as they are.** A missed Key Notes question already stores its odd note and replays it, so Review mistakes needs no change.

## Risks / Trade-offs

- [No automated tests] → Verify with a one-off Node check that generates a large sample and counts odd notes whose pitch is in the key; expect zero.
