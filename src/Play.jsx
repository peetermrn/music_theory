import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { play, stop } from "./audio.js";
import { TUNING } from "./theory.js";
import { KINDS, listener, showMap } from "./play.js";
import { Fretboard } from "./Visuals.jsx";
import { useMic, MicProblem } from "./Mic.jsx";

const TOTAL = 10;    // questions per session
const ADVANCE = 1000; // milliseconds the right note is shown before the next question
const NOTE = [1.0, 1.85]; // a Play it back note: seconds it is held before its rest, seconds until it has died away

function nextQuestion(kind, seen) {
  let q;
  for (let i = 0; i < 50; i++) { q = KINDS[kind](); if (!seen.has(q.key)) break; }
  seen.add(q.key);
  return q;
}

// Mounted only on a question, so the microphone is released on the results screen
function Listening({ hear, onProblem }) {
  const { problem, retry } = useMic(hear);
  useEffect(() => onProblem(!!problem), [problem]);
  return problem ? <MicProblem problem={problem} what="Play on guitar" onRetry={retry} /> : null;
}

// A Play on guitar session of one kind: ten questions answered by playing, then the results
export default function Play({ kind, title, onExit }) {
  const [seen] = useState(() => new Set());
  const [q, setQ] = useState(() => nextQuestion(kind, seen));
  const [n, setN] = useState(0);
  const [results, setResults] = useState([]); // { prompt, answer, firstTry, time } per question
  const [first, setFirst] = useState(null);   // null until the first note or Show me; then whether it was right
  const [heard, setHeard] = useState(null);   // what the last wrong note was
  const [solved, setSolved] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);
  const [deaf, setDeaf] = useState(false); // the microphone is unavailable
  const t0 = useRef(performance.now());
  const time = useRef(null); // seconds until the right note, once it is played

  // The listener lives for the whole session, so a note still ringing does not answer the next question
  const onNote = useRef();
  const ear = useRef(null);
  if (!ear.current) ear.current = listener((m) => onNote.current(m));
  // A note played once is searching; the same note played again is the answer
  const pending = useRef(null);
  onNote.current = (m) => {
    if (solved) return;
    if (m !== pending.current) {
      pending.current = m;
      // only Play it back names a searched note: elsewhere the name would give the answer away
      return setHeard(`${q.search ? q.search(m) : "A note"} ●○ play it again to answer`);
    }
    pending.current = null;
    const r = q.check(m);
    if (r === true) {
      time.current = (performance.now() - t0.current) / 1000;
      if (first === null) setFirst(true);
      setSolved(true);
      return;
    }
    if (first === null) setFirst(false);
    const off = r && Math.abs(r.octave);
    setHeard(r ? `Right note, but ${off > 1 ? `${off} octaves` : "an octave"} too ${r.octave < 0 ? "low" : "high"}` : `${q.heard(m)} is not it`);
  };

  // A Play it back note: what the microphone hears is ignored until the note has died away
  const sound = (question) => {
    ear.current.mute(Infinity); // also while the recordings load
    play([question.target, null], NOTE[0], "guitar")
      .then(() => ear.current.mute(performance.now() + NOTE[1] * 1000));
  };
  useEffect(() => { if (q.target != null && !done) sound(q); }, [q]);
  useEffect(() => stop, []);

  const next = () => {
    const record = { prompt: q.prompt, answer: q.name, firstTry: first === true, time: solved ? time.current : null };
    setResults((r) => [...r, record]);
    if (n + 1 >= TOTAL) { stop(); return setDone(true); }
    setQ(nextQuestion(kind, seen)); setN(n + 1);
    setFirst(null); setHeard(null); setSolved(false); setRevealed(false); pending.current = null;
    t0.current = performance.now(); time.current = null;
  };
  // The right note shows for a moment, then the session moves on by itself
  useEffect(() => {
    if (!solved) return;
    const id = setTimeout(next, ADVANCE);
    return () => clearTimeout(id);
  }, [solved]);

  const reveal = () => { setRevealed(true); if (first === null) setFirst(false); };
  const again = () => {
    seen.clear();
    setResults([]); setN(0); setDone(false);
    setFirst(null); setHeard(null); setSolved(false); setRevealed(false); pending.current = null;
    setQ(nextQuestion(kind, seen));
    t0.current = performance.now(); time.current = null;
  };

  // Names the screen the branches below render; each new one opens scrolled to the top
  const screen = done ? "done" : `q${n}`;
  useLayoutEffect(() => { window.scrollTo(0, 0); }, [screen]);

  if (done) {
    const score = results.filter((r) => r.firstTry).length;
    const timed = results.filter((r) => r.time != null);
    const avg = timed.reduce((s, r) => s + r.time, 0) / (timed.length || 1);
    const missed = results.filter((r) => !r.firstTry);
    return (
      <main className="page">
        <p className="label">{title} complete</p>
        <h1 className="score">{score} / {TOTAL}</h1>
        <p className="sub">{Math.round((score / TOTAL) * 100)}%</p>
        <p className="sub">Average time to find the note<br /><b className="avg">{avg.toFixed(1)} seconds</b></p>
        {missed.length > 0 && (
          <ul className="tally">
            {missed.map((r, i) => <li key={i}><span>{r.prompt}</span><b>{r.answer}</b></li>)}
          </ul>
        )}
        <button className="primary" onClick={again}>Play again</button>
        <button className="ghost" onClick={onExit}>Finish</button>
      </main>
    );
  }

  const score = results.filter((r) => r.firstTry).length;
  return (
    <main className="page">
      <header className="bar">
        <button className="ghost small" onClick={() => { stop(); onExit(); }}>Quit</button>
        <span>{n + 1} / {TOTAL} · {score} right</span>
      </header>
      <h2 className="prompt">{q.prompt}</h2>
      {q.target != null && <button className="sound both" onClick={() => sound(q)}>▶ Hear it again</button>}
      <div className={`reading ${solved ? "tuned" : revealed ? "revealed" : ""}`} aria-live="polite">
        <strong className="note">{solved || revealed ? q.name : "?"}</strong>
        <p className="cents">{solved ? "Correct!" : heard ?? (deaf ? "Not listening" : "Listening… play the note")}</p>
      </div>
      <Listening hear={(buf, rate, t) => ear.current.hear(buf, rate, t)} onProblem={setDeaf} />
      {revealed && q.shape && <Fretboard tuning={TUNING.guitar} map={showMap(q)} shape={q.shape} labels="notes" />}
      {!solved && (revealed
        ? <button className="primary" onClick={next}>{n + 1 >= TOTAL ? "Finish" : "Next"}</button>
        : <button className="secondary" onClick={reveal}>Show me</button>)}
    </main>
  );
}
