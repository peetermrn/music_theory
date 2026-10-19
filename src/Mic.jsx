import { useState, useRef, useEffect } from "react";
import { context } from "./audio.js";

// The microphone, shared by the tuner and Play on guitar. It is only held while a screen using
// this hook is shown and the app is visible; sound from it never leaves the phone.

const EVERY = 50; // milliseconds between analyses

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
          latest.current(buf, ctx.sampleRate, t);
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
