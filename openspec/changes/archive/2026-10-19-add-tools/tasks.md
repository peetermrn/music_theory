# Tasks

## 1. Home screen and navigation

- [x] 1.1 In App.jsx add the `tool` state, a `TOOLS` constant (names and one-line descriptions), the `tool:${tool}` screen name, and a "Tools" section after "Visuals" with Metronome and Tuner entries and no speed button. Render placeholder pages with a "‹ Back" bar. Verify in `npm run dev`: both entries open a page from the top after scrolling the home screen down, and Back returns home with the scale chips and best scores unchanged.
- [x] 1.2 Add the "Tools" heading, entries and explanation paragraph to `HowItWorks`, reusing `TOOLS`, as the app-help delta requires. Verify by opening "How it works": Tools comes after Visuals, and the text mentions 100 BPM, steps of 1 and 10, the first-beat accent, Guitar/Bass/Manual, reference tones, and that the microphone is used only while the Tuner is open.

## 2. Shared audio

- [x] 2.1 In audio.js export `context()`, and give `play()` an optional voice parameter that defaults to the current voice. Verify that ear training still plays in the stored voice (switch piano and guitar on an exercise), and that `npm run build` passes.

## 3. Metronome

- [x] 3.1 Build Metronome.jsx with a tempo display starting at 100, −10/−1/+1/+10 buttons clamped to 40–240, beats-per-bar chips 2–6 (default 4), and a Start/Stop control. Verify: +10 +10 −1 shows 119, +10 at 235 shows 240, −1 at 40 stays 40, and changing values does not scroll the page.
- [x] 3.2 Add the look-ahead scheduler with synthesized clicks (accented first beat), with tempo and beats read from refs. Verify by ear: Start gives an accented click at once; with 3 beats the accent falls every third click; +10 while playing speeds up with no gap; one minute at 60 BPM matches a stopwatch at 60 clicks.
- [x] 3.3 Add the beat indicator driven by `requestAnimationFrame` from the audio clock: one marker per beat, the first styled differently, none lit when stopped. Verify that the markers light in time with the clicks and return to the first marker on the accent.
- [x] 3.4 Add the screen wake lock while playing, and stop on unmount and on `visibilitychange` (hidden). Verify on the phone: playing past the screen timeout keeps the screen on; Back stops the clicks; switching apps and returning shows the metronome stopped with Start showing.

## 4. Pitch detection

- [x] 4.1 Write src/pitch.js: YIN with parabolic interpolation and an RMS gate, `detect(buf, sampleRate, [minHz, maxHz], { octaveCheck })` with the 2τ octave check, plus helpers for Hz→MIDI/cents against A4 = 440 and dual-spelling note names (`C#4/Db4`). Verify with a temporary throwaway script on generated sine and sawtooth buffers, then delete it (no test framework is added): 110 Hz → A2 within ±2 cents, 108 Hz → about −32 cents from A2, 277.2 Hz → C#4/Db4, 41.2 Hz → E1, and silence or noise → null.

## 5. Tuner

- [x] 5.1 Build Tuner.jsx with Guitar/Bass/Manual chips (Guitar on open), the string row (hidden in Manual), the note label, the −50…+50 meter with a ±5-cent in-tune band, and the "Play a note" state. Verify in desktop Chrome with a fake reading wired in: every element renders on a phone-width viewport without horizontal scrolling, and switching instruments does not scroll the page.
- [x] 5.2 Add the microphone lifecycle: `getUserMedia` with echo cancellation, noise suppression and auto gain off; an AnalyserNode; stop all tracks on unmount and when hidden, and restart when visible. Verify on the phone (through `adb reverse tcp:5173 tcp:5173` and `http://localhost:5173`): the microphone indicator appears on the Tuner page, disappears on Back and on switching apps, and comes back on return.
- [x] 5.3 Add the "needs the microphone" panel for denied, missing, busy or insecure-context microphones, with "Try again". Verify: denying permission shows the panel with how to allow it; allowing it in site settings and tapping Try again starts listening; string tones still play while it is denied.
- [x] 5.4 Wire detection into the readings: the per-instrument ranges, auto nearest string, median-of-5 smoothing reset on target change, and the last reading dimmed for about a second before "Play a note". Verify with a tone generator on a second device: 110 Hz reads the A string at 0 and in tune; 108 Hz reads about −32; 440 Hz in Manual reads A4; 277.2 Hz reads C#4/Db4; talking near the phone does not produce readings.
- [x] 5.5 Add string selection: tapping a string selects it, plays its note through `play([midi], undefined, "guitar")`, and narrows detection to ±7 semitones around it. Readings past ±50 cents pin to the meter's end with a "tune up" or "tune down" hint; tapping the string again or changing instrument returns to auto. Verify: the G string tapped and played three semitones flat says "tune up"; with ear training set to piano, the reference still sounds as guitar.
- [x] 5.6 Tune a real guitar and a real bass with the phone microphone. Check that every open string is recognised in auto mode without octave errors, and note whether the slowed bass reference tones sound acceptable (the design's Open Question). If they do not, raise it before changing the tone.

## 6. Integration

- [x] 6.1 Run `npm run build` (it must pass with no new dependencies in package.json). Then manually play the affected screens in `npm run dev` on the phone: the home screen Tools section, the Metronome (all scenarios in specs/metronome), the Tuner in Guitar, Bass and Manual (all scenarios in specs/tuner), "How it works", and one ear-training exercise and one quiz session to confirm they are unchanged. Repeat the Tuner check offline on the installed PWA from a Vercel preview deploy.
