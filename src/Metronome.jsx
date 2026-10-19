import { useState, useRef, useEffect } from "react";
import { context } from "./audio.js";

const START = 100, MIN = 40, MAX = 240; // BPM
const STEPS = [-10, -1, 1, 10];
const BEATS = [2, 3, 4, 5, 6];
// Clicks are scheduled on the audio clock a little ahead of time, so they keep time when the page is busy
const AHEAD = 0.1; // seconds of clicks scheduled in advance
const TICK = 25;   // milliseconds between scheduling runs
const CLICK = { accent: [1600, 0.9], beat: [1000, 0.5] }; // pitch in Hz and level of a short blip

export default function Metronome({ onExit }) {
  const [bpm, setBpm] = useState(START);
  const [beats, setBeats] = useState(4);
  const [on, setOn] = useState(false);
  const [lit, setLit] = useState(-1); // beat whose click is sounding, -1 while stopped
  // the scheduler reads these as it goes, so a change applies from the next beat without a restart
  const now = useRef({});
  now.current = { bpm, beats };

  useEffect(() => {
    if (!on) return;
    let ctx;
    try { ctx = context(); } catch { setOn(false); return; } // no Web Audio: nothing to play
    let next = ctx.currentTime + 0.05, beat = 0, frame, lock, ended = false;
    const queue = [];   // [beat, time] of the clicks scheduled but not yet shown
    const blips = [];   // gain nodes of the clicks scheduled or sounding
    const click = (accent, at) => {
      const [hz, level] = accent ? CLICK.accent : CLICK.beat;
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.frequency.value = hz;
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(level, at + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.001, at + 0.03);
      osc.connect(gain).connect(ctx.destination);
      osc.start(at); osc.stop(at + 0.04);
      blips.push(gain);
      osc.onended = () => { blips.splice(blips.indexOf(gain), 1); gain.disconnect(); };
    };
    const schedule = () => {
      while (next < ctx.currentTime + AHEAD) {
        if (beat >= now.current.beats) beat = 0; // fewer beats chosen mid-bar: start a new bar
        click(beat === 0, next);
        queue.push([beat, next]);
        next += 60 / now.current.bpm;
        beat = (beat + 1) % now.current.beats;
      }
    };
    // the light follows the audio clock, so it matches what is heard
    const draw = () => {
      while (queue.length > 1 && queue[1][1] <= ctx.currentTime) queue.shift();
      if (queue[0]?.[1] <= ctx.currentTime) setLit(queue[0][0]);
      frame = requestAnimationFrame(draw);
    };
    schedule();
    const timer = setInterval(schedule, TICK);
    frame = requestAnimationFrame(draw);
    // keep the screen on while playing, where the phone allows it
    navigator.wakeLock?.request("screen")
      .then((l) => { if (ended) l.release(); else lock = l; })
      .catch(() => {});
    const hide = () => { if (document.hidden) setOn(false); };
    document.addEventListener("visibilitychange", hide);
    return () => {
      ended = true;
      clearInterval(timer);
      cancelAnimationFrame(frame);
      blips.forEach((g) => g.disconnect());
      lock?.release().catch(() => {});
      document.removeEventListener("visibilitychange", hide);
      setLit(-1);
    };
  }, [on]);

  const change = (step) => setBpm((b) => Math.min(MAX, Math.max(MIN, b + step)));
  // the audio context is resumed inside the tap, where the browser allows it
  const toggle = () => { if (!on) { try { context(); } catch { /* stays silent */ } } setOn(!on); };

  return (
    <main className="page">
      <header className="bar">
        <button className="ghost small" onClick={onExit}>‹ Back</button>
      </header>
      <h1 className="title">Metronome</h1>
      <p className="tempo"><strong>{bpm}</strong><span>BPM</span></p>
      <div className="nudge" role="group" aria-label="Tempo">
        {STEPS.map((s) => (
          <button key={s} onClick={() => change(s)} aria-label={`${s > 0 ? "Up" : "Down"} ${Math.abs(s)} BPM`}>
            {s > 0 ? `+${s}` : `−${-s}`}
          </button>
        ))}
      </div>
      <div className="beats" aria-hidden="true">
        {[...Array(beats)].map((_, i) => <i key={i} className={`${i ? "" : "first"} ${lit === i ? "lit" : ""}`} />)}
      </div>
      <h2 className="heading">Beats per bar</h2>
      <div className="switch even" role="group" aria-label="Beats per bar">
        {BEATS.map((n) => (
          <button key={n} className={beats === n ? "on" : ""} aria-pressed={beats === n} onClick={() => setBeats(n)}>{n}</button>
        ))}
      </div>
      <button className="primary go" onClick={toggle}>{on ? "Stop" : "Start"}</button>
    </main>
  );
}
