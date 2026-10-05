# Spec Delta

## Purpose

Scale-degree recognition by ear, the third ear-training exercise: the app establishes a key with a short chord progression, plays one note of that key, and the user says which degree of the scale it is. It trains hearing a note's place in a key, without perfect pitch, and mirrors the Notes mode by sound.

## ADDED Requirements

### Requirement: Degree training entry and page
The home screen SHALL show a "Degree training" entry under the "Ear training" heading, after "Chord training", with no speed entry. Tapping it SHALL open the Degree training page, which SHALL list Level 1 to Level 4, each with the keys and degrees it asks, and the Custom selection, and SHALL let the user return to the home screen. Nothing SHALL be played and no session SHALL start until the user starts a level or Custom.

#### Scenario: Entry on the home screen
- **WHEN** the home screen is shown
- **THEN** "Interval training", "Chord training" and "Degree training" appear under "Ear training" in that order, and none has a speed entry

#### Scenario: Page content
- **WHEN** the user taps "Degree training"
- **THEN** a page titled "Degree training" shows four levels and the Custom selection, and no sound is played

#### Scenario: Back to home
- **WHEN** the user taps the back control on the Degree training page
- **THEN** the home screen is shown as it was

### Requirement: Degree question
A degree-training question SHALL first play a chord progression that establishes a key, then a short silence, then one single note from that key's scale, and SHALL ask which degree of the scale the note is. The degrees are named "1st" to "7th". The question SHALL state whether the key is major or minor and SHALL NOT show the name of the key or of the note before an answer is selected.

#### Scenario: What is heard
- **WHEN** a degree question is played
- **THEN** several chords are heard, then a pause, then one note on its own

#### Scenario: Fifth degree in a major key
- **WHEN** the key is D major and the degree asked is the 5th
- **THEN** the single note is an A, the correct answer is "5th", and neither "D" nor "A" is shown before answering

#### Scenario: Major or minor is stated
- **WHEN** a Level 4 question is shown
- **THEN** the question says the key is minor

### Requirement: Establishing the key
The progression SHALL use only chords built from the notes of the key's own scale and SHALL end on the chord of the 1st degree, so that the key is clear before the note is played. The key SHALL be chosen at random for each question from all twelve keys of the level's type, so that a degree cannot be recognised by its pitch. The single note SHALL lie between the tonic and the 7th degree above it.

#### Scenario: Ends at home
- **WHEN** the progression of any question is played
- **THEN** its last chord is the chord of the key's 1st degree

#### Scenario: Same degree, different key
- **WHEN** the 3rd degree is asked twice in one session
- **THEN** the two questions are in different keys and the two notes differ in pitch

### Requirement: Scales used
In a major key the degrees SHALL be those of the major scale (0 2 4 5 7 9 11 semitones above the tonic) and in a minor key those of the natural minor scale (0 2 3 5 7 8 10). No note outside the key's scale SHALL be asked.

#### Scenario: Third degree in minor
- **WHEN** the key is A minor and the degree asked is the 3rd
- **THEN** the single note is 3 semitones above the tonic, a C

#### Scenario: Seventh degree in minor
- **WHEN** the key is A minor and the degree asked is the 7th
- **THEN** the single note is 10 semitones above the tonic, a G

### Requirement: Degree levels
Degree training SHALL offer four levels. Level 1 asks the 1st, 3rd and 5th degrees in major keys. Level 2 adds the 2nd and 4th. Level 3 adds the 6th and 7th. Level 4 asks all seven degrees in minor keys. Every level SHALL be available from the start, and tapping a level on the Degree training page SHALL start a session in it with no intermediate step.

#### Scenario: Level 1
- **WHEN** a Level 1 session is played
- **THEN** every key is major and every note is the 1st, 3rd or 5th degree

#### Scenario: Level 3
- **WHEN** a Level 3 session is played
- **THEN** every key is major and any of the seven degrees can be asked

#### Scenario: Level 4
- **WHEN** a Level 4 session is played
- **THEN** every key is minor and any of the seven degrees can be asked

#### Scenario: No locking
- **WHEN** the app is opened for the first time
- **THEN** Level 4 can be started without playing the lower levels

### Requirement: Degree Custom selection
The Degree training page SHALL show a Custom selection with a choice between major and minor keys, a tick box for each of the seven degrees, and a control that starts a session with exactly that key type and those degrees. A session SHALL NOT start with fewer than two degrees ticked. The selection SHALL be remembered on the device between visits; before the user has chosen, it is minor keys with the 1st, 3rd and 5th. If the selection cannot be stored, Custom SHALL still be playable.

#### Scenario: Minor triad notes
- **WHEN** the user chooses minor and ticks only the 1st, 3rd and 5th and starts
- **THEN** every key is minor, every note is one of those three degrees, and they are the only three answer choices

#### Scenario: Too few degrees
- **WHEN** only one degree is ticked
- **THEN** the session cannot be started

#### Scenario: Selection remembered
- **WHEN** the user chooses major with the 4th and 7th, closes the app and opens the Degree training page again
- **THEN** major, the 4th and the 7th are still selected

### Requirement: Degree answer choices
A degree-training question SHALL show one answer choice for every degree of the level or Custom selection, ordered from the 1st to the 7th, in the same positions for every question of the session. All choices and the sound controls SHALL be visible on a phone-width screen without scrolling, including when all seven degrees are shown.

#### Scenario: Fixed positions
- **WHEN** two questions of a Level 1 session are shown
- **THEN** both show 1st, 3rd and 5th in that order

#### Scenario: Seven choices on a phone
- **WHEN** a Level 3 question is shown on a phone-width screen
- **THEN** all seven choices and the sound controls are visible without scrolling

### Requirement: Degree sound controls
The question screen SHALL have a control that plays the whole question again (progression, pause, note), a control that plays only the progression, and a control that plays only the note. They SHALL work both before and after an answer is selected and can be used any number of times without answering the question. Starting any sound SHALL cut off a sound that is still playing.

#### Scenario: Note only
- **WHEN** the user taps the note control
- **THEN** the single note is heard and no chord is played

#### Scenario: Key only
- **WHEN** the user taps the key control
- **THEN** the progression is heard and the single note is not played

#### Scenario: Listening does not answer
- **WHEN** the user uses any sound control before answering
- **THEN** the question remains unanswered

### Requirement: Degree feedback
After an answer is selected the app SHALL mark the selected and the correct choice, state whether the answer was correct, name the selected degree when it was wrong, and name the key and the note that was played, spelled as that key spells it. Tapping any answer choice SHALL then play that degree's note in the question's key, without changing the recorded answer. The app SHALL wait for the user to continue, with a button labelled "Next", or "Finish" on the last question.

#### Scenario: Wrong answer
- **WHEN** the key is D major, the note was the 5th and the user selects 3rd
- **THEN** the feedback names 3rd as the pick, 5th as the answer, and states that the 5th of D major is A

#### Scenario: Spelled as the key spells it
- **WHEN** the key is F major and the note was the 4th
- **THEN** the feedback names the note as Bb, not A#

#### Scenario: Comparing the pick with the answer
- **WHEN** the user, after that wrong answer, taps 3rd and then 5th
- **THEN** the 3rd and then the 5th degree of the question's key are played, and the question still counts as wrong

### Requirement: Same session rules as interval training
A degree-training session SHALL follow the ear-training capability's requirements "Session", "Automatic playback", "Sound choice", "Results", "Quitting", "Separate from the other modes" and "Sound without a network", reading "degree" for "interval", "key" for "starting note" and "Degree training page" for "Interval training page". The sound choice SHALL be the same one as in the other ear-training exercises, and results SHALL be ordered from the 1st degree to the 7th.

#### Scenario: Ten questions without repeats
- **WHEN** a Level 1 session is played
- **THEN** it has 10 questions with no time limit, and no two of them ask the same degree in the same key

#### Scenario: Plays by itself
- **WHEN** the user taps Next
- **THEN** the next progression and note are played without a further tap

#### Scenario: Results per degree
- **WHEN** a Level 2 session ends in which the 4th was asked 3 times and answered correctly once
- **THEN** the results screen shows the score, the percentage, the average answer time and "4th" with 1/3, and offers no "Review mistakes"

#### Scenario: Leaving a session
- **WHEN** the user taps Quit during a degree question, or Finish on the results screen
- **THEN** the Degree training page is shown and any sound stops

#### Scenario: Playing Custom again
- **WHEN** the user plays again from the results screen of a Custom session
- **THEN** a new session starts with the same key type and degrees

#### Scenario: Offline
- **WHEN** the installed app is opened with no network connection and a degree-training session is started
- **THEN** the progressions and notes are played
