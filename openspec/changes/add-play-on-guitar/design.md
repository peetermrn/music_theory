# Design

## Context

See proposal.md for the motivation and `specs/play-on-guitar` for the behaviour.

Current state this design builds on:

- **[src/Tuner.jsx](../../../src/Tuner.jsx) holds all the microphone code.**
  - It calls `getUserMedia` with the browser's call processing off, feeds an AnalyserNode (4096 or 8192 samples), and analyses about every 50 ms.
  - It releases the microphone on unmount and while the app is hidden.
  - It maps errors to a "needs the microphone" panel with "Try again".
  - A note is shown only after 3 analyses within a semitone of each other, which keeps speech out.
- **[src/pitch.js](../../../src/pitch.js)** provides `detect(buf, rate, [lo, hi], octaveCheck)` and the note helpers (`midiOf`, `noteName`, `letter`). Tested accurate to under 1 cent on guitar notes.
- **[src/theory.js](../../../src/theory.js)** provides the keys (`KEYS`), scale spelling (`scale`, `pc`), string names (`STRINGS`) and open-string MIDI notes (`TUNING`).
- **[src/Visuals.jsx](../../../src/Visuals.jsx)** draws a fretboard from a pitch-class map plus an optional "shape" of highlighted frets per string. The rest of the scale's notes are dimmed. Both are internal to that file today.
- **[src/audio.js](../../../src/audio.js):** `play(steps, gap, voice)` plays sampled notes. A single note rings for 2.2 s, and a step before a rest rings for `gap + 0.6` s.
- **[src/App.jsx](../../../src/App.jsx)** routes screens with flags and a `screen` name that scrolls each new screen to the top. Ear.jsx shows how a self-contained session component handles its own screens and scrolling.

## Goals / Non-Goals

**Goals:**
- One microphone implementation shared by the tuner and Play on guitar, with no change in the tuner's behaviour.
- Reliable "a note was played" events from continuous audio:
  - a held note counts once;
  - ringing notes and the app's own sounds do not count.
- Question generators kept as small pure functions next to the existing theory data.

**Non-Goals:**
- Polyphonic detection, and checking which string was used.
- A generic "listening game" framework for later question kinds. Scale runs and chord tones can extend the generators when they come.

## Decisions

### 1. Shared microphone module: `src/Mic.jsx`

- **A `useMic(listen)` hook**, moved out of Tuner.jsx. It owns:
  - `getUserMedia` with the processing constraints;
  - the AnalyserNode, with its size based on the sample rate;
  - the ~50 ms analysis loop;
  - the `visibilitychange` handling, and release on unmount.

  It calls `listen(buf, sampleRate, t)` through a ref, so the caller's latest callback is always used without restarting the microphone. It returns `{ problem, retry }`.
- **A `<MicProblem problem onRetry />` component**, also moved out of Tuner.jsx. It renders the existing explanation texts and the Try again button.
- **Tuner.jsx** keeps its own `listen` (ranges, string choice, smoothing) and calls the hook. Only code moves, so the tuner spec's scenarios are re-checked with the same fake-microphone tests used for the tuner.
- **Play on guitar** activates the hook only on question screens. The results screen does not mount it, so the microphone is released there, as the spec requires.

*Alternative:* copy the microphone code into the new screen. Rejected: two copies of the permission and release logic would drift.

### 2. From audio frames to "note played" events: a small listener in `src/play.js`

Each analysis runs `detect` over 70–700 Hz, which is E2 up to the 12th fret of the high E string with a margin, with `octaveCheck` on. Its result feeds a state machine:

```
frame --> detect --> midi (float) or null
          |
          v
   last 3 frames within 0.5 semitone?  -- no --> (nothing yet)
          | yes
          v
   note = round(midi)
   note == held?  -- yes --> (still the same note: no event)
          | no
          v
   held = note, emit onNote(note)
   null for ~150 ms  --> held = null   (silence: the next note counts again)
```

- **`held` survives a change of question.** When the right note advances to the next question, the same ringing note is still `held` and is not a new event. This meets "a note still ringing does not count" without a fixed waiting time. A different note, or silence and then the same note, counts again.
- **A wrong note held down** produces one event, not one every 50 ms.
- **Plucking the same note again** must give a second event even while it still rings, because an answer is a note played twice in a row.
  - A rise in level of 1.5 times over the lowest level of the last few analyses counts as a new pluck: it clears `held` and the steady-frame history.
  - A new pluck is not counted within 250 ms of the last one. A single pluck's rise is spread over two overlapping analysis windows, and a human double pluck takes longer than that, so this stops one pluck from counting twice.
- **The app's own sound:** while a Play it back note is sounding, frames are dropped and `held` is cleared. The window lasts from the start of the note to 0.2 s after it ends.
  - The note is played as `play([midi, null], 1.0, "guitar")`: one step, then a rest. That makes it ring for 1.6 s, not the 2.2 s of a lone final note, so the user waits less before playing.
  - The guitar voice is passed explicitly, as the tuner does, so the ear-training sound choice is untouched.
- **Rounding** to the nearest semitone tolerates a guitar up to ±50 cents out of tune. Results do not judge tuning.

*Alternative:* match the expected note directly in each frame. Rejected because it cannot name wrong notes, and it re-triggers on ringing strings.

### 3. Question generators in `src/play.js`

Each generator returns `{ prompt, key, check(midi), name, shape? }`:
- `key` is what the session compares to avoid repeats.
- `check` returns `"right"`, `"wrong"`, or `{ octave: ±n }` for Play it back.
- `name` is the answer's display name.

| Kind | Picks | Right when | Answer name |
|---|---|---|---|
| Key notes | a key from `KEYS`, a position 0–6 | `midi % 12 === pc(note)` | the note as the key spells it (`scale(root, type)[k]`) |
| Fretboard notes | a string 0–5, a pitch class 0–11 | `midi` is `open + f` for some fret 0–12 with that pitch class (1 or 2 pitches) | the sharp name, as the quiz Fretboard modes name notes |
| Play it back | a MIDI note from 40 to 72 (E2–C5) | `midi === target`; same pitch class but a different octave gives `{ octave }` | `noteName(target)`, for example A3 |

- **Repeat keys:**
  - Key notes: `root type:k`, 168 possible.
  - Fretboard notes: `string:pc`, 72 possible.
  - Play it back: `midi`, 33 possible.

  All are far more than 10 questions.
- **Prompts:**
  - Key notes: "Play the 5th note of E major". The ordinal comes from the same `ord` helper theory.js uses.
  - Fretboard notes: "Play A on the D string", with the string named as in `STRINGS` ("low E", "high E").
  - Play it back: "Play back the note you hear".
- **Naming the wrong note that was heard:**
  - Key notes: name only, both spellings for black keys (`letter`).
  - Fretboard notes and Play it back: name with octave (`noteName`), because the octave matters there.

### 4. Show me fretboard: reuse Visuals' `Fretboard`

- Export `Fretboard` from Visuals.jsx unchanged.
- `play.js` builds the map it needs: a `byPc` array in which only the answer's pitch class is `on` and named. The shape comes from the question:
  - **Fretboard notes:** the matching frets on the asked string only. The same note on other strings shows dimmed, as "also here", which is useful learning.
  - **Play it back:** for each string, the fret where the exact pitch lies within 0–12. Other octaves show dimmed.
- Every fret involved is ≤ 12, so the diagram always shows frets 0–12 with the nut.

*Alternative:* a new mini-fretboard component. Rejected because Visuals already draws exactly this.

### 5. Session component `src/Play.jsx` and routing

- **Routing:** App gets `const [playKind, setPlayKind] = useState(null)` and a "Play on guitar" section after "Memorize the fretboard". The three entries come from a `PLAY` constant shared with the help text, in the same way as `TOOLS`. Screen name: `play:${kind}`.
- **Play.jsx** follows Ear.jsx's shape: session state, a question screen, a results screen, and its own `screen` name (`q${n}` / `done`) with the scroll-to-top layout effect.
- **Per-question state:** `first` (null, right or missed), `pending` (the note played once, waiting to be played again), `heard` (the line describing the last note), `revealed`, `solved`, and `t0`. The listener's `onNote` callback:
  - ignores notes once the question is solved;
  - when the note differs from `pending`, makes it `pending` and shows "play it again to answer". The note is named only in Play it back;
  - when the note equals `pending`, clears `pending` and judges it as the answer;
  - on a right answer: marks it solved, records the time, and advances after ~1 s;
  - on a wrong answer: sets `first` to missed if it is still null, and names the answer, with the octave hint in Play it back.
- **Show me** sets `revealed` and `first = missed`, and shows Next.
- **Results** are computed from the per-question records `{ prompt, answer, firstTry, time }`.

### 6. Help text

App.jsx's `HowItWorks` gets a "Play on guitar" heading after the fretboard modes, with the three `PLAY` entries and one paragraph that meets the app-help delta.

### 7. Layout

```
+-------------------------------+
| Quit       4 / 10 · 3 right   |
|                               |
|  Play the 5th note of E major |
|                               |
|        B   ✓                  |   <- right: large, green
|   You played G#  (try again)  |   <- wrong: muted line
|        Listening ...          |
|                               |
|  [ ▶ Hear it again ]          |   (Play it back only)
|  [        Show me        ]    |
|  [ fretboard diagram ]        |   (after Show me)
|  [         Next         ]     |   (after Show me)
+-------------------------------+
```

The existing styles are reused: `.prompt`, `.secondary`, `.ghost`, `.reading` colours, and `.neck` from Visuals.

## Risks / Trade-offs

- **[Octave errors on exact-pitch questions]** A misread octave would wrongly reject a right note in Fretboard notes or Play it back. Mitigations:
  - the guitar range limit with `octaveCheck`, already tested against weak fundamentals;
  - a manual task that plays every string at frets 0, 5 and 12 into the phone.
- **[Fast playing]** Short or staccato notes may not reach 3 steady analyses (about 150 ms). This is acceptable for a learning drill, and the help text can say "hold the note".
- **[Ring-over through a gap]** A fading note can dip below the noise floor for a moment and then be detected again. It would then count as a new note and cost the next question its first try.
  - *Mitigation:* `held` is cleared only after about 300 ms of silence.
  - The manual task checks this case on the phone: a right note left to ring into the next question.
  - If it still happens, the silence time is the one number to raise.
- **[Tuner regression from the refactor]** The tuner scenarios are re-run with the fake-microphone WAV tests from the add-tools change before the new screen is built.
- **[Out-of-tune guitar]** At ±50 cents a note rounds to its neighbour. The help text advises tuning first with the Tuner.

## Migration Plan

Nothing is stored, so no migration is needed. Deploy as usual. Rollback is reverting the commit.
