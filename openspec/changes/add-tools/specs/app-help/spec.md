# Spec Delta

## ADDED Requirements

### Requirement: Explains the tools
The overlay SHALL list "Metronome" and "Tuner" under the heading "Tools", after the Visuals entry, each with a one-line description. It SHALL explain that the tools have no questions or score; that the metronome starts at 100 BPM, changes by 1 or 10, accents the first beat of the bar and stops when the page is left; and that the tuner listens through the microphone, offers Guitar, Bass and Manual, can find the string itself or tune a tapped string with a reference tone, and uses the microphone only while its page is open.

#### Scenario: Tools listed
- **WHEN** the overlay is open
- **THEN** it shows the heading "Tools" after "Visuals", with "Metronome" and "Tuner" and a one-line description of each

#### Scenario: Microphone explained
- **WHEN** the overlay is open
- **THEN** it states that the tuner uses the microphone only while the Tuner page is open
