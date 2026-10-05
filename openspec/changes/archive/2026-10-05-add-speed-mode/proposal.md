# Proposal

## Why

In a normal session there is no time pressure, so the natural way to answer is to count up from the root note (or from the open string). That works but never builds instant recall. A speed mode with a shrinking time limit makes counting impossible and rewards trusting instinct, and a stored best score gives a reason to come back.

## What Changes

- Every mode (Notes, Scales, Chords, Mixed, Guitar, Bass) keeps its normal 10-question session and gains a speed game, started from the home screen in one tap.
- A speed game is endless: each question has a visible countdown, a correct answer shortens the time limit down to a minimum, and a wrong answer or a timeout costs a heart. The game ends when the hearts run out.
- The score is the number of correct answers. The best score per mode is stored on the device and shown on the home screen and on the game-over screen.
- The game never pauses: after every answer or timeout the result is shown briefly (a wrong answer in red, the correct one in green) and the next question follows automatically.
- The cheat sheet is not available during a speed game.
- Existing requirements that forbid a countdown, require a continue button, or assume a fixed session length are narrowed to normal sessions. Normal sessions behave exactly as before.
- No new question type is added, so nothing joins Mixed mode. Mixed speed games use the same Notes, Scales and Chords questions as normal Mixed sessions.

The exact numbers (hearts, starting time, how fast it shrinks, minimum time, how much time a miss gives back) are starting values. They are expected to be tuned by playing during implementation and review, and the final values are written into the spec before the change is archived.

### Out of scope

- Any change to how questions or distractors are generated.
- Score history, statistics, streaks, leaderboards, sync or accounts. Only one best score per mode is stored.
- A settings screen for the speed values.
- Sound, vibration or animation beyond the countdown and answer feedback.
- A pause button.

## Capabilities

### New Capabilities

- `speed-mode`: the endless timed game: starting it, countdown, hearts, time-limit progression, scoring, game over and the stored best score.

### Modified Capabilities

- `quiz-session`: "Session length", "One question with four choices", "Immediate feedback", "Answer timing" and "Results screen" are narrowed to normal sessions so they do not contradict the speed game.
- `cheat-sheet`: "Cheat sheet access" applies to normal sessions only.

## Impact

- `src/App.jsx`: home screen entries, game state (hearts, time limit, countdown), game-over screen, best score read/write.
- `src/styles.css`: countdown bar, hearts, speed entry on mode cards.
- `src/theory.js`: no change expected.
- Browser `localStorage` is used for the first time, for one number per mode. No dependencies are added.
- Depends on `simplify-home-screen` being applied and archived first, because both changes touch the home screen.
