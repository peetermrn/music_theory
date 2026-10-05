# Spec Delta

## Purpose

A short "How it works" overlay on the home screen that explains the app's modes, sessions, speed games and scale selection to someone seeing them for the first time.

## ADDED Requirements

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
The overlay SHALL list every mode offered on the home screen with a one-line description of what it asks, grouped under the same headings as the home screen.

#### Scenario: Mode list
- **WHEN** the overlay is open
- **THEN** Notes, Scales, Chords, Relatives and Mixed are listed under "Keys" and Guitar and Bass under "Memorize the fretboard", each with a description

### Requirement: Fits a phone
The overlay SHALL be readable on a phone-width screen without horizontal scrolling, and all of its content SHALL be reachable.

#### Scenario: Narrow screen
- **WHEN** the overlay is open on a phone-width screen
- **THEN** there is no horizontal scrolling and the last mode in the list can be brought into view
