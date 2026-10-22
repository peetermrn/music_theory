// @vitest-environment jsdom
// openspec/specs/ear-chords/spec.md
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EXERCISES, EAR_TOTAL } from "../src/ear.js";
import { play, stop, setVoice } from "../src/audio.js";
import Ear from "../src/Ear.jsx";
import { openApp, openEntry, entry, tap, button, text } from "./helpers/app.jsx";
import { blockStorage } from "./helpers/storage.js";

vi.mock("../src/audio.js", () => ({ play: vi.fn(() => Promise.resolve()), stop: vi.fn(), setVoice: vi.fn(), context: vi.fn() }));

const ex = EXERCISES.find((e) => e.id === "chords");
const intervals = EXERCISES.find((e) => e.id === "intervals");
const TYPES = [
  ["maj", "Major", [0, 4, 7]], ["min", "Minor", [0, 3, 7]], ["dim", "Diminished", [0, 3, 6]], ["aug", "Augmented", [0, 4, 8]],
  ["dom7", "Dominant 7th", [0, 4, 7, 10]], ["maj7", "Major 7th", [0, 4, 7, 11]], ["min7", "Minor 7th", [0, 3, 7, 10]],
  ["m7b5", "Half-diminished", [0, 3, 6, 10]], ["dim7", "Diminished 7th", [0, 3, 6, 9]],
];
const NAMES = TYPES.map(([, n]) => n);
const name = (id) => TYPES.find(([i]) => i === id)[1];
const semis = (id) => TYPES.find(([i]) => i === id)[2];
const LEVELS = [["maj", "min"], ["maj", "min", "dim"], ["maj", "min", "dim", "aug"],
  ["maj", "min", "dim", "aug", "dom7", "maj7", "min7"], TYPES.map(([id]) => id)];

const choices = () => [...document.querySelectorAll(".answer.ear")].map((b) => b.textContent.replace(" ✓", ""));
const lastPlayed = () => play.mock.calls.at(-1);
const openPage = () => render(<Ear exercise={ex} onExit={vi.fn()} />);
const current = (spy) => spy.mock.results.at(-1).value;
const startLevel = (n) => tap(new RegExp(`^Level ${n}`));
const finishSession = () => { for (let n = 0; n < EAR_TOTAL; n++) { tap(choices()[0]); tap(n + 1 < EAR_TOTAL ? "Next" : "Finish"); } };
const fixed = (answer, root = 52) => vi.spyOn(ex, "question").mockImplementation(() =>
  ({ answer, root, notes: semis(answer).map((s) => root + s), key: `${root}:${answer}:${Math.random()}` }));

beforeEach(() => { play.mockClear(); stop.mockClear(); setVoice.mockClear(); });

describe("ear-chords", () => {
  describe("Requirement: Chord training entry and page", () => {
    it("Scenario: Entry on the home screen", () => {
      openApp();
      expect(entry("Interval training")).toBeTruthy();
      expect(entry("Chord training")).toBeTruthy();
      expect(screen.queryByRole("button", { name: /training speed game/ })).toBeNull();
      const order = [...document.querySelectorAll("button.play strong")].map((s) => s.textContent);
      expect(order.indexOf("Chord training")).toBe(order.indexOf("Interval training") + 1);
    });

    it("Scenario: Page content", () => {
      openApp();
      openEntry("Chord training");
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Chord training");
      expect(screen.getAllByRole("button", { name: /^Level \d/ })).toHaveLength(5);
      expect(screen.getByRole("heading", { name: "Custom" })).toBeTruthy();
      expect(play).not.toHaveBeenCalled();
    });

    it("Scenario: Back to home", () => {
      openApp();
      openEntry("Chord training");
      tap("‹ Back");
      expect(entry("Chord training")).toBeTruthy();
    });
  });

  describe("Requirement: Chord types", () => {
    it("defines nine types by their semitones above the root", () => {
      expect(ex.items.map((i) => [i.id, i.name, i.semis])).toEqual(TYPES);
    });

    it("Scenario: Minor triad", () => {
      for (let i = 0; i < 50; i++) {
        const q = ex.question(["min"]);
        expect(q.notes).toEqual([q.root, q.root + 3, q.root + 7]);
        expect(name(q.answer)).toBe("Minor");
      }
    });

    it("Scenario: Dominant 7th", () => {
      const q = ex.question(["dom7"]);
      expect(q.notes).toEqual([q.root, q.root + 4, q.root + 7, q.root + 10]);
    });

    it("plays every chord in root position within one octave", () => {
      for (const [id] of TYPES) {
        const q = ex.question([id]);
        expect(q.notes).toEqual([...q.notes].sort((a, b) => a - b));
        expect(q.notes.at(-1) - q.notes[0]).toBeLessThan(12);
      }
    });
  });

  describe("Requirement: Chord question", () => {
    it("Scenario: What is heard", () => {
      const spy = vi.spyOn(ex, "question");
      openPage();
      startLevel(1);
      const q = current(spy);
      const [steps] = lastPlayed();
      expect(steps).toEqual([...q.notes, q.notes]);
      expect(steps.slice(0, 3)).toEqual([...q.notes].sort((a, b) => a - b));
    });

    it("Scenario: Type, not name", () => {
      openPage();
      startLevel(5);
      expect(choices()).toEqual(NAMES);
      const noteName = /\b[A-G][#b♯♭]?\d?\b/;
      expect(document.querySelector("main").textContent.replace(/Major|Minor/g, "")).not.toMatch(noteName);
      tap(choices()[0]);
      expect(document.querySelector("main").textContent.replace(/Major|Minor/g, "")).not.toMatch(noteName);
    });
  });

  describe("Requirement: Random root", () => {
    it("chooses the root from at least an octave in the middle register", () => {
      const roots = new Set([...Array(2000)].map(() => ex.question(["maj"]).root));
      expect(Math.max(...roots) - Math.min(...roots)).toBeGreaterThanOrEqual(12);
    });

    it("Scenario: Same type, different pitch", () => {
      const spy = vi.spyOn(ex, "question");
      openPage();
      startLevel(1);
      const asked = [];
      for (let n = 0; n < EAR_TOTAL; n++) { asked.push(current(spy)); tap(choices()[0]); tap(n + 1 < EAR_TOTAL ? "Next" : "Finish"); }
      for (const id of ["maj", "min"]) {
        const roots = asked.filter((q) => q.answer === id).map((q) => q.root);
        expect(new Set(roots).size).toBe(roots.length);
      }
    });
  });

  describe("Requirement: Chord levels", () => {
    it("asks exactly the types of each level", () => {
      expect(ex.levels).toEqual(LEVELS);
    });

    it("Scenario: Level 1", () => {
      for (let i = 0; i < 200; i++) expect(["maj", "min"]).toContain(ex.question(ex.levels[0]).answer);
    });

    it("Scenario: Level 3", () => {
      for (let i = 0; i < 200; i++) expect(ex.question(ex.levels[2]).notes).toHaveLength(3);
    });

    it("Scenario: Level 5", () => {
      expect(new Set([...Array(1000)].map(() => ex.question(ex.levels[4]).answer)).size).toBe(9);
    });

    it("Scenario: No locking", () => {
      openPage();
      startLevel(5);
      expect(screen.getByText("Which chord is this?")).toBeTruthy();
    });
  });

  describe("Requirement: Chord Custom selection", () => {
    const chip = (label) => screen.getByRole("checkbox", { name: label });
    const ticked = () => screen.getAllByRole("checkbox").filter((c) => c.getAttribute("aria-checked") === "true").map((c) => c.textContent);

    it("ticks major and minor before the user has chosen", () => {
      openPage();
      expect(screen.getAllByRole("checkbox")).toHaveLength(9);
      expect(ticked()).toEqual(["Major", "Minor"]);
    });

    it("Scenario: Drilling two types", () => {
      const spy = vi.spyOn(ex, "question");
      openPage();
      fireEvent.click(chip("Dominant 7th")); fireEvent.click(chip("Major 7th"));
      fireEvent.click(chip("Major")); fireEvent.click(chip("Minor"));
      tap("Start custom");
      expect(choices()).toEqual(["Dominant 7th", "Major 7th"]);
      for (let n = 0; n < EAR_TOTAL; n++) {
        expect(["dom7", "maj7"]).toContain(current(spy).answer);
        tap(choices()[0]); tap(n + 1 < EAR_TOTAL ? "Next" : "Finish");
      }
    });

    it("Scenario: Too few types", () => {
      openPage();
      fireEvent.click(chip("Major"));
      expect(button("Tick at least two").disabled).toBe(true);
    });

    it("Scenario: Selections kept apart", () => {
      const chords = openPage();
      fireEvent.click(chip("Augmented"));
      chords.unmount();
      render(<Ear exercise={intervals} onExit={vi.fn()} />);
      expect(ticked()).toEqual(["Minor 3rd", "Major 3rd"]);
    });

    it("is remembered on the device, and playable when it cannot be stored", () => {
      const first = openPage();
      fireEvent.click(chip("Diminished 7th"));
      first.unmount();
      const second = openPage();
      expect(ticked()).toEqual(["Major", "Minor", "Diminished 7th"]);
      second.unmount();
      blockStorage();
      openPage();
      expect(ticked()).toEqual(["Major", "Minor"]);
      tap("Start custom");
      expect(choices()).toEqual(["Major", "Minor"]);
    });
  });

  describe("Requirement: Chord answer choices", () => {
    it("Scenario: Fixed positions", () => {
      openPage();
      startLevel(2);
      expect(choices()).toEqual(["Major", "Minor", "Diminished"]);
      tap("Minor"); tap("Next");
      expect(choices()).toEqual(["Major", "Minor", "Diminished"]);
    });

    it("Scenario: Nine choices on a phone", () => {
      openPage();
      startLevel(5);
      expect(choices()).toEqual(NAMES);
      expect(document.querySelector(".answers").classList.contains("two")).toBe(true);
    });
  });

  describe("Requirement: Chord sound controls", () => {
    it("plays again as first played, one by one, or together", () => {
      const spy = vi.spyOn(ex, "question");
      openPage();
      startLevel(4);
      const { notes } = current(spy);
      tap("▶ Play again");
      expect(lastPlayed()[0]).toEqual([...notes, notes]);
      tap("One by one");
      expect(lastPlayed()[0]).toEqual(notes);
    });

    it("Scenario: Together only", () => {
      const spy = vi.spyOn(ex, "question");
      openPage();
      startLevel(4);
      tap("Together");
      expect(lastPlayed()[0]).toEqual([current(spy).notes]);
    });

    it("Scenario: Listening does not answer", () => {
      openPage();
      startLevel(4);
      tap("▶ Play again"); tap("One by one"); tap("Together");
      expect(document.querySelector(".feedback")).toBeNull();
    });
  });

  describe("Requirement: Listening to chords after answering", () => {
    it("Scenario: Wrong answer", () => {
      fixed("min");
      openPage();
      startLevel(1);
      tap("Major");
      expect(text()).toContain("Not quite. You picked Major, it was Minor.");
      expect(button("Next")).toBeTruthy();
    });

    it("Scenario: Comparing the pick with the answer", () => {
      fixed("min", 52);
      openPage();
      startLevel(1);
      tap("Major");
      tap("Major");
      expect(lastPlayed()[0]).toEqual([52, 56, 59, [52, 56, 59]]);
      tap("Minor ✓");
      expect(lastPlayed()[0]).toEqual([52, 55, 59, [52, 55, 59]]);
      expect(text()).toContain("1 / 10 · 0 correct");
    });
  });

  describe("Requirement: Same session rules as interval training", () => {
    it("Scenario: Ten questions without repeats", () => {
      const spy = vi.spyOn(ex, "question");
      openPage();
      startLevel(1);
      const keys = [];
      for (let n = 0; n < EAR_TOTAL; n++) { keys.push(current(spy).key); tap(choices()[0]); tap(n + 1 < EAR_TOTAL ? "Next" : "Finish"); }
      expect(new Set(keys).size).toBe(10);
      expect(screen.getByText("Session complete")).toBeTruthy();
    });

    it("Scenario: Offline", async () => {
      // sound comes only from the recordings that ship with the app and are cached for offline use
      const { readFileSync, existsSync } = await import("node:fs");
      expect(readFileSync(`${process.cwd()}/vite.config.js`, "utf8")).toMatch(/globPatterns: \[[^\]]*mp3/);
      for (const voice of ["piano", "guitar"]) expect(existsSync(`${process.cwd()}/public/${voice}/C4.mp3`)).toBe(true);
      openPage();
      startLevel(1);
      expect(play).toHaveBeenCalledTimes(1); // the chords are played
    });

    it("Scenario: Plays by itself", () => {
      const spy = vi.spyOn(ex, "question");
      openPage();
      startLevel(1);
      tap(choices()[0]);
      play.mockClear();
      tap("Next");
      expect(lastPlayed()[0]).toEqual([...current(spy).notes, current(spy).notes]);
    });

    it("Scenario: Results per chord type", () => {
      const plan = ["maj", "min", "dim", "maj", "dim", "min", "dim", "maj", "min", "maj"];
      let i = 0;
      vi.spyOn(ex, "question").mockImplementation(() => { const a = plan[i]; const root = 48 + i++; return { answer: a, root, notes: semis(a).map((s) => root + s), key: `${root}:${a}` }; });
      openPage();
      startLevel(2);
      plan.forEach((a, n) => { tap(n === 4 ? "Major" : name(a)); tap(n + 1 < EAR_TOTAL ? "Next" : "Finish"); });
      expect(text()).toContain("9 / 10");
      expect(text()).toContain("90%");
      expect(text()).toContain("seconds");
      const rows = [...document.querySelectorAll(".tally li")].map((li) => li.textContent);
      expect(rows).toEqual(["Major4/4", "Minor3/3", "Diminished2/3"]);
      expect(screen.queryByRole("button", { name: "Review mistakes" })).toBeNull();
    });

    it("Scenario: Leaving a session", () => {
      openPage();
      startLevel(1);
      stop.mockClear();
      tap("Quit");
      expect(stop).toHaveBeenCalled();
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Chord training");
      startLevel(1);
      finishSession();
      stop.mockClear();
      tap("Finish");
      expect(stop).toHaveBeenCalled();
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Chord training");
    });

    it("Scenario: One sound choice", () => {
      const first = render(<Ear exercise={intervals} onExit={vi.fn()} />);
      startLevel(1);
      fireEvent.click(button(/^Sound:/));
      first.unmount();
      setVoice.mockClear();
      openPage();
      startLevel(1);
      expect(setVoice).toHaveBeenCalledWith("guitar");
      expect(setVoice).not.toHaveBeenCalledWith("piano");
    });
  });
});
