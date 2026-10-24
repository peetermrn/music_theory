# Spec Delta

## MODIFIED Requirements

### Requirement: Explains Scale runs
The overlay SHALL explain that a scale run plays every note of one key's position from its lowest note to its highest and back, heard through the microphone; that the right next note counts with one pluck and any other note is a mistake; that a first run shows the shape and later runs are from memory; that the map fills in with clean runs and asks for a known shape again after a week; that "Refresh known" plays up to 10 known shapes in a random order without changing the map; and that the string is not checked.

#### Scenario: Scale runs summary
- **WHEN** the overlay is open
- **THEN** it states that a run goes up a position and back down, that a first run shows the shape and later runs are from memory, and that clean runs fill in the map

#### Scenario: Refresh summary
- **WHEN** the overlay is open
- **THEN** it states that "Refresh known" replays known shapes in a random order and does not change the map
