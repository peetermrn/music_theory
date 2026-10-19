import { useState, useRef } from "react";
import { SCALES, TUNING, pc, spell, keyName } from "./theory.js";

const mod12 = (x) => ((x % 12) + 12) % 12;
// Names for notes outside the scale only; scale notes are always spelled by their key
const SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const scaleName = (type, penta) => (penta ? `${type} pentatonic` : type);

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

const SYSTEMS = [["five", "5 positions"], ["three", "3 per string"]];
const COUNT = { five: 5, three: 7 };

function Switch({ label, value, options, onChange, disabled }) {
  return (
    <div className="switch" role="group" aria-label={label}>
      {options.map(([id, text]) => (
        <button key={String(id)} className={value === id ? "on" : ""} aria-pressed={value === id} disabled={disabled} onClick={() => onChange(id)}>{text}</button>
      ))}
    </div>
  );
}

// Circle geometry, in SVG units
const C = 160, RING = 126, NOTE = 21, WINDOW = 24, NUM = 169, EDGE = 22; // EDGE: room around the band for the numbers
const at = (p, r) => [C + r * Math.sin((p * Math.PI) / 6), C - r * Math.cos((p * Math.PI) / 6)];

function Circle({ root, type, map, onRoot }) {
  const drag = useRef(null);
  const [pull, setPull] = useState(null); // degrees the stencil is dragged away from where it rested; null at rest
  const turn = pc(root);
  // The stencil is cut as a major key, so a key and its relative share one position:
  // Major / Minor leaves it where it is and moves only the root
  const anchor = mod12(turn + (type === "major" ? 0 : 3));
  // Resting angle, kept unbounded so the stencil always turns the short way round
  const spin = useRef(anchor * 30);
  const diff = mod12(anchor - spin.current / 30);
  spin.current += (diff > 6 ? diff - 12 : diff) * 30;
  const deg = pull !== null && drag.current ? drag.current.rest + pull : spin.current;

  const angle = (e) => {
    const b = e.currentTarget.getBoundingClientRect();
    return (Math.atan2(e.clientX - b.left - b.width / 2, b.top + b.height / 2 - e.clientY) * 180) / Math.PI;
  };
  const down = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const note = e.target.closest?.("[data-pc]");
    drag.current = { last: angle(e), pull: 0, turn, rest: spin.current, moved: false, tap: note ? Number(note.dataset.pc) : null };
  };
  // The stencil follows the finger, and the key changes each time it passes a semitone
  const move = (e) => {
    const d = drag.current;
    if (!d) return;
    const a = angle(e);
    d.pull += ((((a - d.last) % 360) + 540) % 360) - 180; // the short way, across the bottom of the circle too
    d.last = a;
    if (Math.abs(d.pull) > 4) d.moved = true;
    if (!d.moved) return;
    setPull(d.pull);
    const to = mod12(d.turn + Math.round(d.pull / 30));
    if (to !== turn) onRoot(to);
  };
  // Letting go settles the stencil on the nearest semitone. A press that never moved is a tap,
  // and a tap on a note makes it the root.
  const up = () => {
    const d = drag.current;
    drag.current = null;
    setPull(null);
    if (d && !d.moved && d.tap !== null && d.tap !== turn) onRoot(d.tap);
  };
  // One window per note of the major key the stencil is cut as, with that note's degree in the selected key
  const windows = SCALES.major.map((iv, j) => {
    const i = type === "major" ? j : (j + 2) % 7;
    return { iv, degree: i + 1, open: map.open.includes(i), root: i === 0 };
  });
  return (
    <svg className="circle" viewBox={`${-EDGE} ${-EDGE} ${320 + 2 * EDGE} ${320 + 2 * EDGE}`} role="img" aria-label={`Note circle showing ${root} ${type}`}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      <defs>
        <mask id="stencil" maskUnits="userSpaceOnUse" x="0" y="0" width="320" height="320">
          <rect width="320" height="320" fill="#fff" />
          {windows.filter((w) => w.open).map((w) => <circle key={w.iv} cx={at(w.iv, RING)[0]} cy={at(w.iv, RING)[1]} r={WINDOW} fill="#000" />)}
        </mask>
      </defs>
      {map.byPc.map((n, p) => {
        const [x, y] = at(p, RING);
        return (
          <g key={p} data-pc={p} className="ring">
            <circle cx={x} cy={y} r={NOTE} />
            <text x={x} y={y}>{n.name}</text>
          </g>
        );
      })}
      {/* The stencil: one band over the whole ring with a window cut for each note of the scale, turned as a whole */}
      <g className={`dial ${pull !== null ? "held" : ""}`} style={{ transform: `rotate(${deg}deg)` }}>
        <circle className="band" cx={C} cy={C} r={RING} mask="url(#stencil)" />
        {windows.map((w) => {
          const [x, y] = at(w.iv, RING), [nx, ny] = at(w.iv, NUM);
          return (
            <g key={w.iv} className={`${w.open ? "open" : "shut"} ${w.root ? "root" : ""}`}>
              {w.open && <circle className="edge" cx={x} cy={y} r={WINDOW} />}
              <text x={nx} y={ny} style={{ transform: `rotate(${-deg}deg)`, transformOrigin: `${nx}px ${ny}px` }}>{w.degree}</text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

// Fretboard geometry, in SVG units: 13 fret positions across 320
const W = 320, NUT = 20, ROW = 26, PAD = 16, FRETS = 12;
const NUMBERED = [3, 5, 7, 9, 12, 15, 17];

export function Fretboard({ tuning, map, shape, labels }) {
  // The neck keeps its length and slides up only for a position that reaches past the 12th fret
  const top = shape ? Math.max(...shape.flat()) : 0;
  const first = Math.max(0, top - FRETS);
  const col = first ? W / (FRETS + 1) : (W - NUT) / FRETS;
  const x = (f) => (first ? (f - first + 0.5) * col : f ? NUT + (f - 0.5) * col : NUT / 2);
  const wire = (f) => (first ? (f - first + 1) * col : NUT + f * col); // right edge of fret f
  const y = (s) => PAD + (tuning.length - 1 - s) * ROW;
  const bottom = y(0), frets = [...Array(FRETS + 1)].map((_, i) => first + i);
  return (
    <svg className="neck" viewBox={`0 0 ${W} ${bottom + PAD + 18}`} role="img"
      aria-label={`Fretboard, frets ${first} to ${first + FRETS}`}>
      {frets.map((f) => <line key={f} className={f ? "fret" : "nut"} x1={wire(f)} x2={wire(f)} y1={y(tuning.length - 1)} y2={bottom} />)}
      {tuning.map((_, s) => <line key={s} className="string" x1={first ? 0 : NUT} x2={W} y1={y(s)} y2={y(s)} />)}
      {frets.filter((f) => NUMBERED.includes(f)).map((f) => <text key={f} className="fretno" x={x(f)} y={bottom + PAD + 10}>{f}</text>)}
      {tuning.flatMap((o, s) => frets.map((f) => {
        const n = map.byPc[mod12(o + f)];
        if (!n.on) return null;
        const dim = shape && !shape[s].includes(f);
        return (
          <g key={`${s}.${f}`} className={`mark ${n.root ? "root" : ""} ${dim ? "dim" : ""}`}>
            <circle cx={x(f)} cy={y(s)} r={10} />
            <text x={x(f)} y={y(s)}>{labels === "notes" ? n.name : n.degree}</text>
          </g>
        );
      }))}
    </svg>
  );
}

export default function Visuals({ onExit }) {
  const [root, setRoot] = useState("C");
  const [type, setType] = useState("major");
  const [penta, setPenta] = useState(false);
  const [instrument, setInstrument] = useState("guitar");
  const [labels, setLabels] = useState("notes");
  const [system, setSystem] = useState("five");
  const [pos, setPos] = useState(0); // 0 is All

  const map = keyMap(root, type, penta);
  const used = penta ? "five" : system; // a pentatonic only has the five positions
  const tuning = TUNING[instrument];
  const other = type === "major" ? "minor" : "major";
  const relative = map.parent[type === "major" ? 5 : 2];

  // Turning the dial gives the key its usual name; the Major / Minor switch reads the relative key
  // off the scale instead, so the notes keep their spelling
  const turnTo = (p) => setRoot(keyName(p, type));
  const flip = (t) => { if (t !== type) { setRoot(relative); setType(t); } };
  // A selected position that the new system does not have falls back to All
  const fit = (sys) => { if (pos > COUNT[sys]) setPos(0); };

  return (
    <main className="page">
      <header className="bar">
        <button className="ghost small" onClick={onExit}>‹ Back</button>
      </header>
      <h1 className="title">Visuals</h1>
      <Circle root={root} type={type} map={map} onRoot={turnTo} />
      <div className="key">
        <button className="step" onClick={() => turnTo(pc(root) - 1)} aria-label="Down a semitone">‹</button>
        <p>
          <strong>{root} {scaleName(type, penta)}</strong>
          <span>{map.open.map((i) => map.parent[i]).join(" ")}</span>
          <small>Relative {other}: {relative} {other}</small>
        </p>
        <button className="step" onClick={() => turnTo(pc(root) + 1)} aria-label="Up a semitone">›</button>
      </div>
      <Switch label="Key type" value={type} options={[["major", "Major"], ["minor", "Minor"]]} onChange={flip} />
      <Switch label="Scale" value={penta} options={[[false, "7 notes"], [true, "Pentatonic"]]} onChange={(v) => { setPenta(v); fit(v ? "five" : system); }} />

      <h2 className="heading apart">Fretboard</h2>
      <Switch label="Instrument" value={instrument} options={[["guitar", "Guitar"], ["bass", "Bass"]]} onChange={setInstrument} />
      <Switch label="Labels" value={labels} options={[["notes", "Notes"], ["degrees", "Degrees"]]} onChange={setLabels} />
      <Switch label="Shape system" value={used} options={SYSTEMS} disabled={penta} onChange={(v) => { setSystem(v); fit(v); }} />
      <div className="positions" role="group" aria-label="Position">
        {[...Array(COUNT[used] + 1)].map((_, i) => (
          <button key={i} className={pos === i ? "on" : ""} aria-pressed={pos === i} onClick={() => setPos(i)}>{i || "All"}</button>
        ))}
      </div>
      <Fretboard tuning={tuning} map={map} labels={labels} shape={pos ? position(root, type, penta, used, pos - 1, tuning) : null} />
    </main>
  );
}
