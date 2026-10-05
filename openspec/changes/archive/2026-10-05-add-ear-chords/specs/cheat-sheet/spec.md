# Spec Delta

## MODIFIED Requirements

### Requirement: Cheat sheet access
A 💡 button SHALL be visible while a question is shown in a normal session, and tapping it SHALL open the cheat sheet as an overlay that the user can dismiss to return to the same question. The cheat sheet SHALL NOT be available during a speed game. In an ear-training session the 💡 button SHALL open the cheat sheet of the exercise being played instead of the theory cheat sheet: the ear cheat sheet of intervals in interval training and the chord cheat sheet in chord training.

#### Scenario: Opening and closing
- **WHEN** the user taps the 💡 button during a question and then closes the panel
- **THEN** the same question is still shown with its state unchanged

#### Scenario: Speed game
- **WHEN** a question is shown in a speed game
- **THEN** no 💡 button is shown

#### Scenario: Ear session
- **WHEN** the user taps the 💡 button during an interval-training question
- **THEN** the ear cheat sheet of intervals is shown, not the scale and triad reference

#### Scenario: Chord session
- **WHEN** the user taps the 💡 button during a chord-training question
- **THEN** the chord cheat sheet is shown, not the list of intervals

## ADDED Requirements

### Requirement: Chord cheat sheet content
The chord cheat sheet SHALL list all nine chord types, whichever level is being played, each with its formula in scale-degree numbers (for example major as 1 3 5 and minor as 1 ♭3 5) and a short description of how it sounds. Tapping a chord type in the list SHALL play it, always from the same fixed root and never from the root of the current question.

#### Scenario: Chord entry
- **WHEN** the chord cheat sheet is open
- **THEN** it shows "Dominant 7th" with the formula 1 3 5 ♭7 and a description

#### Scenario: Hearing a chord
- **WHEN** the user taps "Diminished" in the chord cheat sheet
- **THEN** a diminished chord is played, and the question underneath remains unanswered

#### Scenario: Same sound on every question
- **WHEN** the user taps "Minor" in the chord cheat sheet on two different questions
- **THEN** the same notes are played both times
