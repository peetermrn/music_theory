# Design

## Context

Both listening pages go through `useMic` in `src/Mic.jsx`, which hands each analysis frame (an AnalyserNode's time-domain samples, about every 50 ms) to the page. Silence is decided in two places with the same constant, -60 dBFS RMS: `FLOOR` in `src/pitch.js`, the gate before YIN in `detect`, and a second `FLOOR` in `src/play.js`, which also keeps the listener's pluck detection from firing on silence. The browser's processing is switched off, including auto gain control, so the level the page sees depends on the hardware. Settings already stored on the device (sound, scale groups, custom exercises) use `localStorage` in try/catch.

## Goals / Non-Goals

**Goals:**
- One setting, read on every frame, so moving the slider takes effect at once without restarting the microphone.
- Pure modules stay pure: `pitch.js` and `play.js` get the level passed in and do not read storage.

**Non-Goals:**
- No gain stage in the audio graph.
- No React context or settings store beyond what the one value needs.

## Decisions

**The setting is the silence gate, not a gain.** YIN's normalised difference function does not change when the signal is scaled, so multiplying the input would only change which frames pass the gate, which is exactly what moving the gate does, without the risk of clipping. The pluck detector's other thresholds (`CLICK`, `ATTACK`) are ratios between frames, so they also do not depend on level. Considered: a GainNode before the analyser. Rejected, because it does the same thing in a less direct way.

**Store and read it in `Mic.jsx`.** A module-level value in `Mic.jsx` (`floor()` returns the gate as an RMS amplitude) is loaded from `localStorage` key `micGate` once and updated by the panel. Pages read it on every frame: `detect(buf, rate, range, octaveCheck, floor())`, and `listener(onNote, floor)` calls the getter. A module value fits because there is only one microphone and one value, and nothing needs to re-render when it changes, except the panel itself, which keeps its own state. Considered: React state lifted into App. Rejected: it would need threading through props for something that only the per-frame code reads.

**The input level comes from `useMic`.** `useMic` already has each frame, so it works out the RMS and keeps it in a module-level value next to the setting, and sets it to nothing when the microphone stops. The panel polls it about ten times a second while it is open, so the pages do not re-render on every frame. Only one listening page is shown at a time, so one value is enough.

**The slider sits on the meter, louder to the right.** The meter fills from left (quiet) to right (loud) over -80 to -30 dBFS, and the slider's thumb is the mark on it, as in a voice app's input-sensitivity control: the sound must reach past the thumb to be heard. So the left end is labelled "More sensitive" and the right "Less sensitive". This means "more sensitive" is on the left, the opposite of the Low/High slider first sketched. That is deliberate: with the meter behind it, the thumb and the level must move the same way, or the mark would move away from the sound when the user drags it. The fill is drawn in the muted colour below the thumb and in green above it.

**Shared components.** `Mic.jsx` exports `MicButton`, the gear button, and `MicSettings`, the panel. The panel is a sibling of the header, so each page puts the button in its header and the panel below it, with a small `useState` of whether it is open, owned by the page. The button goes in `.bar` like the ear-training header tools.

## Risks / Trade-offs

- [The meter's level is RMS over the analysis window (about 85–170 ms), so a short pluck reads lower than its peak] → The gate in `detect` uses the same measure on the same window, so what the meter shows is exactly what the gate sees.
- [A user sets it very sensitive, and in Play on guitar noise starts to count as plucks] → The dip threshold in YIN still rejects noise for the pitch, and Reset is one tap away. The hint says silence should stay below the mark.
- [A stored value from a later version is outside the range] → It is ignored and the default used.
