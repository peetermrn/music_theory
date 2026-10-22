# Spec Delta

## MODIFIED Requirements

### Requirement: Play on guitar entries
The section SHALL offer four entries: "Key notes", "Fretboard notes", "Play it back" and "Scale runs". Tapping one of the first three SHALL start a session of that kind at once, with no page or setting in between. "Scale runs" SHALL open the Scale runs page instead; it is defined by the scale-runs capability, and the other requirements of this capability do not apply to it. The entries SHALL have no speed game and no best score, and SHALL use standard guitar tuning (E A D G B E, lowest to highest) with A4 = 440 Hz.

#### Scenario: One tap
- **WHEN** the user taps "Fretboard notes" on the home screen
- **THEN** the first Fretboard notes question is shown and the app is listening

#### Scenario: Scale runs opens its page
- **WHEN** the user taps "Scale runs" on the home screen
- **THEN** the Scale runs page is shown, and the app is not listening
