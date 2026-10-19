# Proposal

## Why

The Tuner and Play on guitar decide what is a note and what is silence with one fixed level (-60 dBFS). Microphones differ a lot between phones and laptops: on a quiet one the guitar never gets past that level and the app keeps saying "Play a note", while on a loud one, or in a noisy room, background sound gets past it and Play on guitar can take noise for a pluck. One fixed level cannot suit every device, so the user needs to set it.

## What Changes

- A **gear button (⚙)** at the right end of the header bar on the Tuner page and on Play on guitar question screens.
- Tapping it opens a **"Microphone sensitivity"** panel under the header, without leaving the page, so the microphone keeps listening:
  - a slider that sets the level below which sound counts as silence;
  - a **live input meter** behind the slider, so the user can see whether their playing gets past the setting and the room's noise stays under it;
  - a short hint on how to set it, and a **Reset** control that returns to the default.
- The setting is one for the whole app, shared by the Tuner and Play on guitar, and kept between visits on the device.
- The default is today's level, so nothing changes until the user moves the slider.
- "How it works" mentions the setting in its Tuner and Play on guitar explanations.

Nothing joins Mixed mode, and no existing mode changes its behaviour at the default setting.

### Out of scope

- Automatic calibration (measuring the room's noise and setting the level by itself).
- A setting for how strict the pitch check is, or any gain or boost of the microphone signal.
- A gear button on pages that do not use the microphone (Metronome, ear training, quizzes), or a general settings page.
- Choosing between several microphones.

## Capabilities

### New Capabilities
- `mic-sensitivity`: the microphone sensitivity setting shared by every page that listens: where it is opened, what it sets, the live meter, its range and default, and how it is kept.

### Modified Capabilities
- `app-help`: the "How it works" overlay explains that the microphone sensitivity can be adjusted with the gear button.

## Impact

- `src/Mic.jsx`: the stored setting, the input level from each analysis, and a shared settings button and panel.
- `src/pitch.js`: `detect` takes the silence level as an argument.
- `src/play.js`: the listener reads the silence level from the setting.
- `src/Tuner.jsx`, `src/Play.jsx`: the gear button in the header, and the setting passed to detection.
- `src/App.jsx`: help text. `src/styles.css`: the panel and meter.
- No new dependencies. One new `localStorage` key.
