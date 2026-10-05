# Spec Delta

## MODIFIED Requirements

### Requirement: Cheat sheet access
A 💡 button SHALL be visible while a question is shown in a normal session, and tapping it SHALL open the cheat sheet as an overlay that the user can dismiss to return to the same question. The cheat sheet SHALL NOT be available during a speed game.

#### Scenario: Opening and closing
- **WHEN** the user taps the 💡 button during a question and then closes the panel
- **THEN** the same question is still shown with its state unchanged

#### Scenario: Speed game
- **WHEN** a question is shown in a speed game
- **THEN** no 💡 button is shown
