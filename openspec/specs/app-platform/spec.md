# app-platform Specification

## Purpose

How the app is delivered and what it deliberately does not have: a client-only, installable, offline-capable web app for one person's phone.

## Requirements

### Requirement: Client-only application
The app SHALL run entirely in the browser with no backend, database, user accounts or authentication.

#### Scenario: No network dependency for quiz logic
- **WHEN** a question is generated or an answer is checked
- **THEN** no network request is made

### Requirement: Installable PWA
The app SHALL be installable as a Progressive Web App that launches in standalone display mode with its own name and icons.

#### Scenario: Installing on Android
- **WHEN** the user installs the app from the browser on an Android phone
- **THEN** it appears on the home screen as "Theory Quiz" and opens without browser chrome

### Requirement: Offline use
After the first successful load the app SHALL work without a network connection, and SHALL update itself automatically when a new version is available online.

#### Scenario: Offline session
- **WHEN** the installed app is opened with no network connection
- **THEN** a full quiz session can be played

### Requirement: Phone-first layout
The interface SHALL be usable one-handed on a phone screen, with a single-column layout and tap-sized answer buttons.

#### Scenario: Narrow screen
- **WHEN** the app is viewed on a phone-width screen
- **THEN** the question and all four answers are visible and tappable without horizontal scrolling
