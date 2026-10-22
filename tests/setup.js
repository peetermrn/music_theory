// Runs before every test file. Page tests (jsdom) get a clean device each test: empty storage,
// no scroll position, and the browser APIs jsdom lacks.
import { afterEach, beforeEach, vi } from "vitest";

const browser = typeof window !== "undefined";

if (browser) {
  // jsdom has no PointerEvent; the Visuals dial reads clientX/clientY from one
  if (!window.PointerEvent) {
    window.PointerEvent = class PointerEvent extends window.MouseEvent {
      constructor(type, init = {}) { super(type, init); this.pointerId = init.pointerId ?? 1; }
    };
  }
  // jsdom logs "not implemented" for scrollTo; the app calls it on every new screen
  window.scrollTo = vi.fn();
}

beforeEach(() => {
  if (browser) { localStorage.clear(); window.scrollTo.mockClear(); }
});

afterEach(async () => {
  if (browser) (await import("@testing-library/react")).cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
