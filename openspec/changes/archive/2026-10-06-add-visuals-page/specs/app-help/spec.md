# Spec Delta

## ADDED Requirements

### Requirement: Explains the Visuals page
The overlay SHALL list "Circle & fretboard" under the heading "Visuals", after the ear-training entries, with a one-line description. It SHALL explain that the page is for looking, with no questions or score; that turning the dial or tapping a note changes the key; that the Major / Minor switch shows the relative key, which uses the same notes; that the scale can be the seven notes or the pentatonic; that the fretboard below shows where the key's notes are on guitar or bass; and that a position can be selected to see one shape to practise, in either of two shape systems.

#### Scenario: Listed under Visuals
- **WHEN** the overlay is open
- **THEN** "Circle & fretboard" is listed under "Visuals", after the "Ear training" entries, with a description

#### Scenario: Visuals summary
- **WHEN** the overlay is open
- **THEN** it states that the Visuals page has no questions, that turning the dial changes the key, and that the fretboard shows the same key's notes

#### Scenario: Positions summary
- **WHEN** the overlay is open
- **THEN** it states that the fretboard can show one scale position at a time, and names the five positions and three notes per string as the two systems

#### Scenario: Not described as a session
- **WHEN** the overlay is open
- **THEN** the statements about the number of questions, speed games and Review mistakes are not applied to the Visuals page
