import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { EAR_TOTAL } from "./ear.js";
import { play, stop, setVoice } from "./audio.js";

const list = (a) => (a.length > 1 ? `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}` : a[0]);

// A selection is what a session asks: item ids, plus a variant in exercises that have them
const selection = (s) => (Array.isArray(s) ? { ids: s } : s);
// Texts that depend on the variant are given as functions of it
const val = (v, variant) => (typeof v === "function" ? v(variant) : v);

// Custom selection of an exercise, stored as item ids joined with "+", after "<variant>:" if it has variants
function readCustom(ex) {
  try {
    const [ids, variant] = (localStorage.getItem(ex.customKey) || "").split(":").reverse();
    const stored = ids.split("+");
    const sel = ex.items.map((i) => i.id).filter((id) => stored.includes(String(id)));
    const known = ex.variants ? ex.variants.some(([id]) => id === variant) : variant === undefined;
    if (sel.length >= 2 && known) return { ids: sel, variant };
  } catch { /* storage unavailable: use the default */ }
  return selection(ex.customDefault);
}
function writeCustom(ex, { ids, variant }) {
  try { localStorage.setItem(ex.customKey, (variant ? `${variant}:` : "") + ids.join("+")); } catch { /* ignore */ }
}

// The sound button switches between these; the first is the default. One choice for every exercise.
const VOICE_KEY = "theory-quiz.ear-sound";
const VOICES = [["piano", "🎹", "piano"], ["guitar", "🎸", "acoustic guitar"]];
function readVoice() {
  try {
    const v = localStorage.getItem(VOICE_KEY);
    if (VOICES.some(([id]) => id === v)) return v;
  } catch { /* storage unavailable: use the default */ }
  return VOICES[0][0];
}
function writeVoice(v) {
  try { localStorage.setItem(VOICE_KEY, v); } catch { /* ignore */ }
}

function nextQuestion(ex, { ids, variant }, seen) {
  let q;
  for (let i = 0; i < 50; i++) { q = ex.question(ids, variant); if (!seen.has(q.key)) break; }
  seen.add(q.key);
  return q;
}

function EarSheet({ ex, variant, onClose }) {
  const close = () => { stop(); onClose(); };
  return (
    <div className="overlay" onClick={close}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={close} aria-label="Close cheat sheet">✕</button>
        <h2>{val(ex.sheetTitle, variant)}</h2>
        <p className="hint">Tap one to hear it.</p>
        {ex.items.map(({ id, name, sheet, desc }) => (
          <button key={id} className={`entry ${ex.id}`} onClick={() => play(ex.demo(id, variant), ex.gap)}>
            <b>{name}</b><i>{val(sheet, variant)}</i><span>{val(desc, variant)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// One ear-training exercise: its page of levels and Custom, a session, and the results
export default function Ear({ exercise: ex, onExit }) {
  const [sel, setSel] = useState(null); // selection of the running session; null on the exercise's page
  const [seen, setSeen] = useState(new Set());
  const [q, setQ] = useState(null);
  const [n, setN] = useState(0);
  const [picked, setPicked] = useState(null);
  const [results, setResults] = useState([]);
  const [done, setDone] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [voice, setVoiceState] = useState(() => { const v = readVoice(); setVoice(v); return v; });
  const [custom, setCustom] = useState(() => readCustom(ex));
  const t0 = useRef(0);

  const score = results.filter((r) => r.correct).length;
  const name = (id) => ex.items.find((i) => i.id === id).name;
  const sound = (steps) => play(steps, ex.gap);
  const replay = () => sound(ex.controls[0].steps(q));

  const begin = (s) => {
    const fresh = new Set();
    setSeen(fresh); setSel(s); setResults([]); setN(0); setPicked(null); setDone(false);
    setQ(nextQuestion(ex, s, fresh));
    t0.current = performance.now();
  };
  const answer = (id) => {
    const answerTime = (performance.now() - t0.current) / 1000; // includes the automatic playback
    setPicked(id);
    setResults((r) => [...r, { item: q.answer, selectedAnswer: id, correct: id === q.answer, answerTime }]);
  };
  // Before an answer a tap answers; after it a tap plays that choice from the question's root
  const tap = (id) => (picked === null ? answer(id) : sound(ex.preview(q, id)));
  const next = () => {
    stop();
    if (n + 1 >= EAR_TOTAL) return setDone(true);
    setQ(nextQuestion(ex, sel, seen));
    setN(n + 1); setPicked(null);
    t0.current = performance.now();
  };
  const leave = () => { stop(); setSel(null); setDone(false); setSheet(false); };
  const change = (next) => {
    setCustom(next);
    if (next.ids.length >= 2) writeCustom(ex, next);
  };
  const toggle = (id) => change({ ...custom, ids: ex.items.map((i) => i.id).filter((x) => (x === id) !== custom.ids.includes(x)) });
  const cycle = () => {
    const v = VOICES[(VOICES.findIndex(([id]) => id === voice) + 1) % VOICES.length][0];
    setVoiceState(v); setVoice(v); writeVoice(v);
    replay();
  };

  // Each new question plays by itself; the tap that led to it has unlocked the sound
  useEffect(() => { if (q) replay(); }, [q]);
  useEffect(() => stop, []);
  // Names the screen the branches below render; each new one opens scrolled to the top
  const screen = !sel ? "page" : done ? "done" : `q${n}`;
  useLayoutEffect(() => { window.scrollTo(0, 0); }, [screen]);

  if (!sel) {
    return (
      <main className="page">
        <header className="bar">
          <button className="ghost small" onClick={onExit}>‹ Back</button>
        </header>
        <h1 className="title">{ex.title}</h1>
        <p className="sub">{ex.intro} {EAR_TOTAL} questions per level.</p>
        <div className="modes">
          {ex.levels.map(selection).map((level, i, levels) => {
            // a level says what it adds, unless it starts a new variant; then it says what it asks
            const before = i && levels[i - 1].variant === level.variant ? levels[i - 1].ids : null;
            const asks = level.ids.length === ex.items.length && ex.all ? ex.all : list(level.ids.map(name));
            const label = ex.variants ? `${ex.variants.find(([id]) => id === level.variant)[1]}: ` : "";
            return (
              <div key={i} className="mode">
                <button className="play" onClick={() => begin(level)}>
                  <strong>Level {i + 1}</strong>
                  <span>{before ? `Adds ${list(level.ids.filter((id) => !before.includes(id)).map(name)).toLowerCase()}` : label + asks}</span>
                </button>
              </div>
            );
          })}
        </div>
        <section className="section">
          <h2 className="heading">Custom</h2>
          {ex.variants && (
            <div className="switch" role="radiogroup">
              {ex.variants.map(([id, label]) => (
                <button key={id} className={custom.variant === id ? "on" : ""} role="radio" aria-checked={custom.variant === id} onClick={() => change({ ...custom, variant: id })}>
                  {label}
                </button>
              ))}
            </div>
          )}
          <div className="chips pairs">
            {ex.items.map(({ id, name: label }) => (
              <button key={id} className={`chip ${custom.ids.includes(id) ? "on" : ""}`} role="checkbox" aria-checked={custom.ids.includes(id)} onClick={() => toggle(id)}>
                {label}
              </button>
            ))}
          </div>
          <button className="primary" disabled={custom.ids.length < 2} onClick={() => begin(custom)}>
            {custom.ids.length < 2 ? "Tick at least two" : "Start custom"}
          </button>
        </section>
      </main>
    );
  }

  if (done) {
    const avg = results.reduce((s, r) => s + r.answerTime, 0) / (results.length || 1);
    const tally = ex.items.map((i) => [i.name, results.filter((r) => r.item === i.id)]).filter(([, rs]) => rs.length);
    return (
      <main className="page">
        <p className="label">Session complete</p>
        <h1 className="score">{score} / {results.length}</h1>
        <p className="sub">{Math.round((score / (results.length || 1)) * 100)}%</p>
        <p className="sub">Average answer time<br /><b className="avg">{avg.toFixed(1)} seconds</b></p>
        <ul className="tally">
          {tally.map(([label, rs]) => <li key={label}><span>{label}</span><b>{rs.filter((r) => r.correct).length}/{rs.length}</b></li>)}
        </ul>
        <button className="primary" onClick={() => begin(sel)}>Play again</button>
        <button className="ghost" onClick={leave}>Finish</button>
      </main>
    );
  }

  const [, icon, soundName] = VOICES.find(([id]) => id === voice);
  const options = ex.items.filter((i) => sel.ids.includes(i.id)); // always in the exercise's fixed order
  const more = ex.explain ? ex.explain(q) : "";
  return (
    <main className="page">
      <header className="bar">
        <button className="ghost small" onClick={leave}>Quit</button>
        <span>{n + 1} / {EAR_TOTAL} · {score} correct</span>
        <span className="tools">
          <button className="bulb" onClick={cycle} aria-label={`Sound: ${soundName}. Tap to change`}>{icon}</button>
          <button className="bulb" onClick={() => setSheet(true)} aria-label="Open cheat sheet">💡</button>
        </span>
      </header>
      <h2 className="prompt ear">{val(ex.prompt, sel.variant)}</h2>
      <div className="sounds">
        {ex.controls.map(({ label, wide, steps }) => (
          <button key={label} className={`sound ${wide ? "both" : ""}`} onClick={() => sound(steps(q))}>{label}</button>
        ))}
      </div>
      <div className={`answers ${options.length > 5 ? "two" : ""}`}>
        {options.map(({ id, name: label }) => {
          const cls = picked === null ? "" : id === q.answer ? "right" : id === picked ? "wrong" : "dim";
          return (
            <button key={id} className={`answer ear ${cls}`} onClick={() => tap(id)}>
              {label}{picked !== null && id === q.answer ? " ✓" : ""}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="feedback">
          <p>{picked === q.answer ? `Correct! ${more || `${name(q.answer)}.`}` : `Not quite. You picked ${name(picked)}, it was ${name(q.answer)}. ${more}`}</p>
          <button className="primary" onClick={next}>{n + 1 >= EAR_TOTAL ? "Finish" : "Next"}</button>
        </div>
      )}
      {sheet && <EarSheet ex={ex} variant={sel.variant} onClose={() => setSheet(false)} />}
    </main>
  );
}
