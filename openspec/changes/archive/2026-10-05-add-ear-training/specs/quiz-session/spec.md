# Spec Delta

## MODIFIED Requirements

### Requirement: Mode selection
The home screen SHALL offer the quiz modes Notes, Scales, Chords, Relatives, Mixed, Guitar and Bass, and selecting one SHALL start a new session in that mode. The modes SHALL be grouped under two headings, "Keys" (Notes, Scales, Chords, Relatives, Mixed) and "Memorize the fretboard" (Guitar, Bass), and every mode SHALL be directly selectable on the home screen without opening a submenu. Below the modes the home screen SHALL show one "Ear training" entry, which opens the Ear training page instead of starting a session. Ear training is not a quiz mode: its sessions are defined by the ear-training capability, and the other requirements of this capability do not apply to them.

#### Scenario: Starting a session
- **WHEN** the user taps a mode on the home screen
- **THEN** a session starts in that mode and the first question is shown

#### Scenario: Grouped modes
- **WHEN** the home screen is shown
- **THEN** Notes, Scales, Chords, Relatives and Mixed appear under the heading "Keys" and Guitar and Bass appear under the heading "Memorize the fretboard"

#### Scenario: Fretboard mode in one tap
- **WHEN** the user taps Bass on the home screen
- **THEN** a Bass session starts immediately with no intermediate screen

#### Scenario: Ear training entry
- **WHEN** the home screen is shown
- **THEN** a single "Ear training" entry appears below the fretboard modes, and no ear-training level is listed on the home screen

#### Scenario: Opening ear training
- **WHEN** the user taps "Ear training" on the home screen
- **THEN** the Ear training page is shown and no session has started
