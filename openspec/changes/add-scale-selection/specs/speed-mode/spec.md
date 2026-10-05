# Spec Delta

## MODIFIED Requirements

### Requirement: Best score
The app SHALL store the best speed-game score for each mode on the device and keep it between visits. For Notes, Scales and Mixed the best score SHALL be kept separately for each selection of scale groups, and scores stored before scale groups existed SHALL count for the default selection. A finished game with a higher score SHALL replace the stored best and be marked as a new best on the game-over screen. The best score for each mode, for the current selection, SHALL be shown on the home screen once one exists. If the score cannot be stored, the game SHALL still be playable.

#### Scenario: New best
- **WHEN** a Notes speed game ends with a score of 23 and the stored best for Notes is 19
- **THEN** the game-over screen marks a new best and the home screen afterwards shows 23 for Notes

#### Scenario: Best survives a restart
- **WHEN** the app is closed and opened again
- **THEN** the previously stored best scores are shown on the home screen

#### Scenario: Quitting does not record a score
- **WHEN** the user quits a speed game before losing all hearts
- **THEN** the stored best score is unchanged

#### Scenario: Separate best per selection
- **WHEN** the Notes best is 23 with only "Major & minor" on and the user switches to only "Pentatonic"
- **THEN** the home screen shows no Notes best until a Notes speed game is finished with that selection

#### Scenario: Switching back
- **WHEN** the user switches back to only "Major & minor"
- **THEN** the home screen shows a Notes best of 23 again

#### Scenario: Modes without scale groups
- **WHEN** the user changes the scale selection
- **THEN** the best scores shown for Chords, Relatives, Guitar and Bass do not change
