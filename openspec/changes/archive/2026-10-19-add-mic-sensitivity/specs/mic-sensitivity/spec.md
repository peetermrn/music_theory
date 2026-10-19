# Spec Delta

## Purpose

Lets the user set how loud a sound must be for the pages that listen through the microphone to hear it, so that the Tuner and Play on guitar work with quiet and loud microphones alike.

## ADDED Requirements

### Requirement: Sensitivity control on listening pages
The Tuner page and every Play on guitar question screen SHALL show a gear button at the right end of the header bar. Tapping it SHALL open a "Microphone sensitivity" panel under the header, and tapping it again SHALL close it. Opening the panel SHALL NOT leave the page, end the question, or stop the microphone. Pages that do not use the microphone SHALL NOT show the button.

#### Scenario: Opening on the Tuner
- **WHEN** the user taps the gear button on the Tuner page
- **THEN** the "Microphone sensitivity" panel opens under the header and the tuner keeps reading notes

#### Scenario: Opening during a question
- **WHEN** the user taps the gear button on a Play on guitar question
- **THEN** the panel opens, the same question stays on screen, and a note played twice still answers it

#### Scenario: Not on other pages
- **WHEN** the Metronome, an ear-training exercise or the Play on guitar results screen is shown
- **THEN** no gear button is shown

### Requirement: Sensitivity sets the silence level
The panel SHALL have a slider that sets the level below which sound from the microphone counts as silence, from -80 dBFS (most sensitive) to -30 dBFS (least sensitive), in steps of 2 dB. The slider SHALL be labelled as more sensitive at one end and less sensitive at the other, without showing decibels. The setting SHALL apply at once to the Tuner and to Play on guitar.

#### Scenario: A quiet microphone
- **WHEN** a steady note reaches the microphone at -66 dBFS and the Tuner shows "Play a note"
- **THEN** after the user makes it more sensitive than -66 dBFS, the Tuner reads the note without leaving the page

#### Scenario: A noisy room
- **WHEN** background noise at -50 dBFS is taken for plucks in Play on guitar
- **THEN** after the user makes it less sensitive than -50 dBFS, the noise is treated as silence

### Requirement: Live input meter
While the panel is open and the microphone is listening, it SHALL show the current input level on the same scale as the slider, with the slider's position marked on it, and SHALL show in a different colour whether the current sound is above the setting. A hint SHALL say that a played string should pass the mark and silence should stay below it. When the microphone is unavailable the meter SHALL show no level.

#### Scenario: Playing past the mark
- **WHEN** the panel is open and the user plucks a string louder than the setting
- **THEN** the meter rises past the slider's mark and changes colour while the string sounds

#### Scenario: Silence under the mark
- **WHEN** the panel is open in a quiet room at the default setting
- **THEN** the meter stays below the slider's mark

### Requirement: Default and reset
The default setting SHALL be -60 dBFS, the level used before this setting existed, so the pages behave as before until the slider is moved. The panel SHALL have a Reset control that returns the setting to the default.

#### Scenario: First use
- **WHEN** the user opens the panel for the first time on a device
- **THEN** the slider is at the default and the Tuner and Play on guitar hear notes as they did before

#### Scenario: Reset
- **WHEN** the user has moved the slider and taps Reset
- **THEN** the slider returns to the default and the default applies at once

### Requirement: Setting kept on the device
The setting SHALL be one for the whole app, shared by the Tuner and Play on guitar, and SHALL be kept on the device between visits. When it cannot be stored or read, the default SHALL be used and the pages SHALL keep working.

#### Scenario: Shared between pages
- **WHEN** the user makes it more sensitive on the Tuner and then starts a Play on guitar session
- **THEN** the panel in Play on guitar shows the same setting and it applies there

#### Scenario: Kept after closing the app
- **WHEN** the user changes the setting, closes the app and opens the Tuner again
- **THEN** the setting is as the user left it
