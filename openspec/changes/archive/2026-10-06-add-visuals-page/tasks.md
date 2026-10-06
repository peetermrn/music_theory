# Tasks

## 1. Theory helpers

- [x] 1.1 Export `spell`, `keyName` and `STRINGS` from `src/theory.js` without changing their behaviour; verify `npm run build` passes and a Notes session still plays
- [x] 1.2 In a new `src/Visuals.jsx`, add the derivation from `{ root, type, penta }` to the pitch-class map (name, degree, in scale, root) with sharp/flat naming of out-of-scale notes; verify by logging it for C major, Eb major, F# major and A minor pentatonic against the spec scenarios, then remove the logging

## 2. Page and circle

- [x] 2.1 Add the `Visuals` page shell (back control, "Visuals" title, state defaulting to C major, 7 notes, Guitar, Notes, five positions, All) and open it from a `visuals` state in `src/App.jsx`; verify it opens and Back returns to an unchanged home screen
- [x] 2.2 Draw the fixed 12-note ring in SVG with C at the top, scale notes and root distinguished, names from the pitch-class map; verify C major matches the "C major" scenario
- [x] 2.3 Draw the dial as one rotated group with seven numbered windows and a marked root window; verify the windows sit 2 2 1 2 2 2 1 apart in a major key and the numbers stay upright
- [x] 2.4 Add the Major / Minor and 7 notes / Pentatonic switches; verify C major to Minor gives A minor with the same notes, F# major to Minor gives D# minor, and Pentatonic closes the 4th and 7th (major) or 2nd and 6th (minor)
- [x] 2.5 Add the readout (key name, notes from the root, relative key); verify the D major and A minor pentatonic scenarios

## 3. Turning the dial

- [x] 3.1 Add the two step buttons; verify C major steps up to Db major and the buttons work from the keyboard
- [x] 3.2 Add tap-a-note-to-set-root; verify tapping G in a major key gives G major
- [x] 3.3 Add pointer-event dragging that snaps per semitone, with `touch-action: none`; verify with a mouse and in a phone-sized touch emulation that the dial follows, always rests on a note, the page does not scroll, and a drag starting on a note is not treated as a tap

## 4. Fretboard

- [x] 4.1 Draw the fretboard SVG (open column plus 12 equal frets, lowest string at the bottom, fret numbers 3 5 7 9 12) and mark every in-scale position from the pitch-class map with roots standing out; verify the A minor pentatonic low-string scenario (frets 0, 3, 5, 8, 10, 12)
- [x] 4.2 Add the Guitar / Bass and Notes / Degrees switches; verify Bass shows four strings and that in G major with Degrees every G reads 1 and every D reads 5
- [x] 4.3 Verify the link: turning the dial and each switch repaints the fretboard, and C major to Minor keeps the marks and moves only the roots

## 5. Scale positions

- [x] 5.1 Add open-string pitches to `src/theory.js` and the n-notes-per-string position builder with lowest-placement rule; verify A minor pentatonic position 1 (5 8, 5 7, 5 7, 5 7, 5 8, 5 8), A minor three-notes-per-string position 1 (5 7 8, 5 7 8, 5 7 9, 5 7 9, 6 8 10, 7 8 10), E minor pentatonic position 1 in open position, and E major pentatonic position 1 on frets 11–14
- [x] 5.2 Add the seven-note five-position builder (pentatonic box plus the two other notes, inside the span or one fret out, lower fret on a tie); verify A minor position 1 (5 7 8, 5 7 8, 5 7, 4 5 7, 5 6 8, 5 7 8) and that C major position 1 equals A minor position 2
- [x] 5.3 Add the position selector (All, 1…n) and full/dimmed marks; verify selecting a position dims the scale's other notes, All restores them, and the position stays selected while the dial turns from A minor to B minor with the shape moving two frets up
- [x] 5.4 Add the 5 positions / 3 per string switch, disabled in Pentatonic, with the position reset to All when it no longer exists; verify the selector shows 5 or 7 entries and that position 7 then Pentatonic gives All
- [x] 5.5 Make the neck slide when a position's highest fret is above 12 (no nut, shifted fret numbers); verify E major pentatonic position 1 shows frets 2–14 and that returning to All shows 0–12
- [x] 5.6 Verify positions on Bass: A minor pentatonic position 1 reads 5 8, 5 7, 5 7, 5 7 and stays selected when switching instrument

## 6. Home screen, help and layout

- [x] 6.1 Add the "Visuals" heading and "Circle & fretboard" card below "Ear training" on the home screen, with no speed button; verify it matches the other headings and opens the page
- [x] 6.2 Add the Visuals page entry and explanation, including scale positions and the two shape systems, to "How it works" in `src/App.jsx`; verify it appears under "Visuals" after the ear-training entries
- [x] 6.3 Add the page's rules to `src/styles.css` using the existing colour variables and `.switch`; verify at 360px width that there is no horizontal scrolling, the whole fretboard is visible, mark labels are readable, the eight-entry position selector fits in two rows and is on screen together with the neck, and that the page is usable at desktop width

## 7. Integration check

- [x] 7.1 Run `npm run build`, then in `npm run dev` use the Visuals page through every scenario in `specs/visuals/spec.md`, and play one Notes session and one ear-training session to confirm they are unchanged
