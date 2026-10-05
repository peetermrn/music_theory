# Spec Delta

## MODIFIED Requirements

### Requirement: Phone-first layout
The interface SHALL be usable one-handed on a phone screen, as a single column of content with tap-sized buttons and no horizontal scrolling. Within that column, the mode and ear-training entries on the home screen, the level entries on an ear-training page, and the answer choices of an ear-training question with more than five choices MAY be placed two abreast.

#### Scenario: Narrow screen
- **WHEN** a quiz question is viewed on a phone-width screen
- **THEN** the question and all four answers are visible and tappable without horizontal scrolling

#### Scenario: Ear question with twelve choices
- **WHEN** a Level 6 ear-training question is viewed on a phone-width screen
- **THEN** its twelve answer choices are shown in two columns, and all of them are visible and tappable without horizontal scrolling
