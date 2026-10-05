// Ear training: the exercises, each described as data plus a question generator.
// Pitches are MIDI numbers and semitone counts. Only degree training uses theory.js, for keys and note names.
// Ear.jsx runs any exercise from its description:
//   items      answer choices in display order: { id, name, sheet (cheat-sheet column), desc }
//   levels     arrays of item ids, or { variant, ids } when the exercise has variants
//   variants   optional [id, label] pairs, such as major and minor keys; a session is in one of them
//   question   (ids, variant) -> { answer, key, ... }; `key` is what repeat avoidance compares
//   controls   the sound buttons; the first one is what a new question plays by itself
//   preview    (q, id) -> steps played when a choice is tapped after answering
//   demo       (id, variant) -> steps played from a cheat-sheet row
//   explain    optional (q) -> a sentence added to the feedback
// prompt, sheetTitle and an item's sheet and desc may be functions of the variant.
// Steps are what audio.js plays in order: a note, an array of notes that start together, or null for a rest.

import { KEYS, SCALES, scale, pc } from "./theory.js";

export const EAR_TOTAL = 10; // questions per ear session
const LOW = 48, SPAN = 13;   // roots run from C3 to C4, so nothing passes C5, the top recording
const MIDDLE_C = 60;         // cheat sheets always play from here, never from the question's root

const pick = (a) => a[Math.floor(Math.random() * a.length)];
const root = () => LOW + Math.floor(Math.random() * SPAN);
// Levels given as what each one adds to the level before it
const grow = (adds) => adds.map((_, i) => adds.slice(0, i + 1).flat());

const INTERVALS = [
  { id: 1, name: "Minor 2nd", desc: "tense, clashing; the smallest step" },
  { id: 2, name: "Major 2nd", desc: "a plain step, like the start of a scale" },
  { id: 3, name: "Minor 3rd", desc: "dark, sad" },
  { id: 4, name: "Major 3rd", desc: "bright, happy" },
  { id: 5, name: "Perfect 4th", desc: "open and strong, wants to settle" },
  { id: 6, name: "Tritone", desc: "restless, unstable" },
  { id: 7, name: "Perfect 5th", desc: "hollow, solid, at rest" },
  { id: 8, name: "Minor 6th", desc: "wide and bittersweet" },
  { id: 9, name: "Major 6th", desc: "wide and warm" },
  { id: 10, name: "Minor 7th", desc: "bluesy, unresolved" },
  { id: 11, name: "Major 7th", desc: "sharp, straining towards the octave" },
  { id: 12, name: "Octave", desc: "the same note, higher" },
].map((i) => ({ ...i, sheet: i.id })); // an interval's id is its size in semitones

const intervals = {
  id: "intervals",
  title: "Interval training",
  desc: "Which interval two notes form",
  intro: "Two notes are played. Name the interval between them.",
  prompt: "Which interval is this?",
  sheetTitle: "Intervals",
  noun: "intervals",
  items: INTERVALS,
  levels: grow([[4, 12], [7], [3, 5], [1, 2], [8, 9], [6, 10, 11]]),
  customKey: "theory-quiz.ear-custom",
  customDefault: [3, 4],
  gap: 0.6,
  question(ids) {
    const semis = pick(ids), low = root();
    return { answer: semis, root: low, notes: [low, low + semis], key: `${low}:${semis}` };
  },
  controls: [
    { label: "▶ Play both", wide: true, steps: (q) => q.notes },
    { label: "1st note", steps: (q) => [q.notes[0]] },
    { label: "2nd note", steps: (q) => [q.notes[1]] },
  ],
  preview: (q, id) => [q.root, q.root + id],
  demo: (id) => [MIDDLE_C, MIDDLE_C + id],
};

// Chord types as semitones above the root, in root position
const CHORDS = [
  { id: "maj", name: "Major", semis: [0, 4, 7], sheet: "1 3 5", desc: "bright, settled" },
  { id: "min", name: "Minor", semis: [0, 3, 7], sheet: "1 ♭3 5", desc: "dark, sad" },
  { id: "dim", name: "Diminished", semis: [0, 3, 6], sheet: "1 ♭3 ♭5", desc: "tense, cramped" },
  { id: "aug", name: "Augmented", semis: [0, 4, 8], sheet: "1 3 ♯5", desc: "dreamy, unsettled" },
  { id: "dom7", name: "Dominant 7th", semis: [0, 4, 7, 10], sheet: "1 3 5 ♭7", desc: "bluesy, wants to move on" },
  { id: "maj7", name: "Major 7th", semis: [0, 4, 7, 11], sheet: "1 3 5 7", desc: "soft, jazzy, a little bittersweet" },
  { id: "min7", name: "Minor 7th", semis: [0, 3, 7, 10], sheet: "1 ♭3 5 ♭7", desc: "mellow, smooth" },
  { id: "m7b5", name: "Half-diminished", semis: [0, 3, 6, 10], sheet: "1 ♭3 ♭5 ♭7", desc: "dark and unresolved" },
  { id: "dim7", name: "Diminished 7th", semis: [0, 3, 6, 9], sheet: "1 ♭3 ♭5 ♭♭7", desc: "dramatic, tense all over" },
];
const chordNotes = (low, id) => CHORDS.find((c) => c.id === id).semis.map((s) => low + s);
const arpeggio = (notes) => [...notes, notes]; // one by one from the root up, then together

const chords = {
  id: "chords",
  title: "Chord training",
  desc: "Which kind of chord you hear",
  intro: "A chord is played, one note at a time and then together. Name its type.",
  prompt: "Which chord is this?",
  sheetTitle: "Chords",
  noun: "chord types",
  items: CHORDS,
  levels: grow([["maj", "min"], ["dim"], ["aug"], ["dom7", "maj7", "min7"], ["m7b5", "dim7"]]),
  customKey: "theory-quiz.ear-chords-custom",
  customDefault: ["maj", "min"],
  gap: 0.4,
  question(ids) {
    const type = pick(ids), low = root();
    return { answer: type, root: low, notes: chordNotes(low, type), key: `${low}:${type}` };
  },
  controls: [
    { label: "▶ Play again", wide: true, steps: (q) => arpeggio(q.notes) },
    { label: "One by one", steps: (q) => q.notes },
    { label: "Together", steps: (q) => [q.notes] },
  ],
  preview: (q, id) => arpeggio(chordNotes(q.root, id)),
  demo: (id) => arpeggio(chordNotes(MIDDLE_C, id)),
};

// Degree training: chords set a key, then one note of its scale is asked.
// The key is set by its 1st, 4th, 5th and 1st chords, as semitones from the tonic, voiced to move little.
const PROGRESSION = {
  major: [[0, 4, 7], [0, 5, 9], [-1, 2, 7], [0, 4, 7]],
  minor: [[0, 3, 7], [0, 5, 8], [-2, 2, 7], [0, 3, 7]], // natural minor: the 5th chord is minor too
};
const TONIC_LOW = 50; // tonics run from D3 to C#4, which keeps every chord and note within the recordings
const ORDINAL = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th"];
const FEEL = {
  major: [
    "home, fully at rest", "restless, wants to step down to the 1st", "stable and bright; makes the key major",
    "leans down to the 3rd", "stable, open, strong", "soft, leans down to the 5th", "tense, pulls up to the 1st",
  ],
  minor: [
    "home, fully at rest", "restless, wants to step down to the 1st", "stable and dark; makes the key minor",
    "heavy, wants to fall to the 3rd", "stable, open, strong", "sad, leans hard down to the 5th", "a step below home, only a mild pull",
  ],
};
const DEGREE_NAME = ["tonic", "supertonic", "mediant", "subdominant", "dominant", "submediant"];
const DEGREES = ORDINAL.map((name, i) => ({
  id: i + 1,
  name,
  sheet: (variant) => DEGREE_NAME[i] || (variant === "major" ? "leading tone" : "subtonic"),
  desc: (variant) => FEEL[variant][i],
}));
const cadence = (tonic, variant) => PROGRESSION[variant].map((chord) => chord.map((s) => tonic + s));
const degreeNote = (tonic, variant, id) => tonic + SCALES[variant][id - 1];
const whole = (chordSteps, note) => [...chordSteps, null, note]; // the key, a pause, then the note

const degrees = {
  id: "degrees",
  title: "Degree training",
  desc: "Which degree of the key you hear",
  intro: "A few chords set a key, then one note is played. Name its degree in that key.",
  prompt: (variant) => `Which degree of the ${variant} key is the last note?`,
  sheetTitle: (variant) => `Degrees of a ${variant} key`,
  noun: "degrees",
  all: "all seven",
  items: DEGREES,
  variants: [["major", "Major keys"], ["minor", "Minor keys"]],
  levels: [
    { variant: "major", ids: [1, 3, 5] },
    { variant: "major", ids: [1, 2, 3, 4, 5] },
    { variant: "major", ids: [1, 2, 3, 4, 5, 6, 7] },
    { variant: "minor", ids: [1, 2, 3, 4, 5, 6, 7] },
  ],
  customKey: "theory-quiz.ear-degrees-custom",
  customDefault: { variant: "minor", ids: [1, 3, 5] }, // the one useful drill the levels leave out
  gap: 0.6,
  question(ids, variant) {
    const degree = pick(ids);
    const [keyRoot] = pick(KEYS.filter(([, type]) => type === variant));
    const tonic = TONIC_LOW + ((pc(keyRoot) - TONIC_LOW) % 12 + 12) % 12;
    return {
      answer: degree, variant, tonic,
      chords: cadence(tonic, variant),
      note: degreeNote(tonic, variant, degree),
      keyName: `${keyRoot} ${variant}`,
      noteName: scale(keyRoot, variant)[degree - 1], // spelled as the key spells it
      key: `${keyRoot} ${variant}:${degree}`,
    };
  },
  controls: [
    { label: "▶ Play again", wide: true, steps: (q) => whole(q.chords, q.note) },
    { label: "Key", steps: (q) => q.chords },
    { label: "Note", steps: (q) => [q.note] },
  ],
  preview: (q, id) => [degreeNote(q.tonic, q.variant, id)],
  demo: (id, variant) => whole(cadence(MIDDLE_C, variant), degreeNote(MIDDLE_C, variant, id)),
  explain: (q) => `The ${ORDINAL[q.answer - 1]} of ${q.keyName} is ${q.noteName}.`,
};

export const EXERCISES = [intervals, chords, degrees];
