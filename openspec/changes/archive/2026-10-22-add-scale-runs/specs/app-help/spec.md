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
- **THEN** "Key notes", "Fretboard notes", "Play it back" and "Scale runs" are listed under "Play on guitar", after the fretboard modes, each with a description

## ADDED Requirements

### Requirement: Explains Scale runs
The overlay SHALL explain that a scale run plays every note of one key's position from its lowest note to its highest and back, heard through the microphone; that the right next note counts with one pluck and any other note is a mistake; that a first run shows the shape and later runs are from memory; that the map fills in with clean runs and asks for a known shape again after a week; and that the string is not checked.

#### Scenario: Scale runs summary
- **WHEN** the overlay is open
- **THEN** it states that a run goes up a position and back down, that a first run shows the shape and later runs are from memory, and that clean runs fill in the map
