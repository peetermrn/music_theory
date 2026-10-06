# Spec Delta

## Purpose

A page for looking at a key instead of being quizzed on it: a circle of the 12 notes with a rotatable dial that shows which notes a key uses, linked to a fretboard that shows where those notes are.

## ADDED Requirements

### Requirement: Visuals page
The visuals SHALL have their own page, titled "Visuals", opened from the "Circle & fretboard" entry on the home screen, with a control that returns to the home screen. The page SHALL show the note circle above the fretboard on the same page. It SHALL have no questions, score, timer or session, SHALL make no sound, and SHALL NOT change any stored score or selection.

#### Scenario: Opening
- **WHEN** the user taps "Circle & fretboard" on the home screen
- **THEN** a page titled "Visuals" shows the note circle with the fretboard below it, set to C major, 7 notes, Guitar, note-name labels and all positions

#### Scenario: Back to home
- **WHEN** the user taps the back control on the Visuals page
- **THEN** the home screen is shown with the same scale boxes ticked and the same best scores as before

#### Scenario: Nothing is remembered
- **WHEN** the user sets the page to E minor on Bass, leaves, and opens it again
- **THEN** the page is set to C major on Guitar

### Requirement: Note circle
The page SHALL show the 12 notes as a ring in semitone order, clockwise, with C at the top. The ring SHALL NOT move. Notes that belong to the selected scale SHALL be clearly distinguished from the others, and the root SHALL be distinguished from the other scale notes.

#### Scenario: C major
- **WHEN** the page is set to C major, 7 notes
- **THEN** C, D, E, F, G, A and B are shown as scale notes, the other five notes are shown as outside the scale, and C is marked as the root

### Requirement: Scale dial
A dial SHALL lie over the ring with one window per scale note, spaced in the scale's step pattern, so that the notes seen through the windows are the notes of the selected scale. Each window SHALL show the note's degree number, and the root's window SHALL be marked. Turning the dial SHALL move all windows together without changing their spacing.

#### Scenario: Step pattern is visible
- **WHEN** the page is set to any major key with 7 notes
- **THEN** going clockwise from the root window, the windows are 2, 2, 1, 2, 2, 2 and 1 semitones apart and are numbered 1 to 7

#### Scenario: Same shape in every key
- **WHEN** the dial is turned from C major to D major
- **THEN** every window has moved two semitones clockwise and D, E, F#, G, A, B and C# show through

### Requirement: Turning the dial
The user SHALL be able to turn the dial by dragging it around the circle, by tapping a note on the ring to make it the root, and with two step buttons that move it one semitone in either direction. The dial SHALL always rest on a semitone position. The step buttons SHALL be operable from the keyboard, and dragging SHALL work with a mouse as well as with touch.

#### Scenario: Dragging
- **WHEN** the user drags the dial from C major a little under a quarter turn clockwise and lets go
- **THEN** the dial rests exactly on a note and the page shows the major key of that note

#### Scenario: Tapping a note
- **WHEN** the page shows a major key and the user taps G on the ring
- **THEN** the page shows G major

#### Scenario: Step button
- **WHEN** the page shows C major and the user uses the step-up button once
- **THEN** the page shows Db major

#### Scenario: Dragging does not scroll the page
- **WHEN** the user drags the dial on a phone
- **THEN** the dial turns and the page does not scroll

### Requirement: Major and minor
A Major / Minor switch SHALL choose which kind of key is shown. Switching SHALL leave the dial and the scale notes where they are and move the root to the relative key, so that a major key and its relative minor are seen to share their notes. Degree numbers SHALL be counted from the new root.

#### Scenario: Relative minor
- **WHEN** the page shows C major and the user switches to Minor
- **THEN** the page shows A minor, the same seven notes are scale notes, A is marked as the root, and A is numbered 1

#### Scenario: Relative major
- **WHEN** the page shows E minor and the user switches to Major
- **THEN** the page shows G major with the same scale notes

### Requirement: Seven notes or pentatonic
A switch SHALL choose between the full seven-note scale and its pentatonic. In Pentatonic, the dial SHALL close the windows of the two notes the pentatonic leaves out (the 4th and 7th of a major key, the 2nd and 6th of a minor key) and those notes SHALL be shown as outside the scale. The remaining windows SHALL keep their seven-note degree numbers.

#### Scenario: Major pentatonic
- **WHEN** the page shows C major and the user switches to Pentatonic
- **THEN** C, D, E, G and A are scale notes numbered 1, 2, 3, 5 and 6, and F and B are shown as outside the scale

#### Scenario: Minor pentatonic
- **WHEN** the page shows A minor, Pentatonic
- **THEN** A, C, D, E and G are scale notes numbered 1, 3, 4, 5 and 7

#### Scenario: Relative pentatonics share notes
- **WHEN** the page shows C major, Pentatonic, and the user switches to Minor
- **THEN** the page shows A minor pentatonic with the same five scale notes

### Requirement: Key naming and spelling
The page SHALL state the selected key by name, list its notes in order from the root, and name its relative key. Scale notes SHALL be spelled as that key spells them, everywhere on the page. A key reached by turning the dial SHALL have its usual name. A key reached with the Major / Minor switch SHALL be named from the scale it came from, so its notes keep their spelling. Notes outside the scale SHALL be written with flats in a key that has flats and with sharps otherwise.

#### Scenario: Readout
- **WHEN** the page shows D major, 7 notes
- **THEN** it states "D major", lists D E F# G A B C#, and names B minor as the relative minor

#### Scenario: Flat key
- **WHEN** the page shows Eb major
- **THEN** the scale notes are written Eb, F, G, Ab, Bb, C and D on the ring and on the fretboard, and no scale note is written with a sharp

#### Scenario: Usual name when turning
- **WHEN** the dial is turned so that the major root is the note between C and D
- **THEN** the key is named Db major, not C# major

#### Scenario: Spelling kept across the switch
- **WHEN** the page shows F# major and the user switches to Minor
- **THEN** the key is named D# minor and its notes are written with the same names as in F# major

#### Scenario: Pentatonic readout
- **WHEN** the page shows A minor, Pentatonic
- **THEN** it states "A minor pentatonic" and lists A C D E G

### Requirement: Linked fretboard
Below the circle the page SHALL show a fretboard 13 fret positions long, the lowest string at the bottom, with fret numbers that include 3, 5, 7, 9 and 12. With All selected it SHALL show frets 0 to 12 with the nut on the left and mark every position whose note belongs to the selected scale, open strings included, and no other. Root positions SHALL stand out from the other marks. The fretboard SHALL always show the same key and scale as the circle and SHALL update as the dial is turned or a switch is changed.

#### Scenario: Marks follow the circle
- **WHEN** the dial is turned from C major to G major
- **THEN** the fretboard's marks on F positions are replaced by marks on F# positions, and the root marks move from C positions to G positions

#### Scenario: Known positions
- **WHEN** the page shows A minor, Pentatonic, on Guitar, with All selected
- **THEN** the lowest string is marked at frets 0, 3, 5, 8, 10 and 12, and the marks at fret 5 of the lowest string and fret 0 of the A string are root marks

#### Scenario: Relative keys differ only in the root
- **WHEN** the page shows C major and the user switches to Minor
- **THEN** the same fretboard positions are marked, and the root marks move from C positions to A positions

### Requirement: Scale positions
The fretboard SHALL have a position selector offering All and one numbered entry per position of the current shape system. Selecting a position SHALL show that position's notes as full marks and every other note of the scale as a dimmed mark, so the shape is seen in its place on the neck. Roots SHALL stand out inside the shape. The selected position number SHALL be kept when the key changes, so the same position can be followed through different keys.

#### Scenario: A position is highlighted
- **WHEN** the page shows A minor, Pentatonic, on Guitar and the user selects position 1
- **THEN** the marks at frets 5 and 8 of the lowest string are full marks, and the marks at frets 0, 3, 10 and 12 of that string are dimmed

#### Scenario: Back to all notes
- **WHEN** a position is selected and the user selects All
- **THEN** every note of the scale is a full mark again

#### Scenario: Following a position through keys
- **WHEN** position 1 of A minor is selected and the dial is turned to B minor
- **THEN** position 1 is still selected and the same shape is highlighted two frets higher

### Requirement: Five-position shapes
In the five-position system there SHALL be five positions. For a pentatonic, a position is the scale played upwards two notes on each string, from the lowest string to the highest. For a seven-note scale, a position is the pentatonic position of the same key plus the scale's two other notes wherever they fall between its lowest and highest note, placed inside its fret span or one fret outside it. Position 1 SHALL start on the root on the lowest string, and positions 2 to 5 on each next note of the pentatonic.

#### Scenario: Pentatonic box
- **WHEN** the page shows A minor, Pentatonic, on Guitar, position 1
- **THEN** the highlighted frets are, from the lowest string to the highest, 5 and 8, 5 and 7, 5 and 7, 5 and 7, 5 and 8, 5 and 8

#### Scenario: Seven-note position contains the box
- **WHEN** the page shows A minor, 7 notes, on Guitar, position 1
- **THEN** the highlighted frets are, from the lowest string to the highest, 5 7 8, 5 7 8, 5 7, 4 5 7, 5 6 8 and 5 7 8, which include every fret of the A minor pentatonic position 1

#### Scenario: Numbering starts at the root
- **WHEN** the page shows C major, 7 notes, on Guitar, position 1
- **THEN** the lowest highlighted note on the lowest string is C at fret 8

### Requirement: Three-notes-per-string shapes
A switch SHALL choose between the five-position system and three notes per string. In the three-notes-per-string system there SHALL be seven positions, each the seven-note scale played upwards three notes on each string. Position 1 SHALL start on the root on the lowest string, and positions 2 to 7 on each next note of the scale. This system applies to seven-note scales only: while Pentatonic is selected the five-position system SHALL be used and the switch SHALL be unavailable. If the selected position does not exist after a switch, All SHALL be selected.

#### Scenario: Three notes per string
- **WHEN** the page shows A minor, 7 notes, on Guitar, three notes per string, position 1
- **THEN** the highlighted frets are, from the lowest string to the highest, 5 7 8, 5 7 8, 5 7 9, 5 7 9, 6 8 10 and 7 8 10

#### Scenario: Seven positions
- **WHEN** three notes per string is chosen
- **THEN** the position selector offers All and positions 1 to 7

#### Scenario: Pentatonic uses the five positions
- **WHEN** position 7 is selected in three notes per string and the user switches to Pentatonic
- **THEN** the system switch is unavailable, the selector offers All and positions 1 to 5, and All is selected

### Requirement: Shapes shared by relative keys
A major key and its relative minor SHALL have the same set of shapes in each system. Only the root marks, the degree numbers and the position numbers SHALL differ, because numbering starts from each key's own root.

#### Scenario: Same shape, different number
- **WHEN** position 1 of C major and position 2 of A minor are compared in the five-position system, 7 notes, on Guitar
- **THEN** the same frets are highlighted, with C positions as roots in one and A positions as roots in the other

### Requirement: Placement on the neck
A selected position SHALL be shown at its lowest placement on the neck in which every note is at fret 0 or higher. If that placement reaches past the 12th fret, the fretboard SHALL keep its length and show the 13 consecutive frets that end at the position's highest fret, without the nut and with the fret numbers changed to match. Otherwise it SHALL show frets 0 to 12.

#### Scenario: Open position
- **WHEN** the page shows E minor, Pentatonic, on Guitar, position 1
- **THEN** the highlighted notes use the open strings and frets 2 and 3, and the fretboard shows frets 0 to 12

#### Scenario: Position past the 12th fret
- **WHEN** the page shows E major, Pentatonic, on Guitar, position 1
- **THEN** the highlighted frets lie between 11 and 14, the fretboard shows frets 2 to 14 with no nut, and fret 12 is numbered

### Requirement: Fretboard instrument and labels
A Guitar / Bass switch SHALL choose between six strings in standard tuning (E A D G B E, lowest to highest) and four (E A D G). A Notes / Degrees switch SHALL choose whether each fretboard mark is labelled with its note name or with its degree number. Changing either switch SHALL NOT change the key, the scale or the selected position. On Bass a position SHALL be built the same way over four strings.

#### Scenario: Bass
- **WHEN** the user switches to Bass
- **THEN** the fretboard shows four strings, E A D G from bottom to top, with the same key's notes marked

#### Scenario: Degree labels
- **WHEN** the page shows G major and the user switches the labels to Degrees
- **THEN** every G mark reads 1 and every D mark reads 5

#### Scenario: Position on bass
- **WHEN** the page shows A minor, Pentatonic, position 1 and the user switches to Bass
- **THEN** position 1 is still selected and the highlighted frets are, from the lowest string to the highest, 5 and 8, 5 and 7, 5 and 7, 5 and 7

### Requirement: Fits a phone and a desktop browser
On a phone-width screen the whole page SHALL be a single column with no horizontal scrolling: the circle and all 13 fret positions of the fretboard SHALL fit the width, and every control SHALL be tap-sized. The position selector MAY take two rows. In a desktop browser the page SHALL be fully usable with a mouse and keyboard.

#### Scenario: Narrow screen
- **WHEN** the page is viewed on a 360-pixel-wide phone screen
- **THEN** the circle and the fretboard from the nut to the 12th fret are fully visible without horizontal scrolling, and the labels on the marks are readable

#### Scenario: Eight selector entries
- **WHEN** three notes per string is chosen on a 360-pixel-wide phone screen
- **THEN** All and positions 1 to 7 are all visible and tappable without horizontal scrolling

#### Scenario: Desktop browser
- **WHEN** the page is opened in a desktop browser
- **THEN** the dial can be dragged with the mouse and every switch and step button can be reached and operated with the keyboard
