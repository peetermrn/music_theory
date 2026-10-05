# Tasks

## 1. Help overlay

- [x] 1.1 In `src/App.jsx`, add a `HowItWorks` component using the cheat sheet's `.overlay` and `.sheet` classes, with the three paragraphs (normal session, speed game, scale tick boxes) reading their numbers and names from `TOTAL`, `SPEED`, `SCALED` and `GROUPS`; verify the rendered text states 10 questions, 5 hearts, 20 seconds, the modes Notes, Scales and Mixed, and both scale group names
- [x] 1.2 Render the mode list from `SECTIONS` under its two headings, one line per mode; verify all seven modes appear with their descriptions under "Keys" and "Memorize the fretboard"
- [x] 1.3 Style the mode list in `src/styles.css`; verify at phone width the overlay has no horizontal scrolling and the last mode can be scrolled into view

## 2. Help button

- [x] 2.1 Add the "?" button to the top right of the home screen with the accessible name "How it works" and the open/closed state; verify it opens the overlay, that ✕ and an outside tap both close it, and that the ticked scale boxes and best scores are unchanged afterwards
- [x] 2.2 Style the button in `src/styles.css` as a tap-sized round control clear of the title; verify it is at least 44px, does not overlap the title at phone width, and is not present on a question, results or game-over screen

## 3. Integration

- [x] 3.1 Run `npm run build` and, in `npm run dev`, open and close the help on the home screen, then play one normal Notes session and start one speed game; verify the build succeeds, the help matches `specs/app-help/spec.md`, and play is unaffected
