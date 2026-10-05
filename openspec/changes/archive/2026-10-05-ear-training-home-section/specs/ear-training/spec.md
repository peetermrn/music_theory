# Spec Delta

## RENAMED Requirements

- FROM: `### Requirement: Ear training page`
- TO: `### Requirement: Interval training page`

## MODIFIED Requirements

### Requirement: Interval training page
Interval training SHALL have its own page, titled "Interval training" and opened from the "Interval training" entry on the home screen. The page SHALL list Level 1 to Level 6, each with the intervals it asks, and the Custom selection, and SHALL let the user return to the home screen. Nothing SHALL be played and no session SHALL start until the user starts a level or Custom.

#### Scenario: Page content
- **WHEN** the Interval training page is opened
- **THEN** it is titled "Interval training", six levels and the Custom selection are shown, and no sound is played

#### Scenario: Back to home
- **WHEN** the user taps the back control on the Interval training page
- **THEN** the home screen is shown as it was

### Requirement: Levels
Ear training SHALL offer six levels. Level 1 asks major 3rd and octave. Level 2 adds perfect 5th. Level 3 adds minor 3rd and perfect 4th. Level 4 adds minor 2nd and major 2nd. Level 5 adds minor 6th and major 6th. Level 6 adds tritone, minor 7th and major 7th. Every level SHALL be available from the start, and tapping a level on the Interval training page SHALL start a session in it with no intermediate step.

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
The Interval training page SHALL show a Custom selection with a tick box for each of the twelve intervals and a control that starts a session with exactly the ticked intervals. A session SHALL NOT start with fewer than two intervals ticked. The selection SHALL be remembered on the device between visits; before the user has chosen, minor 3rd and major 3rd are ticked. If the selection cannot be stored, Custom SHALL still be playable.

#### Scenario: Drilling two intervals
- **WHEN** the user ticks only minor 3rd and major 3rd and starts
- **THEN** every question is a minor 3rd or a major 3rd, and those are the only two answer choices

#### Scenario: Too few intervals
- **WHEN** only one interval is ticked
- **THEN** the session cannot be started

#### Scenario: Selection remembered
- **WHEN** the user ticks tritone and perfect 5th, closes the app and opens the Interval training page again
- **THEN** tritone and perfect 5th are still the ticked intervals

### Requirement: Results
At the end of a session the app SHALL show the number of correct answers out of the total, the percentage, the average answer time in seconds rounded to one decimal place, and correct/total for each interval that was asked, ordered from the smallest interval to the largest. Answer time is measured from when the question is displayed until an answer is selected, including the automatic playback. The user SHALL be able to play again with the same intervals or return to the Interval training page. "Review mistakes" SHALL NOT be offered, and nothing SHALL be stored between sessions.

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
- **THEN** the Interval training page is shown

### Requirement: Quitting
The user SHALL be able to abandon an ear-training session at any point and return to the Interval training page.

#### Scenario: Quit mid-session
- **WHEN** the user taps Quit during a question
- **THEN** the Interval training page is shown and no results screen appears

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
- **THEN** the Interval training page is shown and the sound stops
