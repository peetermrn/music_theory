# Spec Delta

## MODIFIED Requirements

### Requirement: Cheat sheet access
A 💡 button SHALL be visible while a question is shown in a normal session, and tapping it SHALL open the cheat sheet as an overlay that the user can dismiss to return to the same question. The cheat sheet SHALL NOT be available during a speed game. In an ear-training session the 💡 button SHALL open the cheat sheet of the exercise being played instead of the theory cheat sheet: the ear cheat sheet of intervals in interval training, the chord cheat sheet in chord training and the degree cheat sheet in degree training.

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

#### Scenario: Degree session
- **WHEN** the user taps the 💡 button during a degree-training question
- **THEN** the degree cheat sheet is shown, not the list of intervals or chords

## ADDED Requirements

### Requirement: Degree cheat sheet content
The degree cheat sheet SHALL list the seven degrees, whichever level is being played, each with its name (tonic, supertonic, mediant, subdominant, dominant, submediant, and leading tone or subtonic) and a short description of how it feels in the key, for major keys in a major-key session and for minor keys in a minor-key session. Tapping a degree SHALL play the progression and then that degree, always in the same fixed key and never in the key of the current question. The sheet SHALL NOT name the key or the note of the current question.

#### Scenario: Degree entry
- **WHEN** the degree cheat sheet is open
- **THEN** it shows "5th" with the name "dominant" and a description

#### Scenario: Hearing a degree
- **WHEN** the user taps "7th" in the degree cheat sheet
- **THEN** a progression and then the 7th degree are played, and the question underneath remains unanswered

#### Scenario: Same sound on every question
- **WHEN** the user taps "3rd" in the degree cheat sheet on two different major-key questions
- **THEN** the same chords and the same note are played both times

#### Scenario: Matches the session's key type
- **WHEN** the degree cheat sheet is opened in a Level 4 session and the user taps "3rd"
- **THEN** the progression is in a minor key and the note is 3 semitones above its tonic
