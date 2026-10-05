# quiz-session Specification

## Purpose

The quiz flow shared by every quiz mode (Notes, Scales, Chords, Relatives, Mixed, Guitar and Bass): choosing a mode, answering one multiple-choice question at a time, immediate feedback, answer timing, the end-of-session results screen, and reviewing mistakes. Sessions are meant to take 2–5 minutes on a phone. Ear training is separate: it is opened from the home screen but runs its own sessions, defined by the ear-training capability.

## Requirements

### Requirement: Mode selection
The home screen SHALL offer the quiz modes Notes, Scales, Chords, Relatives, Mixed, Guitar and Bass, and selecting one SHALL start a new session in that mode. The modes SHALL be grouped under two headings, "Keys" (Notes, Scales, Chords, Relatives, Mixed) and "Memorize the fretboard" (Guitar, Bass), and every mode SHALL be directly selectable on the home screen without opening a submenu. Below the modes the home screen SHALL show one "Ear training" entry, which opens the Ear training page instead of starting a session. Ear training is not a quiz mode: its sessions are defined by the ear-training capability, and the other requirements of this capability do not apply to them.

#### Scenario: Starting a session
- **WHEN** the user taps a mode on the home screen
- **THEN** a session starts in that mode and the first question is shown

#### Scenario: Grouped modes
- **WHEN** the home screen is shown
- **THEN** Notes, Scales, Chords, Relatives and Mixed appear under the heading "Keys" and Guitar and Bass appear under the heading "Memorize the fretboard"

#### Scenario: Fretboard mode in one tap
- **WHEN** the user taps Bass on the home screen
- **THEN** a Bass session starts immediately with no intermediate screen

#### Scenario: Ear training entry
- **WHEN** the home screen is shown
- **THEN** a single "Ear training" entry appears below the fretboard modes, and no ear-training level is listed on the home screen

#### Scenario: Opening ear training
- **WHEN** the user taps "Ear training" on the home screen
- **THEN** the Ear training page is shown and no session has started

### Requirement: Session length
A normal session SHALL consist of 10 questions, and the app SHALL avoid repeating the same question prompt within one normal session.

#### Scenario: Session ends after ten questions
- **WHEN** the user has answered the 10th question and continues
- **THEN** the results screen is shown

### Requirement: One question with four choices
The quiz SHALL present one question at a time with exactly four answer choices, exactly one of which is correct.

#### Scenario: Question display
- **WHEN** a question is shown in a normal session
- **THEN** four distinct answer buttons are shown along with the question number, the session length and the running count of correct answers

### Requirement: Immediate feedback
In a normal session, after the user selects an answer the app SHALL immediately show whether it was correct, reveal the correct answer, lock the answer choices, and offer a button to continue.

#### Scenario: Wrong answer
- **WHEN** the user selects an incorrect choice
- **THEN** the selected choice is marked wrong, the correct choice is marked, the correct answer is stated, and the choices can no longer be changed

#### Scenario: Last question
- **WHEN** feedback is shown for the final question of the session
- **THEN** the continue button is labelled "Finish" instead of "Next"

### Requirement: Answer timing
The app SHALL measure, for each question, the time from when the question is displayed until an answer is selected, excluding time spent on the feedback view. In a normal session the app MUST NOT show a countdown or impose a time limit.

#### Scenario: Time on feedback is not counted
- **WHEN** the user answers after 3 seconds and then waits 20 seconds before tapping Next
- **THEN** the recorded answer time for that question is about 3 seconds

### Requirement: Per-question result record
The app SHALL keep, for each answered question in the current session, the question type, question text, correct answer, selected answer, whether it was correct, and the answer time. This data SHALL be held in memory only and not persisted between sessions.

#### Scenario: Result recorded
- **WHEN** the user answers a question
- **THEN** a result record for that question is added to the current session

### Requirement: Results screen
At the end of a normal session the app SHALL show the number of correct answers out of the total, the percentage, the average answer time in seconds rounded to one decimal place, and a per-question-type breakdown of correct/total.

#### Scenario: Results summary
- **WHEN** a session ends with 8 of 10 correct and a mean answer time of 3.68 seconds
- **THEN** the results screen shows "8 / 10", "80%" and "3.7 seconds"

#### Scenario: Leaving the results screen
- **WHEN** the results screen is shown
- **THEN** the user can start another session in the same mode or return to the home screen

### Requirement: Review mistakes
If the user answered any question incorrectly, the results screen SHALL offer a "Review mistakes" action that starts a session containing only the incorrectly answered questions. Each review question SHALL be the same underlying question with freshly generated and shuffled answer choices, and the review session SHALL end with the normal results screen.

#### Scenario: Review offered
- **WHEN** a session ends with 2 incorrect answers
- **THEN** "Review mistakes" is shown and selecting it starts a 2-question session of those two questions

#### Scenario: No mistakes
- **WHEN** a session ends with every answer correct
- **THEN** "Review mistakes" is not shown

### Requirement: Quitting a session
The user SHALL be able to abandon a session at any point and return to the home screen.

#### Scenario: Quit mid-session
- **WHEN** the user taps Quit during a question
- **THEN** the home screen is shown and no results screen appears
