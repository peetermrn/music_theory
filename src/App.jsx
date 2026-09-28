import { useState, useRef } from "react";
import { makeQuestion } from "./theory.js";

const TOTAL = 10;
const MODES = [
  ["notes", "Notes", "Which note sits on each degree"],
  ["scales", "Scales", "Which notes make up a key"],
  ["chords", "Chords", "Which triad sits on each degree"],
  ["mixed", "Mixed", "All of the above, shuffled"],
  ["keynotes", "Key Notes", "Spot the note that isn't in the key"],
  ["guitar", "Guitar", "Fretboard notes, frets 0–12"],
  ["bass", "Bass", "Fretboard notes, frets 0–12"],
];
const LABEL = { notes: "Notes", scales: "Scales", chords: "Chords", keynotes: "Key Notes", guitar: "Guitar", bass: "Bass" };

function nextQuestion(mode, seen, spec) {
  let q;
  for (let i = 0; i < 20; i++) { q = makeQuestion(mode, spec); if (spec || !seen.has(q.prompt)) break; }
  seen.add(q.prompt);
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
  const t0 = useRef(0);

  const total = queue ? queue.length : TOTAL;
  const score = results.filter((r) => r.correct).length;

  const begin = (m, specs) => {
    const s = new Set();
    setSeen(s); setMode(m); setQueue(specs); setResults([]); setN(0); setPicked(null); setDone(false);
    setQ(nextQuestion(m, s, specs?.[0]));
    t0.current = performance.now();
  };
  const start = (m) => begin(m, null);
  const review = () => begin(mode, results.filter((r) => !r.correct).map((r) => r.spec));

  const answer = (opt) => {
    if (picked !== null) return;
    const answerTime = (performance.now() - t0.current) / 1000; // stops the moment an answer is tapped
    setPicked(opt);
    setResults((r) => [...r, {
      questionType: q.kind, question: q.prompt, correctAnswer: q.answer,
      selectedAnswer: opt, correct: opt === q.answer, answerTime, spec: q.spec,
    }]);
  };
  const next = () => {
    if (n + 1 >= total) return setDone(true);
    setQ(nextQuestion(mode, seen, queue?.[n + 1]));
    setN(n + 1); setPicked(null);
    t0.current = performance.now();
  };
  const home = () => { setMode(null); setDone(false); };

  if (!mode) {
    return (
      <main className="page">
        <h1>Theory<br />drills</h1>
        <p className="sub">{TOTAL} questions. Pick a mode.</p>
        <div className="modes">
          {MODES.map(([id, name, desc]) => (
            <button key={id} className="mode" onClick={() => start(id)}>
              <strong>{name}</strong><span>{desc}</span>
            </button>
          ))}
        </div>
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
        <span>{queue ? "Review · " : ""}{n + 1} / {total} · {score} correct</span>
        <button className="bulb" onClick={() => setCheat(true)} aria-label="Open cheat sheet">💡</button>
      </header>
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
      {picked !== null && (
        <div className="feedback">
          <p>{picked === q.answer ? "Correct!" : `Not quite. Answer: ${q.answer}`}</p>
          <button className="primary" onClick={next}>{n + 1 >= total ? "Finish" : "Next"}</button>
        </div>
      )}
      {cheat && <CheatSheet onClose={() => setCheat(false)} />}
    </main>
  );
}
