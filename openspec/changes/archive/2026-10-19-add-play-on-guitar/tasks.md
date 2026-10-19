# Tasks

## 1. Shared microphone

- [x] 1.1 Move the microphone code from Tuner.jsx into `src/Mic.jsx`: a `useMic(listen)` hook (getUserMedia with processing off, analyser sized by sample rate, ~50 ms loop, release on unmount and when hidden, `{ problem, retry }`) and a `<MicProblem>` component with the existing texts. Switch Tuner.jsx to it. Verify `npm run build` passes, and re-run the add-tools fake-microphone checks (110 Hz → A2 in tune, 108 Hz → −32, Manual 277.2 Hz → C#4/Db4, bass 55 Hz → A1, the selected G string → tune up, denied → panel, then Try again → listening, Back/hidden → no live tracks). All must give the same results as before.

## 2. Questions and note listener

- [x] 2.1 Write `src/play.js` with the three generators (Key notes, Fretboard notes, Play it back), each returning `{ prompt, key, check, name, shape }`. Export `Fretboard` from Visuals.jsx, and add the helper that builds the Show me map. Verify with a throwaway node script (deleted afterwards):
  - "5th note of E major" accepts B in any octave;
  - "4th note of F major" is named Bb and accepts A#2;
  - "A on the D string" accepts A3 (57) but not A2 (45);
  - "E on the low E string" accepts 40 and 52;
  - Play it back with A3 returns `{ octave: -1 }` for A2;
  - 1,000 sessions of 10 never repeat a key;
  - every Play it back note is 40–72.
- [x] 2.2 Add the note listener to play.js: a steady 3-frame gate, rounding, a `held` note that survives across questions and clears after ~300 ms of silence, and a mute window for the app's own sound. Verify with a throwaway script that feeds simulated frame sequences:
  - one held note → one event;
  - note A, then A still ringing after a question change → no new event;
  - A, silence, A → two events;
  - A then G# → two events;
  - frames inside the mute window → none.

## 3. Session screen

- [x] 3.1 Build `src/Play.jsx` with the question screen: the prompt, a listening state, the right note in large green with an auto-advance after ~1 s, "You played …" for wrong notes, the octave hint in Play it back, "▶ Hear it again" (Play it back), Show me with the fretboard diagram for Fretboard notes and Play it back, Next after Show me, and Quit. Verify in headless Chrome with fake-microphone WAVs:
  - Key notes "5th of E major" with a B tone → correct, then advances;
  - a wrong tone → "You played …" and still listening;
  - Show me on a fretboard question → diagram with the right fret marked, then Next works;
  - Play it back plays a note, and the tone is not taken as the answer during playback.
- [x] 3.2 Add the results screen: first-try score out of 10, %, average time to the right note, the missed questions with their answers, Play again and Finish. The microphone must not be mounted on this screen. Verify in headless Chrome: after 10 questions the results show the expected counts, and there are no live microphone tracks on the results screen or after Quit.
- [x] 3.3 Wire the microphone states: the `MicProblem` panel on the question screen when blocked, with Show me and Next still usable; release when hidden. Verify with a denied-permission Chrome run: the panel is shown, Show me reveals, Next advances, and granting then Try again starts listening.

## 4. Home screen and help

- [x] 4.1 In App.jsx add the `PLAY` constant, the `playKind` state, the `play:${kind}` screen name, and the "Play on guitar" section after "Memorize the fretboard", with three entries and no speed button. Verify at phone width that the section sits between the fretboard modes and Ear training, that each entry starts its session with one tap from the top of the screen, and that Quit returns home.
- [x] 4.2 Add the "Play on guitar" heading, the entries and the explanation paragraph to `HowItWorks`, as the app-help delta requires. Verify the overlay lists the three entries after the fretboard modes and before Ear training, and mentions the microphone, any octave against exact pitch, first-try scoring, Show me and that the string is not checked.

## 5. Answering by playing a note twice

- [x] 5.1 Make re-plucks count in the listener: a rise to 1.5 times the lowest level of the last few analyses is a new pluck, with no new pluck within 250 ms of the last one, and it clears `held` and the steady frames. Verify with a throwaway script on simulated guitar-like notes (fast attack, decay, ±10% level wobble):
  - one pluck → one event;
  - a pluck, then the same note again 400 ms later at the decayed level ×1.6 → two events;
  - a sustained note with wobble for 3 s → one event;
  - the earlier listener cases still hold.
- [x] 5.2 In Play.jsx, make an answer a note played twice in a row: track `pending`, show the searching line (named in Play it back, unnamed in Key notes and Fretboard notes), judge on the second play, and name a wrong answer. Update the help paragraph. Verify in headless Chrome with the oscillator microphone:
  - Play it back: searching past the right note (target, then other notes, each once) does not answer, and the target twice does;
  - Fretboard notes: a note played once is not named on screen;
  - a wrong answer twice → "… is not it" and the question counts as missed;
  - the octave hint appears for an answer in the wrong octave;
  - a session still reaches the results.

## 6. Integration

- [x] 6.1 Run `npm run build` (it must pass with no new dependencies in package.json). Then manually play the affected screens on the phone, through `adb reverse tcp:5173 tcp:5173` and `npm run dev`:
  - a full session of each Play on guitar kind with a real guitar, including searching past the right note in Play it back, answering by plucking a note twice, and playing every string at frets 0, 5 and 12 in Fretboard notes and Play it back to check for octave errors;
  - letting a right note ring into the next question;
  - the microphone indicator going away on the results screen and after Quit;
  - the Tuner in Guitar, Bass and Manual, to confirm it is unchanged;
  - "How it works";
  - one quiz session and one ear-training session.
