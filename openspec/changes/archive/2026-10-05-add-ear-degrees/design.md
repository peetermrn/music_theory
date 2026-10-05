# Design

## Context

See proposal.md for motivation and scope, and the delta specs for requirements. This design assumes `add-ear-chords` is applied:

- `src/ear.js` exports `EXERCISES`, a list of exercise descriptions (items, levels, question generator, sound buttons, preview, demo), and `src/Ear.jsx` is one screen that runs any of them. The home cards and help entries are rendered from that list.
- `play(steps, gap)` in `src/audio.js` plays steps `gap` seconds apart, where a step is one MIDI note or an array of notes that start together.
- A level, and the Custom selection, is a list of item ids.

`src/theory.js` already has what is needed to name things: `KEYS` (twelve major and twelve minor keys with their conventional spelling), `SCALES` (semitone offsets) and `scale(root, type)` (the key's notes, spelled properly). Its helper `pc` (note name to pitch number 0-11) is not exported.

The recordings cover C3 to C5 (MIDI 48 to 72).

## Goals / Non-Goals

**Goals:**
- Degree training is a third entry in `EXERCISES` plus the smallest additions to the shared screen that it needs.
- Key names and note spellings come from `theory.js`, so "the 4th of F major is Bb" agrees with what the Notes mode teaches.
- Every chord and note stays inside the existing recordings.

**Non-Goals:**
- Generating progressions in general. There are two fixed ones, written as semitone offsets from the tonic.
- Voice-leading rules beyond those two hand-written voicings.
- Any change to how the interval and chord exercises look or sound.

## Decisions

### 1. Key, progression and note, as offsets from the tonic

A question picks one entry of `KEYS` for the session's type (twelve per type). The tonic is placed on the MIDI note from D3 to C#4 (50 to 61) that has the key's pitch number, so each key has exactly one position.

The progression is 1-4-5-1 in the key's own chords, voiced so the hands barely move:

| | 1st chord | 4th chord | 5th chord | 1st chord |
|---|---|---|---|---|
| Major | 0 4 7 | 0 5 9 | -1 2 7 | 0 4 7 |
| Minor (natural) | 0 3 7 | 0 5 8 | -2 2 7 | 0 3 7 |

The asked note is `tonic + SCALES[type][degree - 1]`, so it lies between the tonic and the 7th above it. Range check: lowest note is tonic - 2 = 48 (minor, tonic D3); highest is tonic + 11 = 72 (major 7th of C#4). Both are the ends of the recordings.

In minor the 5th chord is the minor one from the natural scale, not the major chord of the harmonic minor. A major 5th chord would pull harder to the tonic, but it contains the raised 7th, which would then contradict the natural 7th the exercise asks for, and the app teaches natural minor everywhere else.

Repeat avoidance compares `"<key>:<degree>"`. Level 1 has 36 combinations for 10 questions; a Custom selection of two degrees has 24.

*Alternative considered:* one key for the whole session. Quicker to play, but with three degrees in one key the user soon recognises three pitches instead of three functions.

### 2. Playback

`play` gains one thing: a step may be `null`, a rest. A question is `[chord, chord, chord, chord, null, note]`. Starting values, to be tuned by ear: 0.6 s per step, which puts the note 3 s after the start, with the last chord fading as the note enters.

Sound buttons (`controls`): **Play again** (everything), **Key** (the four chords) and **Note** (the note). Tapping an answer choice after answering plays that degree's note alone; the user has just heard the key and can tap **Key** again if needed.

### 3. A selection can carry a variant

Levels 1 to 3 are major and Level 4 is minor, and Custom must choose between them, so a list of item ids is no longer enough. An exercise may declare `variants` (here `major` and `minor`, labelled "Major keys" and "Minor keys"); then each level is `{ variant, ids }`, the Custom section shows a two-way switch above the tick boxes, and `question`, `preview` and `demo` receive the variant. Exercises without `variants` (intervals, chords) are untouched: the screen treats their selections as before.

The Custom selection is stored under `theory-quiz.ear-degrees-custom` as `minor:1+3+5`, validated like the others: an unknown variant or fewer than two valid degrees falls back to minor with 1, 3 and 5. That default is the one useful drill the levels do not offer.

Level cards: "Major keys: 1st, 3rd and 5th", "Adds 2nd and 4th", "Adds 6th and 7th", "Minor keys: all seven". The description says what a level adds only when the variant is the same as the level before.

### 4. Prompt and feedback

Prompt: "Which degree of the major key is the last note?" (or "minor key"). No key name.

The exercise description gains an optional `explain(q)`, shown as a second sentence of the feedback: `Not quite. You picked 3rd, it was 5th. The 5th of D major is A.` The key name is the `KEYS` entry and the note is `scale(root, type)[degree - 1]`, so spelling follows the key. This needs `pc` exported from `theory.js` to turn the key's root into a pitch number; nothing else in `theory.js` changes.

### 5. Degree cheat sheet

Seven rows: degree, name, description. The descriptions differ by key type, and the sheet shows the set for the session's type:

| Degree | Name | Major key | Minor key |
|---|---|---|---|
| 1st | tonic | home, fully at rest | home, fully at rest |
| 2nd | supertonic | restless, wants to step down to the 1st | restless, wants to step down to the 1st |
| 3rd | mediant | stable and bright; makes the key major | stable and dark; makes the key minor |
| 4th | subdominant | leans down to the 3rd | heavy, wants to fall to the 3rd |
| 5th | dominant | stable, open, strong | stable, open, strong |
| 6th | submediant | soft, leans down to the 5th | sad, leans hard down to the 5th |
| 7th | leading tone / subtonic | tense, pulls up to the 1st | a step below home, only a mild pull |

A row plays the progression and its degree in C (major or minor to match), tonic on middle C. This is the same middle-C convention as the other two sheets.

### 6. Layout

Seven choices use the existing two-column grid in four rows. The feedback is one sentence longer than in the other exercises; with three fewer rows of answers than the twelve-interval screen there is room for it on a 360 x 740 screen.

### 7. Purpose line of the cheat-sheet spec

Edited by hand in `openspec/specs/cheat-sheet/spec.md`: the playable list is of the exercise's intervals, chord types or degrees.

## Risks / Trade-offs

- [The natural-minor progression (minor 5th chord) may not make the tonic feel like home strongly enough] → Judge in the tuning task. If it fails, the alternative is the major 5th chord, which contradicts the spec's "only chords from the key's own scale"; that would come back as a spec change, not a silent swap.
- [The asked note is always above the tonic, so higher notes are higher degrees] → Accepted for a first version; it is how beginners' degree trainers start. Other octaves are out of scope.
- [In a twelfth of the questions the key is C, the cheat sheet's key, so a sheet row plays the question's own sound] → Same loophole as the interval and chord sheets, accepted there.
- [Each question takes about 3 s before the note is heard, and answer time includes it] → Accepted as for the other exercises: it is constant. The session stays within a few minutes.
- [Four chords of three notes are the densest sound in the app] → The per-note scaling from `add-ear-chords` applies; check at full phone volume in the tuning task.
- [Low voicings (tonic near D3) may be muddy on guitar] → Judge by ear; the tonic range can move up only by shrinking the set of keys, so the fix would be a higher inversion of the chords, not a narrower range.
- [The variant adds a branch to the shared screen] → It is confined to the Custom section and the level text; intervals and chords are re-checked in the integration task.
- [The feedback names notes, which the chord exercise forbids] → Deliberate: here the key is the subject, and the names appear only after answering.

## Open Questions

- Step length and the length of the pause before the note. Set by ear during implementation; no effect on specs or tasks.
