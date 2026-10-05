# Tasks

## 1. Scale data

- [ ] 1.1 In `src/theory.js`, define the pentatonic scales as position subsets of their parent scale and the two scale groups as data (id, chip label, scales, roots), as in design.md; verify in the browser console that A minor pentatonic is A C D E G, Bb major pentatonic is Bb C D F G and F# major pentatonic is F# G# A# C# D#
- [ ] 1.2 Give `makeQuestion` the selected groups as an argument and draw the key evenly from all root-and-scale pairs of those groups; change `spec` to store root and scale id; verify with the default groups that 200 generated Notes, Scales and Chords questions only use major and natural minor keys, and that Review mistakes still repeats the same questions
- [ ] 1.3 Make Chords and Relatives ignore the selected groups; verify with only `pentatonic` selected that 100 Chords and 100 Relatives questions are all about major or natural minor keys

## 2. Pentatonic questions

- [ ] 2.1 Notes: ask positions 1st–5th for a pentatonic, name the scale in full in the prompt, and build distractors from other scale notes, one left-out parent note and a semitone neighbour; verify "What is the 3rd note of A minor pentatonic?" answers D and that 200 pentatonic Notes questions each have four distinct choices
- [ ] 2.2 Scales: build pentatonic distractors by replacing one note with a left-out parent note or moving one note a semitone, keeping the root first and the notes ascending; verify over 200 questions that every choice has five notes starting on the root, all four choices are distinct, and at least some distractors contain a left-out parent note
- [ ] 2.3 Verify Mixed with both groups selected produces pentatonic Notes and Scales questions and only major or natural minor Chords and Relatives questions

## 3. Chips and storage

- [ ] 3.1 In `src/App.jsx`, add the selection state with guarded read/write of `theory-quiz.scales` and pass it to every `makeQuestion` call; verify the selection survives a reload and that with site storage blocked the app starts with only "Major & minor" on and plays without errors
- [ ] 3.2 Add the "Scales" chip row at the top of the "Keys" section, with toggling that never switches the last chip off; verify the three toggling scenarios in `specs/scale-selection/spec.md` by tapping, and that each mode still starts in one tap
- [ ] 3.3 Style the chips in `src/styles.css` so on and off are clearly different and each chip is tap-sized; verify at phone width there is no horizontal scrolling
- [ ] 3.4 Key the best score of Notes, Scales and Mixed by selection as in design.md, keeping today's keys for the default selection; verify an existing Notes best is still shown by default, disappears when only "Pentatonic" is on, returns when switching back, and that Chords, Relatives, Guitar and Bass bests never change with the chips

## 4. Cheat sheet

- [ ] 4.1 Add major and minor pentatonic entries to `CheatSheet` in `src/App.jsx` with their step patterns and left-out notes; verify they are shown with only "Major & minor" selected

## 5. Integration

- [ ] 5.1 Run `npm run build` and, in `npm run dev`, play Notes and Scales sessions with only "Pentatonic" on, a Notes speed game to game over with both chips on, and a Mixed session with both chips on, including one Review mistakes round; verify the build succeeds and play matches the specs
