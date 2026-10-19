import { useState, useRef, useEffect } from "react";
import { context } from "./audio.js";

// The microphone, shared by the tuner and Play on guitar. It is only held while a screen using
// this hook is shown and the app is visible; sound from it never leaves the phone.

const EVERY = 50; // milliseconds between analyses

// Sensitivity: the level in dBFS below which a frame is silence. Microphones differ, so the user sets it.
// It is one value for the whole app, read on every analysis, so a change applies at once.
const GATE_KEY = "micGate";
const GATE = -60, QUIETEST = -80, LOUDEST = -30, STEP = 2;
const clampGate = (db) => Math.max(QUIETEST, Math.min(LOUDEST, Math.round(db / STEP) * STEP));
let gate = (() => {
  try {
    const db = Number(localStorage.getItem(GATE_KEY) ?? NaN);
    return db >= QUIETEST && db <= LOUDEST ? clampGate(db) : GATE;
  } catch { return GATE; }
})();
function setGate(db) {
  gate = clampGate(db);
  try { localStorage.setItem(GATE_KEY, String(gate)); } catch { /* ignore */ }
}
// The silence level as an RMS amplitude, as detect() and the listener read it
export const floor = () => 10 ** (gate / 20);

let level = null; // RMS of the latest analysis, or null while the microphone is not listening
const dB = (rms) => 20 * Math.log10(Math.max(rms, 1e-9));

// What the browser's error means for the user
const PROBLEM = {
  NotAllowedError: (what) => `${what} needs the microphone, and it is blocked for this site. Allow it in the browser's site settings (tap the icon beside the address, or Settings › Site settings › Microphone), then try again.`,
  NotFoundError: () => "No microphone was found on this device.",
  NotReadableError: () => "The microphone is in use by another app. Close that app, then try again.",
  insecure: () => "The microphone only works when the app is opened over https or on localhost.",
  other: () => "The microphone could not be started.",
};
const SAME = { SecurityError: "NotAllowedError", OverconstrainedError: "NotFoundError", AbortError: "NotReadableError" };

// Calls `listen(buf, sampleRate, t)` about every EVERY milliseconds with the latest samples.
// The newest `listen` is always used, so changing what it reads does not restart the microphone.
export function useMic(listen) {
  const [problem, setProblem] = useState(null);
  const [visible, setVisible] = useState(!document.hidden);
  const [attempt, setAttempt] = useState(0); // "Try again" asks for the microphone once more
  const latest = useRef(listen);
  latest.current = listen;

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
        analyser.fftSize = ctx.sampleRate > 50000 ? 8192 : 4096; // long enough for a bass low E at any sample rate
        source.connect(analyser); // not to the speakers
        const buf = new Float32Array(analyser.fftSize);
        let last = 0;
        const loop = (t) => {
          frame = requestAnimationFrame(loop);
          if (t - last < EVERY) return;
          last = t;
          analyser.getFloatTimeDomainData(buf);
          let power = 0;
          for (let i = 0; i < buf.length; i++) power += buf[i] * buf[i];
          level = Math.sqrt(power / buf.length);
          latest.current(buf, ctx.sampleRate, t);
        };
        frame = requestAnimationFrame(loop);
      } catch (e) {
        if (!gone) { const name = SAME[e.name] || e.name; setProblem(PROBLEM[name] ? name : "other"); }
      }
    })();
    return () => {
      gone = true;
      level = null;
      cancelAnimationFrame(frame);
      source?.disconnect();
      stream?.getTracks().forEach((t) => t.stop()); // what makes the phone drop its microphone indicator
    };
  }, [visible, attempt]);

  return { problem, retry: () => setAttempt((a) => a + 1) };
}

// `what` names who needs the microphone, such as "The tuner"
export function MicProblem({ problem, what, onRetry }) {
  return (
    <div className="problem">
      <p>{PROBLEM[problem](what)}</p>
      <button className="secondary" onClick={onRetry}>Try again</button>
    </div>
  );
}

// The gear button for a listening page's header bar; `open` and `onToggle` belong to the page
export function MicButton({ open, onToggle }) {
  return (
    <button className={`bulb gear ${open ? "on" : ""}`} onClick={onToggle} aria-expanded={open} aria-label="Microphone sensitivity">⚙</button>
  );
}

// The sensitivity panel under the header: the live input level with the setting's slider on top of it,
// both from quiet on the left to loud on the right, so the sound must reach past the thumb to be heard
export function MicSettings() {
  const [value, setValue] = useState(gate);
  const [now, setNow] = useState(level);
  useEffect(() => {
    const id = setInterval(() => setNow(level), 100);
    return () => clearInterval(id);
  }, []);
  const change = (db) => { setGate(db); setValue(gate); };
  const at = (db) => `${((Math.max(QUIETEST, Math.min(LOUDEST, db)) - QUIETEST) / (LOUDEST - QUIETEST)) * 100}%`;
  const heard = now != null && dB(now) >= value;

  return (
    <section className="mic" aria-label="Microphone sensitivity">
      <p className="heading">Microphone sensitivity</p>
      <div className="level">
        <i className={heard ? "heard" : ""} style={{ width: now == null ? 0 : at(dB(now)) }} />
        <input type="range" min={QUIETEST} max={LOUDEST} step={STEP} value={value}
          onChange={(e) => change(Number(e.target.value))} aria-label="Sensitivity: more sensitive to the left" />
      </div>
      <div className="ends"><span>More sensitive</span><span>Less sensitive</span></div>
      <p className="sub hint">Play a string: the bar should pass the slider. In silence it should stay below it.</p>
      <button className="ghost small" onClick={() => change(GATE)} disabled={value === GATE}>Reset</button>
    </section>
  );
}
