# Spec Delta

## Purpose

Questions answered by playing a single note on a guitar, heard through the microphone, so that recall of keys and the fretboard, and hearing notes, are practised on the instrument itself.

## ADDED Requirements

### Requirement: Play on guitar entries
The section SHALL offer three entries: "Key notes", "Fretboard notes" and "Play it back". Tapping one SHALL start a session of that kind at once, with no page or setting in between. The entries SHALL have no speed game and no best score, and SHALL use standard guitar tuning (E A D G B E, lowest to highest) with A4 = 440 Hz.

#### Scenario: One tap
- **WHEN** the user taps "Fretboard notes" on the home screen
- **THEN** the first Fretboard notes question is shown and the app is listening

### Requirement: Key notes questions
A Key notes question SHALL ask for a note of one of the 12 major or 12 natural minor keys by its position, 1st to 7th, naming the key in full, for example "Play the 5th note of E major". The note SHALL count in any octave.

#### Scenario: Any octave
- **WHEN** the question is "Play the 5th note of E major" and the user plays a B on any string
- **THEN** the answer is correct

#### Scenario: Flat key
- **WHEN** the question is "Play the 4th note of F major" and the user plays the note at the 1st fret of the A string
- **THEN** the answer is correct and the note is named Bb

### Requirement: Fretboard notes questions
A Fretboard notes question SHALL ask for a note on a named string, for example "Play A on the D string", naming notes with sharps and the two E strings as "low E" and "high E". Only a pitch found on that string between fret 0 and fret 12 SHALL count, in either of its octaves there.

#### Scenario: Exact pitch
- **WHEN** the question is "Play A on the D string" and the user plays the A at the 7th fret of the D string
- **THEN** the answer is correct

#### Scenario: Same note, wrong octave
- **WHEN** the question is "Play A on the D string" and the user plays the open A string
- **THEN** the answer is not correct

#### Scenario: Open string or 12th fret
- **WHEN** the question is "Play E on the low E string"
- **THEN** both the open low E string and its 12th fret count as correct

#### Scenario: String not checked
- **WHEN** the question is "Play A on the D string" and the user plays the same A at the 2nd fret of the G string
- **THEN** the answer is correct, because only the pitch is heard

### Requirement: Play it back questions
A Play it back question SHALL play one note in the guitar sound, chosen at random from E2 to C5, and ask the user to play the same pitch. A control SHALL play the note again any number of times. The note SHALL always sound as guitar, whichever sound is chosen for ear training. The prompt SHALL NOT show the note's name until it is answered or revealed.

#### Scenario: New question
- **WHEN** a Play it back question is shown
- **THEN** a single guitar note is played by itself, and no note name is shown

#### Scenario: Hearing it again
- **WHEN** the user taps the control to hear the note again
- **THEN** the same note is played again and the question stays unanswered

### Requirement: Hearing a played note
A note SHALL count as played only once it is held steadily for a moment, as in the tuner. Noise, speech and the attack of a string SHALL NOT count. Playing the same note again, even while it is still ringing, SHALL count as playing it again, and one pluck SHALL count once. While the app is playing a sound itself, what the microphone hears SHALL be ignored. A note from the previous question that is still ringing SHALL NOT count as played on the next one.

#### Scenario: Previous note still ringing
- **WHEN** the user answers with the right note, the next question appears, and the string is still ringing
- **THEN** the ringing note is not counted as played on the new question

#### Scenario: Plucked again while ringing
- **WHEN** the user plucks A3 and plucks it again before it has died away
- **THEN** A3 counts as played twice

#### Scenario: App's own sound
- **WHEN** a Play it back note is being played by the app
- **THEN** it is not counted as played by the user

### Requirement: Answering by playing a note twice
A note SHALL count as an answer only when the same pitch is played twice in a row. A note played once is searching: it SHALL NOT be judged, and the app SHALL show that it was heard once and that playing it again answers. In Play it back the searched note SHALL be named; in Key notes and Fretboard notes it SHALL NOT be named until it is given as an answer, so the screen cannot be used to find the note.

#### Scenario: Searching past the right note
- **WHEN** a Play it back question plays A3 and the user plays G3, A3, B3 and C4, each once
- **THEN** none of them is taken as an answer, and the question is still open

#### Scenario: Answering
- **WHEN** the user then plays A3 twice in a row
- **THEN** A3 is the answer, and it is right

#### Scenario: Name hidden while searching
- **WHEN** the question is "Play A on the D string" and the user plays G3 once
- **THEN** the app shows that a note was heard and that playing it again answers, without naming G3

### Requirement: Right answer
When the answer is right, the app SHALL mark it as correct, show the note's name, and continue to the next question by itself after a short moment, or to the results after the last question.

#### Scenario: Correct
- **WHEN** the user answers with the right note
- **THEN** the note is shown as correct and the next question appears after about a second, with no tap

### Requirement: Wrong answers and retries
When the answer is wrong, the app SHALL name the note that was given and keep listening until the right note is given as an answer. Only a question whose first answer was right SHALL count as correct. In Play it back, an answer with the right name in the wrong octave SHALL be shown as an octave too high or too low.

#### Scenario: Wrong then right
- **WHEN** the user answers G# and then answers the right note A
- **THEN** the app first says that G# is not it, then marks A as correct, and the question counts as missed

#### Scenario: Wrong octave
- **WHEN** a Play it back question plays A3 and the user answers A2
- **THEN** the app says the note is right but an octave too low, and keeps listening

### Requirement: Show me
Each question SHALL have a "Show me" control that reveals the answer: the note's name, and for Fretboard notes and Play it back its position on a fretboard diagram of frets 0 to 12. A revealed question SHALL count as missed. The app SHALL keep listening, continue by itself once the note is given as the answer, and offer a Next control so the user can move on without playing it.

#### Scenario: Revealing a fretboard question
- **WHEN** the question is "Play A on the D string" and the user taps "Show me"
- **THEN** the answer A is shown, the D string's 7th fret is marked on a fretboard diagram, and the question counts as missed

#### Scenario: Moving on
- **WHEN** an answer has been revealed and the user taps Next
- **THEN** the next question is shown

### Requirement: Play on guitar session
A session SHALL have 10 questions of the chosen kind, shown one at a time with the question number, the session length and the running count of questions whose first answer was right. It SHALL NOT ask the same question twice. There SHALL be no time limit, and the user SHALL be able to quit at any point and return to the home screen.

#### Scenario: Ten questions
- **WHEN** the 10th question is answered
- **THEN** the results screen is shown

#### Scenario: Quitting
- **WHEN** the user taps Quit during a question
- **THEN** the home screen is shown and no results screen appears

### Requirement: Play on guitar results
The results screen SHALL show the questions whose first answer was right, out of 10, the percentage, the average time in seconds, to one decimal place, from a question being shown until it was answered right, and every missed question with its answer. It SHALL let the user play again in the same kind or return to the home screen. Nothing SHALL be stored between sessions.

#### Scenario: Results
- **WHEN** a session ends with 7 questions whose first answer was right
- **THEN** the results show "7 / 10", "70%", the average time, and the three missed questions with their answers

### Requirement: Microphone in Play on guitar
The microphone SHALL be used only while a Play on guitar question is shown and the app is visible, and SHALL be released on the results screen, when the session is left, and while the app is hidden. If the microphone is blocked or unavailable, the question screen SHALL say so with the same explanation and "Try again" control as the tuner, and Show me and Next SHALL still work. Sound from the microphone SHALL never leave the phone.

#### Scenario: Leaving releases the microphone
- **WHEN** the user quits a session or reaches the results screen
- **THEN** the phone no longer shows that the microphone is in use

#### Scenario: Microphone blocked
- **WHEN** the microphone is blocked and a session is started
- **THEN** the question is shown with the explanation and "Try again", and the user can still reveal answers and move on
