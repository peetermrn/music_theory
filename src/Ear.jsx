import { useState, useRef, useEffect } from "react";
import { INTERVALS, INTERVAL_NAME, EAR_LEVELS, EAR_TOTAL, levelAdds, earQuestion } from "./ear.js";
import { play, stop, setVoice } from "./audio.js";

const list = (a) => (a.length > 1 ? `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}` : a[0]);
const names = (semis) => semis.map((s) => INTERVAL_NAME[s]);
const SEMIS = Object.fromEntries(INTERVALS.map((i) => [i.name, i.semis]));

// Custom selection, stored as semitone counts joined with "+"
const CUSTOM_KEY = "theory-quiz.ear-custom";
const DEFAULT_CUSTOM = [3, 4];
function readCustom() {
  try {
    const stored = (localStorage.getItem(CUSTOM_KEY) || "").split("+").map(Number);
    const sel = INTERVALS.map((i) => i.semis).filter((s) => stored.includes(s));
    if (sel.length >= 2) return sel;
  } catch { /* storage unavailable: use the default */ }
  return DEFAULT_CUSTOM;
}
function writeCustom(semis) {
  try { localStorage.setItem(CUSTOM_KEY, semis.join("+")); } catch { /* ignore */ }
}

// The sound button switches between these; the first is the default
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

function nextQuestion(semis, seen) {
  let q;
  for (let i = 0; i < 50; i++) { q = earQuestion(semis); if (!seen.has(q.id)) break; }
  seen.add(q.id);
  return q;
}

const MIDDLE_C = 60; // the cheat sheet always plays from here, never from the question's note

function EarSheet({ onClose }) {
  const close = () => { stop(); onClose(); };
  return (
    <div className="overlay" onClick={close}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={close} aria-label="Close cheat sheet">✕</button>
        <h2>Intervals</h2>
        <p className="hint">Tap one to hear it.</p>
        {INTERVALS.map(({ semis, name, desc }) => (
          <button key={semis} className="interval" onClick={() => play([MIDDLE_C, MIDDLE_C + semis])}>
            <b>{name}</b><i>{semis}</i><span>{desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Ear({ onExit }) {
  const [semis, setSemis] = useState(null); // intervals of the running session; null on the Interval training page
  const [seen, setSeen] = useState(new Set());
  const [q, setQ] = useState(null);
  const [n, setN] = useState(0);
  const [picked, setPicked] = useState(null);
  const [results, setResults] = useState([]);
  const [done, setDone] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [voice, setVoiceState] = useState(() => { const v = readVoice(); setVoice(v); return v; });
  const [custom, setCustom] = useState(readCustom);
  const t0 = useRef(0);

  const score = results.filter((r) => r.correct).length;

  const begin = (s) => {
    const fresh = new Set();
    setSeen(fresh); setSemis(s); setResults([]); setN(0); setPicked(null); setDone(false);
    setQ(nextQuestion(s, fresh));
    t0.current = performance.now();
  };
  const answer = (opt) => {
    const answerTime = (performance.now() - t0.current) / 1000; // includes the automatic playback
    setPicked(opt);
    setResults((r) => [...r, { interval: q.answer, selectedAnswer: opt, correct: opt === q.answer, answerTime }]);
  };
  // Before an answer a tap answers; after it a tap plays that choice from the question's starting note
  const tap = (opt) => (picked === null ? answer(opt) : play([q.notes[0], q.notes[0] + SEMIS[opt]]));
  const next = () => {
    stop();
    if (n + 1 >= EAR_TOTAL) return setDone(true);
    setQ(nextQuestion(semis, seen));
    setN(n + 1); setPicked(null);
    t0.current = performance.now();
  };
  const leave = () => { stop(); setSemis(null); setDone(false); setSheet(false); };
  const toggle = (s) => {
    const sel = INTERVALS.map((i) => i.semis).filter((x) => (x === s) !== custom.includes(x));
    setCustom(sel);
    if (sel.length >= 2) writeCustom(sel);
  };
  const cycle = () => {
    const v = VOICES[(VOICES.findIndex(([id]) => id === voice) + 1) % VOICES.length][0];
    setVoiceState(v); setVoice(v); writeVoice(v);
    play(q.notes);
  };

  // Each new question plays by itself; the tap that led to it has unlocked the sound
  useEffect(() => { if (q) play(q.notes); }, [q]);
  useEffect(() => stop, []);

  if (!semis) {
    return (
      <main className="page">
        <header className="bar">
          <button className="ghost small" onClick={onExit}>‹ Back</button>
        </header>
        <h1 className="title">Interval training</h1>
        <p className="sub">Two notes are played. Name the interval between them. {EAR_TOTAL} questions per level.</p>
        <div className="modes">
          {EAR_LEVELS.map((level, i) => (
            <div key={i} className="mode">
              <button className="play" onClick={() => begin(level)}>
                <strong>Level {i + 1}</strong>
                <span>{i ? `Adds ${list(names(levelAdds(i))).toLowerCase()}` : list(names(level))}</span>
              </button>
            </div>
          ))}
        </div>
        <section className="section">
          <h2 className="heading">Custom</h2>
          <div className="chips pairs">
            {INTERVALS.map(({ semis: s, name }) => (
              <button key={s} className={`chip ${custom.includes(s) ? "on" : ""}`} role="checkbox" aria-checked={custom.includes(s)} onClick={() => toggle(s)}>
                {name}
              </button>
            ))}
          </div>
          <button className="primary" disabled={custom.length < 2} onClick={() => begin(custom)}>
            {custom.length < 2 ? "Tick at least two" : "Start custom"}
          </button>
        </section>
      </main>
    );
  }

  if (done) {
    const avg = results.reduce((s, r) => s + r.answerTime, 0) / (results.length || 1);
    const tally = INTERVALS.map(({ name }) => [name, results.filter((r) => r.interval === name)]).filter(([, rs]) => rs.length);
    return (
      <main className="page">
        <p className="label">Session complete</p>
        <h1 className="score">{score} / {results.length}</h1>
        <p className="sub">{Math.round((score / (results.length || 1)) * 100)}%</p>
        <p className="sub">Average answer time<br /><b className="avg">{avg.toFixed(1)} seconds</b></p>
        <ul className="tally">
          {tally.map(([name, rs]) => <li key={name}><span>{name}</span><b>{rs.filter((r) => r.correct).length}/{rs.length}</b></li>)}
        </ul>
        <button className="primary" onClick={() => begin(semis)}>Play again</button>
        <button className="ghost" onClick={leave}>Finish</button>
      </main>
    );
  }

  const [, icon, soundName] = VOICES.find(([id]) => id === voice);
  return (
    <main className="page">
      <header className="bar">
        <button className="ghost small" onClick={leave}>Quit</button>
        <span>{n + 1} / {EAR_TOTAL} · {score} correct</span>
        <span className="tools">
          <button className="bulb" onClick={cycle} aria-label={`Sound: ${soundName}. Tap to change`}>{icon}</button>
          <button className="bulb" onClick={() => setSheet(true)} aria-label="Open interval cheat sheet">💡</button>
        </span>
      </header>
      <h2 className="prompt ear">{q.prompt}</h2>
      <div className="sounds">
        <button className="sound both" onClick={() => play(q.notes)}>▶ Play both</button>
        <button className="sound" onClick={() => play([q.notes[0]])}>1st note</button>
        <button className="sound" onClick={() => play([q.notes[1]])}>2nd note</button>
      </div>
      <div className={`answers ${q.options.length > 5 ? "two" : ""}`}>
        {q.options.map((o) => {
          const cls = picked === null ? "" : o === q.answer ? "right" : o === picked ? "wrong" : "dim";
          return (
            <button key={o} className={`answer ear ${cls}`} onClick={() => tap(o)}>
              {o}{picked !== null && o === q.answer ? " ✓" : ""}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="feedback">
          <p>{picked === q.answer ? `Correct! ${q.answer}.` : `Not quite. You picked ${picked}, it was ${q.answer}.`}</p>
          <button className="primary" onClick={next}>{n + 1 >= EAR_TOTAL ? "Finish" : "Next"}</button>
        </div>
      )}
      {sheet && <EarSheet onClose={() => setSheet(false)} />}
    </main>
  );
}
