// Play on guitar: questions answered by playing one note on a guitar, and the listener that turns
// microphone frames into "a note was played" events. Pure functions; Play.jsx runs them.
import { KEYS, STRINGS, TUNING, scale, pc, ord } from "./theory.js";
import { detect, midiOf, noteName, letter } from "./pitch.js";

const GUITAR = TUNING.guitar;
const FRETS = 12;
const BACK_LOW = 40, BACK_HIGH = 72; // Play it back notes run from E2 to C5, the guitar recordings' range
const SHARP = [...Array(12)].map((_, p) => letter(p).split("/")[0]); // fretboard questions name notes with sharps
const rnd = (n) => Math.floor(Math.random() * n);

// A question: `prompt`, `key` (no two in a session are the same), `name` (the answer as shown),
// `check(midi)` (true, false, or { octave } for the right note in the wrong octave),
// `heard(midi)` (how a wrong answer is named), `search(midi)` (how a searched note is named, if it is),
// and for a fretboard diagram `pc` and `shape`
export const KINDS = {
  keys() {
    const [root, type] = KEYS[rnd(KEYS.length)], k = rnd(7);
    const note = scale(root, type)[k];
    return {
      prompt: `Play the ${ord(k + 1)} note of ${root} ${type}`, key: `${root} ${type}:${k}`, name: note,
      check: (m) => m % 12 === pc(note), heard: letter, // any octave counts
    };
  },
  fretboard() {
    const s = rnd(GUITAR.length), p = rnd(12), open = GUITAR[s];
    const frets = [...Array(FRETS + 1).keys()].filter((f) => (open + f) % 12 === p); // the open string's note is also at fret 12
    return {
      prompt: `Play ${SHARP[p]} on the ${STRINGS.guitar[s][0]} string`, key: `${s}:${p}`, name: SHARP[p],
      check: (m) => frets.includes(m - open), heard: noteName,
      pc: p, shape: GUITAR.map((_, i) => (i === s ? frets : [])),
    };
  },
  back() {
    const target = BACK_LOW + rnd(BACK_HIGH - BACK_LOW + 1);
    return {
      prompt: "Play back the note you hear", key: String(target), name: noteName(target), target,
      check: (m) => m === target || (m % 12 === target % 12 && { octave: Math.round((m - target) / 12) }),
      heard: noteName, search: noteName, // the target's name is unknown, so naming searched notes gives nothing away
      pc: target % 12, shape: GUITAR.map((o) => (target - o >= 0 && target - o <= FRETS ? [target - o] : [])),
    };
  },
};

// What the Show me fretboard reads: only the answer's note is marked
export const showMap = (q) => ({
  byPc: SHARP.map((name, p) => ({ name, degree: 0, on: p === q.pc, root: p === q.pc })), // drawn in the root colour to stand out
});

// Listening: a note counts once it is held steadily, and only once until it stops or is played again
const RANGE = [70, 700]; // E2 to the 12th fret of the high E string, with a margin
const STEADY = 3;        // analyses within half a semitone of each other before a note counts
const SILENCE = 150;     // milliseconds without a note before the same note can count again
// A pluck is found from its click: a jump in the sharp, high part of the sound over a few milliseconds,
// which a ringing string does not make. A rise in overall level also counts, for soft plucks.
const SLICE = 512;       // samples per slice the click is looked for in (about 10 ms)
const CLICK = 6;         // a slice with this many times the high-frequency energy of the quietest recent slice...
const BEFORE = 8;        // ...among this many before it is a click
const ATTACK = 1.5;      // a rise in level to this factor over the lowest of the last few analyses is also a pluck
const REPLUCK = 250;     // no new pluck within this many milliseconds of the last; a human double pluck takes longer
const FLOOR = 0.001;     // a quieter level (-60 dBFS) is silence, not a pluck

// Calls onNote(midi) for each note played, once per pluck. A note still sounding when the question
// changes is not played again, so it does not count on the next question. `mute(until)` ignores the
// app's own sound.
export function listener(onNote) {
  let recent = [], held = null, quiet = null, levels = [], slices = [], last = null, plucked = -Infinity, muted = 0;
  return {
    hear(buf, rate, t) {
      let power = 0;
      for (let i = 0; i < buf.length; i++) power += buf[i] * buf[i];
      const rms = Math.sqrt(power / buf.length);
      // the samples that are new since the last analysis, slice by slice
      const fresh = last === null ? buf.length : Math.min(buf.length, Math.round(((t - last) / 1000) * rate));
      last = t;
      let click = false;
      for (let start = Math.max(0, buf.length - Math.ceil(fresh / SLICE) * SLICE); start + SLICE <= buf.length; start += SLICE) {
        let sharp = 0;
        for (let i = Math.max(1, start); i < start + SLICE; i++) { const d = buf[i] - buf[i - 1]; sharp += d * d; }
        if (slices.length === BEFORE && sharp > Math.min(...slices) * CLICK) click = true;
        slices = [...slices, sharp].slice(-BEFORE);
      }
      const attack = rms > FLOOR && (click || rms > Math.min(...levels) * ATTACK) && t - plucked >= REPLUCK;
      levels = [...levels, rms].slice(-4);
      if (t < muted) { recent = []; held = null; return; }
      // a new pluck: the same note counts again, once it has settled
      if (attack) { held = null; recent = []; plucked = t; }
      const hz = detect(buf, rate, RANGE, true);
      if (!hz) {
        recent = [];
        quiet ??= t;
        if (t - quiet >= SILENCE) held = null;
        return;
      }
      quiet = null;
      recent = [...recent, midiOf(hz)].slice(-STEADY);
      if (recent.length < STEADY || Math.max(...recent) - Math.min(...recent) > 0.5) return;
      const note = Math.round(recent[STEADY - 1]);
      if (note === held) return;
      held = note;
      onNote(note);
    },
    mute(until) { muted = until; },
  };
}
