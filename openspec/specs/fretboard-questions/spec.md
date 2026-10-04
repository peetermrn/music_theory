# fretboard-questions Specification

## Purpose

Question generation for the Guitar and Bass modes, which train recall of note positions on the fretboard in standard tuning.

## Requirements

### Requirement: Instruments and tuning
Guitar mode SHALL use six strings in standard tuning (E A D G B E, lowest to highest) and Bass mode SHALL use four strings in standard tuning (E A D G). Guitar prompts SHALL distinguish the two E strings as "low E" and "high E".

#### Scenario: Guitar E strings
- **WHEN** a Guitar question concerns the lowest string
- **THEN** the prompt names it the "low E string"

### Requirement: Fret range
Fretboard questions SHALL be limited to frets 0–12.

#### Scenario: Highest fret
- **WHEN** a fretboard question is generated
- **THEN** it never refers to a fret above the 12th

### Requirement: Fret to note questions
Each fretboard mode SHALL ask which note is at a given fret of a given string, including open strings. Notes SHALL be named using sharps, and distractors SHALL be notes within a few semitones of the correct note.

#### Scenario: Fretted note
- **WHEN** the question "What note is on the 5th fret of the low E string?" is generated
- **THEN** the correct answer is A

#### Scenario: Open string
- **WHEN** a question concerns fret 0 of the G string
- **THEN** the prompt reads "What note is on the open G string?" and the correct answer is G

### Requirement: Note to fret questions
Each fretboard mode SHALL also ask where a given note is on a given string, with choices given as fret positions shown in ascending order. These questions SHALL only use frets 1–11 so that exactly one choice is correct.

#### Scenario: Locating a note
- **WHEN** the question "Where is G on the E string?" is generated in Bass mode
- **THEN** the correct answer is "3rd fret" and the choices are listed from lowest to highest fret

### Requirement: Shared quiz flow
Guitar and Bass questions SHALL use the same quiz session flow as every other mode, including timing, results and Review mistakes.

#### Scenario: Reviewing a fretboard mistake
- **WHEN** the user reviews a missed fretboard question
- **THEN** the same string, fret and question direction are asked again
