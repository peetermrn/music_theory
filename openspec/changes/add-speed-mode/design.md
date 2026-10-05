# Design

## Context

All quiz state lives in one component in `src/App.jsx` (mode, current question, results, done flag), and `makeQuestion(mode, spec)` in `src/theory.js` produces any question. A normal session and a review session already share this flow; the review is just a session with a queue of question specs. Nothing is persisted today and there is no timer other than a start timestamp. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Add the speed game as a variant of the existing flow, reusing question generation, answer buttons, the result records and Review mistakes.
- Keep every tunable number in one place so play-testing means editing constants, not logic.

**Non-Goals:**
- Splitting `App.jsx` into many files or adding a state library or router.
- Per-mode tuning screens or any stored data beyond the best scores.

## Decisions

**1. Speed is a flag on the session, not a new mode id.**
A session is started with a mode and a `speed` flag. Question generation is untouched because it only needs the mode. Alternative considered: separate mode ids such as `notes-speed`; rejected because every label map and the Mixed logic would need duplicating.

**2. One constants object with optional per-mode overrides.**
A single `SPEED` object holds hearts, start, factor, floor and miss relief, with an optional per-mode override table that starts empty. Scales answers take much longer to read than a single note, so a per-mode minimum is likely to be needed; the override table means that tuning does not change the code structure. Starting values: 5 hearts, 20 s start, x0.9 per correct answer, 2 s minimum, two steps back per miss.

The user's first idea for the minimum was 0.8 to 1 s. The starting value is 2 s because reading the prompt, finding one of four shuffled buttons and tapping takes roughly 1.5 to 2 s even with perfect recall. Lower it during tuning if 2 s proves comfortable.

**3. Home screen: each mode card gets a speed strip.**
The card stays one tap for a normal session, and a strip at the bottom of the card ("⚡ Speed" plus the best score once one exists) starts a speed game. The card becomes a container holding two buttons, since a button cannot be nested in a button. Alternative considered: a Classic/Speed switch at the top of the home screen; rejected because it adds hidden state and a second tap whenever the user changes their mind.

**4. Countdown driven by a deadline, drawn as a shrinking bar.**
When a question is shown, a deadline timestamp is stored and a timeout is scheduled for it; the bar is a CSS animation whose duration is the current limit, restarted per question. The timeout is cleared on answer, on quit and on unmount. Alternative considered: a state update every animation frame to show digits; rejected as needless re-rendering, and a bar is easier to read at a glance than digits.

**5. A miss pauses, a hit does not.**
After a correct answer the next question appears after about 300 ms. After a miss the countdown stops and the existing feedback view with its Next button is reused. This keeps the learning moment and gives a natural breath, and means the app can never drain several hearts while unattended.

**6. Best score in `localStorage`, one key per mode.**
Keys follow `theory-quiz.best.<mode>`. Reads and writes are wrapped so a storage failure leaves the game playable with no best shown. The score is written only at game over. Alternative considered: one JSON blob; rejected because separate keys need no parsing or migration.

**7. Recent-repeat window instead of a session-wide set.**
The speed game remembers the last 10 prompts. Scales has only 24 distinct prompts, so the window must stay well below that.

## Risks / Trade-offs

- [App is backgrounded mid-question] -> the deadline passes, which counts as one timeout; because a miss pauses the game, only one heart is lost. Accepted instead of adding pause logic.
- [Scales and Chords prompts are slow to read, so one shared minimum may be unfair] -> per-mode overrides in decision 2.
- [Random guessing at high speed] -> a guess is wrong three times out of four and costs a heart, so it does not pay.
- [Home screen gets busier] -> the strip is small and secondary; check at phone width that six cards still fit comfortably.
- [Tuned numbers drift from the spec] -> the last task group writes the final values into the "Tuning values" requirement before archiving.

## Open Questions

- Final tuning values, and whether any mode needs its own. Answered by play-testing; the structure above does not depend on the answer.
