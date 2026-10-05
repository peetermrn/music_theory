# Tasks

## 1. Home section and page title

- [x] 1.1 In `src/App.jsx`, replace the lone Ear training card with a section that reuses the existing `.section`, `.heading` and `.modes` markup: heading "Ear training", one card "Interval training" with the description "Which interval two notes form" and no ⚡ Speed button; remove the `.mode.wide` rules from `src/styles.css`; verify in `npm run dev` at 360 px wide that the heading looks the same as "Keys" and "Memorize the fretboard", that the card has no speed entry, and that the seven existing mode cards are unchanged
- [x] 1.2 Change the page title in `src/Ear.jsx` to "Interval training"; verify that tapping the card opens a page with that title, that back returns to the home screen, and that a previously stored Custom selection and sound choice are still applied
- [x] 1.3 In the "How it works" overlay, list "Interval training" with its description under an "Ear training" heading the way modes are listed under "Keys", and word the explanation below it as interval training; verify that the entry name is not broken across lines awkwardly on a 360 px screen and that the credits are still shown

## 2. Check

- [x] 2.1 Run `openspec validate --all --strict` and `npm run build`, then in `npm run dev` play one Interval training level and one normal session of an existing mode to confirm both behave as before
