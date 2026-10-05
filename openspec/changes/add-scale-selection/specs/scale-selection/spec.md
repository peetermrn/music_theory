# Spec Delta

## Purpose

Lets the user choose on the home screen which groups of scales the key-based modes draw their questions from, without adding a settings screen.

## ADDED Requirements

### Requirement: Scale chips
The home screen SHALL show, at the top of the "Keys" section, one toggle chip for each scale group: "Major & minor" (major and natural minor) and "Pentatonic" (major pentatonic and minor pentatonic). Each chip SHALL show whether its group is on.

#### Scenario: Chips shown
- **WHEN** the home screen is shown
- **THEN** the chips "Major & minor" and "Pentatonic" appear above the Notes card, each marked as on or off

### Requirement: Toggling scale groups
Tapping a chip SHALL switch its group on or off independently of the other chips. At least one group SHALL always be on: tapping the only chip that is on SHALL leave it on.

#### Scenario: Adding a group
- **WHEN** only "Major & minor" is on and the user taps "Pentatonic"
- **THEN** both chips are on

#### Scenario: Drilling one group alone
- **WHEN** both chips are on and the user taps "Major & minor"
- **THEN** only "Pentatonic" is on

#### Scenario: Last chip
- **WHEN** only "Pentatonic" is on and the user taps "Pentatonic"
- **THEN** "Pentatonic" stays on

### Requirement: Default and remembered selection
On first use only "Major & minor" SHALL be on. The selection SHALL be stored on the device and restored on later visits. If the selection cannot be stored or read, the app SHALL use the default and remain fully usable.

#### Scenario: First use
- **WHEN** the app is opened for the first time
- **THEN** only "Major & minor" is on

#### Scenario: Selection survives a restart
- **WHEN** the user switches "Pentatonic" on, closes the app and opens it again
- **THEN** "Pentatonic" is still on

#### Scenario: Storage unavailable
- **WHEN** device storage is blocked
- **THEN** only "Major & minor" is on and every mode can still be played

### Requirement: Modes the selection applies to
The selection SHALL determine which scales Notes and Scales questions use, in those modes and inside Mixed, for normal sessions and speed games. Chords and Relatives questions SHALL always use major and natural minor keys, and Guitar and Bass SHALL be unaffected. Starting a mode SHALL still take one tap.

#### Scenario: Default selection
- **WHEN** only "Major & minor" is on and a Notes session is played
- **THEN** every question is about a major or natural minor scale

#### Scenario: Pentatonic only
- **WHEN** only "Pentatonic" is on and a Scales session is played
- **THEN** every question is about a major pentatonic or minor pentatonic scale

#### Scenario: Chords ignores the selection
- **WHEN** only "Pentatonic" is on and a Chords session is played
- **THEN** every question is about a triad of a major or natural minor key
