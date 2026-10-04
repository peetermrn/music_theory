# theory-questions Specification

## Purpose

Question generation for the key-based modes (Notes, Scales, Chords, Mixed, Key Notes). Questions train recall of which notes and diatonic triads belong to each major and natural minor key, and must never be phrased in a way that gives the answer away.

## Requirements

### Requirement: Programmatic generation from theory data
All questions SHALL be generated from scale interval data (major `0 2 4 5 7 9 11`, natural minor `0 2 3 5 7 8 10`) rather than from hand-written question lists.

#### Scenario: Scale derived from intervals
- **WHEN** the scale of G major is computed
- **THEN** the result is G A B C D E F#

### Requirement: Supported keys
Questions SHALL be drawn from the 12 major keys (C, G, D, A, E, B, F#, Db, Ab, Eb, Bb, F) and the 12 natural minor keys (A, E, B, F#, C#, G#, Eb, Bb, F, C, G, D).

#### Scenario: Minor key question
- **WHEN** a question is generated for a minor key
- **THEN** it uses the natural minor scale of that key

### Requirement: Correct note spelling
Scale notes SHALL be spelled with one of each letter name, using the accidentals appropriate to the key (for example Bb, not A#, in F major).

#### Scenario: Flat key spelling
- **WHEN** the scale of Bb major is computed
- **THEN** the result is Bb C D Eb F G A

### Requirement: No answer-revealing notation
Question prompts SHALL refer to scale degrees with Arabic ordinals (2nd, 5th) and MUST NOT use Roman numerals or any other notation that reveals chord quality.

#### Scenario: Chord prompt wording
- **WHEN** a question about the triad on the second degree of C major is generated
- **THEN** the prompt reads "What chord is built on the 2nd degree of C major?" and not "What is the ii chord in C major?"

### Requirement: Notes mode
Notes mode SHALL ask which note is on a given degree (1st–7th) of a key. Distractors SHALL be plausible: other notes of the same scale and a semitone neighbour of the correct note.

#### Scenario: Scale-degree note question
- **WHEN** the question "What is the 5th note of A major?" is generated
- **THEN** the correct answer is E and the other three choices are notes near or within A major

### Requirement: Scales mode
Scales mode SHALL ask which set of seven notes is the scale of a given key. Distractors SHALL be the correct scale with one or two notes altered by a semitone.

#### Scenario: Scale question
- **WHEN** the question "Which set of notes is the A minor scale?" is generated
- **THEN** the correct answer is "A B C D E F G" and each other choice differs from it by one or two notes

### Requirement: Chords mode
Chords mode SHALL ask which triad is built on a given degree of a key. The answer SHALL include both root and quality, with the quality computed from the scale's intervals. Distractors SHALL include the same root with a different quality and other diatonic triads of the same key.

#### Scenario: Major-key triad
- **WHEN** the question "What chord is built on the 7th degree of C major?" is generated
- **THEN** the correct answer is "B diminished"

#### Scenario: Minor-key triad
- **WHEN** the question "What chord is built on the 5th degree of A minor?" is generated
- **THEN** the correct answer is "E minor"

### Requirement: Mixed mode
Mixed mode SHALL randomly combine Notes, Scales and Chords questions within one session. It SHALL NOT include Key Notes, Guitar or Bass questions.

#### Scenario: Mixed session content
- **WHEN** a Mixed session is played
- **THEN** every question is a Notes, Scales or Chords question

### Requirement: Key Notes mode
Key Notes mode SHALL ask which of four notes does NOT belong to a given major or minor key. Exactly one choice SHALL be outside the key and the other three SHALL be notes of the key.

#### Scenario: Odd note out
- **WHEN** the question "Which note does NOT belong to Bb major?" is shown with choices A, Bb, C and E
- **THEN** the correct answer is E
