# Tasks

## 1. Shared setting and level

- [x] 1.1 In `src/Mic.jsx`, add the stored setting: a module-level gate in dBFS loaded from `localStorage` key `micGate` (in try/catch, ignored unless a number from -80 to -30), `floor()` returning it as an RMS amplitude, and a setter that clamps to 2 dB steps and stores it. Verify with a throwaway Node script that `floor()` is 0.001 by default and follows the setter.
- [x] 1.2 In `useMic`, compute each frame's RMS into a module-level input level, cleared when the microphone stops. Verify by reading the level in the browser with a fake microphone (task 3.1).

## 2. Detection reads the setting

- [x] 2.1 `detect` in `src/pitch.js` takes the silence level as a fifth argument, defaulting to today's `FLOOR`; `listener` in `src/play.js` takes a getter for it and uses it for both its pluck and silence checks. Verify with a throwaway script on generated tones: a 110 Hz tone at -66 dBFS gives null at the default and 110 Hz at a -70 dBFS level; the listener reports a quiet plucked note only with the lower level.
- [x] 2.2 Pass `floor()` from the Tuner's `detect` call and `floor` to Play's `listener`. Verify `npm run build` passes.

## 3. Gear button and panel

- [x] 3.1 Add `MicButton` and `MicSettings` to `src/Mic.jsx`: the gear button for the header, and the panel with the title, the meter with the slider on it (-80 to -30, step 2, "More sensitive" / "Less sensitive"), the fill coloured by whether the level is above the setting, the hint, and Reset. Add its styles to `src/styles.css`. Put it in the Tuner header and the Play on guitar question header. Verify in headless Chromium at 390 px wide with a fake microphone playing a quiet looping tone: the gear opens and closes the panel without horizontal scrolling, the meter moves, the Tuner shows "Play a note" at the default and reads the note after the slider is moved to more sensitive, Reset returns to the default, and the setting is still there after a reload and on a Play on guitar question.

## 4. Help

- [x] 4.1 Add a sentence about the gear button to the Tuner and Play on guitar explanations in "How it works" (`src/App.jsx`). Verify by opening the overlay in the browser.

## 5. Integration

- [x] 5.1 Run `npm run build`, then play the affected modes in `npm run dev` with a fake microphone: the Tuner in Guitar, Bass and Manual, and a Play on guitar session (gear on question screens, none on the results screen); and check that the Metronome and an ear-training exercise show no gear.

## Workflow follow-up

- Archive the change and sync its specs.
- Push to the designated branch and to main, as the user asked.
