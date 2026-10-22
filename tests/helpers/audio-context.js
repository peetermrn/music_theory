// A Web Audio stand-in that records what would sound: buffer sources (recordings), oscillators
// (metronome clicks) and microphone sources. `now` is the audio clock, moved by the test.

const param = (value = 0) => ({
  value,
  events: [],
  setValueAtTime(v, t) { this.events.push(["set", v, t]); this.value = v; },
  linearRampToValueAtTime(v, t) { this.events.push(["linear", v, t]); },
  exponentialRampToValueAtTime(v, t) { this.events.push(["exp", v, t]); },
  cancelScheduledValues(t) { this.events.push(["cancel", t]); },
});

const node = (extra) => ({
  connected: [],
  connect(to) { this.connected.push(to); return to; },
  disconnect() { this.connected = []; this.disconnected = true; },
  ...extra,
});

export class FakeAudioContext {
  constructor() {
    this.now = 0;
    this.sampleRate = 48000;
    this.state = "running";
    this.destination = node({ name: "destination" });
    this.sources = [];     // recordings started: { buffer, rate, at, until }
    this.oscillators = []; // clicks started: { hz, at, gain }
    this.analysers = [];
    this.streams = [];
    FakeAudioContext.instances.push(this);
  }
  get currentTime() { return this.now; }
  resume() { this.state = "running"; return Promise.resolve(); }
  createGain() { return node({ gain: param(1) }); }
  createBufferSource() {
    const ctx = this;
    const src = node({
      buffer: null, playbackRate: param(1), onended: null,
      start(at) { this.at = at; ctx.sources.push(this); },
      stop(at) { this.until = at; },
    });
    return src;
  }
  createOscillator() {
    const ctx = this;
    return node({
      frequency: param(440), onended: null,
      connect(to) { this.gain = to; return to; },
      start(at) { this.at = at; ctx.oscillators.push(this); },
      stop(at) { this.until = at; },
    });
  }
  createMediaStreamSource(stream) { const s = node({ stream }); this.streams.push(s); return s; }
  createAnalyser() {
    const a = node({ fftSize: 2048, getFloatTimeDomainData(buf) { buf.fill(0); } });
    this.analysers.push(a);
    return a;
  }
  decodeAudioData(data, ok) { ok({ decoded: data }); }
}
FakeAudioContext.instances = [];
