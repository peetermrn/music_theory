# Design

## Context

See proposal.md for motivation and scope, and the delta specs for requirements.

The app is three source files. `src/theory.js` generates questions of one shape, `{ kind, prompt, answer, options, spec }`. `src/App.jsx` is a single component holding all session state; it renders the home screen from the `SECTIONS` table and the question screen from `q`. Its quiz loop assumes text questions with four shuffled choices in several places: repeats are detected by comparing `q.prompt`, answer buttons are disabled once answered, every home card has a ⚡ Speed button, and both results screens offer "Review mistakes".

There is no audio anywhere in the app, and `theory.js` knows pitch classes only, not octaves.

The user asked for ear training to be its own page behind one home button, because it differs enough from the quiz modes in both behaviour and logic.

## Goals / Non-Goals

**Goals:**
- Keep ear training in its own files, so the existing quiz loop in `App.jsx` is not changed and cannot regress.
- Look and feel like the rest of the app by reusing its CSS classes.
- Keep sound in its own small module with no dependency. The only asset files are the piano and guitar recordings, nine each.
- Leave every existing mode's behaviour and stored best scores untouched.

**Non-Goals:**
- A general audio engine. The module plays short notes and nothing else.
- A sampler for arbitrary instruments. There are exactly two voices, and they cover only the range the app uses.
- Sharing interval data with the key/scale code. Intervals here are plain semitone counts.
- Extracting shared session or results components out of `App.jsx`. The overlap is small; see decision 4.

## Decisions

### 1. Sound: Web Audio in `src/audio.js`, two sampled voices

A module with one lazily created `AudioContext` and three functions: `play(notes)` schedules the given MIDI notes one after another in the current voice, `stop()` silences whatever is sounding, and `setVoice("piano" | "guitar")` chooses the voice. `play` calls `stop` first, which gives the "each tap cuts off the previous sound" behaviour for free and makes a double call harmless.

A synthesized voice (two oscillators with an envelope) was implemented first as the default and removed after the user listened to it: it did not sound good next to the recordings.

Timing, tuned by ear: the second note starts 0.6 s after the first; the last or only note rings for 2.2 s and an earlier note for 1.2 s, each ending in a 0.4 s fade. Stopping ramps the gain to zero over about 20 ms instead of cutting it, to avoid a click.

**Piano and guitar.** Both work the same way and are described by one small table in `audio.js` (voice name to folder). Each has nine mp3 recordings, one every three semitones from C3 to C5 (`C3 Ds3 Fs3 A3 C4 Ds4 Fs4 A4 C5`).

- Piano: the Salamander Grand Piano set, about 75 KB per file, in `public/piano/`.
- Guitar: the `guitar-acoustic` set of the tonejs-instruments collection (samples CC BY 3.0), in `public/guitar/`. As downloaded the nine files total 1.4 MB because the low notes ring for a long time; they are trimmed with ffmpeg to about 3 seconds with a short fade-out, which should bring the set to roughly 0.5 MB.

A note is played from the nearest recording through an `AudioBufferSourceNode` with `playbackRate = 2 ** (semitonesAway / 12)`. No note is ever more than one semitone from a recording, which is not audible as a shift. The range matches what the app plays: questions use C3 to C5 and the cheat sheet C4 to C5. Each note goes through its own gain node, which carries the fades and a per-voice volume.

A voice's recordings are fetched and decoded the first time it is selected, and kept in memory. `play` waits for that load; if it fails nothing is played and the load is tried again on the next `play`. A call counter drops a `play` that was overtaken by a newer one while waiting.

Offline: `vite.config.js` adds mp3 to the files the service worker precaches (`workbox.globPatterns`), so the recordings are stored on install along with the rest of the app.

*Alternatives:* Tone.js (`Sampler`) is a large library for playing two notes. `smplr` and `soundfont-player` are smaller but fetch their sounds from a CDN at run time by default, which breaks offline use, and what remains once the files are self-hosted is the few lines described above. A recording for every one of the 25 notes would nearly triple the download for no audible gain.

### 2. Getting sound to start on a phone

Browsers only allow audio after a tap. Every ear question is reached by one: a level card, the Custom start button, Next, or Play again. `play` calls `ctx.resume()` each time, so the first tap unlocks the context and later automatic playback (an effect in `Ear.jsx` that runs when the question changes) just works. If the context cannot start, `play` fails silently and the Play both button, itself a tap, still works. All audio calls are wrapped so that a browser without Web Audio shows a silent but usable question.

`stop()` is called on Quit, on Next, when the session finishes and when `Ear` unmounts.

### 3. Ear questions: `src/ear.js`

```
INTERVALS   12 entries: semitones, name, cheat-sheet description
EAR_LEVELS  6 arrays of semitone counts
earQuestion(semis) -> { kind: "ear", prompt, answer, options, notes: [low, high], id }
```

`options` is the name of every interval in `semis`, in ascending order, not shuffled. The low note is a random MIDI note from C3 to C4 (48 to 60), so the high note never exceeds C5. `id` is `"<low>:<semitones>"`.

It lives in its own module, not in `theory.js`, because it takes different input (a list of intervals, not a key and scale groups) and shares no code with the key questions. `theory.js` is not changed.

Cheat-sheet descriptions (short, hand-written, like the existing cheat sheet):

| Interval | Semitones | Description |
|---|---|---|
| Minor 2nd | 1 | tense, clashing; the smallest step |
| Major 2nd | 2 | a plain step, like the start of a scale |
| Minor 3rd | 3 | dark, sad |
| Major 3rd | 4 | bright, happy |
| Perfect 4th | 5 | open and strong, wants to settle |
| Tritone | 6 | restless, unstable |
| Perfect 5th | 7 | hollow, solid, at rest |
| Minor 6th | 8 | wide and bittersweet |
| Major 6th | 9 | wide and warm |
| Minor 7th | 10 | bluesy, unresolved |
| Major 7th | 11 | sharp, straining towards the octave |
| Octave | 12 | the same note, higher |

### 4. A separate `Ear` component in `src/Ear.jsx`

`App` gets one boolean, `ear`. The home screen renders an "Ear training" card after the `SECTIONS` loop (full width, no ⚡ button), and when `ear` is true `App` returns `<Ear onExit={() => setEar(false)} />` instead of the home screen. That, plus the help text, is the whole change to `App.jsx`: `SECTIONS`, `begin`, `nextQuestion`, `answer`, `next` and the two results screens stay as they are.

`Ear` owns everything else and has three views, chosen from its own state:

```
semis === null          Ear training page (levels, Custom, back)
semis set, not done     question screen
semis set, done         results screen
```

Its state: `semis` (the intervals of the running session), `q`, `n`, `picked`, `results`, `done`, `seen` (a set of question ids for repeat avoidance), `sheet`, `voice` and `custom`. Quit and Finish set `semis` back to `null`, which returns to the Ear training page; Play again restarts with the same `semis`, which is what makes Custom replay without re-ticking.

`Ear` repeats a small amount of what `App` does: the top bar with the counter, timing with `performance.now()`, and the results markup (score, percentage, average time, tally). That is roughly 40 lines. It reuses the same CSS classes (`.page`, `.bar`, `.prompt`, `.answers`, `.answer`, `.feedback`, `.tally`, `.primary`, `.ghost`), so the screens look the same.

*Alternative considered and rejected:* running ear sessions through `App`'s existing loop with an `ear` branch in `nextQuestion`, the answer buttons, the home cards and both results screens. It avoids the 40 repeated lines but threads a mode that has no speed game, no review, no shuffling, a different number of choices and tappable answers after answering through code written for the opposite of each. Extracting shared `Session`/`Results` components would remove the repetition properly, but means restructuring working quiz code for this change.

### 5. Ear training page

A back button and title, then the six levels as cards in the existing two-column `.modes` grid. Each card shows "Level N" and its intervals: Level 1 lists them, later levels say what they add. The text is built from `EAR_LEVELS` and `INTERVALS`.

Below the levels, a Custom section: twelve tick boxes styled like the existing `.chip`, and a Start button that is disabled while fewer than two are ticked. With a page of its own there is room for the tick boxes inline, so no overlay is needed. The selection is stored under `theory-quiz.ear-custom` as semitone counts joined with `+`, written on every toggle and read and validated the same way as `readGroups`: unknown values are dropped, and anything leaving fewer than two falls back to the default `3+4`.

The "How it works" button stays on the home screen only.

### 6. Question screen

The top bar has Quit, the counter, and two buttons on the right: the sound button and 💡. The sound button switches the `voice` state between `piano` and `guitar`, stores it under `theory-quiz.ear-sound`, calls `setVoice`, and replays the current interval. It shows the icon of the current voice (🎹 or 🎸) and its `aria-label` names the current sound. The stored choice is applied when `Ear` mounts.

Between the prompt and the answers there is a full-width **Play both** button and, under it, **1st note** and **2nd note** side by side.

Answer buttons are never `disabled`. Before an answer, a tap answers. After it, a tap calls `play([low, low + thatInterval])`. The existing `right`/`wrong`/`dim` classes are applied; an ear-specific rule raises the `.dim` opacity a little so the buttons do not look dead.

Feedback text for a miss: `Not quite. You picked Major 3rd, it was Perfect 5th.`

Layout: up to five choices use the existing single column. More than five use a two-column grid of compact buttons (about 44 px high, smaller text), filled row by row so reading order stays smallest to largest. The ear prompt drops the tall staff-line padding. Budget for twelve choices on a 360 x 740 screen: bar 40, prompt 50, sound buttons 110, answers 6 rows x 52 = 310, feedback and Next 90, gaps and padding 110, about 710 px. This is the layout the app-platform delta makes room for.

### 7. Results and ear cheat sheet

Results are tallied per interval name from `results`, sorted by semitone count. No "Review mistakes", so ear questions carry no `spec`.

`EarSheet`, in `Ear.jsx`, reuses `.overlay` and `.sheet`. It maps over `INTERVALS`; each row is a button that calls `play([60, 60 + semitones])` (always from middle C). Closing the sheet calls `stop()`.

### 8. Purpose lines of existing specs

A delta spec can change requirements but not a capability's Purpose. Three Purpose lines become inaccurate with this change and are edited directly in `openspec/specs/` as part of implementation:

- `speed-mode`: "available for every quiz mode" gains "ear training has none".
- `quiz-session`: "shared by every mode" becomes shared by every quiz mode, with ear training named as separate.
- `cheat-sheet`: "a static reference panel" no longer covers the ear sheet, whose rows play sound.

Checked and left alone: `theory-questions` ("All questions SHALL be generated from scale interval data") and `fretboard-questions` ("the same quiz session flow as every other mode") are each scoped by their own Purpose to the key-based and fretboard modes; `scale-selection` only concerns the Keys modes.

## Risks / Trade-offs

- [About 40 lines of session and results code exist twice, in `App.jsx` and `Ear.jsx`] → Accepted for the separation. If a third kind of session is ever added, extract shared components then.
- [Twelve choices plus sound buttons plus feedback may not fit a short phone] → Compact two-column grid and reduced prompt as budgeted above; check at 360 x 740 during implementation and reduce button height or gaps if needed.
- [The phone is muted, or iOS silent switch is on, so a question looks broken] → Nothing detectable from a web page. The Play both button is always visible, and the help text says the mode plays sound.
- [The recordings add about 1.2 MB to the install, more if the guitar set does not trim as small as estimated] → Downloaded once by the service worker in the background; the app itself starts without them. They can be trimmed to a few seconds each if size matters.
- [The first question played after choosing piano or guitar waits for nine files to decode] → They come from the local cache, so the delay is short; if loading fails the question is silent but still usable.
- [Both sample sets need attribution: Salamander is believed to be CC BY, tonejs-instruments states CC BY 3.0 for its samples] → Confirm each licence when downloading and put both credits in "How it works"; if the terms of a set turn out to be unsuitable, drop that voice rather than ship its recordings.
- [The guitar samples have not been listened to, and a plucked string a semitone off its recording may sound less natural than piano] → Judge by ear in the tuning task; the electric guitar set of the same collection is complete for these nine notes and is the fallback.
- [With only two intervals, ten random questions can lean heavily to one of them] → Accepted. Repeat avoidance on interval plus starting note keeps every question distinct in pitch.
- [Answer time includes about 1.5 s of playback] → Accepted by the user: it is the same on every question, so averages stay comparable.
- [Answer buttons that stay tappable after answering could be mistaken for changing the answer] → The marked right/wrong state does not move, and the feedback line states the outcome.

## Open Questions

- None. Note length and gap were set by ear during implementation.
