// Sound for ear training: short piano and guitar notes through the Web Audio API, nothing else.
// Every export is safe to call where Web Audio is missing or blocked: the app then stays silent.

// Tuning, in seconds unless noted
const GAP = 0.6;     // the second note starts this long after the first
const RING = 2.2;    // how long the last (or only) note sounds
const OVERLAP = 0.6; // how long a note keeps sounding after the next one has started
const RELEASE = 0.4; // fade-out at the end of a note
const FADE = 0.02;   // fade-out when a note is cut off, to avoid a click
const LEVEL = { piano: 1.4, guitar: 0.6 }; // gain per voice, matched by ear

// Voices: one recording every three semitones from C3 (MIDI 48) to C5
const FOLDER = { piano: "piano", guitar: "guitar" };
const SAMPLES = ["C3", "Ds3", "Fs3", "A3", "C4", "Ds4", "Fs4", "A4", "C5"];
const SAMPLE_LOW = 48, SAMPLE_STEP = 3;

let ctx = null;
let voice = "piano";
let live = [];    // gain nodes of the notes that are scheduled or sounding
let calls = 0;    // a play() overtaken by a newer play() or stop() while loading is dropped
const loads = {}; // voice -> promise of its decoded recordings

function context() {
  if (!ctx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    ctx = new Ctx();
  }
  if (ctx.state !== "running") ctx.resume().catch(() => {});
  return ctx;
}

function load(name) {
  if (!loads[name]) {
    loads[name] = Promise.all(SAMPLES.map(async (note) => {
      const res = await fetch(`${import.meta.env.BASE_URL}${FOLDER[name]}/${note}.mp3`);
      if (!res.ok) throw new Error(`${name} ${note}: ${res.status}`);
      const data = await res.arrayBuffer();
      // callback form: older Safari has no promise-returning decodeAudioData
      return new Promise((ok, fail) => ctx.decodeAudioData(data, ok, fail));
    }));
  }
  return loads[name];
}

// One note starting at `at` and sounding for `ring`, through its own gain node so stop() can fade it
function schedule(midi, at, ring, buffers, level) {
  const gain = ctx.createGain();
  // the nearest recording, shifted by at most a semitone
  const i = Math.max(0, Math.min(SAMPLES.length - 1, Math.round((midi - SAMPLE_LOW) / SAMPLE_STEP)));
  const src = ctx.createBufferSource();
  src.buffer = buffers[i];
  src.playbackRate.value = 2 ** ((midi - (SAMPLE_LOW + i * SAMPLE_STEP)) / 12);
  src.connect(gain).connect(ctx.destination);
  // the recording brings its own attack and decay; only the tail is faded
  gain.gain.setValueAtTime(level, at);
  gain.gain.setValueAtTime(level, at + ring - RELEASE);
  gain.gain.linearRampToValueAtTime(0, at + ring);
  src.start(at); src.stop(at + ring + 0.05);
  const entry = { gain, sources: [src] };
  src.onended = () => { live = live.filter((e) => e !== entry); gain.disconnect(); };
  live.push(entry);
}
// Silence whatever is sounding or scheduled
export function stop() {
  calls++;
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    live.forEach(({ gain, sources }) => {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + FADE);
      sources.forEach((s) => s.stop(now + FADE + 0.01));
    });
  } catch { /* nothing to silence */ }
  live = [];
}

// Play the given MIDI notes one after another in the current voice, cutting off the previous sound
export async function play(notes) {
  try {
    stop();
    const call = calls;
    context(); // resumed here, inside the tap, so that playback after loading is allowed
    const name = voice;
    const buffers = await load(name).catch(() => { delete loads[name]; throw new Error("unavailable"); }); // retried on the next play
    if (call !== calls) return;
    const at = ctx.currentTime + 0.03;
    notes.forEach((midi, i) => schedule(midi, at + i * GAP, i < notes.length - 1 ? GAP + OVERLAP : RING, buffers, LEVEL[name]));
  } catch { /* no Web Audio or no recordings: the question stays usable without sound */ }
}

export function setVoice(name) {
  voice = FOLDER[name] ? name : "piano";
}
