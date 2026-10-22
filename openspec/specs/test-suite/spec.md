# test-suite Specification

## Purpose
Automated checks that the app does what its specs say: one command runs them on any machine, and each test points at the capability and scenario it checks.

## Requirements

### Requirement: One command runs the suite
`npm test` SHALL run every test once and finish with a non-zero exit status when any test fails. It SHALL need no browser, phone, microphone, speaker or network connection, and SHALL give the same result on every run.

#### Scenario: Passing suite
- **WHEN** `npm test` is run on a checkout where the app matches its specs
- **THEN** every test passes and the command exits with status 0

#### Scenario: Broken behaviour
- **WHEN** the scale of G major is computed wrongly and `npm test` is run
- **THEN** the theory-questions tests fail and the command exits with a non-zero status

#### Scenario: Offline machine
- **WHEN** `npm test` is run with no network connection and no microphone
- **THEN** the suite runs to the end with the same result

### Requirement: Tests follow the specs
Every capability in `openspec/specs/` SHALL have its own test file named after it. Within a file, tests SHALL be grouped by the spec's requirements and named after its scenarios, so that a failing test names the requirement and scenario it checks. Behaviour that cannot be checked without a real device, such as layout on a phone, installing the app or real-guitar accuracy, MAY be left to manual checks.

#### Scenario: Finding the spec of a failing test
- **WHEN** a test fails
- **THEN** its name gives the capability, the requirement and the scenario it checks

#### Scenario: A capability without tests
- **WHEN** a capability is added to `openspec/specs/`
- **THEN** a test file of the same name is added with it

### Requirement: Tests stay out of the app
Test code and the tools that run it SHALL NOT be part of the built app, and SHALL NOT change what the app does, downloads or stores.

#### Scenario: Building the app
- **WHEN** `npm run build` is run
- **THEN** the built app contains no test code and no test tool
