# Proposal

## Why

The quiz modes ask about keys, scales and fretboard notes but never show how they fit together, so wrong answers are hard to learn from. While using the app I found myself needing a picture: which of the 12 notes a key uses, how a major key and its relative minor share them, and where those notes sit on the neck.

## What Changes

- A new page, "Visuals", for looking rather than answering. It has no questions, score, timer or session.
- Top of the page: a circle of the 12 notes in semitone order with a rotatable dial over it. The dial's windows follow the scale's step pattern, so the notes showing through are the notes of the key. Rotate it by dragging, by tapping a note, or with step buttons.
- A Major / Minor switch that keeps the dial where it is and moves the root to the relative key, so C major and A minor are seen to use the same notes.
- A 7 notes / Pentatonic switch that closes the two windows a pentatonic leaves out.
- A readout naming the key, its notes in order with correct spelling, and its relative key.
- Bottom of the same page: a fretboard (Guitar / Bass switch) that marks where the key's notes are, with roots standing out, labelled by note name or by degree. It repaints as the dial moves.
- Scale positions for practising: a selector on the fretboard, All or a numbered position. A selected position is shown bright on the whole neck as one playable shape, with the key's other notes dimmed around it. Two shape systems are offered with a switch: the five positions (the pentatonic boxes, and the same boxes with two notes added for the seven-note scales) and three notes per string (seven shapes, seven-note scales only). A major key and its relative minor share their shapes.
- A new "Visuals" heading on the home screen, below "Ear training", with the entry "Circle & fretboard".
- "How it works" lists and explains the new page.

No question type is added, so nothing joins Mixed mode.

### Out of scope

- Sound (tapping a note to hear it, playing the scale). The recordings cover C3–C5, well short of the bass and guitar ranges.
- A circle-of-fifths ordering of the ring.
- Harmonic minor and other scales beyond major, natural minor and their pentatonics.
- Other shape systems, alternate tunings, and suggested fingerings or picking order within a shape.
- Frets above the 12th, except where a selected position reaches past it.
- Chord (triad) display on the circle or the fretboard.
- Using the page as a quiz input, or opening it from a quiz question ("Show me").
- Remembering the last key, instrument or label choice between visits.
- A wider desktop layout: in a desktop browser the page keeps the app's single column and works with mouse and keyboard.

## Capabilities

### New Capabilities

- `visuals`: the Visuals page: the note circle and dial, the key and scale switches, the readout, and the linked fretboard with its scale positions.

### Modified Capabilities

- `quiz-session`: the "Mode selection" requirement gains a fourth home-screen heading, "Visuals", whose entry opens the Visuals page instead of starting a session.
- `app-help`: the overlay additionally lists "Circle & fretboard" under "Visuals" and explains what the page does.

## Impact

- New `src/Visuals.jsx` (page, circle, fretboard, and the calculation of scale positions from the scale and the tuning) drawn in SVG; new rules in `src/styles.css`.
- `src/theory.js`: export the existing scale-spelling, key-naming and string-tuning helpers the page needs. No change to question generation.
- `src/App.jsx`: a `visuals` screen state next to `ear`, the "Visuals" home section, and the help text.
- No new dependencies, no stored data, no network use. Existing modes, scores and ear training are untouched.
