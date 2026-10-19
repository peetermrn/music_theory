# Design

## Context

See proposal.md for the motivation. The specs are in `specs/metronome`, `specs/tuner`, and the deltas for `quiz-session`, `app-platform` and `app-help`.

Current state that shapes the approach:

- [src/App.jsx](../../../src/App.jsx) picks the screen with flags (`ear`, `visuals`, `mode`).
  - It builds a `screen` name. A `useLayoutEffect` keyed on that name scrolls each new screen to the top.
  - Full pages such as [Visuals.jsx](../../../src/Visuals.jsx) and [Ear.jsx](../../../src/Ear.jsx) take an `onExit` prop and render a `header.bar` with a "‹ Back" button.
- [src/audio.js](../../../src/audio.js) owns a single lazily created `AudioContext`.
  - It plays sampled notes with `play(steps, gap)` in a module-level `voice`.
  - Ear.jsx sets that voice with `setVoice()` and stores the choice in localStorage.
  - The guitar recordings cover only C3–C5. Lower notes are made by playing the lowest recording slower.
- The project rules: no new dependencies, no test framework, and verification by `npm run build` plus playing the change in `npm run dev`.

## Goals / Non-Goals

**Goals:**
- Accurate, drift-free metronome timing on a phone.
- Tuner readings accurate to within 2 cents, without octave errors on guitar or bass strings, using code written in the app.
- The microphone is never held when it is not needed.
- New code kept to the size of the existing pages (roughly 100–150 lines per page and under 100 for detection).

**Non-Goals:**
- A general audio engine, or reusing the pitch detector for quizzes. The detector stays a pure module so a later change *could* reuse it, but nothing here builds for that.
- Supporting iOS Safari quirks beyond what already works. The target is Android Chrome as an installed PWA.

## Decisions

### 1. Screens: a `tool` flag in App, one component per tool

- App gets `const [tool, setTool] = useState(null)` (`"metronome" | "tuner" | null`). It renders the tool page before the home branch, in the same way `visuals` is handled.
- The screen name becomes `` tool ? `tool:${tool}` : … ``, so the existing scroll-to-top effect covers both pages with no other change.
- The home screen gets a "Tools" `section` after "Visuals" with two `.mode` entries, using the same markup as the Visuals entry.
- New files:
  - `src/Metronome.jsx`
  - `src/Tuner.jsx`
  - `src/pitch.js`: pure functions with no React or DOM, covering detection and note naming.

*Alternative:* one `Tools.jsx` with both pages. Rejected because the two pages share nothing but the back bar, and separate files match how Visuals and Ear are split.

### 2. audio.js: share the context, and allow a voice per call

- Export the existing `context()` so both tools use the app's one `AudioContext`. Phones limit how many contexts an app can have, and the context is already resumed from a tap.
- Give `play()` an optional third parameter, `name = voice`. The tuner calls `play([midi], undefined, "guitar")` for the reference tone. Ear training's stored voice is never touched, as the "whatever sound was chosen for ear training" scenario requires.

*Alternative:* call `setVoice("guitar")` and restore it afterwards. Rejected because it is racy with the async sample loading.

### 3. Metronome: look-ahead scheduling on the audio clock

```
setInterval(25 ms) --> while nextTime < ctx.currentTime + 0.1:
                          schedule click(beat, nextTime)       (oscillator + gain)
                          queue.push({ beat, time: nextTime })
                          nextTime += 60 / bpm                 (bpm read now --> change applies next beat)
                          beat = (beat + 1) % beats
requestAnimationFrame --> lit = last queue entry with time <= ctx.currentTime
```

- **Clicks** are synthesized, so no sample files are needed. Each click is a short `OscillatorNode` blip of about 30 ms with a fast gain envelope. The accented beat is higher (about 1600 Hz against 1000 Hz) and a little louder.
- **Settings while playing:** `bpm` and `beats` are kept in refs so the scheduler reads the current values without restarting. If `beats` shrinks below the current index, the index wraps to 0.
- **Beat indicator:** driven from the audio clock through `requestAnimationFrame`, not from the timer, so the light matches what is heard.
- **Wake lock:** on Start, request `navigator.wakeLock?.request("screen")` inside a `try`, and release it on Stop.
- **Stopping:** both of these do the same thing as Stop: clear the timer, stop the scheduled oscillators, and release the wake lock.
  - A `visibilitychange` listener, when the app becomes hidden.
  - The component's unmount cleanup.

*Alternative:* one `setInterval` per beat. Rejected because it drifts and is slowed down in busy or background tabs, which is the classic metronome bug.

### 4. Tuner audio graph and microphone lifecycle

```
getUserMedia({ audio: { echoCancellation:false, noiseSuppression:false, autoGainControl:false } })
   --> MediaStreamSource --> AnalyserNode (fftSize 4096)        (not connected to the speakers)
requestAnimationFrame, analysing at most ~20x/s:
   getFloatTimeDomainData --> pitch.detect(buf, sampleRate, range) --> smoothing --> React state
```

- **Audio processing off:** the three processing options are turned off. Echo cancellation and noise suppression treat a sustained note as noise and distort it.
- **Starting and stopping:**
  - A single `useEffect` starts listening when the page mounts and the document is visible.
  - Its cleanup stops every track (`track.stop()`) and disconnects the nodes. Stopping the tracks is what makes Android drop the microphone indicator.
  - A `visibilitychange` listener runs the same stop and start.
- **Errors** are mapped to one "needs the microphone" panel with a "Try again" button that calls start again:
  - `NotAllowedError`: blocked.
  - `NotFoundError`: no microphone.
  - `NotReadableError`: the microphone is in use elsewhere.
  - A missing `mediaDevices`: not a secure context.
- **Reference tones** play through the shared context to the speakers. The microphone will hear them and the tuner will show their reading. That is harmless, and even a quick check that the tuner works.

### 5. Pitch detection: YIN, limited to a range per instrument

`pitch.js` implements YIN, about 60 lines:

1. Difference function over lags `[minLag, maxLag]`.
2. Cumulative mean normalisation.
3. The first dip below a threshold of about 0.15, followed down to its local minimum.
4. Parabolic interpolation around that minimum. This gives sub-sample accuracy, which is what makes ±2 cents possible.

It returns `{ hz, clarity }`, or `null`.

**When no note is reported:**
- The frame's RMS level is below a noise floor.
- No dip passes the threshold, which rejects speech and noise.

| Range (Hz) | Search window | Why |
|---|---|---|
| Guitar, auto: 70–420 | E2 82 Hz to E4 330 Hz, with margin | |
| Bass, auto: 35–130 | E1 41 Hz to G2 98 Hz, with margin | |
| Selected string: target ÷ 1.5 to target × 1.5 | about ±7 semitones around the string | Reads a badly detuned string but excludes its octaves |
| Manual: 38–1100 | E1 to C6, with margin | |

**Octave errors:** a phone microphone barely picks up a bass's fundamental, so the first YIN dip can fall at half the period, which reads an octave too high. In the Guitar and Bass auto ranges, after a dip at lag τ is found, the detector also checks 2τ. It takes 2τ only when two things hold:

- The dip at τ is not already clean (normalised difference above 0.02).
- The dip at 2τ is under half as deep as the dip at τ.

A clean period also repeats at 2τ with an equally deep dip, so a rule of "2τ nearly as low" would read every clean note an octave down. Testing on generated tones showed exactly that for B3 and E4, which is why the rule above is used instead. The selected-string window makes this check unnecessary there. Manual keeps plain YIN and accepts a rare octave error on very low notes.

**Cost:** the work grows with window size × maxLag. Ranges whose longest period exceeds 800 samples (Bass and Manual at 48 kHz) are searched at half the sample rate. Neighbouring samples are averaged in pairs, which cuts the work to about a quarter and measured no loss of accuracy. That is about 3.5 ms per analysis on a laptop, at about 20 analyses per second.

**Smoothing:** keep the median of the last 5 readings, in cents relative to the target. Reset when the target note changes, so a new string reads straight away. "Last reading dimmed for about a second" is a timestamp check on the last good frame.

**Tuning standard:** the note maths is fixed at A4 = 440 Hz:
- `midi = 69 + 12·log2(hz/440)`
- `cents = 1200·log2(hz / f(target))`

**Note naming:** Manual names notes from a 12-entry table that spells black keys with both spellings: `"C#/Db"`, … Each spelling gets the octave, for example `C#4/Db4`. The table lives in `pitch.js`, because theory.js's `NOTES` uses sharps only and is used by the quizzes.

*Alternatives:*
- A plain autocorrelation peak: simpler, but more octave errors and no clarity measure.
- An FFT peak: too coarse at low frequencies without very long windows.
- A library such as pitchy: ruled out by the no-dependency rule. YIN is short enough to write.

### 6. Page layouts

```
Metronome                         Tuner
+---------------------------+     +---------------------------+
| < Back       Metronome    |     | < Back         Tuner      |
|                           |     | [Guitar] [ Bass ] [Manual]|
|          100              |     |                           |
|          BPM              |     |            A              |
| [-10] [-1]   [+1] [+10]   |     |   -50 ----|--+---- +50    |
|                           |     |         -12 cents         |
|   (*)  ( )  ( )  ( )      |     |                           |
|                           |     |  E   A   D   G   B   E    |
| Beats  2  3 [4] 5  6      |     |     [*]     auto          |
|                           |     |                           |
| [         Start        ]  |     |                           |
+---------------------------+     +---------------------------+
```

- **Tuner meter:** a horizontal track from −50 to +50 with a centre band for ±5 cents. The needle's position is a CSS transform, and it turns green in tune.
- **Tuner strings:** string buttons sit in a row. The detected string is highlighted, and a selected string has a stronger "locked" style. In Manual the string row is hidden and the big label shows `C#4/Db4`-style names.
- **Styles:** go in styles.css and reuse `.chip`, `.ghost`, `.primary` and the `.bar` header.

### 7. Help text

Add a "Tools" heading after "Visuals" in `HowItWorks` in App.jsx, with the two one-line entries and a short paragraph that meets the `app-help` delta. Tool names and descriptions live in constants, like `VISUAL`, so the home screen and help text cannot drift apart.

### 8. Testing the microphone on the phone

`getUserMedia` needs a secure context. These ways work without new dependencies:

1. **USB:** run `adb reverse tcp:5173 tcp:5173`, then open `http://localhost:5173` in Chrome on the phone. localhost counts as secure. This is the preferred way.
2. **Desktop Chrome** on `npm run dev` with the laptop microphone, for checking logic and the UI.
3. **A Vercel preview deploy** of the branch, using HTTPS, for the final check on the installed PWA.

Accuracy is checked with a tone generator playing from a second device at 110, 108, 440 and 277.2 Hz, then with a real guitar and bass.

## Risks / Trade-offs

- **Phone microphones roll off below about 100 Hz.** Bass fundamentals are weak, which risks octave errors. Mitigations:
  - the Bass range limit,
  - the 2τ check,
  - the selected-string window,
  - a manual task with a real bass on the phone before archiving.
- **Some Android devices ignore the audio-processing options.** Readings could then wobble or be suppressed on long notes. Mitigation: the median smoothing. If it happens on the user's phone, look at `track.getSettings()` and note it. No workaround is planned.
- **The bass reference tone is the C3 guitar recording slowed by up to 20 semitones.** It may sound dull. Mitigation: it still carries harmonics a phone speaker can play. See Open Questions.
- **The metronome must not run in the background.** Stopping on hide is simple and predictable. Practising with the screen off is not supported, and the wake lock keeps the screen on instead.
- **CPU:** YIN at the Bass range costs several million operations per frame. Mitigation: about 20 analyses per second, and decimation if needed.
- **The microphone hears the metronome or reference tone.** Harmless, since the tools run on separate pages and the reference tone is short.

## Migration Plan

No data or settings migrate, and nothing is stored. Deploy as usual. The PWA updates automatically. Rollback is reverting the commit. The microphone permission the user granted to the site stays in the browser, which is harmless.

## Open Questions

None remain. The slowed guitar recording was checked on the phone speaker and is acceptable as the bass reference tone, so the synthesized fallback was not needed.
