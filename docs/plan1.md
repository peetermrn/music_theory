# Music Theory Quiz App

> **Status: historical source prompt (V1) — implemented.**
> This is the original prompt the app was generated from. It is kept for reference and is no longer the source of truth.
> Current behaviour is specified in [`openspec/specs/`](../openspec/specs/); new work goes through OpenSpec changes in `openspec/changes/`.
> Where this file and the specs disagree, the specs win. Known differences: the fretboard mode listed under *Future Features* was built in [plan2.md](plan2.md), and note names are shown with proper key spellings (Bb, not A#) from the start.
> The remaining *Future Features* below (weakness tracking, spaced repetition, scale shapes, seventh chords, ear training, harmonic minor questions) are the backlog — each is a candidate for `/opsx:propose`.

## Goal

A tiny personal music-theory quiz app for phone, designed for **2–5 minute practice sessions**.

The main goal is to memorize:

* Which notes belong to each major/minor key
* Which note occurs at each scale degree
* Which chord is built on each scale degree
* The quality of each diatonic chord (major, minor, diminished)
* Eventually, other useful music-theory facts

The app should test **recall**, rather than asking questions where the notation itself gives away the answer.

---

## Technology

* React
* Vite
* JavaScript
* Plain CSS
* No backend
* No database
* No authentication
* Deploy to Vercel from GitHub
* PWA support so it can be installed on an Android phone
* Ideally usable offline after the initial installation

All music-theory questions should be generated programmatically from the underlying theory data rather than manually creating hundreds of questions.

---

# Main Screen

The user chooses a quiz mode:

1. **Notes**
2. **Scales**
3. **Chords**
4. **Mixed**

Then the app presents one question at a time with **4 possible answers**.

After answering:

* Immediately show whether the answer was correct
* Show the correct answer
* Show a **Next** button
* Keep track of the current session score

Example:

> What is the 5th note of A major?

* C
* E ✓
* F#
* D

---

# Important Question Design Rule

### Do NOT use Roman numerals in questions where they reveal the answer.

For example, avoid:

> What is the **ii** chord in C major?

Because `ii` already tells the user that the chord is minor.

Instead ask:

> What chord is built on the **2nd degree** of C major?

The user must independently determine:

1. The 2nd note is D
2. The chord built there is D minor

This is the type of recall the app is intended to train.

Similarly:

> What chord is built on the **5th degree** of A minor?

rather than:

> What is the **v** chord of A minor?

---

# Music Theory Data

## Chromatic notes

Use a canonical chromatic representation internally:

```js
[
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B"
]
```

Eventually the UI can support enharmonic spellings such as Bb instead of A#, but internally the app should use semitone positions so questions can be generated reliably.

---

## Major scale

Semitone intervals from the root:

```js
[0, 2, 4, 5, 7, 9, 11]
```

Whole/half-step pattern:

```text
2 2 1 2 2 2 1
```

Example:

```text
C major
C D E F G A B
```

---

## Natural minor

Semitone intervals:

```js
[0, 2, 3, 5, 7, 8, 10]
```

Whole/half-step pattern:

```text
2 1 2 2 1 2 2
```

Example:

```text
A minor
A B C D E F G
```

---

## Harmonic minor

Semitone intervals:

```text
0 2 3 5 7 8 11
```

Whole/half-step pattern:

```text
2 1 2 2 1 3 1
```

This can be added as a later quiz category rather than being required in the first version.

---

# Scale-Degree Questions

Questions should use **Arabic numbers**, not Roman numerals.

Examples:

> What is the 2nd note of E major?

Answer:

> F#

---

> What is the 5th note of Bb major?

Answer:

> F

---

> What is the 3rd note of A minor?

Answer:

> C

---

> What is the 7th note of D major?

Answer:

> C#

The app should generate questions for all seven scale degrees.

---

# Chord Questions

The initial version should focus on **triads built on each scale degree**.

Example:

### C major

| Degree | Root | Chord        |
| -----: | ---- | ------------ |
|      1 | C    | C major      |
|      2 | D    | D minor      |
|      3 | E    | E minor      |
|      4 | F    | F major      |
|      5 | G    | G major      |
|      6 | A    | A minor      |
|      7 | B    | B diminished |

Questions should be phrased like:

> What chord is built on the 2nd degree of C major?

Answer:

> D minor

---

> What chord is built on the 5th degree of C major?

Answer:

> G major

---

> What chord is built on the 7th degree of C major?

Answer:

> B diminished

The answer should include **both the root and chord quality**.

Do not make the answer simply:

> G

because the purpose is also to memorize the chord quality.

---

# Chord Quality Generation

For major keys, the basic triad pattern is:

```text
1  major
2  minor
3  minor
4  major
5  major
6  minor
7  diminished
```

The app should calculate this rather than storing every key manually.

For example:

```text
G major

G major
A minor
B minor
C major
D major
E minor
F# diminished
```

The same principle should eventually be implemented for minor keys.

---

# Mixed Mode

Mixed mode randomly combines different question types.

For example:

> What is the 6th note of G major?

followed by:

> What chord is built on the 4th degree of E major?

followed by:

> What is the 3rd note of B minor?

This should be the default mode once the individual categories are understood.

---

# Answer Generation

Each question should have:

* 1 correct answer
* 3 plausible incorrect answers

Incorrect answers should be generated intelligently rather than completely randomly.

For example, for:

> What is the 5th note of C major?

Correct:

> G

Possible distractors:

> F
> A
> E

Avoid obviously ridiculous distractors.

The same applies to chords. If the correct answer is:

> D minor

possible distractors could be:

> D major
> E minor
> A minor

rather than unrelated chords.

---

# Cheat Sheet

A small **💡 lightbulb button** should be visible during quizzes.

Clicking it opens a small cheat sheet/reference panel.

The cheat sheet is for **learning/review**, not for automatically revealing the current question's answer.

It can contain:

### Major scale

```text
2 2 1 2 2 2 1
```

### Natural minor

```text
2 1 2 2 1 2 2
```

### Harmonic minor

```text
2 1 2 2 1 3 1
```

### Major-key diatonic triads

```text
1  major
2  minor
3  minor
4  major
5  major
6  minor
7  diminished
```

### Scale degrees

```text
1 = tonic
2 = supertonic
3 = mediant
4 = subdominant
5 = dominant
6 = submediant
7 = leading tone
```

The cheat sheet should **not highlight or reveal the answer to the current question**.

---

# Session System

Each session should be short.

Possible default:

```text
10 questions
```

At the end:

```text
Score: 8 / 10
80%
```

Optionally show:

```text
Notes:   4/4
Chords:  3/4
Mixed:   1/2
```

A future version can track performance over multiple sessions.

---

# Future Features

These do not need to be implemented initially.

### Weakness tracking

Track which questions the user gets wrong.

For example:

```text
E major — 7th note
A minor — 4th-degree chord
Bb major — 3rd note
```

Then show these questions more frequently.

### Spaced repetition

Questions answered incorrectly should return sooner.

Questions consistently answered correctly should appear less frequently.

### Fretboard mode

Eventually add questions such as:

> What note is on the 5th fret of the E string?

or:

> Which fret contains A on the low E string?

This would connect the theory practice to guitar/bass playing.

### Scale-shape mode

Eventually add visual fretboard questions for memorizing scale shapes.

### Seventh chords

Expand triads to:

```text
maj7
m7
m7
maj7
7
m7
ø7
```

### Ear-training mode

Eventually allow the user to hear a note/chord and identify it.

---

# First-Version Scope

Keep V1 deliberately small.

Implement only:

* Major scales
* Natural minor scales
* Scale-degree note questions
* Diatonic triad questions
* Notes / Scales / Chords / Mixed modes
* 4-answer multiple choice
* Immediate feedback
* 10-question sessions
* Score
* 💡 cheat sheet
* PWA installation
* Local/offline operation

Do **not** initially implement accounts, backend storage, synchronization, complicated statistics, or a large settings system.

The priority is making the quiz feel **fast, simple, and useful enough that it is easy to open for a 2-minute practice session**.