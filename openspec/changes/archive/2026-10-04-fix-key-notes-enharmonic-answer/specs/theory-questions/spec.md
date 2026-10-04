# Spec Delta

## MODIFIED Requirements

### Requirement: Key Notes mode
Key Notes mode SHALL ask which of four notes does NOT belong to a given major or minor key. Exactly one choice SHALL be outside the key and the other three SHALL be notes of the key. The choice outside the key SHALL differ in pitch from every note of the key, so it MUST NOT be an enharmonic respelling of a key note, and it MUST NOT be spelled B#, E#, Cb or Fb.

#### Scenario: Odd note out
- **WHEN** the question "Which note does NOT belong to Bb major?" is shown with choices A, Bb, C and E
- **THEN** the correct answer is E

#### Scenario: No enharmonic respelling of a key note
- **WHEN** a Key Notes question is generated for Eb major
- **THEN** the odd note out is never D#, because D# is the same pitch as the key's Eb

#### Scenario: No trick spellings of natural notes
- **WHEN** a Key Notes question is generated for any key
- **THEN** the odd note out is never B#, E#, Cb or Fb
