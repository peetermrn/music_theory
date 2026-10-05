# Proposal

## Why

Ear training is about to grow from one exercise to three (intervals, chords, scale degrees). On the home screen it is currently a single unlabelled card under the fretboard modes, which leaves no place for the other two. Giving it a section of its own now, and naming the existing exercise for what it is, makes the next two changes pure additions.

## What Changes

- The home screen gets a third section heading, **Ear training**, in the same yellow capitals as "Keys" and "Memorize the fretboard".
- The existing card moves under that heading and is renamed **Interval training**, with the description "Which interval two notes form". It still has no ⚡ Speed button.
- The page it opens is titled **Interval training** instead of "Ear training", so the card and the page agree.
- "How it works" lists "Interval training" under an "Ear training" heading, like the other sections.
- The specs call the page the "Interval training page" from now on, and describe the home-screen section in a way that later exercises can be added without rewording it.

Nothing about the exercise itself changes: levels, Custom, sounds, sessions, results and the cheat sheet stay as they are, and the stored Custom selection and sound choice are kept.

No new question type is added, so nothing joins Mixed mode.

### Out of scope

- Chord training and degree training. Each is its own change (`add-ear-chords`, then `add-ear-degrees`) and builds on this one.
- Any change to how interval training plays, asks or scores.
- Any change to the Keys and fretboard sections, their modes or their best scores.
- A speed game for ear training.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `quiz-session`: the home screen shows an "Ear training" heading with ear-training entries under it, replacing the single "Ear training" entry.
- `ear-training`: the page is titled and referred to as the Interval training page, and is opened from the "Interval training" entry.
- `speed-mode`: wording only; no speed game on the home screen entries or on any ear-training page.
- `app-platform`: wording only; ear-training entries on the home screen and level entries on an ear-training page may be two abreast.
- `app-help`: the overlay lists the entries under an "Ear training" heading.

## Impact

- `src/App.jsx`: the lone Ear training card becomes a section with a heading and one card; the help overlay lists the entry under its heading and calls the exercise "Interval training".
- `src/Ear.jsx`: page title.
- `src/styles.css`: the rule for the lone full-width card is removed; the section reuses the existing heading and card styles.
- No change to `src/ear.js`, `src/audio.js`, `src/theory.js`, storage keys or dependencies.
