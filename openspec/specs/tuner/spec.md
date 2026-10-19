# tuner Specification

## Purpose

A tuner page that listens through the phone's microphone to tune a guitar or bass, or to name any played note and show how far it is from being in tune.

## Requirements

### Requirement: Tuner page
The tuner SHALL have its own page, titled "Tuner", opened from the "Tuner" entry under "Tools" on the home screen, with a back control that returns to the home screen. The page SHALL have no questions, score or session, and SHALL NOT change any stored score or selection. It SHALL open with Guitar chosen each time.

#### Scenario: Opening
- **WHEN** the user taps "Tuner" on the home screen
- **THEN** a page titled "Tuner" is shown with Guitar chosen and the tuner listening

#### Scenario: Back to home
- **WHEN** the user taps the back control on the Tuner page
- **THEN** the home screen is shown with the same scale boxes ticked and the same best scores as before

### Requirement: Instrument choice
The page SHALL offer three instruments: Guitar, Bass and Manual, one of them chosen at a time. Guitar SHALL tune the six strings E2 A2 D3 G3 B3 E4 and Bass the four strings E1 A1 D2 G2, in standard tuning with A4 = 440 Hz. Manual SHALL tune to the nearest of all twelve notes. Changing the instrument SHALL NOT scroll the page.

#### Scenario: Switching to Bass
- **WHEN** the user chooses Bass
- **THEN** four strings E, A, D and G are shown and readings are measured against them

#### Scenario: Not remembered
- **WHEN** the user chooses Bass, leaves the page and opens it again
- **THEN** Guitar is chosen

### Requirement: Pitch reading
While a steady note is heard, the page SHALL show its target note, how many cents it is above or below it on a meter from −50 to +50, and whether it is in tune. A note within 5 cents SHALL be shown as in tune, in a clearly different style. The reading SHALL be accurate to within 2 cents for a steady tone.

#### Scenario: In tune
- **WHEN** a steady tone of 110.0 Hz is heard with Guitar chosen
- **THEN** the A string is shown with a reading of 0 cents, marked in tune

#### Scenario: Slightly flat
- **WHEN** a steady tone of 108.0 Hz is heard with Guitar chosen
- **THEN** the A string is shown with a reading of about −32 cents, not in tune, with the meter left of centre

### Requirement: No note heard
When no clear note is heard, the page SHALL say so (for example "Play a note") and SHALL NOT show a reading from noise or speech. After a note stops, its last reading SHALL stay visible, dimmed, for about a second before the page returns to "Play a note".

#### Scenario: Silence
- **WHEN** the tuner is open in a quiet room
- **THEN** the page shows "Play a note" and the meter shows no reading

### Requirement: Automatic string detection
With Guitar or Bass chosen and no string selected, the page SHALL show the string closest in pitch to the heard note, highlight that string, and measure the reading against it. Notes far from every string SHALL still be measured against the closest one.

#### Scenario: Low E on guitar
- **WHEN** the open low E string of a guitar is played, slightly sharp
- **THEN** the low E string is highlighted and the reading is a few cents above 0

#### Scenario: Bass string detected in the right octave
- **WHEN** the open A string of a bass (55 Hz) is played into the phone microphone
- **THEN** the A string is highlighted, not mistaken for a note an octave higher or lower

### Requirement: String selection with reference tone
With Guitar or Bass chosen, tapping a string SHALL select it, play that string's note once as a reference tone in the guitar sound, and measure every reading against that string, whatever note is heard. Readings more than 50 cents away SHALL show at the meter's end with a hint to tune up or down. Tapping the selected string again, or choosing another instrument, SHALL return to automatic detection.

#### Scenario: Tuning a badly flat string
- **WHEN** the user taps the G string on Guitar and plays it three semitones flat
- **THEN** the G string stays selected, the meter sits at its left end and the page says to tune up

#### Scenario: Hearing the reference
- **WHEN** the user taps the D string on Guitar
- **THEN** a D3 sounds, in the guitar sound, whatever sound was chosen for ear training

#### Scenario: Back to automatic
- **WHEN** the D string is selected and the user taps it again
- **THEN** no string is selected and readings follow the nearest string

### Requirement: Manual note naming
With Manual chosen, the page SHALL name the nearest of the twelve notes with its octave number, measure the reading against it, and show no strings. A note on a black key SHALL be named with both its sharp and its flat spelling. Manual SHALL read notes at least from E1 (41 Hz) to C6 (1047 Hz).

#### Scenario: Natural note
- **WHEN** a steady 440 Hz tone is heard with Manual chosen
- **THEN** the page shows A4 and 0 cents, marked in tune

#### Scenario: Black key
- **WHEN** a steady tone at 277.2 Hz is heard with Manual chosen
- **THEN** the page shows C#4/Db4 and about 0 cents

### Requirement: Microphone use
The tuner SHALL use the microphone only while the Tuner page is shown and the app is visible. It SHALL release the microphone when the user leaves the page or the app is hidden, and SHALL listen again when the app is shown again on the Tuner page. Sound from the microphone SHALL never leave the phone.

#### Scenario: Leaving releases the microphone
- **WHEN** the user leaves the Tuner page
- **THEN** the phone no longer shows that the microphone is in use

#### Scenario: Coming back from another app
- **WHEN** the user switches to another app and back while on the Tuner page
- **THEN** the microphone was released while away and the tuner listens again on return

### Requirement: Microphone unavailable
If the microphone is blocked, missing or in use elsewhere, the page SHALL say that the tuner needs the microphone and how to allow it, and SHALL offer a control to try again. The rest of the app, and the strings' reference tones, SHALL keep working.

#### Scenario: Permission denied
- **WHEN** the user denies microphone access on opening the Tuner
- **THEN** the page explains that the microphone is needed and how to allow it in the browser's site settings, with a "Try again" control, and tapping a string still plays its reference tone
