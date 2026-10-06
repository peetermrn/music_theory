import { useState, useRef, useEffect } from "react";
import { makeQuestion, GROUPS, DEFAULT_GROUPS } from "./theory.js";
import { EXERCISES, EAR_TOTAL } from "./ear.js";
import Ear from "./Ear.jsx";
import Visuals from "./Visuals.jsx";

const TOTAL = 10;
const SECTIONS = [
  ["Keys", [
    ["notes", "Notes", "Which note sits on each degree"],
    ["scales", "Scales", "Which notes make up a key"],
    ["chords", "Chords", "Which triad sits on each degree"],
    ["relatives", "Relatives", "Which major and minor keys pair up"],
    ["mixed", "Mixed", "All of the above, shuffled"],
  ]],
  ["Memorize the fretboard", [
    ["guitar", "Guitar", "Fretboard notes, frets 0–12"],
    ["bass", "Bass", "Fretboard notes, frets 0–12"],
  ]],
];
const LABEL = { notes: "Notes", scales: "Scales", chords: "Chords", relatives: "Relatives", guitar: "Guitar", bass: "Bass" };
// Ear-training exercises open their own page; they are not quiz modes and have no speed game
const EAR = "Ear training";
// The visuals page is for looking: no questions, no session and no speed game
const VISUALS = "Visuals";
const VISUAL = ["Circle & fretboard", "See a key's notes on a dial and on the neck"];
const levels = (id) => EXERCISES.find((e) => e.id === id).levels;
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

// Selected scale groups, stored as ids joined with "+" in GROUPS order
const SCALES_KEY = "theory-quiz.scales";
const SCALED = ["notes", "scales", "mixed"]; // modes whose questions depend on the selection
function readGroups() {
  try {
    const ids = (localStorage.getItem(SCALES_KEY) || "").split("+");
    const sel = GROUPS.map((g) => g.id).filter((id) => ids.includes(id));
    if (sel.length) return sel;
  } catch { /* storage unavailable: use the default */ }
  return DEFAULT_GROUPS;
}
function writeGroups(groups) {
  try { localStorage.setItem(SCALES_KEY, groups.join("+")); } catch { /* ignore */ }
}

// The default selection keeps the plain per-mode key, so scores stored before scale groups existed still count.
const bestKey = (mode, groups) => {
  const sel = groups.join("+");
  return `theory-quiz.best.${mode}${SCALED.includes(mode) && sel !== DEFAULT_GROUPS.join("+") ? `.${sel}` : ""}`;
};
function readBest(groups) {
  const best = {};
  try {
    for (const id of Object.keys(NAME)) best[id] = Number(localStorage.getItem(bestKey(id, groups))) || 0;
  } catch { /* storage unavailable: play without a stored best */ }
  return best;
}
function writeBest(mode, groups, value) {
  try { localStorage.setItem(bestKey(mode, groups), String(value)); } catch { /* ignore */ }
}

// `recent` limits the repeat check to the last RECENT prompts (speed games) instead of the whole session.
function nextQuestion(mode, seen, spec, recent, groups) {
  let q;
  for (let i = 0; i < 20; i++) { q = makeQuestion(mode, spec, groups); if (spec || !seen.has(q.prompt)) break; }
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
        <h3>Major pentatonic</h3><pre>{"2 2 3 2 3\nmajor scale without its 4th and 7th"}</pre>
        <h3>Minor pentatonic</h3><pre>{"3 2 2 3 2\nnatural minor without its 2nd and 6th"}</pre>
        <h3>Major-key triads</h3>
        <pre>{"1  major\n2  minor\n3  minor\n4  major\n5  major\n6  minor\n7  diminished"}</pre>
        <h3>Minor-key triads</h3>
        <pre>{"1  minor\n2  diminished\n3  major\n4  minor\n5  minor\n6  major\n7  major"}</pre>
        <h3>Relative keys</h3>
        <pre>{"relative minor = 6th note of the major scale\nrelative major = 3rd note of the minor scale"}</pre>
        <h3>Scale degrees</h3>
        <pre>{"1 tonic\n2 supertonic\n3 mediant\n4 subdominant\n5 dominant\n6 submediant\n7 leading tone"}</pre>
      </div>
    </div>
  );
}

const list = (a) => (a.length > 1 ? `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}` : a[0]);

// Numbers, mode names and scale names are read from the constants the app runs on
function HowItWorks({ onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose} aria-label="Close how it works">✕</button>
        <h2>How it works</h2>
        <h3>Sessions</h3>
        <p>Tap a mode under {SECTIONS.map(([title]) => title).join(" or ")} to answer {TOTAL} questions, each with four choices and no time limit. The 💡 button opens a cheat sheet, and at the end you can review the questions you missed.</p>
        <h3>⚡ Speed</h3>
        <p>An endless game. You start with {SPEED.hearts} hearts and lose one for a wrong answer or when time runs out. The time limit starts at {SPEED.start} seconds and gets shorter with every correct answer. Your best score is saved on this device.</p>
        <h3>Scales tick boxes</h3>
        <p>Choose which scales {list(SCALED.map((id) => NAME[id]))} ask about: {GROUPS.map((g) => g.label).join(", ")}. The other modes are not affected.</p>
        {SECTIONS.map(([title, modes]) => (
          <div key={title}>
            <h3>{title}</h3>
            {modes.map(([id, name, desc]) => <p key={id} className="how"><b>{name}</b><span>{desc}</span></p>)}
          </div>
        ))}
        <h3>{EAR}</h3>
        {EXERCISES.map(({ id, title, desc }) => <p key={id} className="how long"><b>{title}</b><span>{desc}</span></p>)}
        <p>An ear-training session is {EAR_TOTAL} questions with no time limit. After answering, tap any choice to hear it and compare. The sound button switches between piano and acoustic guitar. There is no speed game and no Review mistakes.</p>
        <p>Interval training has its own page with {levels("intervals").length} levels, from {levels("intervals")[0].length} intervals up to all {levels("intervals").at(-1).length}, and Custom, where you tick the intervals to drill. Each question plays two notes, the lower one first, and you pick the interval from one choice per interval. Replay the notes together or one at a time as often as you like.</p>
        <p>Chord training has its own page with {levels("chords").length} levels, from major and minor up to all {levels("chords").at(-1).length} chord types, and Custom. Each question plays a chord one note at a time and then together, and you pick its type, such as major or minor, from one choice per type. Replay it one by one or together.</p>
        <p>Degree training has its own page with {levels("degrees").length} levels and Custom. Each question plays a few chords to set a key, then one note, and you pick which degree of that key the note is. The key changes with every question. Replay everything, only the key or only the note. After answering, the key and the note are named.</p>
        <h3>{VISUALS}</h3>
        <p className="how long"><b>{VISUAL[0]}</b><span>{VISUAL[1]}</span></p>
        <p>A page for looking, with no questions and no score. A circle shows the 12 notes, and a dial over it has one window for each note of the key. Turn the dial by dragging it, tapping a note or using the arrows, and the key changes. Major / Minor switches to the relative key, which uses the same notes, and the scale can be all seven notes or the pentatonic. A pentatonic keeps its seven-note degree numbers here, so the note that Notes calls the 3rd note of A minor pentatonic is shown as 4.</p>
        <p>The fretboard below shows where the same key's notes are on guitar or bass, labelled with note names or degrees. Pick a position to see one shape to practise, with the rest of the notes dimmed. There are two sets of shapes: the five positions, and three notes per string.</p>
        <p className="credit">Piano: Salamander Grand Piano by Alexander Holm. Acoustic guitar: tonejs-instruments by Nicholaus Brosowsky, from University of Iowa recordings. Both CC BY 3.0; the guitar notes are shortened.</p>
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
  const [help, setHelp] = useState(false);
  const [ear, setEar] = useState(null); // id of the open ear-training exercise, shown instead of the home screen
  const [visuals, setVisuals] = useState(false);
  const [speed, setSpeed] = useState(false);
  const [hearts, setHearts] = useState(0);
  const [limit, setLimit] = useState(0); // seconds allowed for the current speed question
  const [groups, setGroups] = useState(readGroups);
  const [best, setBest] = useState(() => readBest(groups));
  const [record, setRecord] = useState(false);
  const t0 = useRef(0);

  const total = queue ? queue.length : TOTAL;
  const score = results.filter((r) => r.correct).length;

  const begin = (m, specs, sp) => {
    const s = new Set();
    const cfg = speedCfg(m);
    setSeen(s); setMode(m); setQueue(specs); setResults([]); setN(0); setPicked(null); setDone(false);
    setSpeed(sp); setHearts(cfg.hearts); setLimit(cfg.start); setRecord(false);
    setQ(nextQuestion(m, s, specs?.[0], sp, groups));
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
        if (isRecord) { writeBest(mode, groups, score); setBest({ ...best, [mode]: score }); }
        setRecord(isRecord);
        return setDone(true);
      }
      const cfg = speedCfg(mode);
      setLimit(picked === q.answer
        ? Math.max(cfg.floor, limit * cfg.factor)
        : Math.min(cfg.start, limit / cfg.factor ** cfg.relief));
    } else if (n + 1 >= total) return setDone(true);
    setQ(nextQuestion(mode, seen, queue?.[n + 1], speed, groups));
    setN(n + 1); setPicked(null);
    t0.current = performance.now();
  };
  const home = () => { setMode(null); setDone(false); };
  // Switch a scale group on or off; the last one that is on stays on
  const toggle = (id) => {
    const sel = GROUPS.map((g) => g.id).filter((g) => (g === id) !== groups.includes(g));
    if (!sel.length) return;
    setGroups(sel); writeGroups(sel); setBest(readBest(sel));
  };

  // Speed game timers: the question deadline while unanswered, the auto-advance once it is
  // answered or timed out. Cleared on quit and unmount.
  useEffect(() => {
    if (!speed || !mode || done) return;
    const id = picked === null
      ? setTimeout(() => answer(TIMEOUT), limit * 1000)
      : setTimeout(next, picked === q.answer ? ADVANCE_MS : MISS_MS);
    return () => clearTimeout(id);
  }, [speed, mode, done, q, picked]);

  if (ear) return <Ear exercise={EXERCISES.find((e) => e.id === ear)} onExit={() => setEar(null)} />;

  if (visuals) return <Visuals onExit={() => setVisuals(false)} />;

  if (!mode) {
    return (
      <main className="page">
        <div className="top">
          <h1>Theory<br />drills</h1>
          <button className="help" onClick={() => setHelp(true)} aria-label="How it works">?</button>
        </div>
        <p className="sub">Pick a mode for {TOTAL} questions, or ⚡ Speed for an endless game.</p>
        {SECTIONS.map(([title, modes]) => (
          <section key={title} className="section">
            <h2 className="heading">{title}</h2>
            {title === "Keys" && (
              <div className="chips">
                <span>Scales</span>
                {GROUPS.map((g) => (
                  <button key={g.id} className={`chip ${groups.includes(g.id) ? "on" : ""}`} role="checkbox" aria-checked={groups.includes(g.id)} onClick={() => toggle(g.id)}>
                    {g.label}
                  </button>
                ))}
              </div>
            )}
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
        <section className="section">
          <h2 className="heading">{EAR}</h2>
          <div className="modes">
            {EXERCISES.map(({ id, title, desc }) => (
              <div key={id} className="mode">
                <button className="play" onClick={() => setEar(id)}>
                  <strong>{title}</strong><span>{desc}</span>
                </button>
              </div>
            ))}
          </div>
        </section>
        <section className="section">
          <h2 className="heading">{VISUALS}</h2>
          <div className="modes">
            <div className="mode">
              <button className="play" onClick={() => setVisuals(true)}>
                <strong>{VISUAL[0]}</strong><span>{VISUAL[1]}</span>
              </button>
            </div>
          </div>
        </section>
        {help && <HowItWorks onClose={() => setHelp(false)} />}
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
