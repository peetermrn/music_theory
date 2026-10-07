# Proposal

## Why

Opening "Circle & fretboard" shows the Visuals page already scrolled down, so the title and the top of the note circle are off screen. The app swaps screens by changing React state, not by loading a new page, so the browser keeps the scroll position of the screen that was left. The Visuals entry is at the very bottom of the home screen, so you are always scrolled down when you tap it, and the Visuals page opens at that same depth. The same thing happens, less visibly, anywhere a long screen leads to another one.

## What Changes

- Every new screen opens scrolled to the top: the home screen, a quiz question, a quiz result, an ear-training exercise page, an ear-training question, an ear-training result and the Visuals page.
- Moving on to the next question counts as a new screen, so after scrolling down to tap "Next" the new question is shown from its prompt.
- Going back to the home screen also opens it at the top; it does not return to where you were on the home screen.
- Nothing scrolls while you stay on a screen: turning the dial, changing a switch or picking a position on the Visuals page, ticking a box, answering a question, or opening and closing the cheat sheet or "How it works" leave the scroll position where it is.

No question type is added, so nothing joins Mixed mode. No mode is removed or changed in what it asks.

### Out of scope

- Remembering and restoring the home screen's scroll position when coming back to it.
- Browser back-button or URL-based navigation between screens; the app has none and this change does not add it.
- Scroll position inside the cheat sheet and "How it works" overlays, which scroll on their own.
- Any animation or smooth scrolling; the new screen simply starts at the top.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `app-platform`: adds a requirement that each new screen opens at the top, next to the existing phone-first layout requirement.

## Impact

- `src/App.jsx`: scroll to the top when the shown screen changes (home, quiz question, quiz result, ear training, Visuals).
- `src/Ear.jsx`: the same for its own screens (exercise page, question, result), which App cannot see.
- No new dependencies, no stored data, no CSS change.
