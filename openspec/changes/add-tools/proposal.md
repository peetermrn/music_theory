# Proposal

## Why

The app is opened with an instrument nearby, but keeping time and tuning still need a separate app. A basic metronome and a tuner in the app put the whole short practice session in one place. The tuner's chromatic mode also names any note that is played, which supports learning the notes.

## What Changes

- New **"Tools"** heading on the home screen, below "Visuals", in the same style as the other headings. It has two entries, "Metronome" and "Tuner". Each opens its own page. Neither has a speed game, score or session.
- New **Metronome** page:
  - It opens at 100 BPM.
  - Buttons change the tempo by −10, −1, +1 and +10, within 40–240 BPM.
  - The user can choose the beats per bar. The first beat of each bar gets an accented click.
  - A beat indicator lights up the current beat in time with the click.
  - A Start/Stop control starts and stops the clicks. Changing the tempo while it plays takes effect on the next beat.
  - The screen stays on while it plays.
  - It stops when the user leaves the page or the app is hidden.
- New **Tuner** page with three instruments: **Guitar** (E A D G B E), **Bass** (E A D G) and **Manual** (chromatic, any note).
  - It listens through the microphone and shows the detected note, how many cents sharp or flat it is, and whether it is in tune.
  - Guitar and Bass can be used in two ways:
    - The tuner finds the nearest string by itself.
    - The user can tap a string to tune only that string. The tap also plays that string's note as a reference tone.
  - Manual names the nearest note, with its octave and both spellings for black keys (for example "C#/Db"), and its cents offset.
  - The microphone is used only while the Tuner page is open and the app is visible.
  - If the microphone is blocked or unavailable, the page explains this instead of failing.
- The "How it works" overlay lists and explains the two tools.
- Pitch detection is written in the app, with no new dependency.

Neither tool is a question type, so **nothing joins Mixed mode** and no existing mode changes.

### Out of scope

- Alternate tunings (Drop D and others), 5-string or 6-string bass, and other instruments
- Changing the A = 440 Hz reference
- Metronome subdivisions, tap tempo, sound choices, saved presets, and playing in the background while another screen or app is shown
- Remembering tool settings between visits: both pages open at their defaults
- Using the microphone to answer quiz questions (a possible later change)
- A speed game, score or history for either tool

## Capabilities

### New Capabilities
- `metronome`: the Metronome page, covering tempo, tempo buttons, beats per bar and accent, the beat indicator, start/stop, keeping the screen on, and stopping when the page is left.
- `tuner`: the Tuner page, covering the Guitar, Bass and Manual instruments, microphone use and its release, pitch display in note and cents, string detection and string selection with a reference tone, and behaviour when the microphone is unavailable.

### Modified Capabilities
- `quiz-session`: the home screen's "Mode selection" requirement gains a fifth heading, "Tools", with the Metronome and Tuner entries.
- `app-platform`: "Screens open at the top" adds the Metronome and Tuner pages to its list of screens.
- `app-help`: the overlay lists and explains the Tools.

## Impact

- **Code**:
  - [src/App.jsx](../../../src/App.jsx): the Tools section, the screen names, and the help text.
  - Two new page components.
  - A new pitch-detection module.
  - [src/audio.js](../../../src/audio.js): shares its audio context, and plays a single note in a chosen voice without changing the voice the user picked for ear training.
- **Dependencies**: none added.
- **Permissions**: the app asks for microphone access the first time the Tuner is opened. The microphone works only in a secure context. The deployed HTTPS site and `localhost` work. The Vite dev server opened on the phone through the computer's LAN IP does not. The design describes how to test on the phone.
- **Offline**: both tools work fully offline. Nothing is sent over the network.
