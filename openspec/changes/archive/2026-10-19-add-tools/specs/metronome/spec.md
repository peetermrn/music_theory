# Spec Delta

## Purpose

A basic metronome page for keeping time while practising: a click at a chosen tempo with an accented first beat and a visible beat indicator.

## ADDED Requirements

### Requirement: Metronome page
The metronome SHALL have its own page, titled "Metronome", opened from the "Metronome" entry under "Tools" on the home screen, with a back control that returns to the home screen. The page SHALL have no questions, score, timer or session, and SHALL NOT change any stored score or selection. Nothing SHALL sound until the user starts it.

#### Scenario: Opening
- **WHEN** the user taps "Metronome" on the home screen
- **THEN** a page titled "Metronome" is shown at 100 BPM with 4 beats per bar, stopped and silent

#### Scenario: Back to home
- **WHEN** the user taps the back control on the Metronome page
- **THEN** the home screen is shown with the same scale boxes ticked and the same best scores as before

### Requirement: Tempo
The page SHALL show the tempo in BPM, starting at 100 each time the page opens. Buttons labelled −10, −1, +1 and +10 SHALL change the tempo by that amount. The tempo SHALL stay between 40 and 240 BPM: a change that would pass a limit SHALL stop at the limit.

#### Scenario: Small and large steps
- **WHEN** the user taps +10 twice and −1 once on a freshly opened page
- **THEN** the tempo shows 119 BPM

#### Scenario: Upper limit
- **WHEN** the tempo is 235 and the user taps +10
- **THEN** the tempo shows 240

#### Scenario: Lower limit
- **WHEN** the tempo is 40 and the user taps −1
- **THEN** the tempo stays at 40

#### Scenario: Tempo is not remembered
- **WHEN** the user sets 72 BPM, leaves the page and opens it again
- **THEN** the tempo shows 100

### Requirement: Beats per bar
The page SHALL let the user choose 2, 3, 4, 5 or 6 beats per bar, with 4 chosen when the page opens. The first beat of every bar SHALL click with a sound clearly different from the other beats.

#### Scenario: Waltz time
- **WHEN** the user chooses 3 beats per bar and starts the metronome
- **THEN** every third click, starting with the first, is the accented sound

### Requirement: Start and stop
A single Start/Stop control SHALL start the clicks and stop them. Starting SHALL begin with the first beat of a bar. While playing, the clicks SHALL be evenly spaced at the shown tempo, without audible drift. A tempo or beats-per-bar change while playing SHALL take effect from the next beat without stopping.

#### Scenario: Starting
- **WHEN** the user taps Start
- **THEN** an accented click sounds at once, followed by clicks at the shown tempo, and the control now reads Stop

#### Scenario: Changing tempo while playing
- **WHEN** the metronome plays at 100 BPM and the user taps +10
- **THEN** the clicks continue without a pause, now at 110 BPM

#### Scenario: Stopping
- **WHEN** the user taps Stop
- **THEN** the clicks stop and the control reads Start

### Requirement: Beat indicator
The page SHALL show one marker per beat of the bar. While playing, the marker of the beat that is sounding SHALL light up at the moment its click sounds, and the first beat's marker SHALL look different from the others. While stopped, no marker SHALL be lit.

#### Scenario: Following the beat
- **WHEN** the metronome plays with 4 beats per bar
- **THEN** four markers are shown and they light up one after another in time with the clicks, returning to the first marker on each accented click

### Requirement: Screen stays on while playing
While the metronome plays, the app SHALL ask the phone to keep the screen on, and SHALL release that request when it stops. Where the phone does not allow this, the metronome SHALL still work.

#### Scenario: Long practice
- **WHEN** the metronome plays for longer than the phone's screen timeout without the screen being touched
- **THEN** the screen stays on and the clicks continue

### Requirement: Stops when left
The metronome SHALL stop when the user leaves the page, and when the app is hidden (another app is shown or the screen is turned off). It SHALL NOT restart by itself when the app is shown again.

#### Scenario: Leaving the page
- **WHEN** the metronome is playing and the user taps the back control
- **THEN** the clicks stop and the home screen is shown in silence

#### Scenario: Switching apps
- **WHEN** the metronome is playing and the user switches to another app and back
- **THEN** the metronome is stopped and the control reads Start
