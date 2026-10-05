# Spec Delta

## MODIFIED Requirements

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

### Requirement: Results screen
At the end of a normal session the app SHALL show the number of correct answers out of the total, the percentage, the average answer time in seconds rounded to one decimal place, and a per-question-type breakdown of correct/total.

#### Scenario: Results summary
- **WHEN** a session ends with 8 of 10 correct and a mean answer time of 3.68 seconds
- **THEN** the results screen shows "8 / 10", "80%" and "3.7 seconds"

#### Scenario: Leaving the results screen
- **WHEN** the results screen is shown
- **THEN** the user can start another session in the same mode or return to the home screen
