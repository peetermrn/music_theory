// Notes are spelled properly (Bb, not A#) by walking letter names,
// while intervals are semitone positions.
const L = ["C", "D", "E", "F", "G", "A", "B"];
const NAT = [0, 2, 4, 5, 7, 9, 11];
const mod12 = (x) => ((x % 12) + 12) % 12;

export const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  harmonic: [0, 2, 3, 5, 7, 8, 11], // reserved for a later version
};

export const KEYS = [
  ...["C", "G", "D", "A", "E", "B", "F#", "Db", "Ab", "Eb", "Bb", "F"].map((r) => [r, "major"]),
  ...["A", "E", "B", "F#", "C#", "G#", "Eb", "Bb", "F", "C", "G", "D"].map((r) => [r, "minor"]),
];

const acc = (n) => (n > 0 ? "#" : "b").repeat(Math.abs(n));
const split = (n) => ({
  i: L.indexOf(n[0]),
  a: n.length > 1 ? (n[1] === "#" ? 1 : -1) * (n.length - 1) : 0,
});
const pc = (n) => { const { i, a } = split(n); return mod12(NAT[i] + a); };
const shift = (n, d) => { const { i, a } = split(n); return L[i] + acc(a + d); };
// Move a note one semitone without piling up double accidentals
const nudge = (n) => { const a = split(n).a; return shift(n, a > 0 ? -1 : a < 0 ? 1 : pick([-1, 1])); };

export function scale(root, type) {
  const { i } = split(root), p = pc(root);
  return SCALES[type].map((iv, k) => {
    const j = (i + k) % 7;
    let d = mod12(p + iv - NAT[j]);
    if (d > 6) d -= 12;
    return L[j] + acc(d);
  });
}

// Triad quality is calculated from the scale's own intervals
export function triads(root, type) {
  const iv = SCALES[type];
  return scale(root, type).map((n, k) => {
    const t = mod12(iv[(k + 2) % 7] - iv[k]);
    const f = mod12(iv[(k + 4) % 7] - iv[k]);
    const quality = t === 4 ? (f === 7 ? "major" : "augmented") : f === 7 ? "minor" : "diminished";
    return { root: n, quality, name: `${n} ${quality}` };
  });
}

const pick = (a) => a[Math.floor(Math.random() * a.length)];
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
const ord = (n) => n + ["th", "st", "nd", "rd"][n > 3 ? 0 : n];

const build = (kind, prompt, answer, distractors) => ({
  kind,
  prompt,
  answer,
  options: shuffle([answer, ...[...new Set(distractors)].filter((x) => x !== answer).slice(0, 3)]),
});

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const STRINGS = {
  guitar: [["low E", "E"], ["A", "A"], ["D", "D"], ["G", "G"], ["B", "B"], ["high E", "E"]],
  bass: [["E", "E"], ["A", "A"], ["D", "D"], ["G", "G"]],
};
const rnd = (n) => Math.floor(Math.random() * n);
const fretNote = (open, f) => NOTES[(NOTES.indexOf(open) + f) % 12];

function fretQuestion(kind, spec) {
  const strings = STRINGS[kind];
  const dir = spec?.dir || pick(["note", "fret"]);
  const str = spec?.str ?? rnd(strings.length);
  const fret = spec?.fret ?? (dir === "note" ? rnd(13) : 1 + rnd(11)); // note->fret skips 0/12 (ambiguous)
  const [name, open] = strings[str];
  const sp = { kind, dir, str, fret };

  if (dir === "note") {
    const ans = fretNote(open, fret);
    const p = NOTES.indexOf(ans);
    const near = [1, -1, 2, -2, 3, -3].map((d) => NOTES[mod12(p + d)]);
    const prompt = fret === 0
      ? `What note is on the open ${name} string?`
      : `What note is on the ${ord(fret)} fret of the ${name} string?`;
    return { ...build(kind, prompt, ans, shuffle(near)), spec: sp };
  }
  const target = fretNote(open, fret);
  const label = (f) => `${ord(f)} fret`;
  const cand = [...Array(12)].map((_, i) => i + 1).filter((f) => f !== fret)
    .map((f) => [Math.abs(f - fret) + Math.random(), f]).sort((a, b) => a[0] - b[0]).slice(0, 5).map((x) => x[1]);
  const q = build(kind, `Where is ${target} on the ${name} string?`, label(fret), shuffle(cand).map(label));
  q.options.sort((a, b) => parseInt(a) - parseInt(b));
  return { ...q, spec: sp };
}

// `spec` (returned on every question) lets Review mistakes rebuild the same
// underlying question with freshly shuffled answer choices.
export function makeQuestion(mode, spec) {
  const kind = spec ? spec.kind : mode === "mixed" ? pick(["notes", "scales", "chords"]) : mode;
  if (kind === "guitar" || kind === "bass") return fretQuestion(kind, spec);

  const keyIdx = spec?.key ?? rnd(KEYS.length);
  const [root, type] = KEYS[keyIdx];
  const key = `${root} ${type}`;
  const sc = scale(root, type);
  const sp = { kind, key: keyIdx };

  if (kind === "notes") {
    const k = spec?.k ?? rnd(7);
    const ans = sc[k];
    const others = shuffle(sc.filter((_, i) => i !== k));
    return { ...build(kind, `What is the ${ord(k + 1)} note of ${key}?`, ans, shuffle([nudge(ans), ...others.slice(0, 3)])), spec: { ...sp, k } };
  }

  if (kind === "scales") {
    const ans = sc.join(" ");
    const bad = () => {
      const s = [...sc];
      for (const k of shuffle([1, 2, 3, 4, 5, 6]).slice(0, Math.random() < 0.4 ? 2 : 1)) s[k] = nudge(s[k]);
      return s.join(" ");
    };
    const ds = new Set();
    while (ds.size < 3) { const b = bad(); if (b !== ans) ds.add(b); }
    return { ...build(kind, `Which set of notes is the ${key} scale?`, ans, [...ds]), spec: sp };
  }

  const ts = triads(root, type);
  const k = spec?.k ?? rnd(7);
  const c = ts[k];
  const sameRoot = shuffle(["major", "minor", "diminished"].filter((q) => q !== c.quality)).slice(0, 1).map((q) => `${c.root} ${q}`);
  const others = shuffle(ts.filter((_, i) => i !== k).map((t) => t.name));
  return { ...build("chords", `What chord is built on the ${ord(k + 1)} degree of ${key}?`, c.name, [...sameRoot, ...others]), spec: { ...sp, k } };
}
