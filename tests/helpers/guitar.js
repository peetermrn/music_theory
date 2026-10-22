// A guitar played into a listening page: plucks become microphone frames, delivered every 50 ms
// to the page's listen callback while the page's clock (fake timers) moves on with them.
import { act } from "@testing-library/react";
import { vi } from "vitest";
import { recording, frameAt, RATE, EVERY } from "./sound.js";

export function guitar(hear) {
  const origin = performance.now();
  const plucks = [];
  let sample = () => 0;
  const at = () => performance.now() - origin;
  const self = {
    // Let `ms` of sound reach the page
    run(ms) {
      act(() => {
        for (let left = ms; left > 0; left -= EVERY) {
          vi.advanceTimersByTime(EVERY);
          hear()(frameAt(sample, at()), RATE, performance.now());
        }
      });
      return self;
    },
    pluck(midi, ms = 400) { plucks.push({ midi, at: at() }); sample = recording(plucks); return self.run(ms); },
    twice(midi) { return self.pluck(midi).pluck(midi); },
    mute(ms = 400) { plucks.push({ midi: null, at: at() }); sample = recording(plucks); return self.run(ms); },
  };
  return self;
}
