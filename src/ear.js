// Ear training: interval data, levels and the question generator.
// Intervals are plain semitone counts; nothing here depends on theory.js.

export const INTERVALS = [
  { semis: 1, name: "Minor 2nd", desc: "tense, clashing; the smallest step" },
  { semis: 2, name: "Major 2nd", desc: "a plain step, like the start of a scale" },
  { semis: 3, name: "Minor 3rd", desc: "dark, sad" },
  { semis: 4, name: "Major 3rd", desc: "bright, happy" },
  { semis: 5, name: "Perfect 4th", desc: "open and strong, wants to settle" },
  { semis: 6, name: "Tritone", desc: "restless, unstable" },
  { semis: 7, name: "Perfect 5th", desc: "hollow, solid, at rest" },
  { semis: 8, name: "Minor 6th", desc: "wide and bittersweet" },
  { semis: 9, name: "Major 6th", desc: "wide and warm" },
  { semis: 10, name: "Minor 7th", desc: "bluesy, unresolved" },
  { semis: 11, name: "Major 7th", desc: "sharp, straining towards the octave" },
  { semis: 12, name: "Octave", desc: "the same note, higher" },
];
export const INTERVAL_NAME = Object.fromEntries(INTERVALS.map((i) => [i.semis, i.name]));

// What each level adds to the one before it
const ADDS = [[4, 12], [7], [3, 5], [1, 2], [8, 9], [6, 10, 11]];
export const EAR_LEVELS = ADDS.map((_, i) => ADDS.slice(0, i + 1).flat().sort((a, b) => a - b));
export const levelAdds = (level) => ADDS[level];

export const EAR_TOTAL = 10; // questions per ear session
const LOW = 48, SPAN = 13; // the lower note is C3 to C4, so the higher one never passes C5

const pick = (a) => a[Math.floor(Math.random() * a.length)];

// One question asking for an interval out of `semis`; choices are every interval of `semis`, smallest first.
export function earQuestion(semis) {
  const sorted = [...semis].sort((a, b) => a - b);
  const interval = pick(sorted);
  const low = LOW + Math.floor(Math.random() * SPAN);
  return {
    kind: "ear",
    prompt: "Which interval is this?",
    answer: INTERVAL_NAME[interval],
    options: sorted.map((s) => INTERVAL_NAME[s]),
    notes: [low, low + interval],
    id: `${low}:${interval}`,
  };
}
