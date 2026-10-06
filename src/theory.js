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

// A pentatonic is a set of positions in a seven-note parent scale, so it is spelled like its parent
const SUBSETS = {
  "major pentatonic": ["major", [0, 1, 2, 4, 5]],
  "minor pentatonic": ["minor", [0, 2, 3, 4, 6]],
};

// Scale groups the user can switch on for Notes and Scales questions
export const GROUPS = [
  { id: "major-minor", label: "Major & minor", scales: ["major", "minor"] },
  { id: "pentatonic", label: "Pentatonic", scales: ["major pentatonic", "minor pentatonic"] },
];
export const DEFAULT_GROUPS = ["major-minor"];

const acc = (n) => (n > 0 ? "#" : "b").repeat(Math.abs(n));
const split = (n) => ({
  i: L.indexOf(n[0]),
  a: n.length > 1 ? (n[1] === "#" ? 1 : -1) * (n.length - 1) : 0,
});
export const pc = (n) => { const { i, a } = split(n); return mod12(NAT[i] + a); };
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

// Notes of any scale, plus the parent-scale notes a pentatonic leaves out
export function spell(root, type) {
  const sub = SUBSETS[type];
  if (!sub) return { notes: scale(root, type), left: [], pos: null };
  const parent = scale(root, sub[0]);
  return { notes: sub[1].map((i) => parent[i]), left: parent.filter((_, i) => !sub[1].includes(i)), pos: sub[1], parent };
}

// Every root-and-scale pair of the selected groups; a scale is asked on the roots of its parent type
const pairs = (groups) => GROUPS.filter((g) => groups.includes(g.id)).flatMap((g) => g.scales)
  .flatMap((type) => KEYS.filter(([, t]) => t === (SUBSETS[type]?.[0] ?? type)).map(([r]) => [r, type]));

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

// The usual key name for a pitch class (Ab major, but G# minor), taken from KEYS
export const keyName = (p, type) => KEYS.find(([r, t]) => t === type && pc(r) === mod12(p))[0];

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
export const STRINGS = {
  guitar: [["low E", "E"], ["A", "A"], ["D", "D"], ["G", "G"], ["B", "B"], ["high E", "E"]],
  bass: [["E", "E"], ["A", "A"], ["D", "D"], ["G", "G"]],
};
// The same open strings as MIDI notes, lowest first
export const TUNING = { guitar: [40, 45, 50, 55, 59, 64], bass: [28, 33, 38, 43] };
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
// `groups` are the selected scale group ids; Chords and Relatives always use major and minor keys.
export function makeQuestion(mode, spec, groups = DEFAULT_GROUPS) {
  const kind = spec ? spec.kind : mode === "mixed" ? pick(["notes", "scales", "chords", "relatives"]) : mode;
  if (kind === "guitar" || kind === "bass") return fretQuestion(kind, spec);

  const [root, type] = spec ? [spec.root, spec.type] : pick(kind === "notes" || kind === "scales" ? pairs(groups) : KEYS);
  const key = `${root} ${type}`;
  const { notes: sc, left, pos, parent } = spell(root, type);
  const sp = { kind, root, type };

  if (kind === "relatives") {
    // The relative key is read off the scale: 6th note of a major key, 3rd note of a minor key
    const to = type === "major" ? "minor" : "major";
    const ans = `${sc[type === "major" ? 5 : 2]} ${to}`;
    // Parallel key, two other degrees of the same scale, and a semitone neighbour of the answer
    const semis = type === "major" ? [0, 4, 7, 9 + pick([-1, 1])] : [0, 8, 7, 3 + pick([-1, 1])];
    const wrong = semis.map((d) => `${keyName(pc(root) + d, to)} ${to}`);
    return { ...build(kind, `What is the relative ${to} of ${key}?`, ans, shuffle(wrong)), spec: sp };
  }

  if (kind === "notes") {
    const k = spec?.k ?? rnd(sc.length);
    const ans = sc[k];
    const others = shuffle(sc.filter((_, i) => i !== k));
    // A pentatonic also offers one of the parent-scale notes it leaves out
    const wrong = pos ? [nudge(ans), pick(left), ...others.slice(0, 2)] : [nudge(ans), ...others.slice(0, 3)];
    return { ...build(kind, `What is the ${ord(k + 1)} note of ${key}?`, ans, shuffle(wrong)), spec: { ...sp, k } };
  }

  if (kind === "scales") {
    const ans = sc.join(" ");
    const rest = sc.map((_, i) => i).slice(1); // the root is never altered
    const nudged = (n) => {
      const s = [...sc];
      for (const k of shuffle(rest).slice(0, n)) s[k] = nudge(s[k]);
      return s.join(" ");
    };
    // Pentatonic: swap one note for a left-out parent note, keeping the notes in ascending order
    const swapped = () => {
      const out = pick(pos.slice(1)), into = pick(parent.map((_, i) => i).filter((i) => !pos.includes(i)));
      return pos.map((i) => (i === out ? into : i)).sort((a, b) => a - b).map((i) => parent[i]).join(" ");
    };
    const bad = () => (pos ? (Math.random() < 0.5 ? swapped() : nudged(1)) : nudged(Math.random() < 0.4 ? 2 : 1));
    const ds = new Set(pos ? [swapped()] : []);
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
