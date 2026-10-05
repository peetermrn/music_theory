# Tasks

## 1. Remove Key Notes mode

- [ ] 1.1 In `src/theory.js`, delete the Key Notes branch of `makeQuestion` and the `outsiders` helper used only by it; verify `grep -n "keynotes\|outsiders" src/theory.js` prints nothing
- [ ] 1.2 In `src/App.jsx`, remove Key Notes from the mode list and the results label map; verify `grep -rn "keynotes\|Key Notes" src/` prints nothing
- [ ] 1.3 In `openspec/specs/theory-questions/spec.md`, edit the Purpose line so it no longer names Key Notes; verify `openspec validate --all --strict` passes

## 2. Group the home screen

- [ ] 2.1 In `src/App.jsx`, render the home screen as two sections, "Keys" (Notes, Scales, Chords, Mixed) and "Memorize the fretboard" (Guitar, Bass), each a heading followed by its mode buttons; verify in `npm run dev` that both headings and all six modes are visible and each button starts its session in one tap
- [ ] 2.2 In `src/styles.css`, add a section heading style consistent with the existing small uppercase label style; verify at phone width that the home screen has no horizontal scrolling and the buttons keep their current size

## 3. Integration check

- [ ] 3.1 Run `npm run build` and, in `npm run dev`, play one Mixed session and one Guitar session including a Review mistakes round; verify the build succeeds, no Key Notes question appears, and the results breakdown shows a label for every question type
