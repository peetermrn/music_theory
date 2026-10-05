# Spec Delta

## MODIFIED Requirements

### Requirement: Starting a speed game
The home screen SHALL offer, for each of the modes Notes, Scales, Chords, Relatives, Mixed, Guitar and Bass, a way to start a speed game in that mode with one tap, in addition to starting a normal session.

#### Scenario: Starting from the home screen
- **WHEN** the user taps the speed entry of the Notes mode on the home screen
- **THEN** a speed game starts with Notes questions, full hearts, a score of 0 and the starting time limit

#### Scenario: Relatives speed game
- **WHEN** the user taps the speed entry of the Relatives mode on the home screen
- **THEN** a speed game starts with Relatives questions

### Requirement: Same questions as the normal mode
A speed game SHALL use the same question types, prompts, four answer choices and distractor rules as a normal session of the same mode.

#### Scenario: Mixed speed game
- **WHEN** a Mixed speed game is played
- **THEN** every question is a Notes, Scales, Chords or Relatives question
