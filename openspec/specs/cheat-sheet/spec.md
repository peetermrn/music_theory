# cheat-sheet Specification

## Purpose

A static reference panel available during a quiz for learning and review.

## Requirements

### Requirement: Cheat sheet access
A 💡 button SHALL be visible while a question is shown in a normal session, and tapping it SHALL open the cheat sheet as an overlay that the user can dismiss to return to the same question. The cheat sheet SHALL NOT be available during a speed game.

#### Scenario: Opening and closing
- **WHEN** the user taps the 💡 button during a question and then closes the panel
- **THEN** the same question is still shown with its state unchanged

#### Scenario: Speed game
- **WHEN** a question is shown in a speed game
- **THEN** no 💡 button is shown

### Requirement: Cheat sheet content
The cheat sheet SHALL show the whole/half-step patterns for the major (2 2 1 2 2 2 1), natural minor (2 1 2 2 1 2 2) and harmonic minor (2 1 2 2 1 3 1) scales, the diatonic triad qualities for major and minor keys, the scale-degree names, and the rule for relative keys: the relative minor starts on the 6th note of a major scale and the relative major starts on the 3rd note of a minor scale. It SHALL also show the major pentatonic (2 2 3 2 3, the major scale without its 4th and 7th notes) and the minor pentatonic (3 2 2 3 2, the natural minor scale without its 2nd and 6th notes), whichever scale groups are selected.

#### Scenario: Reference content
- **WHEN** the cheat sheet is open
- **THEN** the major-key triad pattern major, minor, minor, major, major, minor, diminished is shown

#### Scenario: Relative-key rule
- **WHEN** the cheat sheet is open
- **THEN** it states that the relative minor starts on the 6th note of the major scale and the relative major on the 3rd note of the minor scale

#### Scenario: Pentatonic entries
- **WHEN** the cheat sheet is open with only "Major & minor" selected
- **THEN** the minor pentatonic pattern 3 2 2 3 2 and the notes it leaves out are shown

### Requirement: Does not reveal the current answer
The cheat sheet SHALL show the same general reference content regardless of the current question and MUST NOT highlight or reveal the answer to it.

#### Scenario: Content independent of question
- **WHEN** the cheat sheet is opened on two different questions
- **THEN** its content is identical both times
