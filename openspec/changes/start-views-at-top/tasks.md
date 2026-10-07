# Tasks

## 1. App screens

- [ ] 1.1 In `src/App.jsx`, import `useLayoutEffect`, derive a screen key (`ear:<id>`, `visuals`, `home`, `done` or `q<n>`) next to the render branches it mirrors, with a one-line comment saying a new screen must be added to it, and scroll the window to the top in a layout effect keyed on it. Verify in `npm run dev` on a phone-sized window: scrolling the home screen to the bottom and tapping "Circle & fretboard" opens Visuals with "‹ Back" and the "Visuals" title visible
- [ ] 1.2 Verify the remaining App transitions in `npm run dev`: from a scrolled home screen a quiz mode opens on its first question at the top; "Next" after scrolling shows the next prompt at the top; a result's "Play again" and "Review mistakes" open at the top; "‹ Back", Quit and Finish return to the home screen at the top

## 2. Ear-training screens

- [ ] 2.1 In `src/Ear.jsx`, import `useLayoutEffect`, derive its screen key (`page`, `done` or `q<n>`) and scroll the window to the top in a layout effect keyed on it. Verify in `npm run dev`: a scrolled-down exercise page (Custom section visible) starts a level at the top; on a Level 6 question with twelve choices, scrolling down to "Next" shows the next prompt at the top; the result screen and "Finish" back to the exercise page open at the top

## 3. Nothing scrolls within a screen

- [ ] 3.1 Verify in `npm run dev` that staying on a screen keeps its position: on Visuals scrolled to the fretboard, switching instrument, labels, shape system and position and using the step buttons does not move the page; on the home screen ticking a Scales box does not move it; opening and closing "How it works" and a cheat sheet leaves the screen behind where it was; a speed game still advances normally

## 4. Build and play

- [ ] 4.1 Run `npm run build` and confirm it succeeds with no new warnings, then play the affected modes in `npm run dev` on a phone-sized window: open Visuals from the bottom of the home screen, play one Keys quiz to its result, and play one ear-training level to its result, confirming every new screen starts at the top
