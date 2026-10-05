# speed-mode Specification

## Purpose

An endless timed game available for every quiz mode. It trains instant recall by shortening the time allowed per question, ends when the player runs out of hearts, and remembers the best score per mode on the device.

## Requirements

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

### Requirement: Countdown per question
Each speed-game question SHALL have a time limit, and the remaining time SHALL be shown as a visible countdown from the moment the question is displayed. If no answer is selected before the time runs out, the question SHALL count as a wrong answer in every respect: it costs a heart, does not add to the score, and is included in Review mistakes.

#### Scenario: Time runs out
- **WHEN** the countdown reaches zero before the user selects an answer
- **THEN** one heart is lost, the correct answer is revealed, and the score is unchanged

#### Scenario: Timed-out question is reviewable
- **WHEN** a game ends after a question timed out and the user selects "Review mistakes"
- **THEN** the timed-out question is among the review questions

### Requirement: Time limit progression
The time limit SHALL become shorter after each correct answer until it reaches a minimum, and SHALL become longer after each miss without exceeding the starting time limit.

#### Scenario: Correct answer above the minimum
- **WHEN** the user answers correctly while the time limit is above the minimum
- **THEN** the next question has a shorter time limit

#### Scenario: Correct answer at the minimum
- **WHEN** the user answers correctly while the time limit is at the minimum
- **THEN** the next question has the same time limit

#### Scenario: Miss
- **WHEN** the user misses a question
- **THEN** the next question has a longer time limit, but not longer than the starting time limit

### Requirement: Hearts
A speed game SHALL start with a fixed number of hearts, shown during play. Each miss, whether a wrong answer or a timeout, SHALL remove one heart, and the game SHALL end when no hearts remain.

#### Scenario: Losing a heart
- **WHEN** the user selects a wrong answer with 3 hearts left
- **THEN** 2 hearts are shown

#### Scenario: Last heart
- **WHEN** the user misses a question with 1 heart left
- **THEN** the game-over screen is shown after a short moment

### Requirement: Speed-game feedback
After every question the app SHALL lock the choices, stop the countdown, briefly mark the result and then continue without any tap. A correct answer is marked as correct; a wrong answer is marked as wrong with the correct answer marked alongside it; after a timeout the correct answer is marked. A speed game SHALL NOT wait for the user between questions.

#### Scenario: Correct answer advances by itself
- **WHEN** the user selects the correct answer
- **THEN** the next question appears after a short moment with no tap

#### Scenario: Wrong answer advances by itself
- **WHEN** the user selects a wrong answer with hearts to spare
- **THEN** the selected choice is briefly marked wrong, the correct choice is marked, and the next question appears after a short moment with no tap

#### Scenario: Timeout advances by itself
- **WHEN** the countdown runs out with hearts to spare
- **THEN** the correct choice is briefly marked and the next question appears after a short moment with no tap

#### Scenario: Unattended game
- **WHEN** a speed game is left untouched
- **THEN** each question times out in turn until no hearts remain and the game-over screen is shown

### Requirement: Endless play without recent repeats
A speed game SHALL have no fixed number of questions. It SHALL NOT repeat a question prompt that was asked among the most recent questions of the same game.

#### Scenario: Long game
- **WHEN** the user has answered 50 questions and still has hearts
- **THEN** another question is shown

### Requirement: Score and game over
The score of a speed game SHALL be the number of correct answers. The game-over screen SHALL show the score and the best score for that mode, and SHALL let the user play again in the same mode or return to the home screen. If any question was missed, it SHALL offer "Review mistakes", which starts a normal untimed review session of the missed questions.

#### Scenario: Game over summary
- **WHEN** a Bass speed game ends with 17 correct answers
- **THEN** the game-over screen shows a score of 17 and the best Bass score

#### Scenario: Reviewing misses
- **WHEN** the user selects "Review mistakes" on the game-over screen
- **THEN** a normal session of the missed questions starts with no countdown and no hearts

### Requirement: Best score
The app SHALL store the best speed-game score for each mode on the device and keep it between visits. For Notes, Scales and Mixed the best score SHALL be kept separately for each selection of scale groups, and scores stored before scale groups existed SHALL count for the default selection. A finished game with a higher score SHALL replace the stored best and be marked as a new best on the game-over screen. The best score for each mode, for the current selection, SHALL be shown on the home screen once one exists. If the score cannot be stored, the game SHALL still be playable.

#### Scenario: New best
- **WHEN** a Notes speed game ends with a score of 23 and the stored best for Notes is 19
- **THEN** the game-over screen marks a new best and the home screen afterwards shows 23 for Notes

#### Scenario: Best survives a restart
- **WHEN** the app is closed and opened again
- **THEN** the previously stored best scores are shown on the home screen

#### Scenario: Quitting does not record a score
- **WHEN** the user quits a speed game before losing all hearts
- **THEN** the stored best score is unchanged

#### Scenario: Separate best per selection
- **WHEN** the Notes best is 23 with only "Major & minor" on and the user switches to only "Pentatonic"
- **THEN** the home screen shows no Notes best until a Notes speed game is finished with that selection

#### Scenario: Switching back
- **WHEN** the user switches back to only "Major & minor"
- **THEN** the home screen shows a Notes best of 23 again

#### Scenario: Modes without scale groups
- **WHEN** the user changes the scale selection
- **THEN** the best scores shown for Chords, Relatives, Guitar and Bass do not change

### Requirement: Tuning values
A speed game SHALL use these values: 5 hearts; a starting time limit of 20 seconds; each correct answer multiplies the time limit by 0.9; a minimum time limit of 2 seconds; each miss divides the time limit by 0.9 twice. The same values SHALL apply to every mode. A correct answer is shown for about 0.3 seconds and a miss for about 0.6 seconds before the next question.

#### Scenario: First correct answer
- **WHEN** the user answers the first question of a speed game correctly
- **THEN** the second question has a time limit of 18 seconds
