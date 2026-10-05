# Spec Delta

## MODIFIED Requirements

### Requirement: Starting a speed game
The home screen SHALL offer, for each of the modes Notes, Scales, Chords, Relatives, Mixed, Guitar and Bass, a way to start a speed game in that mode with one tap, in addition to starting a normal session. Ear training SHALL NOT offer a speed game, neither on the home screen nor on the Ear training page.

#### Scenario: Starting from the home screen
- **WHEN** the user taps the speed entry of the Notes mode on the home screen
- **THEN** a speed game starts with Notes questions, full hearts, a score of 0 and the starting time limit

#### Scenario: Relatives speed game
- **WHEN** the user taps the speed entry of the Relatives mode on the home screen
- **THEN** a speed game starts with Relatives questions

#### Scenario: Ear training has no speed entry
- **WHEN** the home screen or the Ear training page is shown
- **THEN** the Ear training entry, the levels and Custom show no speed entry and no best score
