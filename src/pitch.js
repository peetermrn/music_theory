// Pitch detection for the tuner: YIN on one frame of microphone samples, and note maths at A4 = 440 Hz.
// Pure functions with no Web Audio or React, so they can be checked on generated samples.

const THRESHOLD = 0.15; // a dip of the normalised difference below this counts as a period
const FLOOR = 0.001;    // by default a frame quieter than this RMS level (-60 dBFS) is silence. Kept low: with its processing
                        // off, a phone microphone hears a guitar quietly. The dip threshold, not this, keeps noise out.
const CLEAN = 0.02;     // a dip this deep is a clear period: the octave check leaves it alone
const MAX_LAG = 800;    // longer periods are searched at half the sample rate
const OCTAVE = 0.5;     // ...otherwise twice the period is taken when its dip is under this share of the first one's

// The frequency heard in `buf` between `lo` and `hi` Hz, or null when no clear note is there.
// `octaveCheck` guards against reading an octave too high when the fundamental is weak, as a phone
// microphone hears a bass: at half the true period the dip is shallow, at the true period it is deep.
// A frame quieter than the RMS level `floor` is silence; the user's microphone sensitivity sets it.
export function detect(buf, rate, [lo, hi], octaveCheck = false, floor = FLOOR) {
  // Low notes need long lags: at half the sample rate the work is a quarter, with no loss of accuracy
  if (rate / lo > MAX_LAG) {
    const half = new Float32Array(buf.length >> 1);
    for (let i = 0; i < half.length; i++) half[i] = (buf[2 * i] + buf[2 * i + 1]) / 2;
    return detect(half, rate / 2, [lo, hi], octaveCheck, floor);
  }
  let power = 0;
  for (let i = 0; i < buf.length; i++) power += buf[i] * buf[i];
  if (Math.sqrt(power / buf.length) < floor) return null;

  const minLag = Math.max(2, Math.floor(rate / hi));
  const maxLag = Math.min(Math.ceil(rate / lo), Math.floor(buf.length / 2) - 1);
  const size = buf.length - maxLag - 1; // every lag compares windows of the same length
  // difference function, then each value divided by the mean of the ones before it
  const norm = new Float32Array(maxLag + 2);
  norm[0] = 1;
  let sum = 0;
  for (let lag = 1; lag <= maxLag + 1; lag++) {
    let d = 0;
    for (let i = 0; i < size; i++) { const x = buf[i] - buf[i + lag]; d += x * x; }
    sum += d;
    norm[lag] = sum ? (d * lag) / sum : 1;
  }

  // the first dip under the threshold, followed down to its lowest point
  let lag = minLag;
  while (lag <= maxLag && norm[lag] >= THRESHOLD) lag++;
  if (lag > maxLag) return null;
  while (lag < maxLag && norm[lag + 1] < norm[lag]) lag++;

  if (octaveCheck && norm[lag] > CLEAN) {
    let twice = 2 * lag;
    for (let l = twice - 2; l <= twice + 2; l++) if (l <= maxLag && norm[l] < norm[twice]) twice = l;
    if (twice <= maxLag && norm[twice] < norm[lag] * OCTAVE) lag = twice;
  }

  // a parabola through the dip and its neighbours finds the period between samples
  const [a, b, c] = [norm[lag - 1], norm[lag], norm[lag + 1]];
  const bend = a - 2 * b + c;
  const period = lag + (bend > 0 ? (a - c) / (2 * bend) : 0);
  return rate / period;
}

export const midiOf = (hz) => 69 + 12 * Math.log2(hz / 440);
export const hzOf = (midi) => 440 * 2 ** ((midi - 69) / 12);
export const centsFrom = (hz, midi) => 1200 * Math.log2(hz / hzOf(midi));

// Black keys have no key to choose a spelling from, so both are given
const NAMES = ["C", "C#/Db", "D", "D#/Eb", "E", "F", "F#/Gb", "G", "G#/Ab", "A", "A#/Bb", "B"];
export const letter = (midi) => NAMES[midi % 12];
export const noteName = (midi) => {
  const octave = Math.floor(midi / 12) - 1;
  return letter(midi).split("/").map((n) => n + octave).join("/");
};
