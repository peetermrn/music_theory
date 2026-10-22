// Scale shapes on the neck: the notes of a key with their names and degrees, and the frets of each
// position. Pure functions, shared by the Visuals page and Scale runs.
import { SCALES, pc, spell } from "./theory.js";

const mod12 = (x) => ((x % 12) + 12) % 12;
// Names for notes outside the scale only; scale notes are always spelled by their key
const SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
export const scaleName = (type, penta) => (penta ? `${type} pentatonic` : type);

// What the circle, the readout and the fretboard all read: the seven notes of the key, which of
// them the scale uses, and every pitch class with its name, degree (0 outside the key) and role.
export function keyMap(root, type, penta) {
  const s = spell(root, scaleName(type, penta));
  const parent = s.parent ?? s.notes;
  const open = s.pos ?? parent.map((_, i) => i);
  const names = parent.some((n) => n.includes("b")) ? FLAT : SHARP;
  const byPc = names.map((name) => ({ name, degree: 0, on: false, root: false }));
  parent.forEach((name, i) => { byPc[pc(name)] = { name, degree: i + 1, on: open.includes(i), root: i === 0 }; });
  return { parent, open, byPc };
}

// A run of ascending scale notes from degree index `k`, `n` to a string from the lowest string up,
// in the lowest octave where no note falls below its string's nut
function lay(rootPc, ivs, k, n, tuning) {
  for (let base = tuning[0] + mod12(rootPc - tuning[0]) - 12; ; base += 12) {
    const pitches = [...Array(n * tuning.length)].map((_, i) => base + ivs[(k + i) % ivs.length] + 12 * Math.floor((k + i) / ivs.length));
    const frets = tuning.map((o, s) => pitches.slice(s * n, s * n + n).map((p) => p - o));
    if (frets.every((f) => f.every((x) => x >= 0))) return { pitches, frets };
  }
}

// The frets of position `k` (0-based) on each string, lowest string first
export function position(root, type, penta, system, k, tuning) {
  const rp = pc(root), ivs = SCALES[type];
  if (system === "three" && !penta) return lay(rp, ivs, k, 3, tuning).frets;
  const { pitches, frets } = lay(rp, spell(root, scaleName(type, true)).pos.map((i) => ivs[i]), k, 2, tuning);
  if (penta) return frets;
  // A seven-note position is the pentatonic box plus the scale's other two notes wherever they fall
  // between its lowest and highest note: inside its fret span, else one fret out, the lower fret on a tie
  const all = frets.flat(), lo = Math.min(...all), hi = Math.max(...all);
  for (let p = pitches[0]; p <= pitches.at(-1); p++) {
    if (!ivs.includes(mod12(p - rp)) || pitches.includes(p)) continue;
    const [, f, s] = tuning.map((o, i) => [Math.max(lo - (p - o), p - o - hi, 0), p - o, i])
      .filter((c) => c[1] >= 0).sort((a, b) => a[0] - b[0] || a[1] - b[1])[0];
    frets[s].push(f);
  }
  return frets.map((f) => f.sort((a, b) => a - b));
}
