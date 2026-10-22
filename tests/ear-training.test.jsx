// @vitest-environment jsdom
// openspec/specs/ear-training/spec.md
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EXERCISES, EAR_TOTAL } from "../src/ear.js";
import { play, stop, setVoice } from "../src/audio.js";
import Ear from "../src/Ear.jsx";
import { openApp, openEntry, tap, button, text } from "./helpers/app.jsx";
import { blockStorage } from "./helpers/storage.js";
import { FakeAudioContext } from "./helpers/audio-context.js";

vi.mock("../src/audio.js", () => ({ play: vi.fn(() => Promise.resolve()), stop: vi.fn(), setVoice: vi.fn(), context: vi.fn() }));

const ex = EXERCISES.find((e) => e.id === "intervals");
const NAMES = ["Minor 2nd", "Major 2nd", "Minor 3rd", "Major 3rd", "Perfect 4th", "Tritone", "Perfect 5th",
  "Minor 6th", "Major 6th", "Minor 7th", "Major 7th", "Octave"];
const name = (semis) => NAMES[semis - 1];
const LEVELS = [[4, 12], [4, 7, 12], [3, 4, 5, 7, 12], [1, 2, 3, 4, 5, 7, 12], [1, 2, 3, 4, 5, 7, 8, 9, 12], [...Array(12)].map((_, i) => i + 1)];

const choices = () => [...document.querySelectorAll(".answer.ear")].map((b) => b.textContent.replace(" ✓", ""));
const lastPlayed = () => play.mock.calls.at(-1);
const openPage = () => { const r = render(<Ear exercise={ex} onExit={vi.fn()} />); return r; };
// Records every question the page asks
const watch = () => vi.spyOn(ex, "question");
const current = (spy) => spy.mock.results.at(-1).value;
const startLevel = (n) => tap(new RegExp(`^Level ${n}`));

beforeEach(() => { play.mockClear(); stop.mockClear(); setVoice.mockClear(); });

// The app's real sound engine (audio.js, mocked for the pages above) on a fake Web Audio and fetch
const fetchOk = () => vi.fn(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) }));
async function engine() {
  vi.resetModules();
  const audio = await vi.importActual("../src/audio.js");
  window.AudioContext = FakeAudioContext;
  vi.stubGlobal("fetch", fetchOk());
  return { audio, ctx: audio.context() };
}

describe("ear-training", () => {
  describe("Requirement: Interval training page", () => {
    it("Scenario: Page content", () => {
      openApp();
      openEntry("Interval training");
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Interval training");
      for (let i = 1; i <= 6; i++) expect(button(new RegExp(`^Level ${i}`))).toBeTruthy();
      expect(screen.getByRole("heading", { name: "Custom" })).toBeTruthy();
      expect(play).not.toHaveBeenCalled();
    });

    it("Scenario: Back to home", () => {
      openApp();
      openEntry("Interval training");
      tap("‹ Back");
      expect(screen.getByRole("heading", { name: "Ear training" })).toBeTruthy();
      expect(screen.getByRole("heading", { name: "Keys" })).toBeTruthy();
    });

    it("lists the intervals each level asks", () => {
      openPage();
      expect(button(/^Level 1/).textContent).toContain("Major 3rd and Octave");
      expect(button(/^Level 2/).textContent).toContain("Adds perfect 5th");
      expect(button(/^Level 3/).textContent).toContain("Adds minor 3rd and perfect 4th");
      expect(button(/^Level 6/).textContent).toContain("Adds tritone, minor 7th and major 7th");
    });
  });

  describe("Requirement: Interval question", () => {
    it("Scenario: Major 3rd", () => {
      for (let i = 0; i < 50; i++) {
        const q = ex.question([4]);
        expect(q.notes[1] - q.notes[0]).toBe(4);
        expect(name(q.answer)).toBe("Major 3rd");
      }
    });

    it("Scenario: Order of the notes", () => {
      const spy = watch();
      openPage();
      startLevel(6);
      const q = current(spy);
      const [steps, gap] = lastPlayed();
      expect(steps).toEqual([q.root, q.root + q.answer]);
      expect(steps[0]).toBeLessThan(steps[1]);
      expect(gap).toBeGreaterThan(0);
    });

    it("has the twelve intervals from a minor 2nd to an octave", () => {
      expect(ex.items.map((i) => i.name)).toEqual(NAMES);
      expect(ex.items.map((i) => i.id)).toEqual([...Array(12)].map((_, i) => i + 1));
      for (const semis of ex.items.map((i) => i.id)) {
        const q = ex.question([semis]);
        expect(q.notes).toEqual([q.root, q.root + semis]);
      }
    });

    it("plays the steps a gap apart, notes of a step together, and skips a rest", async () => {
      const { audio, ctx } = await engine();
      ctx.now = 10;
      await audio.play([60, [60, 64, 67], null, 72], 0.5);
      expect(ctx.sources.map((x) => +(x.at - 10).toFixed(2))).toEqual([0.03, 0.53, 0.53, 0.53, 1.53]);
    });

    it("plays each note at its pitch from the nearest recording", async () => {
      const { audio, ctx } = await engine();
      await audio.play([61, 47], 0.6);
      const [a, b] = ctx.sources;
      expect(a.playbackRate.value).toBeCloseTo(2 ** (1 / 12), 6);
      expect(b.playbackRate.value).toBeCloseTo(2 ** (-1 / 12), 6);
    });
  });

  describe("Requirement: Random starting note", () => {
    it("chooses the lower note from at least an octave in the middle register", () => {
      const roots = new Set([...Array(2000)].map(() => ex.question([7]).root));
      expect(Math.max(...roots) - Math.min(...roots)).toBeGreaterThanOrEqual(12);
      expect(Math.min(...roots)).toBeGreaterThanOrEqual(40);
      expect(Math.max(...roots) + 12).toBeLessThanOrEqual(84);
    });

    it("Scenario: Same interval, different pitch", () => {
      const spy = watch();
      openPage();
      startLevel(1);
      const asked = [];
      for (let n = 0; n < EAR_TOTAL; n++) {
        asked.push(current(spy));
        tap(name(current(spy).answer));
        tap(n + 1 < EAR_TOTAL ? "Next" : "Finish");
      }
      for (const semis of [4, 12]) {
        const roots = asked.filter((q) => q.answer === semis).map((q) => q.root);
        expect(new Set(roots).size).toBe(roots.length);
      }
    });
  });

  describe("Requirement: Levels", () => {
    it("asks exactly the intervals of each level", () => {
      expect(ex.levels).toHaveLength(6);
      ex.levels.forEach((ids, i) => expect([...ids].sort((a, b) => a - b)).toEqual(LEVELS[i]));
    });

    it("Scenario: Level 1", () => {
      for (let i = 0; i < 200; i++) expect([4, 12]).toContain(ex.question(ex.levels[0]).answer);
    });

    it("Scenario: Level 3", () => {
      for (let i = 0; i < 200; i++) expect([3, 4, 5, 7, 12]).toContain(ex.question(ex.levels[2]).answer);
    });

    it("Scenario: Level 6", () => {
      const asked = new Set([...Array(1000)].map(() => ex.question(ex.levels[5]).answer));
      expect(asked.size).toBe(12);
    });

    it("Scenario: No locking", () => {
      const spy = watch();
      openApp();
      openEntry("Interval training");
      startLevel(6);
      expect(screen.getByText("Which interval is this?")).toBeTruthy();
      expect(choices()).toEqual(NAMES);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("Requirement: Custom selection", () => {
    const chip = (label) => screen.getByRole("checkbox", { name: label });
    const ticked = () => screen.getAllByRole("checkbox").filter((c) => c.getAttribute("aria-checked") === "true").map((c) => c.textContent);

    it("ticks minor 3rd and major 3rd before the user has chosen", () => {
      openPage();
      expect(screen.getAllByRole("checkbox")).toHaveLength(12);
      expect(ticked()).toEqual(["Minor 3rd", "Major 3rd"]);
    });

    it("Scenario: Drilling two intervals", () => {
      const spy = watch();
      openPage();
      tap("Start custom");
      expect(choices()).toEqual(["Minor 3rd", "Major 3rd"]);
      for (let n = 0; n < EAR_TOTAL; n++) {
        expect([3, 4]).toContain(current(spy).answer);
        tap(choices()[0]);
        tap(n + 1 < EAR_TOTAL ? "Next" : "Finish");
      }
    });

    it("Scenario: Too few intervals", () => {
      openPage();
      fireEvent.click(chip("Minor 3rd"));
      expect(ticked()).toEqual(["Major 3rd"]);
      expect(button("Tick at least two").disabled).toBe(true);
      fireEvent.click(button("Tick at least two"));
      expect(screen.queryByText("Which interval is this?")).toBeNull();
    });

    it("Scenario: Selection remembered", () => {
      const { unmount } = openPage();
      fireEvent.click(chip("Tritone"));
      fireEvent.click(chip("Perfect 5th"));
      fireEvent.click(chip("Minor 3rd"));
      fireEvent.click(chip("Major 3rd"));
      expect(ticked()).toEqual(["Tritone", "Perfect 5th"]);
      unmount();
      openPage();
      expect(ticked()).toEqual(["Tritone", "Perfect 5th"]);
    });

    it("stays playable when the selection cannot be stored", () => {
      blockStorage();
      openPage();
      expect(ticked()).toEqual(["Minor 3rd", "Major 3rd"]);
      fireEvent.click(chip("Octave"));
      tap("Start custom");
      expect(choices()).toEqual(["Minor 3rd", "Major 3rd", "Octave"]);
    });
  });

  describe("Requirement: Session", () => {
    it("Scenario: Session ends after ten questions", () => {
      openPage();
      startLevel(2);
      for (let n = 0; n < EAR_TOTAL; n++) {
        expect(text()).toContain(`${n + 1} / 10 ·`);
        tap(choices()[0]);
        tap(n + 1 < EAR_TOTAL ? "Next" : "Finish");
      }
      expect(screen.getByText("Session complete")).toBeTruthy();
    });

    it("Scenario: Two intervals", () => {
      const spy = watch();
      openPage();
      startLevel(1);
      const keys = [];
      for (let n = 0; n < EAR_TOTAL; n++) {
        keys.push(current(spy).key);
        tap(choices()[0]);
        tap(n + 1 < EAR_TOTAL ? "Next" : "Finish");
      }
      expect(keys).toHaveLength(10);
      expect(new Set(keys).size).toBe(10);
    });

    it("shows the number, the length and the running count, with no countdown or hearts", () => {
      const spy = watch();
      openPage();
      startLevel(1);
      expect(text()).toContain("1 / 10 · 0 correct");
      tap(name(current(spy).answer));
      expect(text()).toContain("1 / 10 · 1 correct");
      expect(document.querySelector(".countdown")).toBeNull();
      expect(document.querySelector(".hearts")).toBeNull();
    });
  });

  describe("Requirement: Answer choices", () => {
    it("Scenario: Fixed positions", () => {
      openPage();
      startLevel(2);
      expect(choices()).toEqual(["Major 3rd", "Perfect 5th", "Octave"]);
      tap("Major 3rd");
      tap("Next");
      expect(choices()).toEqual(["Major 3rd", "Perfect 5th", "Octave"]);
    });

    it("Scenario: Twelve choices on a phone", () => {
      openPage();
      startLevel(6);
      expect(choices()).toEqual(NAMES);
      expect(document.querySelector(".answers").classList.contains("two")).toBe(true);
      expect(screen.getAllByRole("button", { name: /Play both|1st note|2nd note/ })).toHaveLength(3);
    });
  });

  describe("Requirement: Automatic playback", () => {
    it("Scenario: New question", () => {
      const spy = watch();
      openPage();
      startLevel(1);
      expect(lastPlayed()[0]).toEqual(current(spy).notes);
      tap(choices()[0]);
      play.mockClear();
      tap("Next");
      expect(play).toHaveBeenCalledTimes(1);
      expect(lastPlayed()[0]).toEqual(current(spy).notes);
    });
  });

  describe("Requirement: Sound controls", () => {
    it("Scenario: Replay", () => {
      const spy = watch();
      openPage();
      startLevel(3);
      const first = lastPlayed();
      tap("▶ Play both");
      expect(lastPlayed()).toEqual(first);
      expect(lastPlayed()[0]).toEqual(current(spy).notes);
    });

    it("Scenario: Repeating a single note", () => {
      const spy = watch();
      openPage();
      startLevel(3);
      play.mockClear();
      tap("1st note"); tap("1st note"); tap("1st note");
      expect(play).toHaveBeenCalledTimes(3);
      for (const [steps] of play.mock.calls) expect(steps).toEqual([current(spy).notes[0]]);
      tap("2nd note");
      expect(lastPlayed()[0]).toEqual([current(spy).notes[1]]);
    });

    it("Scenario: Listening does not answer", () => {
      openPage();
      startLevel(3);
      tap("▶ Play both"); tap("1st note"); tap("2nd note");
      expect(document.querySelector(".feedback")).toBeNull();
      expect(text()).toContain("1 / 10 · 0 correct");
    });

    it("works after an answer is selected", () => {
      const spy = watch();
      openPage();
      startLevel(3);
      tap(choices()[0]);
      tap("2nd note");
      expect(lastPlayed()[0]).toEqual([current(spy).notes[1]]);
    });

    it("cuts off a sound that is still playing when another starts", async () => {
      const { audio, ctx } = await engine();
      await audio.play([60, 64], 0.6);
      const first = ctx.sources.slice();
      ctx.now = 0.2;
      await audio.play([67], 0.6);
      for (const x of first) expect(x.until).toBeLessThan(0.3);
    });
  });

  describe("Requirement: Sound choice", () => {
    const soundButton = () => button(/^Sound:/);

    it("uses the piano until the user chooses otherwise", () => {
      openPage();
      startLevel(1);
      expect(setVoice).toHaveBeenCalledWith("piano");
      expect(soundButton().getAttribute("aria-label")).toBe("Sound: piano. Tap to change");
    });

    it("Scenario: Switching to guitar", () => {
      const spy = watch();
      openPage();
      startLevel(1);
      play.mockClear();
      fireEvent.click(soundButton());
      expect(soundButton().getAttribute("aria-label")).toBe("Sound: acoustic guitar. Tap to change");
      expect(setVoice).toHaveBeenLastCalledWith("guitar");
      expect(lastPlayed()[0]).toEqual(current(spy).notes);
      expect(document.querySelector(".feedback")).toBeNull();
    });

    it("Scenario: Back to piano", () => {
      openPage();
      startLevel(1);
      fireEvent.click(soundButton());
      play.mockClear();
      fireEvent.click(soundButton());
      expect(soundButton().getAttribute("aria-label")).toBe("Sound: piano. Tap to change");
      expect(setVoice).toHaveBeenLastCalledWith("piano");
      expect(play).toHaveBeenCalledTimes(1);
    });

    it("Scenario: Choice remembered", () => {
      const first = openPage();
      startLevel(1);
      fireEvent.click(soundButton());
      first.unmount();
      setVoice.mockClear();
      openPage();
      expect(setVoice).toHaveBeenCalledWith("guitar");
      startLevel(1);
      expect(soundButton().getAttribute("aria-label")).toBe("Sound: acoustic guitar. Tap to change");
    });

    it("plays each voice from its own recordings, the piano for an unknown voice", async () => {
      const { audio } = await engine();
      audio.setVoice("kazoo");
      await audio.play([60]);
      expect(fetch.mock.calls[0][0]).toMatch(/^\/piano\//);
      audio.setVoice("guitar");
      await audio.play([60]);
      expect(fetch.mock.calls.at(-1)[0]).toMatch(/^\/guitar\//);
    });

    it("Scenario: Instrument unavailable", async () => {
      const { audio, ctx } = await engine();
      vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 404 })));
      await expect(audio.play([60, 64], 0.6, "guitar")).resolves.toBeUndefined();
      expect(ctx.sources).toHaveLength(0);
      // tried again on the next play
      vi.stubGlobal("fetch", fetchOk());
      await audio.play([60, 64], 0.6, "guitar");
      expect(ctx.sources).toHaveLength(2);
    });

    it("stays usable without sound where Web Audio is missing", async () => {
      vi.resetModules();
      const audio = await vi.importActual("../src/audio.js");
      delete window.AudioContext;
      expect(() => audio.stop()).not.toThrow();
      await expect(audio.play([60])).resolves.toBeUndefined();
    });
  });

  describe("Requirement: Listening after answering", () => {
    const fixed = (answer, root = 50) => vi.spyOn(ex, "question").mockImplementation(() => ({ answer, root, notes: [root, root + answer], key: `${root}:${answer}:${Math.random()}` }));

    it("Scenario: Wrong answer", () => {
      fixed(7);
      openPage();
      startLevel(2);
      tap("Major 3rd");
      expect(text()).toContain("Not quite. You picked Major 3rd, it was Perfect 5th.");
      expect(button("Perfect 5th ✓")).toBeTruthy();
      expect(button("Major 3rd").className).toContain("wrong");
      expect(button("Perfect 5th ✓").className).toContain("right");
      expect(button("Next")).toBeTruthy();
    });

    it("Scenario: Comparing the pick with the answer", () => {
      fixed(7);
      openPage();
      startLevel(2);
      tap("Major 3rd");
      play.mockClear();
      tap("Major 3rd");
      expect(lastPlayed()[0]).toEqual([50, 54]);
      tap("Perfect 5th ✓");
      expect(lastPlayed()[0]).toEqual([50, 57]);
      expect(text()).toContain("1 / 10 · 0 correct");
      expect(text()).toContain("Not quite.");
    });

    it("says Finish on the last question", () => {
      openPage();
      startLevel(1);
      for (let n = 0; n < EAR_TOTAL - 1; n++) { tap(choices()[0]); tap("Next"); }
      tap(choices()[0]);
      expect(button("Finish")).toBeTruthy();
    });
  });

  describe("Requirement: Results", () => {
    it("Scenario: Results summary", () => {
      vi.useFakeTimers();
      const plan = [4, 4, 4, 4, 7, 7, 7, 12, 12, 12];
      let i = 0;
      vi.spyOn(ex, "question").mockImplementation(() => { const a = plan[i]; const root = 48 + i++; return { answer: a, root, notes: [root, root + a], key: `${root}:${a}` }; });
      openPage();
      startLevel(2);
      plan.forEach((a, n) => {
        vi.advanceTimersByTime(n % 2 ? 3000 : 4000);
        // one major 3rd and one perfect 5th are missed
        const pick = n === 0 ? "Perfect 5th" : n === 4 ? "Octave" : name(a);
        tap(pick);
        tap(n + 1 < EAR_TOTAL ? "Next" : "Finish");
      });
      expect(text()).toContain("8 / 10");
      expect(text()).toContain("80%");
      expect(text()).toContain("3.5 seconds");
      const rows = [...document.querySelectorAll(".tally li")].map((li) => li.textContent);
      expect(rows).toEqual(["Major 3rd3/4", "Perfect 5th2/3", "Octave3/3"]);
    });

    it("Scenario: No review", () => {
      openPage();
      startLevel(6);
      for (let n = 0; n < EAR_TOTAL; n++) { tap(choices()[0]); tap(n + 1 < EAR_TOTAL ? "Next" : "Finish"); }
      expect(screen.getByText("Session complete")).toBeTruthy();
      expect(screen.queryByRole("button", { name: "Review mistakes" })).toBeNull();
    });

    it("Scenario: Playing Custom again", () => {
      openPage();
      fireEvent.click(screen.getByRole("checkbox", { name: "Octave" }));
      tap("Start custom");
      for (let n = 0; n < EAR_TOTAL; n++) { tap(choices()[0]); tap(n + 1 < EAR_TOTAL ? "Next" : "Finish"); }
      tap("Play again");
      expect(text()).toContain("1 / 10 · 0 correct");
      expect(choices()).toEqual(["Minor 3rd", "Major 3rd", "Octave"]);
    });

    it("Scenario: Leaving the results screen", () => {
      openPage();
      startLevel(1);
      for (let n = 0; n < EAR_TOTAL; n++) { tap(choices()[0]); tap(n + 1 < EAR_TOTAL ? "Next" : "Finish"); }
      tap("Finish");
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Interval training");
    });

    it("measures answer time from when the question is shown, including the automatic playback", () => {
      vi.useFakeTimers();
      openPage();
      startLevel(1);
      for (let n = 0; n < EAR_TOTAL; n++) {
        vi.advanceTimersByTime(2500);
        tap(choices()[0]);
        vi.advanceTimersByTime(30000); // time on the feedback is not counted
        tap(n + 1 < EAR_TOTAL ? "Next" : "Finish");
      }
      expect(text()).toContain("2.5 seconds");
    });
  });

  describe("Requirement: Quitting", () => {
    it("Scenario: Quit mid-session", () => {
      openPage();
      startLevel(1);
      tap("Quit");
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Interval training");
      expect(screen.queryByText("Session complete")).toBeNull();
    });
  });

  describe("Requirement: Separate from the other modes", () => {
    it("Scenario: Mixed session", () => {
      openApp();
      openEntry("Mixed");
      expect(screen.getByRole("heading", { level: 2 }).textContent).toMatch(/\?$/);
      expect(play).not.toHaveBeenCalled();
      tap("Quit");
      fireEvent.click(button("Mixed speed game"));
      expect(play).not.toHaveBeenCalled();
    });

    it("is not affected by the Scales tick boxes", () => {
      openApp();
      fireEvent.click(screen.getByRole("checkbox", { name: "Pentatonic" }));
      openEntry("Interval training");
      startLevel(2);
      expect(choices()).toEqual(["Major 3rd", "Perfect 5th", "Octave"]);
    });
  });

  describe("Requirement: Sound without a network", () => {
    it("Scenario: Quitting while a note sounds", () => {
      openPage();
      startLevel(1);
      stop.mockClear();
      tap("Quit");
      expect(stop).toHaveBeenCalled();
    });

    it("stops the sound on Next, on Finish and when the page closes", () => {
      const { unmount } = openPage();
      startLevel(1);
      tap(choices()[0]);
      stop.mockClear();
      tap("Next");
      expect(stop).toHaveBeenCalled();
      stop.mockClear();
      unmount();
      expect(stop).toHaveBeenCalled();
    });

    it("Scenario: Offline", async () => {
      // the recordings ship with the app and are cached by the service worker
      const { readFileSync, existsSync } = await import("node:fs");
      const config = readFileSync(`${process.cwd()}/vite.config.js`, "utf8");
      expect(config).toMatch(/globPatterns: \[[^\]]*mp3/);
      for (const voice of ["piano", "guitar"]) {
        for (const note of ["C3", "Ds3", "Fs3", "A3", "C4", "Ds4", "Fs4", "A4", "C5"]) {
          expect(existsSync(`${process.cwd()}/public/${voice}/${note}.mp3`)).toBe(true);
        }
      }
    });

    it("Scenario: Instruments offline", async () => {
      // each voice is loaded from its own recordings, which ship with the app
      const { audio } = await engine();
      await audio.play([60], 0.6, "piano");
      await audio.play([60], 0.6, "guitar");
      const urls = fetch.mock.calls.map(([u]) => u);
      expect(urls).toContain("/piano/C4.mp3");
      expect(urls).toContain("/guitar/C4.mp3");
      expect(urls.every((u) => !/^https?:/.test(u))).toBe(true);
    });
  });
});
