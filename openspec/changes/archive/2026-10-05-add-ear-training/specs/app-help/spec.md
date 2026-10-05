# Spec Delta

## MODIFIED Requirements

### Requirement: Lists every mode
The overlay SHALL list every mode offered on the home screen with a one-line description of what it asks, grouped under the same headings as the home screen. It SHALL also list the Ear training entry with a one-line description.

#### Scenario: Mode list
- **WHEN** the overlay is open
- **THEN** Notes, Scales, Chords, Relatives and Mixed are listed under "Keys" and Guitar and Bass under "Memorize the fretboard", each with a description

#### Scenario: Ear training entry
- **WHEN** the overlay is open
- **THEN** "Ear training" is listed after the fretboard modes with a description

## ADDED Requirements

### Requirement: Explains ear training
The overlay SHALL explain ear training separately from normal sessions: it has its own page with six levels and a Custom selection; two notes are played and the user picks the interval from one choice per interval; the notes can be replayed together or one at a time; the choices can be tapped after answering to hear them; the sound button switches between piano and acoustic guitar; and there is no speed game and no Review mistakes. It SHALL also credit the sources of the piano and guitar recordings.

#### Scenario: Ear training summary
- **WHEN** the overlay is open
- **THEN** it states that an ear-training question plays two notes, that they can be replayed together or singly, and that ear training has no speed game

#### Scenario: Not described as four choices
- **WHEN** the overlay is open
- **THEN** the statement that a session has four choices per question is not applied to ear training

#### Scenario: Sounds and credits
- **WHEN** the overlay is open
- **THEN** it names the two sounds the sound button switches between, and names the source of the piano recordings and of the guitar recordings
