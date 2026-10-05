# Spec Delta

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Mixed mode
Mixed mode SHALL randomly combine Notes, Scales, Chords and Relatives questions within one session. It SHALL NOT include Guitar or Bass questions.

#### Scenario: Mixed session content
- **WHEN** a Mixed session is played
- **THEN** every question is a Notes, Scales, Chords or Relatives question
