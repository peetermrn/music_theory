# Music Theory Quiz App — Selected Feature Additions

> **Status: historical source prompt (V2 additions) — implemented.**
> This is the second prompt, applied on top of [plan1.md](plan1.md). It is kept for reference and is no longer the source of truth.
> Current behaviour is specified in [`openspec/specs/`](../openspec/specs/); new work goes through OpenSpec changes in `openspec/changes/`.
> Where this file and the specs disagree, the specs win.

This is an update to the existing app specification.

**Do not remove or replace any existing functionality.**
The existing quiz modes and behavior should continue to work.

Only implement the additions described below.

---

# 1. Session Statistics

Improve the existing end-of-session results screen.

In addition to the current score, show:

* Total correct answers
* Total questions
* Percentage
* Average answer time

Example:

```text
SESSION COMPLETE

8 / 10
80%

Average answer time
3.7 seconds
```

The statistics should be calculated from the current session.

---

# 2. Track Answer Time

The app needs to measure how quickly the user answers each question.

When a new question is displayed, record its start time.

When the user selects an answer, record the end time and calculate:

```text
answer time = answer timestamp - question start timestamp
```

The timer should stop immediately when the user selects an answer.

Do not include the time spent looking at the feedback/results screen.

Each answered question should retain its answer time, for example:

```js
{
  questionType: "notes",
  correct: true,
  answerTime: 2.84
}
```

At the end of the session, calculate:

```text
average answer time =
sum of all answer times / number of answered questions
```

Display the result rounded to one decimal place.

Example:

```text
Average answer time: 3.7 seconds
```

Do not add a visible countdown or time limit. This is purely a statistic measuring recall speed.

---

# 3. Review Mistakes

After completing a session, if the user got any questions wrong, provide a:

**Review mistakes**

button.

Example:

```text
SESSION COMPLETE

8 / 10
80%

Average answer time
3.7 seconds

[Review mistakes]
[Finish]
```

When the user selects **Review mistakes**, start a new quiz containing only questions they answered incorrectly in the previous session.

The review should use the same normal question/answer interface.

For example, if the user got these wrong:

```text
What is the 5th note of Bb major?
What chord is built on the 2nd degree of E major?
```

the review session contains those questions again.

### Important

The review should generate the same underlying question again, but it does not necessarily need to use exactly the same three incorrect answer choices.

The purpose is to test whether the user now knows the answer rather than whether they remember the previous button position.

At the end of the review, show the normal session statistics, including average answer time.

If the user made no mistakes, do not show the Review mistakes button.

---

# 4. New Mode — Key Notes

Add a new quiz mode that tests whether the user knows which notes belong to a particular key.

Example:

> **Which note does NOT belong to Bb major?**

Possible answers:

```text
A
Bb
C
E
```

Correct answer:

```text
E
```

because:

```text
Bb major = Bb C D Eb F G A
```

The app should generate these questions programmatically from the existing scale/key data.

---

## Question generation

For each question:

* Generate a major or minor key
* Calculate the seven notes belonging to that scale
* Select one note that does **not** belong
* Select three notes that **do** belong
* Randomize the four answer choices

Example:

> Which note does NOT belong to E major?

E major:

```text
E F# G# A B C# D#
```

Possible choices:

```text
D#
F#
A
G
```

Correct answer:

```text
G
```

The mode should work for both major and minor keys.

The new mode can be called:

**Key Notes**

---

# 5. Guitar Fretboard Mode

Add a new **Guitar** quiz mode for memorizing notes on a standard guitar fretboard.

Use standard tuning:

```text
E A D G B E
```

from lowest-pitched string to highest-pitched string.

Initially, use frets **0–12**.

---

## Question type 1 — Fret → Note

Example:

> What note is on the 5th fret of the low E string?

Possible answers:

```text
A
B
C
G
```

Correct:

```text
A
```

Another example:

> What note is on the 3rd fret of the B string?

Correct:

```text
D
```

Open strings should be included.

For example:

> What note is on the open G string?

Answer:

```text
G
```

---

## Question type 2 — Note → Fret

Also include reverse questions.

Example:

> Where is A on the low E string?

Possible answers:

```text
3rd fret
5th fret
7th fret
10th fret
```

Correct:

```text
5th fret
```

Initially, questions can be restricted to frets 0–12.

---

# 6. Bass Fretboard Mode

Add a separate **Bass** quiz mode.

Use standard 4-string bass tuning:

```text
E A D G
```

from lowest-pitched string to highest-pitched string.

Initially, use frets **0–12**.

---

## Question type 1 — Fret → Note

Example:

> What note is on the 5th fret of the E string?

Correct:

```text
A
```

Another:

> What note is on the 7th fret of the D string?

Correct:

```text
A
```

Open strings should be included.

---

## Question type 2 — Note → Fret

Example:

> Where is G on the E string?

Possible answers:

```text
1st fret
3rd fret
5th fret
7th fret
```

Correct:

```text
3rd fret
```

Initially, questions can be restricted to frets 0–12.

---

# 7. Existing Modes Must Remain

The current modes must remain unchanged and available.

The new modes are additions.

The mode selection should therefore contain the existing modes plus:

```text
Key Notes
Guitar
Bass
```

The existing modes include:

* Notes
* Scales
* Chords
* Mixed

Do not remove or substantially alter their existing question generation.

Mixed mode should continue behaving as it currently does. **Do not automatically add Guitar, Bass, or Key Notes to Mixed mode unless the existing app architecture already makes this appropriate.**

---

# 8. Keep the Existing Quiz Flow

All new question types should use the same existing quiz interface:

1. Show one question
2. Show four answer choices
3. User selects an answer
4. Immediately show correct/incorrect feedback
5. Continue to the next question
6. At the end, show session statistics

The new features should feel like natural extensions of the existing app rather than separate systems.

---

# Implementation Notes

Keep the implementation simple.

No backend or authentication is required.

The app should continue using its existing client-side architecture and data.

The main new persistent/session data needed for these features is the answer result and answer time for each question.

Example:

```js
{
  questionType: "guitar",
  question: "What note is on the 5th fret of the low E string?",
  correctAnswer: "A",
  selectedAnswer: "A",
  correct: true,
  answerTime: 2.31
}
```

This information should make it possible to calculate:

* Session score
* Average answer time
* Which questions should appear in Review mistakes

Keep the UI simple and consistent with the existing application.