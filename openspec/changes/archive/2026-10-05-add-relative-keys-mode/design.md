# Design

## Context

`makeQuestion` in `src/theory.js` picks a key from `KEYS` (12 major, 12 minor), computes its correctly spelled scale, and builds one question per kind. Every question returns a `spec` so Review mistakes can rebuild it. The home screen, speed entries and best scores are all generated from the `SECTIONS` list in `src/App.jsx`, so a new mode added there gets a card, a speed game and a best score with no further work.

## Goals / Non-Goals

**Goals:**
- Add Relatives as one more question kind that fits the existing generator, `spec` and session flow unchanged.

**Non-Goals:**
- No new data tables. The relative key is read from the scale the app already computes.

## Decisions

**The answer is read from the scale.** The relative minor is the 6th note of the major scale; the relative major is the 3rd note of the minor scale. This gives correct spelling for free. Alternative considered: a lookup table of 12 pairs, rejected because the project generates everything from theory data.

**Two answers fall outside the app's key lists.** F# major gives D# minor, and Eb minor gives Gb major. Both are shown as computed, because they are the correct names. They appear only as answers; no question is ever asked *about* D# minor or Gb major. Alternative considered: dropping those two questions, rejected because it leaves a gap in the set for no gain.

**Answers carry the quality** ("E minor", not "E"), matching Chords mode. All four choices have the quality the prompt asks for, so the quality gives nothing away.

**Distractor pool, three taken at random:**

| Direction | Parallel key | Other degrees of the same scale | Semitone neighbour |
|---|---|---|---|
| major to minor (G major, answer E minor) | G minor | 3rd (B minor), 5th (D minor) | Eb minor or F minor |
| minor to major (C# minor, answer E major) | C# major | 6th (A major), 5th (G# major) | Eb major or F major |

The semitone neighbour is the correct root moved one semitone and spelled as a usual key name. The existing `nudge` helper can produce E#, B#, Fb or Cb, so the neighbour for Relatives needs its own spelling rule.

**`spec` is `{ kind: "relatives", key }`.** The key index already fixes the direction, so nothing else is needed for Review mistakes.

**Home screen layout.** "Keys" becomes Notes, Scales, Chords, Relatives, Mixed. In the two-column grid Mixed is the fifth card and spans both columns.

## Risks / Trade-offs

- [Only 24 distinct prompts] → A 10-question session and the 10-prompt repeat window of a speed game both fit. A long speed game will cycle through the same questions, which is the point of drilling them.
- [The stored Mixed best score was set without Relatives questions, which are quick to answer] → Accepted. It is a personal score and will simply be beaten.
