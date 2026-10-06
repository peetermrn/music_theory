# theory-questions Specification

## Purpose

Question generation for the key-based modes (Notes, Scales, Chords, Relatives, Mixed). Questions train recall of which notes and diatonic triads belong to each major and natural minor key, which notes make up its pentatonic, and which key is its relative, and must never be phrased in a way that gives the answer away.

## Requirements

### Requirement: Programmatic generation from theory data
All questions SHALL be generated from scale interval data (major `0 2 4 5 7 9 11`, natural minor `0 2 3 5 7 8 10`) rather than from hand-written question lists.

#### Scenario: Scale derived from intervals
- **WHEN** the scale of G major is computed
- **THEN** the result is G A B C D E F#

### Requirement: Supported keys
Questions SHALL be drawn from the 12 major keys (C, G, D, A, E, B, F#, Db, Ab, Eb, Bb, F) and the 12 natural minor keys (A, E, B, F#, C#, G#, Eb, Bb, F, C, G, D). Major pentatonic questions SHALL use the same 12 roots as the major keys and minor pentatonic questions the same 12 roots as the minor keys.

#### Scenario: Minor key question
- **WHEN** a question is generated for a minor key
- **THEN** it uses the natural minor scale of that key

#### Scenario: Pentatonic roots
- **WHEN** a minor pentatonic question is generated
- **THEN** its root is one of A, E, B, F#, C#, G#, Eb, Bb, F, C, G, D

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
Notes mode SHALL ask which note is at a given position of a scale from the selected scale groups: 1st–7th for a seven-note scale, 1st–5th for a pentatonic. A pentatonic's positions are counted within its own five notes, not by the degree numbers of its parent scale that the visuals capability shows. The prompt SHALL name the scale in full. Distractors SHALL be plausible: other notes of the same scale and a semitone neighbour of the correct note, and for a pentatonic also a note of its parent scale that the pentatonic leaves out.

#### Scenario: Scale-degree note question
- **WHEN** the question "What is the 5th note of A major?" is generated
- **THEN** the correct answer is E and the other three choices are notes near or within A major

#### Scenario: Pentatonic note question
- **WHEN** the question "What is the 3rd note of A minor pentatonic?" is generated
- **THEN** the correct answer is D

#### Scenario: No sixth note of a pentatonic
- **WHEN** a Notes question about a pentatonic scale is generated
- **THEN** the position asked for is between 1st and 5th

### Requirement: Scales mode
Scales mode SHALL ask which set of notes is a given scale from the selected scale groups, naming the scale in full. For a seven-note scale, distractors SHALL be the correct scale with one or two notes altered by a semitone. For a pentatonic, each distractor SHALL have five notes starting on the root and differ from the correct scale by a note altered by a semitone or replaced by a note of the parent scale that the pentatonic leaves out.

#### Scenario: Scale question
- **WHEN** the question "Which set of notes is the A minor scale?" is generated
- **THEN** the correct answer is "A B C D E F G" and each other choice differs from it by one or two notes

#### Scenario: Pentatonic scale question
- **WHEN** the question "Which set of notes is the A minor pentatonic scale?" is generated
- **THEN** the correct answer is "A C D E G" and every other choice has five notes starting on A

#### Scenario: Left-out note as a wrong answer
- **WHEN** a choice for the A minor pentatonic scale contains F, a note of A minor that the pentatonic leaves out
- **THEN** that choice is marked wrong if selected

### Requirement: Chords mode
Chords mode SHALL ask which triad is built on a given degree of a key. The answer SHALL include both root and quality, with the quality computed from the scale's intervals. Distractors SHALL include the same root with a different quality and other diatonic triads of the same key.

#### Scenario: Major-key triad
- **WHEN** the question "What chord is built on the 7th degree of C major?" is generated
- **THEN** the correct answer is "B diminished"

#### Scenario: Minor-key triad
- **WHEN** the question "What chord is built on the 5th degree of A minor?" is generated
- **THEN** the correct answer is "E minor"

### Requirement: Mixed mode
Mixed mode SHALL randomly combine Notes, Scales, Chords and Relatives questions within one session. Its Notes and Scales questions SHALL use the selected scale groups; its Chords and Relatives questions SHALL use major and natural minor keys. It SHALL NOT include Guitar or Bass questions.

#### Scenario: Mixed session content
- **WHEN** a Mixed session is played
- **THEN** every question is a Notes, Scales, Chords or Relatives question

#### Scenario: Mixed with pentatonics on
- **WHEN** a Mixed session is played with both scale groups on
- **THEN** its Notes and Scales questions include pentatonic scales and its Chords and Relatives questions do not

### Requirement: Relatives mode
Relatives mode SHALL ask for the relative minor of a major key or the relative major of a minor key, using the 12 major and 12 natural minor keys. The answer SHALL name root and quality and be spelled as the matching note of the asked key's scale. Distractors SHALL have the same quality as the answer and be plausible: the parallel key, keys on other degrees of the same scale, and a key a semitone from the correct one.

#### Scenario: Relative minor
- **WHEN** the question "What is the relative minor of G major?" is generated
- **THEN** the correct answer is "E minor" and the other three choices are minor keys

#### Scenario: Relative major
- **WHEN** the question "What is the relative major of C# minor?" is generated
- **THEN** the correct answer is "E major" and the other three choices are major keys

#### Scenario: Answer outside the supported keys
- **WHEN** the question "What is the relative minor of F# major?" is generated
- **THEN** the correct answer is "D# minor"

#### Scenario: Parallel key as a wrong answer
- **WHEN** the choices for "What is the relative minor of G major?" include the parallel key
- **THEN** that choice reads "G minor" and is marked wrong if selected

### Requirement: Pentatonic scales
The major pentatonic scale SHALL be the 1st, 2nd, 3rd, 5th and 6th notes of the major scale on the same root, and the minor pentatonic scale SHALL be the 1st, 3rd, 4th, 5th and 7th notes of the natural minor scale on the same root. Their notes SHALL be spelled as in that parent scale.

#### Scenario: Minor pentatonic
- **WHEN** the A minor pentatonic scale is computed
- **THEN** the result is A C D E G

#### Scenario: Major pentatonic in a flat key
- **WHEN** the Bb major pentatonic scale is computed
- **THEN** the result is Bb C D F G
