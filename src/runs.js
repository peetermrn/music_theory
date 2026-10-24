// Scale runs: a position of a key played from its lowest note to its highest and back, followed note
// by note, and the map of every key and position that clean runs fill in. Pure functions; Runs.jsx
// runs them.
import { KEYS, TUNING } from "./theory.js";
import { keyMap, position } from "./shapes.js";

const GUITAR = TUNING.guitar;
export const POSITIONS = 5;
const DUE = 7; // days after its last clean run from memory that a known cell is due again
const STORE = "scale-runs";
export const REFRESH = 10; // most runs in a refresh

// Every cell of the map, majors then minors in the home screen's key order, positions 1 to 5 within a key
export const cellId = (root, type, k) => `${root} ${type}/${k + 1}`;
export const CELLS = KEYS.flatMap(([root, type]) =>
  [...Array(POSITIONS).keys()].map((k) => ({ root, type, k, id: cellId(root, type, k) })));
const IDS = new Set(CELLS.map((c) => c.id));

// The steps of a run, each a pitch with the string and fret it is played at: the five-position shape
// of the key, the same one the Visuals page draws, in order of pitch, up and back down. No pitch is
// in a shape twice, so the pitch alone says which step was played.
export function runNotes(root, type, k) {
  const up = position(root, type, false, "five", k, GUITAR)
    .flatMap((frets, s) => frets.map((f) => ({ midi: GUITAR[s] + f, s, f })))
    .sort((a, b) => a.midi - b.midi);
  return [...up, ...up.slice(0, -1).reverse()];
}
// The step played at the turn; after it the run goes down
export const top = (run) => (run.length - 1) / 2;

// Following a run: `i` steps played, mistakes so far, and the last wrong note, to name it
export const begin = () => ({ i: 0, mistakes: 0, wrong: null });
export function follow(run, st, midi) {
  if (st.i >= run.length) return st;
  if (midi === run[st.i].midi) return { ...st, i: st.i + 1, wrong: null };
  if (st.i > 0 && midi === run[st.i - 1].midi) return st; // the note just counted, plucked or heard again
  return { ...st, mistakes: st.mistakes + 1, wrong: midi };
}

// What a run says about a wrong note: the right name in another octave says which way to go; with
// `cue`, any other note also names the note the position starts on. Names are spelled by the key.
export function mistake(cell, next, wrong, { cue = false } = {}) {
  const name = (m) => keyMap(cell.root, cell.type, false).byPc[m % 12].name;
  const n = name(wrong);
  if (wrong % 12 === next % 12) return wrong > next ? `${n} is too high: play a lower ${n}` : `${n} is too low: play a higher ${n}`;
  if (!cue) return `${n} is not next`;
  return `${n} is not next. Position ${cell.k + 1} starts on ${name(runNotes(cell.root, cell.type, cell.k)[0].midi)}`;
}

// Days are local dates written YYYY-MM-DD
export const today = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const days = (from, to) => (Date.parse(to) - Date.parse(from)) / 86400000;

// A cell is stored as { state: "seen" | "known", day } and is not started when missing. Due is not
// stored: it is a known cell whose day is more than a week old.
export function stateOf(cell, day) {
  if (!cell) return "new";
  return cell.state === "known" && days(cell.day, day) > DUE ? "due" : cell.state;
}

// A cell after a run. `memory`: the run started from memory; `clean`: no mistakes and no Show me.
export function settle(cell, { memory, clean }, day) {
  if (memory && clean) return { state: "known", day };
  if (memory && cell?.state === "known") return { state: "seen" };
  if (!memory && clean && !cell) return { state: "seen" };
  return cell;
}

// The run Next run starts: due cells, the longest due first; then seen cells; then cells not
// started; then known cells, the oldest first
export function suggest(store, day) {
  const by = (s) => CELLS.filter((c) => stateOf(store[c.id], day) === s);
  const oldest = (cells) => [...cells].sort((a, b) => store[a.id].day.localeCompare(store[b.id].day))[0];
  return oldest(by("due")) ?? by("seen")[0] ?? by("new")[0] ?? oldest(by("known"));
}

// A refresh: the known and due cells, in a random order, at most REFRESH of them. Shuffled by
// Fisher–Yates, so every order is equally likely.
export const refreshable = (store, day) => CELLS.filter((c) => ["known", "due"].includes(stateOf(store[c.id], day)));
export function refreshSet(store, day) {
  const cells = refreshable(store, day);
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return cells.slice(0, REFRESH);
}

// The map on the device. Anything unreadable gives an empty map, and a failed write is ignored.
export function readRuns() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE) || "{}");
    const store = {};
    for (const [id, c] of Object.entries(raw && typeof raw === "object" ? raw : {})) {
      if (!IDS.has(id) || !c) continue;
      if (c.state === "seen") store[id] = { state: "seen" };
      else if (c.state === "known" && /^\d{4}-\d{2}-\d{2}$/.test(c.day)) store[id] = { state: "known", day: c.day };
    }
    return store;
  } catch { return {}; }
}
export function writeRuns(store) {
  try { localStorage.setItem(STORE, JSON.stringify(store)); } catch { /* ignore */ }
}
