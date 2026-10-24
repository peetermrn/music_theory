# app-help Specification

## Purpose

A short "How it works" overlay on the home screen that explains the app's modes, sessions, speed games and scale selection to someone seeing them for the first time.

## Requirements

### Requirement: Help access
The home screen SHALL show a help button that opens a "How it works" overlay. The user SHALL be able to dismiss the overlay and return to the home screen. Opening and closing it SHALL NOT start a session or change the scale selection or any stored score. The help button SHALL NOT be shown during a session or a speed game.

#### Scenario: Opening and closing
- **WHEN** the user taps the help button on the home screen and then closes the overlay
- **THEN** the home screen is shown as it was, with the same scale boxes ticked and the same best scores

#### Scenario: Not during a quiz
- **WHEN** a question is shown in a session or a speed game
- **THEN** no help button is shown

### Requirement: Explains sessions and speed games
The overlay SHALL explain a normal session (its number of questions, four choices, no time limit, the cheat sheet and Review mistakes) and a speed game (endless play, hearts lost on a wrong answer or a timeout, a time limit that shortens with each correct answer, and the stored best score). The numbers it states SHALL be the values the app actually uses.

#### Scenario: Normal session summary
- **WHEN** the overlay is open
- **THEN** it states that a session has 10 questions and no time limit

#### Scenario: Speed game summary
- **WHEN** the overlay is open
- **THEN** it states that a speed game starts with 5 hearts and a time limit of 20 seconds

### Requirement: Explains the scale selection
The overlay SHALL explain that the "Scales" tick boxes choose which scales are asked about, name the modes they affect (Notes, Scales and Mixed), and name the available scale groups.

#### Scenario: Scale selection summary
- **WHEN** the overlay is open
- **THEN** it names Notes, Scales and Mixed as the modes the tick boxes affect, and lists "Major & minor" and "Pentatonic"

### Requirement: Lists every mode
The overlay SHALL list every mode offered on the home screen with a one-line description of what it asks, grouped under the same headings as the home screen. It SHALL also list every entry under "Play on guitar" and every entry under "Ear training", each under its heading with a one-line description.

#### Scenario: Mode list
- **WHEN** the overlay is open
- **THEN** Notes, Scales, Chords, Relatives and Mixed are listed under "Keys" and Guitar and Bass under "Memorize the fretboard", each with a description

#### Scenario: Ear training entry
- **WHEN** the overlay is open
- **THEN** "Interval training" is listed under "Ear training", after the "Play on guitar" entries, with a description

#### Scenario: Play on guitar entries
- **WHEN** the overlay is open
- **THEN** "Key notes", "Fretboard notes", "Play it back" and "Scale runs" are listed under "Play on guitar", after the fretboard modes, each with a description

### Requirement: Fits a phone
The overlay SHALL be readable on a phone-width screen without horizontal scrolling, and all of its content SHALL be reachable.

#### Scenario: Narrow screen
- **WHEN** the overlay is open on a phone-width screen
- **THEN** there is no horizontal scrolling and the last mode in the list can be brought into view

### Requirement: Explains ear training
The overlay SHALL explain ear training separately from normal sessions, starting with interval training: interval training has its own page with six levels and a Custom selection; two notes are played and the user picks the interval from one choice per interval; the notes can be replayed together or one at a time. For every ear-training exercise it SHALL state that the choices can be tapped after answering to hear them, that the sound button switches between piano and acoustic guitar, and that there is no speed game and no Review mistakes. It SHALL also credit the sources of the piano and guitar recordings.

#### Scenario: Ear training summary
- **WHEN** the overlay is open
- **THEN** it states that an interval-training question plays two notes, that they can be replayed together or singly, and that ear training has no speed game

#### Scenario: Not described as four choices
- **WHEN** the overlay is open
- **THEN** the statement that a session has four choices per question is not applied to ear training

#### Scenario: Sounds and credits
- **WHEN** the overlay is open
- **THEN** it names the two sounds the sound button switches between, and names the source of the piano recordings and of the guitar recordings

### Requirement: Explains chord training
The overlay SHALL explain chord training: it has its own page with five levels and a Custom selection; a chord is played one note at a time and then together, and the user picks its type from one choice per type; it can be replayed one by one or together; the choices can be tapped after answering to hear them; and, like interval training, it has no speed game and no Review mistakes.

#### Scenario: Chord training summary
- **WHEN** the overlay is open
- **THEN** it states that a chord-training question plays a chord one note at a time and then together, and that the answer is the type of chord

#### Scenario: Listed with the other exercises
- **WHEN** the overlay is open
- **THEN** "Chord training" is listed under "Ear training" after "Interval training", with a description

### Requirement: Explains degree training
The overlay SHALL explain degree training: it has its own page with four levels and a Custom selection; a few chords are played to set a key, then one note, and the user picks which degree of the key that note is; the key changes with every question; the chords and the note can be replayed together or separately; after answering, the key and the note are named and the choices can be tapped to hear them; and, like the other ear-training exercises, it has no speed game and no Review mistakes.

#### Scenario: Degree training summary
- **WHEN** the overlay is open
- **THEN** it states that a degree-training question plays chords to set the key and then one note, and that the answer is the note's degree in that key

#### Scenario: Listed with the other exercises
- **WHEN** the overlay is open
- **THEN** "Degree training" is listed under "Ear training" after "Chord training", with a description

### Requirement: Explains the Visuals page
The overlay SHALL list "Circle & fretboard" under the heading "Visuals", after the ear-training entries, with a one-line description. It SHALL explain that the page is for looking, with no questions or score; that turning the dial or tapping a note changes the key; that the Major / Minor switch shows the relative key, which uses the same notes; that the scale can be the seven notes or the pentatonic; that a pentatonic keeps its seven-note degree numbers on this page, unlike Notes mode, which counts its notes 1st to 5th; that the fretboard below shows where the key's notes are on guitar or bass; and that a position can be selected to see one shape to practise, in either of two shape systems.

#### Scenario: Listed under Visuals
- **WHEN** the overlay is open
- **THEN** "Circle & fretboard" is listed under "Visuals", after the "Ear training" entries, with a description

#### Scenario: Visuals summary
- **WHEN** the overlay is open
- **THEN** it states that the Visuals page has no questions, that turning the dial changes the key, and that the fretboard shows the same key's notes

#### Scenario: Pentatonic numbering
- **WHEN** the overlay is open
- **THEN** it states that the Visuals page numbers a pentatonic's notes by their seven-note degrees, with an example of a note that Notes mode counts differently

#### Scenario: Positions summary
- **WHEN** the overlay is open
- **THEN** it states that the fretboard can show one scale position at a time, and names the five positions and three notes per string as the two systems

#### Scenario: Not described as a session
- **WHEN** the overlay is open
- **THEN** the statements about the number of questions, speed games and Review mistakes are not applied to the Visuals page

### Requirement: Lists the tools
The overlay SHALL list "Metronome" and "Tuner" under the heading "Tools", after the Visuals entry, each with a one-line description, and SHALL state that the tools have no questions or score.

#### Scenario: Tools listed
- **WHEN** the overlay is open
- **THEN** it shows the heading "Tools" after "Visuals", with "Metronome" and "Tuner" and a one-line description of each

### Requirement: Explains the tools
The overlay SHALL explain that the metronome starts at 100 BPM, changes by 1 or 10, accents the first beat of the bar and stops when the page is left; and that the tuner listens through the microphone, offers Guitar, Bass and Manual, can find the string itself or tune a tapped string with a reference tone, and uses the microphone only while its page is open.

#### Scenario: Microphone explained
- **WHEN** the overlay is open
- **THEN** it states that the tuner uses the microphone only while the Tuner page is open

### Requirement: Explains Play on guitar
The overlay SHALL explain that Play on guitar questions are answered by playing a note on the guitar twice in a row, heard through the microphone, and that a note played once is only searching; that Key notes accepts any octave while Fretboard notes and Play it back need the exact pitch; that only a right first answer scores; that Show me reveals the answer and counts the question as missed; and that the string is not checked.

#### Scenario: Play on guitar summary
- **WHEN** the overlay is open
- **THEN** it states that an answer is a note played twice in a row on the guitar, heard through the microphone, and that only a right first answer scores

### Requirement: Explains microphone sensitivity
The overlay SHALL state, in its explanations of the Tuner and of Play on guitar, that if the microphone does not hear the guitar or reacts to noise, its sensitivity can be adjusted with the gear button on those pages.

#### Scenario: Sensitivity explained
- **WHEN** the overlay is open
- **THEN** the Tuner and Play on guitar explanations say that the gear button adjusts the microphone sensitivity

### Requirement: Explains Scale runs
The overlay SHALL explain that a scale run plays every note of one key's position from its lowest note to its highest and back, heard through the microphone; that the right next note counts with one pluck and any other note is a mistake; that a first run shows the shape and later runs are from memory; that the map fills in with clean runs and asks for a known shape again after a week; that "Refresh known" plays up to 10 known shapes in a random order without changing the map; and that the string is not checked.

#### Scenario: Scale runs summary
- **WHEN** the overlay is open
- **THEN** it states that a run goes up a position and back down, that a first run shows the shape and later runs are from memory, and that clean runs fill in the map

#### Scenario: Refresh summary
- **WHEN** the overlay is open
- **THEN** it states that "Refresh known" replays known shapes in a random order and does not change the map
