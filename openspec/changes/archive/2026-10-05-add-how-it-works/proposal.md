# Proposal

## Why

The home screen now has seven modes, a speed entry on every card and a row of scale tick boxes, and nothing on it explains what any of that does. How a speed game works (hearts, the shrinking clock, the saved best) and what the tick boxes affect can only be found out by trying.

## What Changes

- The home screen gains a small **"?" button** that opens a "How it works" overlay. It is closed with ✕ or by tapping outside it, and returns to the home screen unchanged.
- The overlay is a short summary that fits a phone screen with little or no scrolling:
  - how a normal session works (10 questions, four choices, no clock, the 💡 cheat sheet, Review mistakes);
  - how a speed game works (endless, hearts, a clock that shortens with each correct answer, the saved best score);
  - what the "Scales" tick boxes do and which modes they affect;
  - one line for every mode on the home screen.
- The mode list and the speed numbers are taken from the same data the app runs on, so the help cannot fall out of step when a mode is added or a value is tuned.
- No new question type is added, so nothing joins Mixed mode.

### Out of scope

- A cheat sheet button on the home screen. The cheat sheet stays where it is, inside a normal session.
- First-run onboarding, a tutorial, tooltips or highlighted walkthroughs.
- Music theory explanations. The overlay explains the app, not the theory.
- Help inside a quiz or a speed game.
- Any change to modes, questions, scoring or the scale selection.
- The blues scale.

## Capabilities

### New Capabilities

- `app-help`: the "How it works" overlay on the home screen: how it is opened and closed, and what it explains.

### Modified Capabilities

None.

## Impact

- `src/App.jsx`: a help button on the home screen, a help overlay component and its open/closed state.
- `src/styles.css`: the help button and the mode list inside the overlay. The overlay itself reuses the cheat sheet's styles.
- `src/theory.js`: no change.
- No storage is used and no dependencies are added.
