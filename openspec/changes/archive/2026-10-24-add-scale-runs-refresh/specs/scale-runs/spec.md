# Spec Delta

## MODIFIED Requirements

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

### Requirement: Quitting a run
A run SHALL have a Quit control. Quitting SHALL return to the Scale runs page and SHALL NOT change the cell. Quitting a run of a refresh SHALL also end the refresh.

#### Scenario: Quit
- **WHEN** the user taps Quit halfway through a run from memory of a known cell
- **THEN** the Scale runs page is shown and the cell is still known

#### Scenario: Quitting a refresh
- **WHEN** the user taps Quit during the 2nd run of a refresh of 6
- **THEN** the Scale runs page is shown, no further refresh run starts, and every cell is as it was before the refresh

## ADDED Requirements

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
