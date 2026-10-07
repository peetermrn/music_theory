# Spec Delta

## ADDED Requirements

### Requirement: Screens open at the top
Each time the app shows a different screen, it SHALL show that screen from its top, whatever the scroll position of the screen before it. A different screen is the home screen, a quiz question, a quiz result, an ear-training exercise page, an ear-training question, an ear-training result or the Visuals page; each next question counts as a different screen. While the same screen stays shown, nothing the user does on it SHALL change its scroll position.

#### Scenario: Opening the Visuals page
- **WHEN** the user scrolls the home screen down to the "Circle & fretboard" entry and taps it
- **THEN** the Visuals page is shown from the top, with its back control and title visible

#### Scenario: Opening an ear-training exercise
- **WHEN** the user scrolls the home screen down and taps an ear-training exercise
- **THEN** the exercise's page is shown from the top

#### Scenario: Next question
- **WHEN** the user scrolls down on a question to tap "Next"
- **THEN** the next question is shown from the top, with its prompt visible

#### Scenario: Back to home
- **WHEN** the user leaves a scrolled-down page with its back, Quit or Finish control
- **THEN** the home screen is shown from the top

#### Scenario: Using the Visuals page does not scroll it
- **WHEN** the user has scrolled the Visuals page down to the fretboard and changes the instrument, the labels, the shape system or the position, or uses a step button
- **THEN** the page stays scrolled where it was

#### Scenario: Overlays do not scroll the screen
- **WHEN** the user opens and closes the cheat sheet or "How it works" on a scrolled-down screen
- **THEN** the screen behind it stays scrolled where it was
