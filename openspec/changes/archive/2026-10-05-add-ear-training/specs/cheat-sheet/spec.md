# Spec Delta

## MODIFIED Requirements

### Requirement: Cheat sheet access
A 💡 button SHALL be visible while a question is shown in a normal session, and tapping it SHALL open the cheat sheet as an overlay that the user can dismiss to return to the same question. The cheat sheet SHALL NOT be available during a speed game. In an ear-training session the 💡 button SHALL open the ear cheat sheet instead of the theory cheat sheet.

#### Scenario: Opening and closing
- **WHEN** the user taps the 💡 button during a question and then closes the panel
- **THEN** the same question is still shown with its state unchanged

#### Scenario: Speed game
- **WHEN** a question is shown in a speed game
- **THEN** no 💡 button is shown

#### Scenario: Ear session
- **WHEN** the user taps the 💡 button during an ear-training question
- **THEN** the ear cheat sheet is shown, not the scale and triad reference

## ADDED Requirements

### Requirement: Ear cheat sheet content
The ear cheat sheet SHALL list all twelve intervals from minor 2nd to octave, whichever level is being played, each with its size in semitones and a short description of how it sounds. Tapping an interval in the list SHALL play it, always from the same fixed starting note and never from the starting note of the current question.

#### Scenario: Interval entry
- **WHEN** the ear cheat sheet is open
- **THEN** it shows "Perfect 5th" with 7 semitones and a description

#### Scenario: Hearing an interval
- **WHEN** the user taps "Minor 3rd" in the ear cheat sheet
- **THEN** a minor 3rd is played, and the question underneath remains unanswered

#### Scenario: Same sound on every question
- **WHEN** the user taps "Minor 3rd" in the ear cheat sheet on two different questions
- **THEN** the same two notes are played both times
