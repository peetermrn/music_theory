# Spec Delta

## Purpose

Interval recognition by ear, on its own page with its own sessions, separate from the quiz modes: the app plays two notes and the user names the interval between them. Levels start with two clearly different intervals and grow to all twelve, and a Custom selection lets the user drill any intervals they choose.

## ADDED Requirements

### Requirement: Ear training page
Ear training SHALL have its own page, opened from the home screen. The page SHALL list Level 1 to Level 6, each with the intervals it asks, and the Custom selection, and SHALL let the user return to the home screen. Nothing SHALL be played and no session SHALL start until the user starts a level or Custom.

#### Scenario: Page content
- **WHEN** the Ear training page is opened
- **THEN** six levels and the Custom selection are shown, and no sound is played

#### Scenario: Back to home
- **WHEN** the user taps the back control on the Ear training page
- **THEN** the home screen is shown as it was

### Requirement: Interval question
An ear-training question SHALL play two notes one after the other with a short gap, the lower note first, and ask which interval they form. The possible intervals are the twelve from a minor 2nd (1 semitone) to an octave (12 semitones): minor 2nd, major 2nd, minor 3rd, major 3rd, perfect 4th, tritone, perfect 5th, minor 6th, major 6th, minor 7th, major 7th and octave.

#### Scenario: Major 3rd
- **WHEN** the question's interval is a major 3rd
- **THEN** the second note played is 4 semitones above the first and the correct answer is "Major 3rd"

#### Scenario: Order of the notes
- **WHEN** an interval is played
- **THEN** the lower note is heard first and the higher note second

### Requirement: Random starting note
The lower note of each question SHALL be chosen at random from a range of at least an octave in the middle register, so that an interval cannot be recognised by its pitch.

#### Scenario: Same interval, different pitch
- **WHEN** the same interval is asked twice in one session
- **THEN** it starts on a different note each time

### Requirement: Levels
Ear training SHALL offer six levels. Level 1 asks major 3rd and octave. Level 2 adds perfect 5th. Level 3 adds minor 3rd and perfect 4th. Level 4 adds minor 2nd and major 2nd. Level 5 adds minor 6th and major 6th. Level 6 adds tritone, minor 7th and major 7th. Every level SHALL be available from the start, and tapping a level on the Ear training page SHALL start a session in it with no intermediate step.

#### Scenario: Level 1
- **WHEN** a Level 1 session is played
- **THEN** every question is a major 3rd or an octave

#### Scenario: Level 3
- **WHEN** a Level 3 session is played
- **THEN** every question is a minor 3rd, major 3rd, perfect 4th, perfect 5th or octave

#### Scenario: Level 6
- **WHEN** a Level 6 session is played
- **THEN** any of the twelve intervals can be asked

#### Scenario: No locking
- **WHEN** the app is opened for the first time
- **THEN** Level 6 can be started without playing the lower levels

### Requirement: Custom selection
The Ear training page SHALL show a Custom selection with a tick box for each of the twelve intervals and a control that starts a session with exactly the ticked intervals. A session SHALL NOT start with fewer than two intervals ticked. The selection SHALL be remembered on the device between visits; before the user has chosen, minor 3rd and major 3rd are ticked. If the selection cannot be stored, Custom SHALL still be playable.

#### Scenario: Drilling two intervals
- **WHEN** the user ticks only minor 3rd and major 3rd and starts
- **THEN** every question is a minor 3rd or a major 3rd, and those are the only two answer choices

#### Scenario: Too few intervals
- **WHEN** only one interval is ticked
- **THEN** the session cannot be started

#### Scenario: Selection remembered
- **WHEN** the user ticks tritone and perfect 5th, closes the app and opens the Ear training page again
- **THEN** tritone and perfect 5th are still the ticked intervals

### Requirement: Session
An ear-training session SHALL consist of 10 questions, shown one at a time with the question number, the session length and the running count of correct answers. It SHALL have no time limit, no countdown and no hearts. A session SHALL NOT play the same interval from the same starting note twice.

#### Scenario: Session ends after ten questions
- **WHEN** the user has answered the 10th question and continues
- **THEN** the ear-training results screen is shown

#### Scenario: Two intervals
- **WHEN** a Level 1 session is played
- **THEN** it has 10 questions, and no two of them play the same interval from the same starting note

### Requirement: Answer choices
An ear-training question SHALL show one answer choice for every interval of the level or Custom selection, ordered from the smallest interval to the largest, in the same positions for every question of the session. All choices and the sound controls SHALL be visible on a phone-width screen without scrolling, including when all twelve intervals are shown.

#### Scenario: Fixed positions
- **WHEN** two questions of a Level 2 session are shown
- **THEN** both show Major 3rd, Perfect 5th and Octave in that order

#### Scenario: Twelve choices on a phone
- **WHEN** a Level 6 question is shown on a phone-width screen
- **THEN** all twelve choices and the sound controls are visible without scrolling

### Requirement: Automatic playback
The interval SHALL be played automatically when a question is displayed. If the device does not allow sound to start by itself, the question SHALL still be shown and the interval SHALL play when the user taps Play both.

#### Scenario: New question
- **WHEN** the user taps Next
- **THEN** the next question is shown and its two notes are played without a further tap

### Requirement: Sound controls
The question screen SHALL have a control that plays both notes again, a control that plays only the first note, and a control that plays only the second note. They SHALL work both before and after an answer is selected and can be used any number of times. Starting any sound SHALL cut off a sound that is still playing.

#### Scenario: Replay
- **WHEN** the user taps Play both
- **THEN** the two notes are played again exactly as before

#### Scenario: Repeating a single note
- **WHEN** the user taps the first-note control several times in a row
- **THEN** the first note is heard once per tap, each tap restarting it

#### Scenario: Listening does not answer
- **WHEN** the user uses any sound control before answering
- **THEN** the question remains unanswered

### Requirement: Sound choice
Ear training SHALL offer two sounds: a piano and an acoustic guitar, with the piano used until the user chooses otherwise. A sound button on the ear question screen SHALL switch between them, show which one is current, and play the current interval again in the newly chosen sound. The choice SHALL apply to every sound in ear training and be remembered on the device between visits. If the chosen instrument cannot be loaded, the question SHALL remain usable without sound.

#### Scenario: Switching to guitar
- **WHEN** piano is current and the user taps the sound button during a question
- **THEN** the button shows guitar, the question's two notes are played as acoustic guitar notes, and the question remains unanswered

#### Scenario: Back to piano
- **WHEN** guitar is current and the user taps the sound button
- **THEN** the button shows piano and the two notes are played as piano notes

#### Scenario: Choice remembered
- **WHEN** the user switches to guitar, closes the app and later starts an ear-training session
- **THEN** the first question is played as guitar notes

#### Scenario: Instrument unavailable
- **WHEN** the chosen instrument's sound cannot be loaded
- **THEN** the question is still shown and can be answered, without sound

### Requirement: Listening after answering
After an answer is selected the app SHALL mark the selected and the correct choice, state whether the answer was correct and, when it was wrong, name both the selected interval and the correct interval. Tapping any answer choice SHALL then play that choice's interval from the question's starting note, without changing the recorded answer. The app SHALL wait for the user to continue, with a button labelled "Next", or "Finish" on the last question.

#### Scenario: Wrong answer
- **WHEN** the user selects Major 3rd and the interval was a perfect 5th
- **THEN** the feedback names Major 3rd as the pick and Perfect 5th as the answer

#### Scenario: Comparing the pick with the answer
- **WHEN** the user, after that wrong answer, taps Major 3rd and then Perfect 5th
- **THEN** a major 3rd and then a perfect 5th are played from the question's starting note, and the question still counts as wrong

### Requirement: Results
At the end of a session the app SHALL show the number of correct answers out of the total, the percentage, the average answer time in seconds rounded to one decimal place, and correct/total for each interval that was asked, ordered from the smallest interval to the largest. Answer time is measured from when the question is displayed until an answer is selected, including the automatic playback. The user SHALL be able to play again with the same intervals or return to the Ear training page. "Review mistakes" SHALL NOT be offered, and nothing SHALL be stored between sessions.

#### Scenario: Results summary
- **WHEN** a Level 2 session ends with 8 of 10 correct, in which a major 3rd was asked 4 times and answered correctly 3 times
- **THEN** the results screen shows "8 / 10", "80%", the average answer time, and "Major 3rd" with 3/4

#### Scenario: No review
- **WHEN** a session ends with 3 incorrect answers
- **THEN** "Review mistakes" is not shown

#### Scenario: Playing Custom again
- **WHEN** the user plays again from the results screen of a Custom session
- **THEN** a new session starts with the same ticked intervals

#### Scenario: Leaving the results screen
- **WHEN** the user finishes from the results screen
- **THEN** the Ear training page is shown

### Requirement: Quitting
The user SHALL be able to abandon an ear-training session at any point and return to the Ear training page.

#### Scenario: Quit mid-session
- **WHEN** the user taps Quit during a question
- **THEN** the Ear training page is shown and no results screen appears

### Requirement: Separate from the other modes
Ear-training questions SHALL NOT appear in Mixed or in any quiz mode, and the "Scales" tick boxes SHALL NOT affect ear training.

#### Scenario: Mixed session
- **WHEN** a Mixed session or Mixed speed game is played
- **THEN** no question plays a sound

### Requirement: Sound without a network
Both sounds SHALL be available on the device and SHALL work with no network connection once the app has been loaded. Sound SHALL stop when the user leaves the question, whether by quitting, continuing to the next question or finishing the session.

#### Scenario: Offline
- **WHEN** the installed app is opened with no network connection and a Level 1 session is started
- **THEN** the intervals are played

#### Scenario: Instruments offline
- **WHEN** the installed app is opened with no network connection and the user plays a question on piano and then switches to guitar
- **THEN** the intervals are played as piano notes and then as guitar notes

#### Scenario: Quitting while a note sounds
- **WHEN** the user taps Quit while a note is sounding
- **THEN** the Ear training page is shown and the sound stops
