import { useState, useRef, useLayoutEffect } from "react";
import { TUNING } from "./theory.js";
import { keyMap, position } from "./shapes.js";
import { CELLS, POSITIONS, REFRESH, runNotes, top, begin, follow, mistake, today, stateOf, settle, suggest, refreshable, refreshSet, readRuns, writeRuns } from "./runs.js";
import { listener } from "./play.js";
import { Listening } from "./Play.jsx";
import { MicButton, MicSettings, floor } from "./Mic.jsx";
import { Fretboard, Switch } from "./Visuals.jsx";

const RANGE = [70, 800]; // up to the 15th fret of the high E string, the highest note of any shape
const STATE = { new: "not started", seen: "seen", known: "known", due: "due" };
const name = (c) => `${c.root} ${c.type}, position ${c.k + 1}`;
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

// One scale run, then its result. Keyed by the run, so Again and Next run start afresh. A run of a
// refresh ({ at, of, next }) changes nothing; its cells are known or due, so it is from memory.
function Run({ cell, store, ear, next, refresh, onSettle, onNext, onAgain, onBack }) {
  const day = today();
  const [run] = useState(() => runNotes(cell.root, cell.type, cell.k));
  const [memory] = useState(() => stateOf(store[cell.id], day) !== "new"); // a cell not started is shown
  const [st, setSt] = useState(begin);
  const [revealed, setRevealed] = useState(false);
  const [deaf, setDeaf] = useState(false);
  const [tuning, setTuning] = useState(false); // the microphone sensitivity panel is open
  const [result, setResult] = useState(null); // { clean, mistakes, time, state } once the last note is played
  const t1 = useRef(null); // when the first note counted

  ear.onNote.current = (m) => {
    if (result) return;
    const now = follow(run, st, m);
    if (now.i === 1 && st.i === 0) t1.current = performance.now();
    setSt(now);
    if (now.i < run.length) return;
    const clean = now.mistakes === 0 && !revealed;
    const time = (performance.now() - t1.current) / 1000;
    if (refresh) return setResult({ clean, mistakes: now.mistakes, time });
    const after = settle(store[cell.id], { memory, clean }, day);
    onSettle(cell.id, after);
    setResult({ clean, mistakes: now.mistakes, time, state: stateOf(after, day) });
  };

  // Each new screen opens scrolled to the top; playing a note does not change the screen
  useLayoutEffect(() => { window.scrollTo(0, 0); }, [!!result]);

  if (result) {
    return (
      <main className="page">
        <p className="label">{refresh ? `Refresh ${refresh.at} of ${refresh.of} complete` : "Scale run complete"}</p>
        <h1 className="score">{result.clean ? "Clean run" : plural(result.mistakes, "mistake")}</h1>
        <p className="sub">{name(cell)}{revealed && !result.mistakes ? ", with Show me" : ""}</p>
        <p className="sub">Time from first note to last<br /><b className="avg">{result.time.toFixed(1)} seconds</b></p>
        {refresh ? (
          <>
            {refresh.next && <button className="primary" onClick={onNext}>Next: {name(refresh.next)}</button>}
            <button className="secondary" onClick={onAgain}>Again</button>
            <button className={refresh.next ? "ghost" : "primary"} onClick={onBack}>{refresh.next ? "End refresh" : "‹ Scale runs"}</button>
          </>
        ) : (
          <>
            <p className="sub">This position is now <b className="now">{STATE[result.state]}</b></p>
            <button className="primary" onClick={onNext}>Next run: {name(next)}</button>
            <button className="secondary" onClick={onAgain}>Again</button>
            <button className="ghost" onClick={onBack}>‹ Scale runs</button>
          </>
        )}
      </main>
    );
  }

  const up = st.i <= top(run);
  // Going up the notes light as they are played; at the turn they go out and light again on the way down
  const lit = up ? run.slice(0, st.i) : run.slice(top(run), st.i);
  const shown = !memory || revealed;
  const names = keyMap(cell.root, cell.type, false);
  return (
    <main className="page">
      <header className="bar">
        <button className="ghost small" onClick={onBack}>Quit</button>
        <span>{refresh ? `Refresh ${refresh.at} of ${refresh.of}` : memory ? "From memory" : "Shown"}{st.mistakes > 0 && ` · ${plural(st.mistakes, "mistake")}`}</span>
        <MicButton open={tuning} onToggle={() => setTuning(!tuning)} />
      </header>
      {tuning && <MicSettings />}
      <h2 className="prompt">{name(cell)}</h2>
      <div className="reading" aria-live="polite">
        <strong className="note">{st.i} / {run.length}</strong>
        <p className="cents">
          {st.wrong != null ? mistake(cell, run[st.i].midi, st.wrong, { cue: st.i === 0 && !shown })
            : deaf ? "Not listening"
            : st.i === 0 ? "Listening… start on the lowest note"
            : up ? "↑ Going up" : "↓ Going down"}
        </p>
      </div>
      <Listening hear={ear.hear} onProblem={setDeaf} />
      {shown && (
        <Fretboard tuning={TUNING.guitar} map={names} labels="degrees"
          shape={position(cell.root, cell.type, false, "five", cell.k, TUNING.guitar)}
          played={new Set(lit.map((n) => `${n.s}.${n.f}`))} />
      )}
      {!shown && <button className="secondary" onClick={() => setRevealed(true)}>Show me</button>}
    </main>
  );
}

// The Scale runs page: the map of every key and position, and the run it suggests next
export default function Runs({ onExit }) {
  const [store, setStore] = useState(readRuns);
  const [type, setType] = useState("major");
  const [cell, setCell] = useState(null); // the cell being run
  const [refresh, setRefresh] = useState(null); // { cells, at } while a refresh runs; at is 0-based
  const [count, setCount] = useState(0);  // runs started, so each gets a fresh Run
  const day = today();
  const next = suggest(store, day);

  // One listener for the page's whole life, so a note still ringing from one run does not count on the next
  const onNote = useRef(() => {});
  const ear = useRef(null);
  if (!ear.current) {
    const l = listener((m) => onNote.current(m), floor, RANGE);
    ear.current = { onNote, hear: (buf, rate, t) => l.hear(buf, rate, t) };
  }

  const start = (c, r = null) => { setCell(c); setRefresh(r); setCount((n) => n + 1); };
  const startRefresh = () => { const cells = refreshSet(store, day); start(cells[0], { cells, at: 0 }); };
  const save = (id, c) => {
    const s = { ...store };
    if (c) s[id] = c; else delete s[id];
    setStore(s); writeRuns(s);
  };

  useLayoutEffect(() => { window.scrollTo(0, 0); }, [cell ? count : 0]);

  if (cell) {
    const later = refresh?.cells[refresh.at + 1] ?? null;
    return <Run key={count} cell={cell} store={store} ear={ear.current} next={next} onSettle={save}
      refresh={refresh && { at: refresh.at + 1, of: refresh.cells.length, next: later }}
      onNext={() => (refresh ? start(later, { ...refresh, at: refresh.at + 1 }) : start(next))}
      onAgain={() => start(cell, refresh)} onBack={() => setCell(null)} />;
  }

  const rows = CELLS.filter((c) => c.type === type);
  const known = rows.filter((c) => ["known", "due"].includes(stateOf(store[c.id], day))).length;
  const refreshing = Math.min(refreshable(store, day).length, REFRESH);
  return (
    <main className="page">
      <header className="bar">
        <button className="ghost small" onClick={onExit}>‹ Back</button>
      </header>
      <h1 className="title">Scale runs</h1>
      <p className="sub hint">Play a position from its lowest note to its highest and back down. A first run shows the shape; after that it is from memory.</p>
      <button className="primary" onClick={() => start(next)}>Next run: {name(next)}</button>
      {refreshing > 0 && <button className="secondary" onClick={startRefresh}>Refresh known: {plural(refreshing, "run")}</button>}
      <Switch label="Key type" value={type} options={[["major", "Major"], ["minor", "Minor"]]} onChange={setType} />
      <p className="sub hint">{known} of {rows.length} known</p>
      <div className="runmap" role="group" aria-label={`${type} keys by position`}>
        <span />
        {[...Array(POSITIONS)].map((_, k) => <span key={k} className="pos">{k + 1}</span>)}
        {rows.map((c) => {
          const s = stateOf(store[c.id], day);
          return [
            c.k === 0 && <span key={c.root} className="root">{c.root}</span>,
            <button key={c.id} className={`cell ${s} ${c.id === next.id ? "next" : ""}`}
              aria-label={`${name(c)}, ${STATE[s]}`} onClick={() => start(c)} />,
          ];
        })}
      </div>
      <p className="legend">
        {Object.entries(STATE).map(([s, label]) => <span key={s}><i className={`cell ${s}`} />{label}</span>)}
      </p>
    </main>
  );
}
