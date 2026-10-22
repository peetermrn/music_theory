// @vitest-environment jsdom
// openspec/specs/metronome/spec.md
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act, within } from "@testing-library/react";
import { context } from "../src/audio.js";
import Metronome from "../src/Metronome.jsx";
import { openApp, openEntry, tap, button, text } from "./helpers/app.jsx";
import { FakeAudioContext } from "./helpers/audio-context.js";

vi.mock("../src/audio.js", () => ({ play: vi.fn(() => Promise.resolve()), stop: vi.fn(), setVoice: vi.fn(), context: vi.fn() }));

let ctx, lock;
// Let `ms` pass on both the page's timers and the audio clock
const pass = (ms) => act(() => { for (let i = 0; i < ms; i += 5) { ctx.now += 0.005; vi.advanceTimersByTime(5); } });
const bpm = () => Number(document.querySelector(".tempo strong").textContent);
const step = (label) => fireEvent.click(within(screen.getByRole("group", { name: "Tempo" })).getByRole("button", { name: label }));
const beats = (n) => fireEvent.click(within(screen.getByRole("group", { name: "Beats per bar" })).getByRole("button", { name: String(n) }));
const markers = () => [...document.querySelectorAll(".beats i")];
const lit = () => markers().findIndex((m) => m.classList.contains("lit"));
const clicks = () => ctx.oscillators.map((o) => ({ hz: o.frequency.value, at: +o.at.toFixed(4) }));
const gaps = (list) => list.slice(1).map((c, i) => +(c.at - list[i].at).toFixed(4));
const openMetronome = () => render(<Metronome onExit={() => {}} />);

beforeEach(() => {
  vi.useFakeTimers();
  ctx = new FakeAudioContext();
  ctx.now = 5;
  context.mockReturnValue(ctx);
  lock = { release: vi.fn(() => Promise.resolve()) };
  Object.defineProperty(navigator, "wakeLock", { configurable: true, value: { request: vi.fn(async () => lock) } });
  Object.defineProperty(document, "hidden", { configurable: true, get: () => false });
});

describe("metronome", () => {
  describe("Requirement: Metronome page", () => {
    it("Scenario: Opening", () => {
      openApp();
      openEntry("Metronome");
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Metronome");
      expect(bpm()).toBe(100);
      expect(button("4").getAttribute("aria-pressed")).toBe("true");
      expect(button("Start")).toBeTruthy();
      pass(2000);
      expect(ctx.oscillators).toHaveLength(0);
    });

    it("Scenario: Back to home", () => {
      localStorage.setItem("theory-quiz.best.notes", "5");
      openApp();
      const before = document.querySelector("main").innerHTML;
      openEntry("Metronome");
      tap("Start");
      tap("‹ Back");
      expect(document.querySelector("main").innerHTML).toBe(before);
    });

    it("has no questions, score, timer or session", () => {
      openMetronome();
      expect(text()).not.toMatch(/correct|Score|Best|\d+ \/ \d+/);
    });
  });

  describe("Requirement: Tempo", () => {
    it("Scenario: Small and large steps", () => {
      openMetronome();
      step("Up 10 BPM"); step("Up 10 BPM"); step("Down 1 BPM");
      expect(bpm()).toBe(119);
    });

    it("labels the buttons −10, −1, +1 and +10", () => {
      openMetronome();
      expect(within(screen.getByRole("group", { name: "Tempo" })).getAllByRole("button").map((b) => b.textContent)).toEqual(["−10", "−1", "+1", "+10"]);
    });

    it("Scenario: Upper limit", () => {
      openMetronome();
      for (let i = 0; i < 13; i++) step("Up 10 BPM");
      for (let i = 0; i < 5; i++) step("Up 1 BPM");
      expect(bpm()).toBe(235);
      step("Up 10 BPM");
      expect(bpm()).toBe(240);
      step("Up 1 BPM");
      expect(bpm()).toBe(240);
    });

    it("Scenario: Lower limit", () => {
      openMetronome();
      for (let i = 0; i < 6; i++) step("Down 10 BPM");
      expect(bpm()).toBe(40);
      step("Down 1 BPM");
      expect(bpm()).toBe(40);
      step("Up 1 BPM"); step("Down 10 BPM");
      expect(bpm()).toBe(40);
    });

    it("Scenario: Tempo is not remembered", () => {
      const first = openMetronome();
      for (let i = 0; i < 3; i++) step("Down 10 BPM");
      step("Up 1 BPM"); step("Up 1 BPM");
      expect(bpm()).toBe(72);
      first.unmount();
      openMetronome();
      expect(bpm()).toBe(100);
    });
  });

  describe("Requirement: Beats per bar", () => {
    it("offers 2 to 6 beats, with 4 chosen", () => {
      openMetronome();
      const group = within(screen.getByRole("group", { name: "Beats per bar" }));
      expect(group.getAllByRole("button").map((b) => b.textContent)).toEqual(["2", "3", "4", "5", "6"]);
      expect(group.getAllByRole("button").map((b) => b.getAttribute("aria-pressed"))).toEqual(["false", "false", "true", "false", "false"]);
    });

    it("Scenario: Waltz time", () => {
      openMetronome();
      beats(3);
      tap("Start");
      pass(4000);
      const hz = clicks().map((c) => c.hz);
      expect(hz.length).toBeGreaterThan(6);
      hz.forEach((f, i) => expect(f).toBe(i % 3 === 0 ? 1600 : 1000));
    });
  });

  describe("Requirement: Start and stop", () => {
    it("Scenario: Starting", () => {
      openMetronome();
      tap("Start");
      expect(button("Stop")).toBeTruthy();
      expect(clicks()[0]).toEqual({ hz: 1600, at: 5.05 });
      pass(3000);
      const list = clicks();
      expect(list.length).toBeGreaterThanOrEqual(5);
      for (const g of gaps(list)) expect(g).toBeCloseTo(0.6, 9); // 100 BPM, no drift
      list.forEach((c, i) => expect(c.hz).toBe(i % 4 === 0 ? 1600 : 1000));
    });

    it("schedules each click a little ahead on the audio clock", () => {
      openMetronome();
      tap("Start");
      pass(2000);
      for (const c of clicks()) expect(c.at).toBeLessThanOrEqual(ctx.now + 0.1 + 1e-9);
    });

    it("Scenario: Changing tempo while playing", () => {
      openMetronome();
      tap("Start");
      pass(1000);
      const before = clicks().length;
      step("Up 10 BPM");
      pass(3000);
      const list = clicks();
      const after = gaps(list.slice(before));
      expect(gaps(list.slice(0, before)).every((g) => Math.abs(g - 0.6) < 1e-9)).toBe(true);
      for (const g of after) expect(g).toBeCloseTo(60 / 110, 3);
      // no pause where the tempo changed
      expect(+(list[before].at - list[before - 1].at).toFixed(4)).toBeLessThanOrEqual(0.6);
      expect(bpm()).toBe(110);
    });

    it("changes the beats per bar from the next beat without stopping", () => {
      openMetronome();
      tap("Start");
      pass(700); // two clicks of a 4-beat bar
      beats(2);
      pass(3000);
      const hz = clicks().map((c) => c.hz);
      expect(hz.slice(0, 2)).toEqual([1600, 1000]);
      hz.slice(2).forEach((f, i) => expect(f).toBe(i % 2 === 0 ? 1600 : 1000));
      expect(gaps(clicks()).every((g) => Math.abs(g - 0.6) < 1e-9)).toBe(true);
    });

    it("Scenario: Stopping", () => {
      openMetronome();
      tap("Start");
      pass(1500);
      tap("Stop");
      const count = ctx.oscillators.length;
      pass(3000);
      expect(ctx.oscillators).toHaveLength(count);
      expect(button("Start")).toBeTruthy();
    });

    it("stays silent where there is no Web Audio", () => {
      context.mockImplementation(() => { throw new Error("no audio"); });
      openMetronome();
      tap("Start");
      pass(500);
      expect(button("Start")).toBeTruthy();
    });
  });

  describe("Requirement: Beat indicator", () => {
    it("Scenario: Following the beat", () => {
      openMetronome();
      expect(markers()).toHaveLength(4);
      expect(markers().map((m) => m.classList.contains("first"))).toEqual([true, false, false, false]);
      tap("Start");
      const seen = [];
      for (let i = 0; i < 120; i++) { pass(50); if (lit() >= 0 && seen.at(-1) !== lit()) seen.push(lit()); }
      // lit in turn, each at the moment of its click, back to the first on each accent
      expect(seen.slice(0, 9)).toEqual([0, 1, 2, 3, 0, 1, 2, 3, 0]);
    });

    it("lights a beat when its click sounds, not when it is scheduled", () => {
      openMetronome();
      tap("Start");
      pass(620); // the 2nd click (at 5.65) is scheduled but not yet sounding
      expect(lit()).toBe(0);
      pass(60);
      expect(lit()).toBe(1);
    });

    it("shows one marker per beat of the bar", () => {
      openMetronome();
      beats(6);
      expect(markers()).toHaveLength(6);
      beats(2);
      expect(markers()).toHaveLength(2);
    });

    it("lights nothing while stopped", () => {
      openMetronome();
      expect(lit()).toBe(-1);
      tap("Start");
      pass(1000);
      tap("Stop");
      pass(100);
      expect(lit()).toBe(-1);
    });
  });

  describe("Requirement: Screen stays on while playing", () => {
    it("Scenario: Long practice", async () => {
      openMetronome();
      tap("Start");
      await act(async () => {});
      expect(navigator.wakeLock.request).toHaveBeenCalledWith("screen");
      tap("Stop");
      expect(lock.release).toHaveBeenCalled();
    });

    it("works where the phone does not allow it", () => {
      Object.defineProperty(navigator, "wakeLock", { configurable: true, value: undefined });
      openMetronome();
      tap("Start");
      pass(1500);
      expect(ctx.oscillators.length).toBeGreaterThan(1);
    });
  });

  describe("Requirement: Stops when left", () => {
    it("Scenario: Leaving the page", () => {
      openApp();
      openEntry("Metronome");
      tap("Start");
      pass(1000);
      tap("‹ Back");
      const count = ctx.oscillators.length;
      pass(3000);
      expect(ctx.oscillators).toHaveLength(count);
      expect(ctx.oscillators.every((o) => o.gain.disconnected)).toBe(true);
      expect(screen.getByRole("heading", { name: "Tools" })).toBeTruthy();
    });

    it("Scenario: Switching apps", () => {
      openMetronome();
      tap("Start");
      pass(1000);
      act(() => {
        Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
        document.dispatchEvent(new Event("visibilitychange"));
      });
      expect(button("Start")).toBeTruthy();
      act(() => {
        Object.defineProperty(document, "hidden", { configurable: true, get: () => false });
        document.dispatchEvent(new Event("visibilitychange"));
      });
      const count = ctx.oscillators.length;
      pass(3000);
      expect(ctx.oscillators).toHaveLength(count);
      expect(button("Start")).toBeTruthy();
    });
  });
});
