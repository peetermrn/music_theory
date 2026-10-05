# Spec Delta

## MODIFIED Requirements

### Requirement: Lists every mode
The overlay SHALL list every mode offered on the home screen with a one-line description of what it asks, grouped under the same headings as the home screen. It SHALL also list every entry under "Ear training", under that heading, each with a one-line description.

#### Scenario: Mode list
- **WHEN** the overlay is open
- **THEN** Notes, Scales, Chords, Relatives and Mixed are listed under "Keys" and Guitar and Bass under "Memorize the fretboard", each with a description

#### Scenario: Ear training entry
- **WHEN** the overlay is open
- **THEN** "Interval training" is listed under "Ear training", after the fretboard modes, with a description
