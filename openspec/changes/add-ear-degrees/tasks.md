# Tasks

## 1. Degree data and questions

- [ ] 1.1 Export `pc` from `src/theory.js` (no other change) and add to `src/ear.js` the degree items (1st to 7th with name and the major and minor descriptions), the two progressions as offsets from the tonic, and the four levels as `{ variant, ids }`; verify with `node -e` that the levels are major 1 3 5, major 1 2 3 4 5, major 1-7 and minor 1-7, and that `npm run build` passes
- [ ] 1.2 Add the degree question generator: a random `KEYS` entry of the variant, tonic placed between MIDI 50 and 61, steps `[chord, chord, chord, chord, null, note]`, the answer, the repeat key, and the key name and spelled note for the feedback; verify with a `node -e` loop of 500 questions per variant that every played note is between 48 and 72, the last chord is the 1st-degree chord, the note equals tonic plus the scale offset of its degree, and that F major 4th is spelled "Bb" and A minor 7th "G"

## 2. Shared screen and sound additions

- [ ] 2.1 Let a step in `play` be `null` (a rest) in `src/audio.js`; verify with `npm run build` and that interval and chord questions sound as before
- [ ] 2.2 Add optional `variants` to the exercise description and to `src/Ear.jsx`: levels as `{ variant, ids }`, a two-way switch in Custom, the variant passed to `question`, `preview` and `demo`, and the level text rule from design decision 3; add the optional `explain(q)` sentence to the feedback; verify that the Interval training and Chord training pages, their Custom selections and their feedback are unchanged

## 3. Degree training screens

- [ ] 3.1 Add the degree exercise to `EXERCISES` with its controls (Play again, Key, Note), preview, demo and Custom storage under `theory-quiz.ear-degrees-custom`; verify that the home screen shows three cards under "Ear training" with "Degree training" last and no ⚡ entry, that its page lists four levels with the texts from design decision 3, that Custom starts on minor with 1st, 3rd and 5th, that Start is disabled with one tick, and that the switch and ticks survive a reload
- [ ] 3.2 Play a Level 1 and a Level 4 session; verify that each question plays four chords, a pause and one note by itself, that the prompt says major or minor and shows no key or note name, that Key plays only the chords and Note only the note, that consecutive questions are in different keys, and that Quit silences the sound and returns to the Degree training page
- [ ] 3.3 Check feedback and comparing; verify that a wrong answer reads like "Not quite. You picked 3rd, it was 5th. The 5th of D major is A.", that flat keys are spelled with flats, that tapping two choices afterwards plays those degrees in the same key without changing the score, and that the results screen lists the degrees from 1st to 7th with correct/total
- [ ] 3.4 Check the degree cheat sheet from 💡; verify seven rows with name and description, the major descriptions in Levels 1 to 3 and the minor ones in Level 4, that a row plays the progression and note in C, that closing stops the sound, and that no key or note name of the current question is shown
- [ ] 3.5 Check the layout in the browser's device toolbar at 360 x 740; verify that a Level 3 question shows all seven choices and the three sound buttons without scrolling, and that the two-sentence feedback and Next are visible after answering
- [ ] 3.6 Tune by ear on a phone: step length, the pause before the note, and chord volume against the single note, on piano and on guitar; verify that the tonic clearly feels like home after the major progression and after the natural-minor one, and report back instead of changing the chords if the minor one does not

## 4. Help and spec purpose

- [ ] 4.1 Add degree training to the "How it works" overlay: its entry under "Ear training" and a short explanation (own page, four levels and Custom, chords set the key then one note, the answer is the degree, the key changes every question, replaying, key and note named after answering, tapping choices, no speed game or Review mistakes); verify each point is stated
- [ ] 4.2 Reword the Purpose line of `openspec/specs/cheat-sheet/spec.md` as described in design decision 7; verify with `openspec validate --specs --strict`

## 5. Integration check

- [ ] 5.1 Run `npm run build`, then in `npm run dev` play a full degree-training Level 1, Level 4 and Custom session, one on piano and one on guitar, one interval-training and one chord-training session, and one normal Notes session to confirm they are unchanged
- [ ] 5.2 Run `npm run preview`, load the app once, switch the browser to offline and confirm a degree-training session still plays on piano and on guitar
