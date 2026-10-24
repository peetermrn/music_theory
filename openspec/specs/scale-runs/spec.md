# scale-runs Specification

## Purpose

Scale runs on a real guitar, heard through the microphone and followed note by note, with a map of every major and minor key in five positions that fills in as the shapes are learned. The aim is to know the scales all over the neck.

## Requirements

### Requirement: Scale runs page
The "Scale runs" entry under "Play on guitar" SHALL open a page titled "Scale runs" with a control back to the home screen. The page SHALL show a Major / Minor switch, the map for that key type, and a "Next run" button that names the run it starts, for example "Next run: G major, position 2". While any cell is known or due, a "Refresh known" button below "Next run" SHALL name how many runs a refresh plays, for example "Refresh known: 6 runs"; otherwise it SHALL NOT be shown. The page SHALL open on Major each time. It SHALL NOT listen to the microphone.

#### Scenario: Opening
- **WHEN** the user taps "Scale runs" on the home screen
- **THEN** the Scale runs page is shown with Major selected, the major map and a "Next run" button naming a run, and no run has started

#### Scenario: Switching to minor
- **WHEN** the user switches the page to Minor
- **THEN** the map shows the 12 minor keys, and "Next run" still names the overall suggested run

#### Scenario: No refresh before anything is known
- **WHEN** the page is opened and some cells are seen but none is known or due
- **THEN** no "Refresh known" button is shown

#### Scenario: Refresh button counts its runs
- **WHEN** C major positions 1 to 5 and G major position 1 are known
- **THEN** the page shows "Refresh known: 6 runs"; with 14 cells known or due it shows "Refresh known: 10 runs", and with one due cell and nothing else "Refresh known: 1 run"

### Requirement: The map
The map SHALL have one row per key of the selected type, in the order the home screen's keys use (C, G, D, A, E, B, F#, Db, Ab, Eb, Bb, F for major; A, E, B, F#, C#, G#, Eb, Bb, F, C, G, D for minor), and one column per position, 1 to 5. Each cell SHALL show its state: not started, seen, known or due. The page SHALL also show how many of the selected type's 60 cells are known or due.

#### Scenario: Empty map
- **WHEN** the page is opened for the first time
- **THEN** all 60 major cells show not started, and the page shows 0 of 60 known

#### Scenario: Tapping a cell
- **WHEN** the user taps the cell of Bb major, position 3
- **THEN** a run of Bb major, position 3 starts

### Requirement: Run shapes
A run SHALL use the guitar shape of its key and position in the five-position system with all seven notes, the same shape the Visuals page draws for that key and position, at the same place on the neck. A minor key's position numbers SHALL start from its own root, as on the Visuals page.

#### Scenario: Same shape as Visuals
- **WHEN** a run of A minor, position 1 starts
- **THEN** its shape is, from the lowest string to the highest, frets 5 7 8, 5 7 8, 5 7, 4 5 7, 5 6 8 and 5 7 8

### Requirement: The notes of a run
A run SHALL consist of every note of its shape in order of pitch, from the lowest to the highest, then back down to the lowest. The highest note SHALL be played once, at the turn. A note SHALL count only at its exact pitch.

#### Scenario: A minor, position 1
- **WHEN** a run of A minor, position 1 starts
- **THEN** it is 33 notes long: from A at the 5th fret of the low E string up 17 notes to C at the 8th fret of the high E string, and back down to that first A

#### Scenario: Another octave does not count
- **WHEN** the next note of the run is A2 and the user plays A3
- **THEN** it is not taken as the next note

### Requirement: Following a run
Each note played SHALL be compared with the next note of the run. The right note SHALL move the run on at once, with one pluck. The same note as the one just counted SHALL be ignored, so a note plucked twice or heard twice does not count as a mistake. Any other note SHALL be a mistake: it SHALL be named, for example "F is not next", and the run SHALL wait for the right note. A mistake with the same note name as the next note, in another octave, SHALL instead say which way to go, for example "E is too high: play a lower E". The run SHALL show how many of its notes have been played, out of its length, and whether it is going up or down.

#### Scenario: Right note
- **WHEN** the run is at its 4th note and the user plays that note once
- **THEN** the run is at its 5th note and the count shows 4 of 33 played

#### Scenario: Plucked twice
- **WHEN** the user plays the right note and then plucks it again
- **THEN** the second pluck is ignored and no mistake is counted

#### Scenario: Wrong note
- **WHEN** the next note is G and the user plays F
- **THEN** the app says that F is not next, one mistake is counted, and the run still waits for G

#### Scenario: Right note, too high
- **WHEN** the next note is E2 and the user plays E3
- **THEN** the app says "E is too high: play a lower E", one mistake is counted, and the run still waits for E2

#### Scenario: Right note, too low
- **WHEN** the next note is A3 and the user plays A2
- **THEN** the app says "A is too low: play a higher A", one mistake is counted, and the run still waits for A3

#### Scenario: The turn
- **WHEN** the user plays the highest note of the run
- **THEN** the run shows that it is now going down

### Requirement: Hearing notes in a run
A note SHALL count as played in a run by the same rules as Play on guitar's "Hearing a played note": held steadily for a moment, once per pluck, with a note still ringing from before the run not counted. Every note of every run shape, up to the 15th fret of the high E string, SHALL be heard. Runs SHALL use standard guitar tuning with A4 = 440 Hz.

#### Scenario: Highest shapes
- **WHEN** a run's highest note is at the 15th fret of the high E string and the user plays it
- **THEN** it is heard and counted

### Requirement: Shown runs
A run of a cell that is not started SHALL be shown. A shown run SHALL draw its shape on a fretboard as the Visuals page does for a selected position: the shape's notes as full marks, the scale's other notes dimmed and the roots standing out, labelled with degree numbers. Each note SHALL be marked as played once it counts.

#### Scenario: First run of a cell
- **WHEN** the user starts a run of a cell that is not started
- **THEN** the shape is drawn with degree labels before any note is played

#### Scenario: Notes light up
- **WHEN** the user plays the first three notes of a shown run
- **THEN** those three notes are marked as played on the fretboard, and no other note is

### Requirement: Runs from memory
A run of a cell that is seen, known or due SHALL be from memory. It SHALL show the key, the position, the count of notes played and the direction, and SHALL NOT draw the shape. A "Show me" control SHALL draw the shape, with the notes played so far marked. The run SHALL then go on as a shown run, and can no longer count as a clean run from memory.

#### Scenario: From memory
- **WHEN** the user starts a run of a seen cell
- **THEN** the prompt names the key and the position, and no fretboard is shown

#### Scenario: Show me
- **WHEN** the user taps "Show me" after 10 notes of a run from memory
- **THEN** the shape is drawn with those 10 notes marked as played, and the run carries on from the 11th note

### Requirement: Clean runs and cell states
A clean run SHALL be one with no mistakes and no Show me. When a run ends, its cell SHALL change as follows. A clean shown run makes a not-started cell seen. A clean run from memory makes the cell known and records the day. A run from memory that is not clean turns a known or due cell back to seen. Anything else SHALL leave the cell as it was.

#### Scenario: Learning a cell
- **WHEN** a shown run of a not-started cell ends with no mistakes
- **THEN** the cell is seen, and its next run is from memory

#### Scenario: Knowing a cell
- **WHEN** a run from memory of a seen cell ends with no mistakes and no Show me
- **THEN** the cell is known

#### Scenario: Forgetting a cell
- **WHEN** a run from memory of a known cell ends with two mistakes
- **THEN** the cell is seen again

#### Scenario: Shown run with a mistake
- **WHEN** a shown run of a not-started cell ends with one mistake
- **THEN** the cell is still not started

### Requirement: Due cells
A known cell whose last clean run from memory was more than 7 days ago SHALL be due. A due cell SHALL be shown on the map as distinct from a known one, and still counts towards the number known.

#### Scenario: A week later
- **WHEN** a cell was made known 8 days ago and has not been played since
- **THEN** the map shows it as due

### Requirement: Suggested run
"Next run" SHALL start the run of the first cell in this order, across both key types: due cells, the longest due first; then seen cells; then cells not started; then known cells, the oldest clean run first. Seen and not-started cells SHALL be taken key by key, all major keys before the minor keys, in the map's order, and positions 1 to 5 within a key.

#### Scenario: First suggestion
- **WHEN** the map is empty
- **THEN** "Next run" names C major, position 1

#### Scenario: One key across the neck first
- **WHEN** only C major positions 1 to 4 are known and nothing is seen or due
- **THEN** "Next run" names C major, position 5

#### Scenario: Recall before new shapes
- **WHEN** C major, position 1 is seen and G major, position 1 is not started
- **THEN** "Next run" names C major, position 1

#### Scenario: Due first
- **WHEN** D minor, position 4 is due and other cells are seen
- **THEN** "Next run" names D minor, position 4

### Requirement: Quitting a run
A run SHALL have a Quit control. Quitting SHALL return to the Scale runs page and SHALL NOT change the cell. Quitting a run of a refresh SHALL also end the refresh.

#### Scenario: Quit
- **WHEN** the user taps Quit halfway through a run from memory of a known cell
- **THEN** the Scale runs page is shown and the cell is still known

#### Scenario: Quitting a refresh
- **WHEN** the user taps Quit during the 2nd run of a refresh of 6
- **THEN** the Scale runs page is shown, no further refresh run starts, and every cell is as it was before the refresh

### Requirement: Run result
When the last note of a run is played, the result SHALL show whether the run was clean, the number of mistakes, the time in seconds from the first note to the last, to one decimal place, and the cell's state now. It SHALL offer "Next run", which starts the run now suggested, "Again", which runs the same cell again, and a control back to the Scale runs page.

#### Scenario: Clean run from memory
- **WHEN** a run from memory of a seen cell ends with no mistakes
- **THEN** the result says the run was clean, shows 0 mistakes, the time, and that the cell is now known

#### Scenario: Again
- **WHEN** the user taps "Again" after a run with mistakes
- **THEN** a run of the same key and position starts

### Requirement: Stored progress
Each cell's state and the day of its last clean run from memory SHALL be stored on the device and restored on later visits. If storage cannot be read or written, every cell SHALL start as not started, and runs SHALL still work.

#### Scenario: Progress survives a restart
- **WHEN** the user makes C major, position 1 known, closes the app and opens the Scale runs page again
- **THEN** that cell is shown as known

#### Scenario: Storage unavailable
- **WHEN** device storage is blocked
- **THEN** the map shows every cell as not started, and a run can be played to its result

### Requirement: Microphone in runs
The microphone SHALL be used only while a run is shown and the app is visible, and SHALL be released on the result, on the Scale runs page, when the run is left, and while the app is hidden. If the microphone is blocked or unavailable, the run SHALL say so with the same explanation and "Try again" control as the tuner, and Show me and Quit SHALL still work. Sound from the microphone SHALL never leave the phone.

#### Scenario: Result releases the microphone
- **WHEN** a run ends and its result is shown
- **THEN** the phone no longer shows that the microphone is in use

#### Scenario: Microphone blocked
- **WHEN** the microphone is blocked and a run is started
- **THEN** the run shows the explanation and "Try again", and Quit returns to the Scale runs page

### Requirement: Refresh known
"Refresh known" SHALL start a refresh: up to 10 of the cells that are known or due, from both key types, in a random order with no cell twice. Seen and not-started cells SHALL NOT be in it. Each cell SHALL be run once, in that order, as a run from memory with Show me, and the run SHALL show its place in the refresh, for example "Refresh 3 of 6". A refresh SHALL NOT change any cell's state or stored day, whatever happens in its runs.

#### Scenario: Every known cell once
- **WHEN** C major positions 1 to 5 and G major position 1 are known and the user taps "Refresh known"
- **THEN** a run from memory says "Refresh 1 of 6", and the six runs of the refresh are of those six cells, each once

#### Scenario: At most ten
- **WHEN** 14 cells are known or due and the user starts a refresh
- **THEN** it has 10 runs, each of a different one of those cells

#### Scenario: Known and due cells
- **WHEN** one major cell is due, one is seen, and one major and one minor cell are known
- **THEN** the refresh has 3 runs, of the due cell and the two known cells

#### Scenario: Random order
- **WHEN** the user starts a refresh several times with the same known cells
- **THEN** the cells do not always come in the same order

#### Scenario: A refresh changes nothing
- **WHEN** a refresh run of a known cell ends with mistakes, or after Show me
- **THEN** the cell is still known with the same day, and the map and "Next run" are as they were before the refresh

#### Scenario: A clean refresh run keeps the day
- **WHEN** a cell made known 5 days ago is run cleanly in a refresh
- **THEN** its stored day is unchanged, and it is due 3 days later as it would have been without the refresh

#### Scenario: Due stays due
- **WHEN** a due cell is run cleanly in a refresh
- **THEN** the map still shows it as due, and "Next run" still names it

### Requirement: Refresh result
When the last note of a refresh run is played, the result SHALL show whether the run was clean, the number of mistakes, the time from the first note to the last to one decimal place, and the key and position, and SHALL NOT show a cell state. It SHALL offer "Next" naming the refresh's next run, "Again", which runs the same cell again within the refresh, and "End refresh", back to the Scale runs page. After the refresh's last run there SHALL be no "Next" and no summary.

#### Scenario: Between refresh runs
- **WHEN** the 3rd run of a refresh of 6 ends with one mistake
- **THEN** the result shows 1 mistake, the time and the cell, no cell state, and "Next" naming the 4th cell, and tapping it starts a run that says "Refresh 4 of 6"

#### Scenario: Again in a refresh
- **WHEN** the user taps "Again" after the 3rd run of a refresh of 6 and plays it to the end
- **THEN** that run says "Refresh 3 of 6", and its result's "Next" still names the 4th cell

#### Scenario: Last refresh run
- **WHEN** the last run of a refresh ends
- **THEN** the result has no "Next" and no summary, and offers "Again" and a control back to the Scale runs page

#### Scenario: End refresh
- **WHEN** the user taps "End refresh" on a result before the last run
- **THEN** the Scale runs page is shown and no further refresh run starts

### Requirement: Where a position starts
In a run from memory, a wrong note played before the run's first note has counted SHALL be named as any wrong note is, and the run SHALL also name the note its position starts on, spelled as in the key, for example "F is not next. Position 2 starts on D". If the wrong note has the start note's name, only the octave message SHALL be shown. The shape SHALL still not be drawn. After the first note has counted, and in shown runs, a wrong note SHALL only be named.

#### Scenario: Wrong first note
- **WHEN** a run from memory of C major, position 2 is waiting for its first note and the user plays F
- **THEN** the run says "F is not next. Position 2 starts on D", one mistake is counted, and no fretboard is shown

#### Scenario: Flat key start
- **WHEN** a run from memory of Eb minor, position 2 is waiting for its first note and the user plays a wrong note
- **THEN** the run names Gb as the note position 2 starts on

#### Scenario: Start note in the wrong octave
- **WHEN** a run from memory of C major, position 3, which starts on the open low E string, is waiting for its first note and the user plays the E an octave higher
- **THEN** the run says "E is too high: play a lower E" and nothing more

#### Scenario: After the first note
- **WHEN** the first note of a run from memory has counted and the user plays a wrong note
- **THEN** the run only says that the note is not next

#### Scenario: Shown run
- **WHEN** a shown run is waiting for its first note and the user plays a wrong note
- **THEN** the run only says that the note is not next
