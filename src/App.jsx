import { useState, useRef, useEffect } from "react";
import { makeQuestion } from "./theory.js";

const TOTAL = 10;
const SECTIONS = [
  ["Keys", [
    ["notes", "Notes", "Which note sits on each degree"],
    ["scales", "Scales", "Which notes make up a key"],
    ["chords", "Chords", "Which triad sits on each degree"],
    ["mixed", "Mixed", "All of the above, shuffled"],
  ]],
  ["Memorize the fretboard", [
    ["guitar", "Guitar", "Fretboard notes, frets 0–12"],
    ["bass", "Bass", "Fretboard notes, frets 0–12"],
  ]],
];
const LABEL = { notes: "Notes", scales: "Scales", chords: "Chords", guitar: "Guitar", bass: "Bass" };
const NAME = Object.fromEntries(SECTIONS.flatMap(([, modes]) => modes.map(([id, name]) => [id, name])));

// Speed game tuning. Times are in seconds; `modes` holds per-mode overrides, e.g. { scales: { floor: 4 } }.
const SPEED = {
  hearts: 5,
  start: 20,   // time limit of the first question
  factor: 0.9, // a correct answer multiplies the limit by this...
  floor: 2,    // ...down to this minimum
  relief: 2,   // a miss undoes this many correct-answer steps, up to `start`
  modes: {},
};
const speedCfg = (mode) => ({ ...SPEED, ...SPEED.modes[mode] });
const ADVANCE_MS = 300; // pause on a correct speed answer before the next question
const MISS_MS = 600;    // pause on a speed miss (wrong answer or timeout), long enough to see the right one
const RECENT = 10;      // speed games avoid repeating the last RECENT prompts
const TIMEOUT = Symbol("timeout"); // `picked` value when the countdown ran out

const bestKey = (mode) => `theory-quiz.best.${mode}`;
function readBest() {
  const best = {};
  try {
    for (const id of Object.keys(NAME)) best[id] = Number(localStorage.getItem(bestKey(id))) || 0;
  } catch { /* storage unavailable: play without a stored best */ }
  return best;
}
function writeBest(mode, value) {
  try { localStorage.setItem(bestKey(mode), String(value)); } catch { /* ignore */ }
}

// `recent` limits the repeat check to the last RECENT prompts (speed games) instead of the whole session.
function nextQuestion(mode, seen, spec, recent) {
  let q;
  for (let i = 0; i < 20; i++) { q = makeQuestion(mode, spec); if (spec || !seen.has(q.prompt)) break; }
  seen.delete(q.prompt);
  seen.add(q.prompt);
  if (recent && seen.size > RECENT) seen.delete(seen.values().next().value);
  return q;
}

function CheatSheet({ onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose} aria-label="Close cheat sheet">✕</button>
        <h2>Cheat sheet</h2>
        <h3>Major scale</h3><pre>2 2 1 2 2 2 1</pre>
        <h3>Natural minor</h3><pre>2 1 2 2 1 2 2</pre>
        <h3>Harmonic minor</h3><pre>2 1 2 2 1 3 1</pre>
        <h3>Major-key triads</h3>
        <pre>{"1  major\n2  minor\n3  minor\n4  major\n5  major\n6  minor\n7  diminished"}</pre>
        <h3>Minor-key triads</h3>
        <pre>{"1  minor\n2  diminished\n3  major\n4  minor\n5  minor\n6  major\n7  major"}</pre>
        <h3>Scale degrees</h3>
        <pre>{"1 tonic\n2 supertonic\n3 mediant\n4 subdominant\n5 dominant\n6 submediant\n7 leading tone"}</pre>
      </div>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState(null);
  const [queue, setQueue] = useState(null); // specs of missed questions during a review
  const [seen, setSeen] = useState(new Set());
  const [q, setQ] = useState(null);
  const [n, setN] = useState(0);
  const [picked, setPicked] = useState(null);
  const [results, setResults] = useState([]);
  const [done, setDone] = useState(false);
  const [cheat, setCheat] = useState(false);
  const [speed, setSpeed] = useState(false);
  const [hearts, setHearts] = useState(0);
  const [limit, setLimit] = useState(0); // seconds allowed for the current speed question
  const [best, setBest] = useState(readBest);
  const [record, setRecord] = useState(false);
  const t0 = useRef(0);

  const total = queue ? queue.length : TOTAL;
  const score = results.filter((r) => r.correct).length;

  const begin = (m, specs, sp) => {
    const s = new Set();
    const cfg = speedCfg(m);
    setSeen(s); setMode(m); setQueue(specs); setResults([]); setN(0); setPicked(null); setDone(false);
    setSpeed(sp); setHearts(cfg.hearts); setLimit(cfg.start); setRecord(false);
    setQ(nextQuestion(m, s, specs?.[0], sp));
    t0.current = performance.now();
  };
  const start = (m, sp = false) => begin(m, null, sp);
  const review = () => begin(mode, results.filter((r) => !r.correct).map((r) => r.spec), false);

  // `opt` is TIMEOUT when the speed countdown ran out: a wrong answer with no selected answer
  const answer = (opt) => {
    if (picked !== null) return;
    const answerTime = (performance.now() - t0.current) / 1000; // stops the moment an answer is tapped
    const correct = opt === q.answer;
    setPicked(opt);
    if (speed && !correct) setHearts((h) => h - 1);
    setResults((r) => [...r, {
      questionType: q.kind, question: q.prompt, correctAnswer: q.answer,
      selectedAnswer: opt === TIMEOUT ? null : opt, correct, answerTime, spec: q.spec,
    }]);
  };
  const next = () => {
    if (speed) {
      if (hearts <= 0) {
        // game over: the only place the best score is written
        const isRecord = score > (best[mode] || 0);
        if (isRecord) { writeBest(mode, score); setBest({ ...best, [mode]: score }); }
        setRecord(isRecord);
        return setDone(true);
      }
      const cfg = speedCfg(mode);
      setLimit(picked === q.answer
        ? Math.max(cfg.floor, limit * cfg.factor)
        : Math.min(cfg.start, limit / cfg.factor ** cfg.relief));
    } else if (n + 1 >= total) return setDone(true);
    setQ(nextQuestion(mode, seen, queue?.[n + 1], speed));
    setN(n + 1); setPicked(null);
    t0.current = performance.now();
  };
  const home = () => { setMode(null); setDone(false); };

  // Speed game timers: the question deadline while unanswered, the auto-advance once it is
  // answered or timed out. Cleared on quit and unmount.
  useEffect(() => {
    if (!speed || !mode || done) return;
    const id = picked === null
      ? setTimeout(() => answer(TIMEOUT), limit * 1000)
      : setTimeout(next, picked === q.answer ? ADVANCE_MS : MISS_MS);
    return () => clearTimeout(id);
  }, [speed, mode, done, q, picked]);

  if (!mode) {
    return (
      <main className="page">
        <h1>Theory<br />drills</h1>
        <p className="sub">{TOTAL} questions. Pick a mode.</p>
        {SECTIONS.map(([title, modes]) => (
          <section key={title} className="section">
            <h2 className="heading">{title}</h2>
            <div className="modes">
              {modes.map(([id, name, desc]) => (
                <div key={id} className="mode">
                  <button className="play" onClick={() => start(id)}>
                    <strong>{name}</strong><span>{desc}</span>
                  </button>
                  <button className="speed" onClick={() => start(id, true)} aria-label={`${name} speed game`}>
                    <span>⚡ Speed</span>{best[id] > 0 && <b>Best {best[id]}</b>}
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    );
  }

  if (done && speed) {
    const wrong = results.length - score;
    return (
      <main className="page">
        <p className="label">Game over</p>
        <h1 className="score">{score}</h1>
        <p className="sub">correct in {NAME[mode]} speed</p>
        <p className="sub">
          Best {NAME[mode]} score<br /><b className="avg">{best[mode] || 0}</b>
          {record && <span className="record">New best</span>}
        </p>
        <button className="primary" onClick={() => start(mode, true)}>Play again</button>
        {wrong > 0 && <button className="secondary" onClick={review}>Review mistakes</button>}
        <button className="ghost" onClick={home}>Finish</button>
      </main>
    );
  }

  if (done) {
    const wrong = results.length - score;
    const avg = results.reduce((s, r) => s + r.answerTime, 0) / (results.length || 1);
    const kinds = {};
    results.forEach((r) => { const k = kinds[r.questionType] || (kinds[r.questionType] = [0, 0]); k[0] += r.correct ? 1 : 0; k[1] += 1; });
    return (
      <main className="page">
        <p className="label">Session complete</p>
        <h1 className="score">{score} / {results.length}</h1>
        <p className="sub">{Math.round((score / (results.length || 1)) * 100)}%</p>
        <p className="sub">Average answer time<br /><b className="avg">{avg.toFixed(1)} seconds</b></p>
        <ul className="tally">
          {Object.entries(kinds).map(([k, [c, t]]) => <li key={k}><span>{LABEL[k]}</span><b>{c}/{t}</b></li>)}
        </ul>
        {wrong > 0 && <button className="primary" onClick={review}>Review mistakes</button>}
        <button className={wrong > 0 ? "secondary" : "primary"} onClick={() => start(mode)}>Play again</button>
        <button className="ghost" onClick={home}>Finish</button>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="bar">
        <button className="ghost small" onClick={home}>Quit</button>
        {speed ? (
          <>
            <span className="hearts" aria-label={`${hearts} hearts left`}>
              {"♥".repeat(hearts)}<i>{"♥".repeat(speedCfg(mode).hearts - hearts)}</i>
            </span>
            <span className="points">{score}</span>
          </>
        ) : (
          <>
            <span>{queue ? "Review · " : ""}{n + 1} / {total} · {score} correct</span>
            <button className="bulb" onClick={() => setCheat(true)} aria-label="Open cheat sheet">💡</button>
          </>
        )}
      </header>
      {speed && (
        <div className="countdown" key={n}>
          <i style={{ animationDuration: `${limit}s`, animationPlayState: picked === null ? "running" : "paused" }} />
        </div>
      )}
      <h2 className="prompt">{q.prompt}</h2>
      <div className="answers">
        {q.options.map((o) => {
          const cls = picked === null ? "" : o === q.answer ? "right" : o === picked ? "wrong" : "dim";
          return (
            <button key={o} className={`answer ${q.kind} ${cls}`} onClick={() => answer(o)} disabled={picked !== null}>
              {o}{picked !== null && o === q.answer ? " ✓" : ""}
            </button>
          );
        })}
      </div>
      {picked !== null && !speed && (
        <div className="feedback">
          <p>{picked === q.answer ? "Correct!" : `Not quite. Answer: ${q.answer}`}</p>
          <button className="primary" onClick={next}>{n + 1 >= total ? "Finish" : "Next"}</button>
        </div>
      )}
      {cheat && <CheatSheet onClose={() => setCheat(false)} />}
    </main>
  );
}
