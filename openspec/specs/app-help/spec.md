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
The overlay SHALL list every mode offered on the home screen with a one-line description of what it asks, grouped under the same headings as the home screen. It SHALL also list every entry under "Ear training", under that heading, each with a one-line description.

#### Scenario: Mode list
- **WHEN** the overlay is open
- **THEN** Notes, Scales, Chords, Relatives and Mixed are listed under "Keys" and Guitar and Bass under "Memorize the fretboard", each with a description

#### Scenario: Ear training entry
- **WHEN** the overlay is open
- **THEN** "Interval training" is listed under "Ear training", after the fretboard modes, with a description

### Requirement: Fits a phone
The overlay SHALL be readable on a phone-width screen without horizontal scrolling, and all of its content SHALL be reachable.

#### Scenario: Narrow screen
- **WHEN** the overlay is open on a phone-width screen
- **THEN** there is no horizontal scrolling and the last mode in the list can be brought into view

### Requirement: Explains ear training
The overlay SHALL explain ear training separately from normal sessions: it has its own page with six levels and a Custom selection; two notes are played and the user picks the interval from one choice per interval; the notes can be replayed together or one at a time; the choices can be tapped after answering to hear them; the sound button switches between piano and acoustic guitar; and there is no speed game and no Review mistakes. It SHALL also credit the sources of the piano and guitar recordings.

#### Scenario: Ear training summary
- **WHEN** the overlay is open
- **THEN** it states that an ear-training question plays two notes, that they can be replayed together or singly, and that ear training has no speed game

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
