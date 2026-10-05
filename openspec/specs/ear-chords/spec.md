# ear-chords Specification

## Purpose

Chord-type recognition by ear, the second ear-training exercise: the app plays a chord and the user names what kind of chord it is. Levels start with major against minor and grow to nine triad and seventh-chord types, and a Custom selection lets the user drill any types they choose.

## Requirements

### Requirement: Chord training entry and page
The home screen SHALL show a "Chord training" entry under the "Ear training" heading, after "Interval training", with no speed entry. Tapping it SHALL open the Chord training page, which SHALL list Level 1 to Level 5, each with the chord types it asks, and the Custom selection, and SHALL let the user return to the home screen. Nothing SHALL be played and no session SHALL start until the user starts a level or Custom.

#### Scenario: Entry on the home screen
- **WHEN** the home screen is shown
- **THEN** "Interval training" and "Chord training" appear under "Ear training", and neither has a speed entry

#### Scenario: Page content
- **WHEN** the user taps "Chord training"
- **THEN** a page titled "Chord training" shows five levels and the Custom selection, and no sound is played

#### Scenario: Back to home
- **WHEN** the user taps the back control on the Chord training page
- **THEN** the home screen is shown as it was

### Requirement: Chord types
Chord training SHALL use nine chord types, each defined by the semitones of its notes above the root: major (0 4 7), minor (0 3 7), diminished (0 3 6), augmented (0 4 8), dominant 7th (0 4 7 10), major 7th (0 4 7 11), minor 7th (0 3 7 10), half-diminished (0 3 6 10) and diminished 7th (0 3 6 9). Every chord SHALL be played in root position with its notes in that order from the root upwards, within one octave.

#### Scenario: Minor triad
- **WHEN** the question's chord type is minor
- **THEN** the notes played are the root and the notes 3 and 7 semitones above it, and the correct answer is "Minor"

#### Scenario: Dominant 7th
- **WHEN** the question's chord type is dominant 7th
- **THEN** four notes are played: the root and the notes 4, 7 and 10 semitones above it

### Requirement: Chord question
A chord-training question SHALL play one chord and ask which type it is. The chord's notes SHALL be played one after the other from the root upwards and then all together. The question SHALL NOT ask for, and the screen SHALL NOT show, the name of the root or of the chord before or after answering.

#### Scenario: What is heard
- **WHEN** a major-chord question is played
- **THEN** three notes are heard one after the other, lowest first, and then the same three notes together

#### Scenario: Type, not name
- **WHEN** a chord question is shown
- **THEN** the answer choices are chord types such as "Major" and "Minor", and no note name appears on the screen

### Requirement: Random root
The root of each question SHALL be chosen at random from a range of at least an octave in the middle register, so that a chord type cannot be recognised by its pitch.

#### Scenario: Same type, different pitch
- **WHEN** the same chord type is asked twice in one session
- **THEN** it is played from a different root each time

### Requirement: Chord levels
Chord training SHALL offer five levels. Level 1 asks major and minor. Level 2 adds diminished. Level 3 adds augmented. Level 4 adds dominant 7th, major 7th and minor 7th. Level 5 adds half-diminished and diminished 7th. Every level SHALL be available from the start, and tapping a level on the Chord training page SHALL start a session in it with no intermediate step.

#### Scenario: Level 1
- **WHEN** a Level 1 session is played
- **THEN** every question is a major or a minor chord

#### Scenario: Level 3
- **WHEN** a Level 3 session is played
- **THEN** every question is a major, minor, diminished or augmented triad, and no seventh chord is asked

#### Scenario: Level 5
- **WHEN** a Level 5 session is played
- **THEN** any of the nine chord types can be asked

#### Scenario: No locking
- **WHEN** the app is opened for the first time
- **THEN** Level 5 can be started without playing the lower levels

### Requirement: Chord Custom selection
The Chord training page SHALL show a Custom selection with a tick box for each of the nine chord types and a control that starts a session with exactly the ticked types. A session SHALL NOT start with fewer than two types ticked. The selection SHALL be remembered on the device between visits, separately from the interval Custom selection; before the user has chosen, major and minor are ticked. If the selection cannot be stored, Custom SHALL still be playable.

#### Scenario: Drilling two types
- **WHEN** the user ticks only dominant 7th and major 7th and starts
- **THEN** every question is one of those two, and they are the only two answer choices

#### Scenario: Too few types
- **WHEN** only one chord type is ticked
- **THEN** the session cannot be started

#### Scenario: Selections kept apart
- **WHEN** the user changes the chord Custom selection and then opens the Interval training page
- **THEN** the interval Custom selection is as it was

### Requirement: Chord answer choices
A chord-training question SHALL show one answer choice for every chord type of the level or Custom selection, in the same positions for every question of the session and in this order: major, minor, diminished, augmented, dominant 7th, major 7th, minor 7th, half-diminished, diminished 7th. All choices and the sound controls SHALL be visible on a phone-width screen without scrolling, including when all nine types are shown.

#### Scenario: Fixed positions
- **WHEN** two questions of a Level 2 session are shown
- **THEN** both show Major, Minor and Diminished in that order

#### Scenario: Nine choices on a phone
- **WHEN** a Level 5 question is shown on a phone-width screen
- **THEN** all nine choices and the sound controls are visible without scrolling

### Requirement: Chord sound controls
The question screen SHALL have a control that plays the chord again as it was first played (one by one, then together), a control that plays its notes one by one only, and a control that plays them together only. They SHALL work both before and after an answer is selected and can be used any number of times without answering the question. Starting any sound SHALL cut off a sound that is still playing.

#### Scenario: Together only
- **WHEN** the user taps Together
- **THEN** all notes of the chord start at the same moment and none is played separately

#### Scenario: Listening does not answer
- **WHEN** the user uses any sound control before answering
- **THEN** the question remains unanswered

### Requirement: Listening to chords after answering
After an answer is selected the app SHALL mark the selected and the correct choice and, when the answer was wrong, name both the selected and the correct chord type. Tapping any answer choice SHALL then play that chord type from the question's root, one by one and then together, without changing the recorded answer. The app SHALL wait for the user to continue, with a button labelled "Next", or "Finish" on the last question.

#### Scenario: Wrong answer
- **WHEN** the user selects Major and the chord was minor
- **THEN** the feedback names Major as the pick and Minor as the answer

#### Scenario: Comparing the pick with the answer
- **WHEN** the user, after that wrong answer, taps Major and then Minor
- **THEN** a major chord and then a minor chord are played from the question's root, and the question still counts as wrong

### Requirement: Same session rules as interval training
A chord-training session SHALL follow the ear-training capability's requirements "Session", "Automatic playback", "Sound choice", "Results", "Quitting", "Separate from the other modes" and "Sound without a network", reading "chord type" for "interval", "root" for "starting note" and "Chord training page" for "Interval training page". The sound choice SHALL be the same one as in interval training, not a second setting.

#### Scenario: Ten questions without repeats
- **WHEN** a Level 1 session is played
- **THEN** it has 10 questions with no time limit, and no two of them play the same chord type from the same root

#### Scenario: Plays by itself
- **WHEN** the user taps Next
- **THEN** the next chord is played without a further tap

#### Scenario: Results per chord type
- **WHEN** a Level 2 session ends in which a diminished chord was asked 3 times and answered correctly twice
- **THEN** the results screen shows the score, the percentage, the average answer time and "Diminished" with 2/3, and offers no "Review mistakes"

#### Scenario: Leaving a session
- **WHEN** the user taps Quit during a chord question, or Finish on the results screen
- **THEN** the Chord training page is shown and any sound stops

#### Scenario: One sound choice
- **WHEN** the user switches to guitar in interval training and then starts a chord-training session
- **THEN** the chords are played as guitar notes

#### Scenario: Offline
- **WHEN** the installed app is opened with no network connection and a chord-training session is started
- **THEN** the chords are played
