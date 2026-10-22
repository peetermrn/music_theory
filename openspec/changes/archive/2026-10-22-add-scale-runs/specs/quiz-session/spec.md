# Spec Delta

## MODIFIED Requirements

### Requirement: Mode selection
The home screen SHALL offer the quiz modes Notes, Scales, Chords, Relatives, Mixed, Guitar and Bass, and selecting one SHALL start a new session in that mode. The modes SHALL be grouped under two headings, "Keys" (Notes, Scales, Chords, Relatives, Mixed) and "Memorize the fretboard" (Guitar, Bass), and every mode SHALL be directly selectable on the home screen without opening a submenu. Below the modes the home screen SHALL show a heading "Play on guitar", in the same style, with the entries "Key notes", "Fretboard notes", "Play it back" and "Scale runs". Each of the first three SHALL start a session of its kind with one tap, "Scale runs" SHALL open the Scale runs page, and none SHALL have a speed game. These entries are not quiz modes: they are defined by the play-on-guitar capability, and the other requirements of this capability do not apply to them. Below "Play on guitar" the home screen SHALL show the heading "Ear training", in the same style as the others, for the ear-training exercises. Each entry under it SHALL open that exercise's page instead of starting a session. Ear-training exercises are not quiz modes: their sessions are defined by the ear-training capabilities, and the other requirements of this capability do not apply to them. Below "Ear training" the home screen SHALL show the heading "Visuals", in the same style, with the entry "Circle & fretboard". That entry SHALL open the Visuals page instead of starting a session, and SHALL have no speed game. The Visuals page is not a quiz mode: it is defined by the visuals capability, and the other requirements of this capability do not apply to it. Below "Visuals" the home screen SHALL show the heading "Tools", in the same style, with the entries "Metronome" and "Tuner". Each SHALL open its page instead of starting a session, and SHALL have no speed game. The tools are not quiz modes: they are defined by the metronome and tuner capabilities, and the other requirements of this capability do not apply to them.

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
- **THEN** the heading "Ear training" appears below the "Play on guitar" entries, looking like the headings "Keys" and "Memorize the fretboard", with the entries "Interval training", "Chord training" and "Degree training" under it and no ear-training level listed on the home screen

#### Scenario: Opening ear training
- **WHEN** the user taps "Interval training" on the home screen
- **THEN** the Interval training page is shown and no session has started

#### Scenario: Visuals entry
- **WHEN** the home screen is shown
- **THEN** the heading "Visuals" appears below the ear-training entries, looking like the other headings, with the entry "Circle & fretboard" under it and no speed game button on that entry

#### Scenario: Opening the Visuals page
- **WHEN** the user taps "Circle & fretboard" on the home screen
- **THEN** the Visuals page is shown and no session has started

#### Scenario: Tools entries
- **WHEN** the home screen is shown
- **THEN** the heading "Tools" appears below the Visuals entry, looking like the other headings, with the entries "Metronome" and "Tuner" under it and no speed game button on either

#### Scenario: Opening a tool
- **WHEN** the user taps "Tuner" on the home screen
- **THEN** the Tuner page is shown and no session has started

#### Scenario: Play on guitar entries
- **WHEN** the home screen is shown
- **THEN** the heading "Play on guitar" appears below the fretboard modes, looking like the other headings, with the entries "Key notes", "Fretboard notes", "Play it back" and "Scale runs" under it and no speed game button on any of them
