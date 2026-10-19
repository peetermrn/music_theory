import { useState, useRef, useEffect } from "react";
import { context, play } from "./audio.js";
import { TUNING } from "./theory.js";
import { detect, midiOf, hzOf, centsFrom, noteName, letter } from "./pitch.js";

const INSTRUMENTS = [["guitar", "Guitar"], ["bass", "Bass"], ["manual", "Manual"]];
// Hz searched for a note: each instrument's open strings with a margin, or every note from E1 to C6
const RANGE = { guitar: [70, 420], bass: [35, 130], manual: [38, 1100] };
const SPAN = 1.5;      // a selected string is searched within this factor (about 7 semitones) either way
const IN_TUNE = 5;     // cents
const EVERY = 50;      // milliseconds between analyses
const STEADY = 3;      // analyses within a semitone of each other before a note is shown, so speech is ignored
const SMOOTH = 5;      // readings shown are the median of this many
const DIM = 200, CLEAR = 1200; // milliseconds after the last note heard until its reading dims, then goes

// What the browser's error means for the user
const PROBLEM = {
  NotAllowedError: "The tuner needs the microphone, and it is blocked for this site. Allow it in the browser's site settings (tap the icon beside the address, or Settings › Site settings › Microphone), then try again.",
  NotFoundError: "No microphone was found on this device.",
  NotReadableError: "The microphone is in use by another app. Close that app, then try again.",
  insecure: "The microphone only works when the app is opened over https or on localhost.",
  other: "The microphone could not be started.",
};
const SAME = { SecurityError: "NotAllowedError", OverconstrainedError: "NotFoundError", AbortError: "NotReadableError" };

const median = (a) => [...a].sort((x, y) => x - y)[a.length >> 1];

export default function Tuner({ onExit }) {
  const [instrument, setInstrument] = useState("guitar");
  const [sel, setSel] = useState(null); // index of the selected string; null finds the string by itself
  const [view, setView] = useState(null); // { midi, string, cents, fresh } of the reading shown
  const [problem, setProblem] = useState(null);
  const [visible, setVisible] = useState(!document.hidden);
  const [attempt, setAttempt] = useState(0); // "Try again" asks for the microphone once more
  const now = useRef({});
  now.current = { instrument, sel };
  const heard = useRef({ notes: [], cents: [], midi: null, at: 0 });

  // The microphone is only held while this page is shown and the app is visible
  useEffect(() => {
    const change = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", change);
    return () => document.removeEventListener("visibilitychange", change);
  }, []);

  useEffect(() => {
    if (!visible) return;
    let stream, source, frame, gone = false;
    setProblem(null);
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw Object.assign(new Error(), { name: "insecure" });
        const ctx = context();
        // the browser's call processing treats a held note as noise, so it is switched off
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
        });
        if (gone) return stream.getTracks().forEach((t) => t.stop());
        source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 4096;
        source.connect(analyser); // not to the speakers
        const buf = new Float32Array(analyser.fftSize);
        let last = 0;
        const loop = (t) => {
          frame = requestAnimationFrame(loop);
          if (t - last < EVERY) return;
          last = t;
          analyser.getFloatTimeDomainData(buf);
          listen(buf, ctx.sampleRate, t);
        };
        frame = requestAnimationFrame(loop);
      } catch (e) {
        if (!gone) { const name = SAME[e.name] || e.name; setProblem(PROBLEM[name] ? name : "other"); }
      }
    })();
    return () => {
      gone = true;
      cancelAnimationFrame(frame);
      source?.disconnect();
      stream?.getTracks().forEach((t) => t.stop()); // what makes the phone drop its microphone indicator
    };
  }, [visible, attempt]);

  // One analysis: find the note, measure it against its target, and update what is shown
  const listen = (buf, rate, t) => {
    const { instrument, sel } = now.current;
    const strings = TUNING[instrument];
    const h = heard.current;
    const range = sel != null ? [hzOf(strings[sel]) / SPAN, hzOf(strings[sel]) * SPAN] : RANGE[instrument];
    const hz = detect(buf, rate, range, instrument !== "manual" && sel == null);
    if (hz) {
      const m = midiOf(hz);
      h.notes = [...h.notes, m].slice(-STEADY);
      const steady = h.notes.length === STEADY && Math.max(...h.notes) - Math.min(...h.notes) < 1;
      if (steady) {
        const string = instrument === "manual" ? null
          : sel ?? strings.reduce((best, s, i) => (Math.abs(s - m) < Math.abs(strings[best] - m) ? i : best), 0);
        const midi = string == null ? Math.round(m) : strings[string];
        if (midi !== h.midi) { h.midi = midi; h.cents = []; } // a new target reads straight away
        h.cents = [...h.cents, centsFrom(hz, midi)].slice(-SMOOTH);
        h.at = t;
        return setView({ midi, string, cents: median(h.cents), fresh: true });
      }
    } else h.notes = [];
    if (t - h.at > CLEAR) { h.midi = null; setView(null); }
    else if (t - h.at > DIM) setView((v) => v && v.fresh ? { ...v, fresh: false } : v);
  };

  const reset = () => { heard.current = { notes: [], cents: [], midi: null, at: 0 }; setView(null); };
  const choose = (id) => { setInstrument(id); setSel(null); reset(); };
  const tap = (i) => {
    if (sel === i) return setSel(null);
    setSel(i);
    play([TUNING[instrument][i]], undefined, "guitar"); // the reference tone is always the guitar sound
  };

  const strings = instrument === "manual" ? null : TUNING[instrument];
  const cents = view && Math.round(view.cents);
  const tuned = view && Math.abs(view.cents) <= IN_TUNE;
  const far = view && Math.abs(view.cents) > 50;
  const shown = sel ?? view?.string; // the string the reading is measured against

  return (
    <main className="page">
      <header className="bar">
        <button className="ghost small" onClick={onExit}>‹ Back</button>
      </header>
      <h1 className="title">Tuner</h1>
      <div className="switch even" role="group" aria-label="Instrument">
        {INSTRUMENTS.map(([id, text]) => (
          <button key={id} className={instrument === id ? "on" : ""} aria-pressed={instrument === id} onClick={() => choose(id)}>{text}</button>
        ))}
      </div>
      {problem ? (
        <div className="problem">
          <p>{PROBLEM[problem]}</p>
          <button className="secondary" onClick={() => setAttempt((a) => a + 1)}>Try again</button>
        </div>
      ) : (
        <div className={`reading ${view && !view.fresh ? "stale" : ""} ${tuned ? "tuned" : ""}`} aria-live="polite">
          <strong className="note">{view ? noteName(view.midi) : "—"}</strong>
          <div className="meter">
            <span className="zone" />
            {view && <i style={{ left: `${50 + Math.max(-50, Math.min(50, view.cents))}%` }} />}
          </div>
          <p className="cents">
            {!view ? "Play a note"
              : tuned ? "In tune"
              : `${cents > 0 ? "+" : "−"}${Math.abs(cents)} cents${far ? ` · tune ${cents < 0 ? "up" : "down"}` : ""}`}
          </p>
        </div>
      )}
      {strings && (
        <>
          <div className="strings" role="group" aria-label="Strings">
            {strings.map((midi, i) => (
              <button key={i} className={`${sel === i ? "locked" : ""} ${shown === i ? "on" : ""}`} aria-pressed={sel === i} onClick={() => tap(i)}>
                {letter(midi)}
              </button>
            ))}
          </div>
          <p className="sub hint">
            {sel == null ? "Finds the string by itself. Tap a string to hear it and tune only that one."
              : `Tuning ${noteName(strings[sel])}. Tap it again to find the string by itself.`}
          </p>
        </>
      )}
    </main>
  );
}
