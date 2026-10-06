# Design

## Context

See proposal.md for motivation and specs/visuals/spec.md for behaviour.

- The app has no router. `App.jsx` swaps whole screens on state; ear training is `if (ear) return <Ear … onExit />` before the home screen renders. `Ear.jsx` owns its own state and page markup (`<main className="page">`, a `.bar` header with a "‹ Back" button, an `h1.title`).
- `theory.js` already holds everything the page needs, though several pieces are private: `scale(root, type)` spells a seven-note scale by letter name, `spell(root, type)` adds the pentatonic subset and its parent positions, `keyName(pc, type)` gives the usual key name for a pitch class from `KEYS`, `pc(note)` gives a pitch class, and `STRINGS` has guitar and bass tunings as `[label, openNote]` from lowest to highest.
- `.page` is a 480px-max column with 20px side padding, so the drawing area is 320px on a 360px phone and 440px at most. The app-platform spec forbids horizontal scrolling.
- Existing two-way controls use the `.switch` class (two buttons in a bordered pill).
- No test framework; verification is `npm run build` plus using the page.

## Goals / Non-Goals

**Goals:**
- One state drives both drawings, so the circle and fretboard cannot disagree.
- All note names on the page come from `theory.js`, never from a second table.
- Fit 13 fret positions in 320px without scrolling, including when a position is selected.
- Scale positions are calculated from the scale and the tuning, never stored as fret patterns.

**Non-Goals:**
- A general scale engine. Only what `SCALES` and `SUBSETS` already define for major, minor and their pentatonics is used.
- Animation other than the stencil turning to a new key.
- Shared components with the quiz or ear pages.
- Fingering or picking-order hints inside a shape.

## Decisions

### State is a root name, a type and five view options
`{ root: "C", type: "major", penta: false, instrument: "guitar", labels: "notes", system: "five", position: 0 }` in one `Visuals` component (`position: 0` is All). Everything shown is derived on render from `root` and `type`:

- `parent = scale(root, type)`: seven spelled notes; index is degree − 1.
- `open`: the degree indexes whose windows are open, all seven or the pentatonic subset positions for `type`.
- `byPc`: a map from pitch class to `{ name, degree, inScale, isRoot }` for all 12 pitch classes, built from `parent` and `open`. The ring, the dial, the readout and the fretboard all read this map.

The root is kept as a name, not a pitch class, because the same pitch class has two keys (F#/Gb major, D#/Eb minor) and the spec requires the spelling to survive the Major / Minor switch.

*Alternative considered:* storing a pitch class and always naming it with `keyName`. Rejected: F# major would flip to Eb minor, and the "same notes" would be re-spelled in flats at exactly the moment the page is showing they are the same.

### Two ways of naming the root
- Turning the dial, tapping a note, or a step button sets `root = keyName(pc, type)`: the usual name.
- The Major / Minor switch sets `root` to the relative read off the current scale, `parent[5]` going to minor and `parent[2]` going to major, the same rule the Relatives quiz uses. The dial does not move.

Every spelling this can produce is valid for `scale()`: the relatives of the 24 keys in `KEYS` are either in `KEYS` or one of D# minor and Gb major, both of which spell without double accidentals.

### Out-of-scale note names
A pitch class outside the scale is named from a flat list if any note of `parent` contains "b", otherwise from a sharp list. These two 12-entry lists are the only new note data, and only for dimmed labels.

### The dial is a stencil: one band with windows, turned as a whole
The circle is a single square SVG (`viewBox` in fixed units, `width: 100%`). The ring is 12 identical note discs at 30° steps with C at the top; it never changes apart from the note names. The dial is a `<g>` drawn over it: a translucent band covering the whole ring, with a window cut out by an SVG mask for each note of the scale, a thick edge on each window (brass, and rose on the root's), and a degree number outside the band beside each. Notes under the band show through faintly; notes in a window are at full strength. In Pentatonic the two left-out windows are simply not cut.

The stencil is always cut in the major pattern and turned to the relative major's pitch class. A key and its relative minor therefore share one stencil position, and the Major / Minor switch changes only which window is the root and how the windows are numbered. Nothing turns.

The group is turned with a CSS `transform: rotate()` and a short transition, so changing key shows the stencil travelling to its new place. The resting angle is kept as an unbounded number of degrees and always advanced by the shortest signed difference, so B to C turns 30° forward and not 330° back. Degree numbers carry the opposite rotation with the same transition and stay upright. The existing `prefers-reduced-motion` rule removes the transitions.

*Alternative considered:* separate outlined windows with no band (the first build). Rejected after use: notes outside the key had to be dimmed by styling the ring, which made them too dark, and the windows did not read as one object that moves.

*Alternative considered:* an HTML/CSS dial with `conic-gradient` cutouts. Rejected: hit-testing and text placement are simpler in one SVG, and it scales with the column for free.

### Dragging with pointer events
`pointerdown` on the circle captures the pointer and records the angle from the centre (`atan2`), the root's pitch class and the stencil's resting angle. `pointermove` accumulates the angle travelled, taking the short way at each step so crossing the bottom of the circle does not jump. While held, the stencil follows the finger exactly with the transition switched off, and the key changes each time the travel passes a semitone. On release the stencil settles, with the transition, on the nearest semitone, which is already the selected key. The SVG has `touch-action: none` so a drag does not scroll the page. Pointer events cover mouse and touch with one code path.

Ring notes are the tap targets; the stencil itself ignores pointer events. A press that travels less than a few degrees is a tap, so a drag that starts on a note still turns the dial.

The two step buttons (‹ ›) below the circle are real `<button>`s, which gives keyboard operation without making the SVG focusable.

### Fretboard layout
One SVG, width 100%, with the fret axis divided into a narrow open-string column and 12 equal fret columns. At 320px that gives roughly a 20px open column and 25px per fret; marks are circles about 20px across with 10–11px labels, which holds the longest label ("F#", "Bb"). Strings are evenly spaced rows, lowest at the bottom; row height is fixed, so bass is simply a shorter drawing. Fret numbers 3, 5, 7, 9 and 12 are printed under the board.

A position's pitch class is `(pc(open) + fret) % 12`, looked up in `byPc`. The existing `fretNote` helper is not used: it names notes in sharps for the quiz, which the fretboard-questions spec requires and this page must not do.

Equal fret widths are a deliberate departure from a real neck. Realistic narrowing frets would make the 12th-fret marks too small to label on a phone.

### A position is a run of ascending pitches, laid out n per string
Strings get absolute pitches in semitones (guitar E2 A2 D3 G3 B3 E4, bass E1 A1 D2 G2), kept next to `STRINGS` in `theory.js`. A position is then built with one function:

1. Take the scale's intervals: the five pentatonic ones (five-position system) or all seven (three notes per string).
2. Starting from degree index `k` (position number − 1), list `n × strings` ascending pitches, `n` = 2 or 3.
3. Give the first `n` to the lowest string, the next `n` to the next string, and so on. A note's fret is its pitch minus the string's open pitch.
4. Use the lowest octave in which every fret is ≥ 0.

This yields the five pentatonic boxes and the seven three-notes-per-string shapes exactly, on guitar and on bass, with no shape data.

A seven-note position in the five-position system is the pentatonic box plus the scale's other two notes: for every scale pitch between the box's lowest and highest pitch that the box lacks, add it on the string where its fret is inside the box's fret span; failing that, on a string where it is one fret outside. Ties go to the lower fret. That gives the familiar 17-note shapes (for A minor position 1, the extra B lands on the G string at fret 4, not on the D string at fret 9).

The construction was run in a throwaway script for all 12 roots, both key types, both instruments and every position: the one-fret rule always finds a place, every spec scenario's frets come out as written, and the highest fret any position reaches is 17.

*Alternative considered:* storing the five CAGED shapes and seven 3NPS shapes as fret offsets. Rejected: two tables per instrument to get right by hand, where the rule above is about 20 lines and follows the app's habit of deriving everything from theory data.

### Positions are a filter over the same marks
The fretboard still draws a mark for every in-scale position in view. With a position selected, a mark is full if its (string, fret) is in the position's set and dimmed otherwise. Nothing else about the drawing changes, so labels, root colour and instrument switching work unchanged.

Position numbers count from the current root, so the Major / Minor switch renumbers the same shapes (C major 1 is A minor 2). The stored `position` is simply kept; it is reset to All only when it exceeds the system's count (7 → 5 on switching to Pentatonic or to the five-position system).

### The neck slides instead of growing
Positions reach fret 17 at most, and 18 columns do not fit 320px. The neck therefore always has 13 columns. Its first fret is 0 unless the selected position's highest fret is above 12, in which case the first fret is that highest fret − 12. When the first fret is not 0 the nut is not drawn and the first column is an ordinary fret. Fret numbers are printed for 3, 5, 7, 9, 12, 15 and 17 when in view.

*Alternative considered:* a 15- or 18-fret neck at all times. Rejected: marks drop below about 17px with unreadable labels, to serve a minority of positions.

*Alternative considered:* placing a high position an octave lower. Not possible: those are the positions whose lower octave would need frets below the nut.

### Controls
Five `.switch` pairs: Major / Minor, 7 notes / Pentatonic, Guitar / Bass, Notes / Degrees, and 5 positions / 3 per string. The first two sit with the circle, the others with the fretboard, so each control is next to what it changes. The system switch is disabled while Pentatonic is on. The position selector is a row of buttons (All, 1…5 or 1…7) directly above the neck, laid out as a four-column grid so eight entries take two rows of full tap-sized buttons. The readout sits between the circle and the fretboard.

### Wiring into the app
- `App.jsx`: a `visuals` boolean next to `ear`; `if (visuals) return <Visuals onExit={…} />`. The home screen gets a fourth `<section>` after "Ear training" with one `.mode` card and no `.speed` button, the same markup the ear entries use.
- `HowItWorks`: the heading and entry name come from the same constants as the home section, plus one paragraph of explanation.
- `theory.js`: add `export` to `spell`, `keyName` and `STRINGS`, and add the open-string pitches. No behaviour change to questions.

## Risks / Trade-offs

- [Marks on a 320px fretboard are small and close together] → They are for reading, not tapping, so the 44px tap-size rule does not apply to them; root marks use the brass fill so the pattern reads even when labels are small. Check on a real phone before archiving.
- [A drag that starts on a ring note could be taken for a tap, or the reverse] → Decide on release: no step change means tap.
- [Notes under the stencil may be too faint or too strong] → One opacity value on the band; tune by eye on a phone.
- [Equal-width frets look unlike a real neck] → Accepted for legibility; fret numbers keep orientation.
- [No sound, so the page is silent in an app that has audio] → Out of scope by the proposal; the state shape leaves room to add it.
