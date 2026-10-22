// Generated sound in the shape the microphone delivers it: frames of the latest samples,
// analysed every 50 ms. Pitches are in Hz, levels are RMS amplitudes of full scale.

export const RATE = 48000;
export const FRAME = 4096; // useMic's analyser size below 50 kHz
export const EVERY = 50;   // milliseconds between analyses

export const hzOf = (midi) => 440 * 2 ** ((midi - 69) / 12);
export const dbfs = (db) => 10 ** (db / 20);

// A steady sine of `hz` with RMS level `rms`
export function tone(hz, { rms = 0.1, rate = RATE, length = FRAME, phase = 0 } = {}) {
  const amp = rms * Math.SQRT2;
  const buf = new Float32Array(length);
  for (let i = 0; i < length; i++) buf[i] = amp * Math.sin(phase + (2 * Math.PI * hz * i) / rate);
  return buf;
}

// A tone whose fundamental is almost gone and whose 2nd harmonic is strongest, as a phone hears a
// bass string. Read naively it is an octave too high.
export function weakFundamental(hz, { rate = RATE, length = FRAME } = {}) {
  const buf = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    const t = i / rate;
    buf[i] = 0.002 * Math.sin(2 * Math.PI * hz * t) + 0.1 * Math.sin(4 * Math.PI * hz * t + 0.3) + 0.02 * Math.sin(6 * Math.PI * hz * t + 1);
  }
  return buf;
}

// Repeatable white noise of RMS level `rms`
export function noise({ rms = 0.05, length = FRAME, seed = 1 } = {}) {
  let s = seed;
  const rnd = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
  const buf = new Float32Array(length);
  for (let i = 0; i < length; i++) buf[i] = (rnd() * 2 - 1) * rms * Math.sqrt(3);
  return buf;
}

// A guitar-like recording: plucks of MIDI notes at given times (ms), each a few harmonics that
// decay, ending where the next pluck starts unless `ring` is set, or at `until` (ms) if given.
// A pluck with no `midi` is a hand muting the strings. sample(i) gives sample i.
export function recording(plucks, { rate = RATE, decay = 1.5, level = 0.3 } = {}) {
  const ms = (x) => Math.round((x / 1000) * rate);
  const notes = plucks.filter((p) => p.midi != null).map(({ midi, at, ring, until }) => {
    const after = plucks.find((p) => p.at > at);
    return { hz: hzOf(midi), start: ms(at), end: until != null ? ms(until) : ring || !after ? Infinity : ms(after.at) };
  });
  const PICK = Math.round(0.004 * rate); // the pick's click: 4 ms of broadband noise at the start of a pluck
  const hiss = (i) => { const x = Math.sin(i * 12.9898) * 43758.5453; return 2 * (x - Math.floor(x)) - 1; };
  return (i) => {
    let x = 0;
    for (const n of notes) {
      if (i < n.start || i >= n.end) continue;
      const t = (i - n.start) / rate;
      const env = level * Math.exp(-t * decay);
      x += env * (Math.sin(2 * Math.PI * n.hz * t) + 0.5 * Math.sin(4 * Math.PI * n.hz * t) + 0.25 * Math.sin(6 * Math.PI * n.hz * t));
      if (i - n.start < PICK) x += level * hiss(i) * (1 - (i - n.start) / PICK);
    }
    return x;
  };
}

// The frame the microphone holds at time `t` ms: the FRAME samples before it
export function frameAt(sample, t, { rate = RATE, length = FRAME } = {}) {
  const end = Math.round((t / 1000) * rate);
  const buf = new Float32Array(length);
  for (let i = 0; i < length; i++) { const j = end - length + i; buf[i] = j < 0 ? 0 : sample(j); }
  return buf;
}

// Feed `hear(buf, rate, t)` every EVERY ms from `from` to `to`
export function listen(hear, sample, from, to, { rate = RATE } = {}) {
  for (let t = from; t <= to; t += EVERY) hear(frameAt(sample, t, { rate }), rate, t);
}
