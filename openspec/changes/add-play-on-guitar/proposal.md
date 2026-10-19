# Proposal

## Why

The quizzes train recall by tapping buttons, but the goal is to find the notes on a real guitar. The tuner already hears single notes accurately. Using it to check answers turns the same theory and fretboard recall into practice with the hands and ears, and makes a session feel like a game: play a note, and it lights up.

## What Changes

- New **"Play on guitar"** heading on the home screen, after "Memorize the fretboard". It has three entries, and each starts a 10-question session with one tap:
  - **Key notes**, for example "Play the 5th note of E major". Any octave counts.
  - **Fretboard notes**, for example "Play A on the D string". Only the pitch found on that string between frets 0 and 12 counts.
  - **Play it back**: the app plays a note in the guitar sound, and the user plays the same pitch.
- **Answering by playing:**
  - The app listens through the microphone. A note counts once it is held steadily, as in the tuner.
  - A note played once is only searching, and is not judged. Playing the same note twice in a row gives it as the answer, so finding a note by trying is allowed and hitting it by accident does not end the question.
  - While searching, Play it back names the note heard. Key notes and Fretboard notes only show that a note was heard, so the screen cannot be used to find the answer.
  - A right answer lights up and the next question follows by itself.
  - A wrong answer is named ("G# is not it"), and the user keeps going until the answer is right. Only a right first answer scores.
  - In Play it back, an answer in the right note name but the wrong octave gets its own hint: "an octave too high" or "too low".
- **"Show me"** gives up on a question and reveals the answer:
  - Key notes: the note name.
  - Fretboard notes and Play it back: the note, plus its position on a fretboard diagram.
  - The question then counts as missed. The user can still play the note, or tap Next.
- **Results:** first-try score out of 10, the percentage, the average time to find the right note, and a list of the questions missed with their answers. The user can play again or finish.
- **Microphone:** used only while a Play on guitar session is shown and the app is visible, as in the tuner. When it is blocked, the same "needs the microphone" message and Try again are shown.
- The "How it works" overlay lists and explains the new section.

Nothing joins Mixed mode, and no existing mode changes. The microphone code moves out of the Tuner into a shared piece, without changing how the tuner behaves.

### Out of scope

- Bass. Guitar only for now.
- Other kinds of question: scale runs, chord tones, intervals.
- Strummed chords. Only single notes are heard.
- Checking which string a note was played on. The pitch is checked, the string is trusted.
- A speed game, best scores, Review mistakes, the 💡 cheat sheet, and levels or settings for the new entries.
- Following the "Scales" tick boxes. Key notes uses major and natural minor keys only.

## Capabilities

### New Capabilities
- `play-on-guitar`: the Play on guitar section. Covers the three kinds of question, answering by playing, retries and first-try scoring, Show me, the session and its results, and microphone use.

### Modified Capabilities
- `quiz-session`: "Mode selection" gets the "Play on guitar" heading and its entries, and the "Ear training" heading now follows it.
- `app-platform`: "Screens open at the top" adds the Play on guitar question and result screens.
- `app-help`: "Lists every mode" adds the Play on guitar entries. A new requirement explains how the section works.

## Impact

- **Code:**
  - [src/App.jsx](../../../src/App.jsx): the home section, the screen name, and the help text.
  - A new session component.
  - Question generators that use [src/theory.js](../../../src/theory.js) data.
  - A shared microphone module taken out of [src/Tuner.jsx](../../../src/Tuner.jsx).
  - [src/Visuals.jsx](../../../src/Visuals.jsx) exports its fretboard drawing so Show me can reuse it.
  - [src/pitch.js](../../../src/pitch.js) is reused unchanged.
- **Dependencies:** none added.
- **Permissions:** the same microphone permission the tuner already asks for.
- **Offline:** works fully offline. Nothing is sent over the network.
