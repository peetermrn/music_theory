# Tasks

## 1. Fix odd-note generation

- [x] 1.1 In `src/theory.js`, change the Key Notes branch to pick the odd note from the key's semitone neighbours after removing any whose pitch is in the key and any spelled B#, E#, Cb or Fb; verify with a one-off Node script that 20,000 generated Key Notes questions contain 0 odd notes whose pitch is in the key and 0 spelled B#, E#, Cb or Fb
- [x] 1.2 Confirm every one of the 24 keys yields at least one valid odd note; verify by looping over all keys in the same script with no error or empty result
- [x] 1.3 Confirm a replayed question keeps its odd note; verify that generating a Key Notes question from a stored spec returns the same answer

## 2. Integration check

- [x] 2.1 Run `npm run build` and play a Key Notes session in `npm run dev`, including one Review mistakes round; verify the build succeeds and every question has exactly one note outside the key
