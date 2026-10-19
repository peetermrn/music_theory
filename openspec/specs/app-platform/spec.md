# app-platform Specification

## Purpose

How the app is delivered and what it deliberately does not have: a client-only, installable, offline-capable web app for one person's phone.

## Requirements

### Requirement: Client-only application
The app SHALL run entirely in the browser with no backend, database, user accounts or authentication.

#### Scenario: No network dependency for quiz logic
- **WHEN** a question is generated or an answer is checked
- **THEN** no network request is made

### Requirement: Installable PWA
The app SHALL be installable as a Progressive Web App that launches in standalone display mode with its own name and icons.

#### Scenario: Installing on Android
- **WHEN** the user installs the app from the browser on an Android phone
- **THEN** it appears on the home screen as "Theory Quiz" and opens without browser chrome

### Requirement: Offline use
After the first successful load the app SHALL work without a network connection, and SHALL update itself automatically when a new version is available online.

#### Scenario: Offline session
- **WHEN** the installed app is opened with no network connection
- **THEN** a full quiz session can be played

### Requirement: Phone-first layout
The interface SHALL be usable one-handed on a phone screen, as a single column of content with tap-sized buttons and no horizontal scrolling. Within that column, the mode, ear-training and tool entries on the home screen, the level entries on an ear-training page, and the answer choices of an ear-training question with more than five choices MAY be placed two abreast.

#### Scenario: Narrow screen
- **WHEN** a quiz question is viewed on a phone-width screen
- **THEN** the question and all four answers are visible and tappable without horizontal scrolling

#### Scenario: Ear question with twelve choices
- **WHEN** a Level 6 ear-training question is viewed on a phone-width screen
- **THEN** its twelve answer choices are shown in two columns, and all of them are visible and tappable without horizontal scrolling

### Requirement: Screens open at the top
Each time the app shows a different screen, it SHALL show that screen from its top, whatever the scroll position of the screen before it. A different screen is the home screen, a quiz question, a quiz result, an ear-training exercise page, an ear-training question, an ear-training result, a Play on guitar question, a Play on guitar result, the Visuals page, the Metronome page or the Tuner page; each next question counts as a different screen. While the same screen stays shown, nothing the user does on it SHALL change its scroll position.

#### Scenario: Opening the Visuals page
- **WHEN** the user scrolls the home screen down to the "Circle & fretboard" entry and taps it
- **THEN** the Visuals page is shown from the top, with its back control and title visible

#### Scenario: Opening an ear-training exercise
- **WHEN** the user scrolls the home screen down and taps an ear-training exercise
- **THEN** the exercise's page is shown from the top

#### Scenario: Next question
- **WHEN** the user scrolls down on a question to tap "Next"
- **THEN** the next question is shown from the top, with its prompt visible

#### Scenario: Back to home
- **WHEN** the user leaves a scrolled-down page with its back, Quit or Finish control
- **THEN** the home screen is shown from the top

#### Scenario: Using the Visuals page does not scroll it
- **WHEN** the user has scrolled the Visuals page down to the fretboard and changes the instrument, the labels, the shape system or the position, or uses a step button
- **THEN** the page stays scrolled where it was

#### Scenario: Opening a tool
- **WHEN** the user scrolls the home screen down to the "Tools" entries and taps "Tuner"
- **THEN** the Tuner page is shown from the top, with its back control and title visible

#### Scenario: Using a tool does not scroll it
- **WHEN** the user has scrolled the Metronome or Tuner page and changes the tempo, the beats per bar, the instrument or the selected string, or starts or stops the metronome
- **THEN** the page stays scrolled where it was

#### Scenario: Next Play on guitar question
- **WHEN** the user has scrolled a Play on guitar question down and its right note is played
- **THEN** the next question is shown from the top, with its prompt visible

#### Scenario: Overlays do not scroll the screen
- **WHEN** the user opens and closes the cheat sheet or "How it works" on a scrolled-down screen
- **THEN** the screen behind it stays scrolled where it was
