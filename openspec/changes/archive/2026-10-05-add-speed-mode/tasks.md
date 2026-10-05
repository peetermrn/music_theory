# Tasks

## 1. Speed game core

- [x] 1.1 In `src/App.jsx`, add a `SPEED` constants object (hearts, start, factor, floor, miss relief, empty per-mode overrides) and a `speed` flag on session start; verify a normal session still plays 10 questions exactly as before
- [x] 1.2 Add hearts and time-limit state: a correct answer multiplies the limit by the factor down to the floor, a miss removes a heart and relaxes the limit up to the start value; verify by temporarily logging the limit that it goes 20, 18, 16.2 after two correct answers and never goes below the floor
- [x] 1.3 Add the per-question deadline timeout, cleared on answer, quit and unmount; record a timeout as a wrong answer with no selected answer; verify that not answering loses exactly one heart, reveals the correct answer and puts the question into Review mistakes, and that quitting mid-countdown causes no later state change or console error
- [x] 1.4 Auto-advance about 300 ms after a correct answer and about 600 ms after a miss (wrong answer or timeout), with no Next button in a speed game; verify an untouched game times out question by question and ends on the game-over screen
- [x] 1.5 Replace the session-wide repeat check with a last-10-prompts window for speed games only; verify a Scales speed game runs past 30 questions without the same prompt twice in a row

## 2. Speed game screens

- [x] 2.1 In the question view for speed games, show hearts and score in the header, add the countdown bar, and hide the 💡 button; verify the bar empties in step with the current limit and restarts on each question
- [x] 2.2 Add the game-over screen with score, best score, Play again, Finish and, when there were misses, Review mistakes starting a normal untimed review; verify the review has no countdown or hearts and ends on the normal results screen
- [x] 2.3 Add styles in `src/styles.css` for the countdown bar, hearts and game-over screen; verify at phone width there is no horizontal scrolling and the answers stay fully visible

## 3. Best score and home screen

- [x] 3.1 Add guarded `localStorage` read/write of the best score per mode under `theory-quiz.best.<mode>`, written only at game over; verify a higher score shows "New best", survives a page reload, and that quitting mid-game leaves it unchanged
- [x] 3.2 Turn each home screen mode card into a container with the existing normal-session button and a "⚡ Speed" strip showing the best score when one exists; verify each strip starts a speed game in that mode in one tap and the card still starts a normal session
- [x] 3.3 Verify storage failure is harmless: with site storage blocked in the browser, a speed game still plays to game over without errors

## 4. Tuning and integration

- [x] 4.1 Play speed games in Notes, Scales, Chords and Guitar with the user and adjust the `SPEED` values, including per-mode overrides if needed; verify the user confirms the values feel right
- [x] 4.2 Write the final values into the "Tuning values" requirement in this change's `specs/speed-mode/spec.md`, including any per-mode differences; verify `openspec validate add-speed-mode --strict` passes
- [x] 4.3 Run `npm run build` and, in `npm run dev`, play one normal Notes session and one speed game each in Notes and Bass to game over, including a Review mistakes round; verify the build succeeds and both normal and speed play match the specs
