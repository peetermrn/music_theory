# Spec Delta

## MODIFIED Requirements

### Requirement: Lists every mode
The overlay SHALL list every mode offered on the home screen with a one-line description of what it asks, grouped under the same headings as the home screen. It SHALL also list every entry under "Play on guitar" and every entry under "Ear training", each under its heading with a one-line description.

#### Scenario: Mode list
- **WHEN** the overlay is open
- **THEN** Notes, Scales, Chords, Relatives and Mixed are listed under "Keys" and Guitar and Bass under "Memorize the fretboard", each with a description

#### Scenario: Ear training entry
- **WHEN** the overlay is open
- **THEN** "Interval training" is listed under "Ear training", after the "Play on guitar" entries, with a description

#### Scenario: Play on guitar entries
- **WHEN** the overlay is open
- **THEN** "Key notes", "Fretboard notes" and "Play it back" are listed under "Play on guitar", after the fretboard modes, each with a description

## ADDED Requirements

### Requirement: Explains Play on guitar
The overlay SHALL explain that Play on guitar questions are answered by playing a note on the guitar twice in a row, heard through the microphone, and that a note played once is only searching; that Key notes accepts any octave while Fretboard notes and Play it back need the exact pitch; that only a right first answer scores; that Show me reveals the answer and counts the question as missed; and that the string is not checked.

#### Scenario: Play on guitar summary
- **WHEN** the overlay is open
- **THEN** it states that an answer is a note played twice in a row on the guitar, heard through the microphone, and that only a right first answer scores
