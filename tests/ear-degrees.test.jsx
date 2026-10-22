// @vitest-environment jsdom
// openspec/specs/ear-degrees/spec.md
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EXERCISES, EAR_TOTAL } from "../src/ear.js";
import { KEYS, SCALES, scale, pc } from "../src/theory.js";
import { play, stop, setVoice } from "../src/audio.js";
import Ear from "../src/Ear.jsx";
import { openApp, openEntry, entry, tap, button, text } from "./helpers/app.jsx";
import { blockStorage } from "./helpers/storage.js";

vi.mock("../src/audio.js", () => ({ play: vi.fn(() => Promise.resolve()), stop: vi.fn(), setVoice: vi.fn(), context: vi.fn() }));

const ex = EXERCISES.find((e) => e.id === "degrees");
const generate = ex.question.bind(ex); // the real generator, kept before any test spies on it
const ORD = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th"];
const mod12 = (x) => ((x % 12) + 12) % 12;
const choices = () => [...document.querySelectorAll(".answer.ear")].map((b) => b.textContent.replace(" ✓", ""));
const lastPlayed = () => play.mock.calls.at(-1);
const openPage = () => render(<Ear exercise={ex} onExit={vi.fn()} />);
const current = (spy) => spy.mock.results.at(-1).value;
const startLevel = (n) => tap(new RegExp(`^Level ${n}`));
// A question in a chosen key: the real generator, with the key picked by the test
function inKey(root, variant, degree) {
  const keys = KEYS.filter(([, t]) => t === variant);
  const k = keys.findIndex(([r]) => r === root);
  const ids = [degree];
  const rnd = vi.spyOn(Math, "random").mockReturnValueOnce(0).mockReturnValueOnce((k + 0.5) / keys.length);
  const q = generate(ids, variant);
  rnd.mockRestore();
  return q;
}
const fixed = (root, variant, degree) => vi.spyOn(ex, "question").mockImplementation((ids, v) => ({ ...inKey(root, v ?? variant, degree), key: Math.random() }));

beforeEach(() => { play.mockClear(); stop.mockClear(); setVoice.mockClear(); });

describe("ear-degrees", () => {
  describe("Requirement: Degree training entry and page", () => {
    it("Scenario: Entry on the home screen", () => {
      openApp();
      const order = [...document.querySelectorAll("button.play strong")].map((s) => s.textContent);
      const i = order.indexOf("Interval training");
      expect(order.slice(i, i + 3)).toEqual(["Interval training", "Chord training", "Degree training"]);
      expect(screen.queryByRole("button", { name: /training speed game/ })).toBeNull();
    });

    it("Scenario: Page content", () => {
      openApp();
      openEntry("Degree training");
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Degree training");
      expect(screen.getAllByRole("button", { name: /^Level \d/ })).toHaveLength(4);
      expect(screen.getByRole("heading", { name: "Custom" })).toBeTruthy();
      expect(play).not.toHaveBeenCalled();
    });

    it("lists the keys and degrees each level asks", () => {
      openPage();
      expect(button(/^Level 1/).textContent).toContain("Major keys: 1st, 3rd and 5th");
      expect(button(/^Level 2/).textContent).toContain("Adds 2nd and 4th");
      expect(button(/^Level 3/).textContent).toContain("Adds 6th and 7th");
      expect(button(/^Level 4/).textContent).toContain("Minor keys: all seven");
    });

    it("Scenario: Back to home", () => {
      openApp();
      openEntry("Degree training");
      tap("‹ Back");
      expect(entry("Degree training")).toBeTruthy();
    });
  });

  describe("Requirement: Degree question", () => {
    it("Scenario: What is heard", () => {
      const spy = vi.spyOn(ex, "question");
      openPage();
      startLevel(3);
      const q = current(spy);
      const [steps] = lastPlayed();
      const rest = steps.indexOf(null);
      expect(rest).toBeGreaterThan(1);
      expect(steps.slice(0, rest).every(Array.isArray)).toBe(true); // several chords
      expect(steps.slice(rest + 1)).toEqual([q.note]);               // then one note on its own
    });

    it("Scenario: Fifth degree in a major key", () => {
      fixed("D", "major", 5);
      openPage();
      startLevel(1);
      const q = ex.question.mock.results.at(-1).value;
      expect(mod12(q.note) % 12).toBe(pc("A"));
      expect(q.answer).toBe(5);
      const main = document.querySelector("main").textContent;
      expect(main).not.toMatch(/\bD\b|\bA\b/);
      tap("5th");
      expect(text()).toContain("Correct! The 5th of D major is A.");
    });

    it("Scenario: Major or minor is stated", () => {
      openPage();
      startLevel(4);
      expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Which degree of the minor key is the last note?");
      tap("Quit");
      startLevel(1);
      expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Which degree of the major key is the last note?");
    });

    it("names the degrees 1st to 7th", () => {
      expect(ex.items.map((i) => i.name)).toEqual(ORD);
    });
  });

  describe("Requirement: Establishing the key", () => {
    it("Scenario: Ends at home", () => {
      for (const variant of ["major", "minor"]) {
        for (let i = 0; i < 100; i++) {
          const q = ex.question([1, 2, 3, 4, 5, 6, 7], variant);
          const last = q.chords.at(-1).map((m) => mod12(m - q.tonic)).sort((a, b) => a - b);
          expect(last).toEqual(variant === "major" ? [0, 4, 7] : [0, 3, 7]);
          // only chords built from the key's own scale
          for (const chord of q.chords) for (const m of chord) expect(SCALES[variant]).toContain(mod12(m - q.tonic));
        }
      }
    });

    it("chooses the key at random from all twelve keys of the type", () => {
      for (const variant of ["major", "minor"]) {
        const keys = new Set([...Array(1000)].map(() => ex.question([1, 3], variant).keyName));
        expect([...keys].sort()).toEqual(KEYS.filter(([, t]) => t === variant).map(([r]) => `${r} ${variant}`).sort());
      }
    });

    it("plays the note between the tonic and the 7th degree above it", () => {
      for (let i = 0; i < 300; i++) {
        const q = ex.question([1, 2, 3, 4, 5, 6, 7], i % 2 ? "major" : "minor");
        expect(q.note - q.tonic).toBeGreaterThanOrEqual(0);
        expect(q.note - q.tonic).toBeLessThanOrEqual(11);
        expect(mod12(q.tonic)).toBe(pc(q.keyName.split(" ")[0]));
      }
    });

    it("Scenario: Same degree, different key", () => {
      const spy = vi.spyOn(ex, "question");
      openPage();
      startLevel(1);
      const asked = [];
      for (let n = 0; n < EAR_TOTAL; n++) { asked.push(current(spy)); tap(choices()[0]); tap(n + 1 < EAR_TOTAL ? "Next" : "Finish"); }
      for (const d of [1, 3, 5]) {
        const keys = asked.filter((q) => q.answer === d).map((q) => q.keyName);
        expect(new Set(keys).size).toBe(keys.length);
        const notes = asked.filter((q) => q.answer === d).map((q) => q.note);
        expect(new Set(notes).size).toBe(notes.length);
      }
    });
  });

  describe("Requirement: Scales used", () => {
    it("asks only notes of the major or natural minor scale", () => {
      for (const variant of ["major", "minor"]) {
        for (let d = 1; d <= 7; d++) {
          const q = ex.question([d], variant);
          expect(q.note - q.tonic).toBe(SCALES[variant][d - 1]);
          expect(q.noteName).toBe(scale(q.keyName.split(" ")[0], variant)[d - 1]);
        }
      }
    });

    it("Scenario: Third degree in minor", () => {
      const q = inKey("A", "minor", 3);
      expect(q.keyName).toBe("A minor");
      expect(q.note - q.tonic).toBe(3);
      expect(q.noteName).toBe("C");
    });

    it("Scenario: Seventh degree in minor", () => {
      const q = inKey("A", "minor", 7);
      expect(q.note - q.tonic).toBe(10);
      expect(q.noteName).toBe("G");
    });
  });

  describe("Requirement: Degree levels", () => {
    it("has four levels", () => {
      expect(ex.levels).toEqual([
        { variant: "major", ids: [1, 3, 5] },
        { variant: "major", ids: [1, 2, 3, 4, 5] },
        { variant: "major", ids: [1, 2, 3, 4, 5, 6, 7] },
        { variant: "minor", ids: [1, 2, 3, 4, 5, 6, 7] },
      ]);
    });

    it("Scenario: Level 1", () => {
      const spy = vi.spyOn(ex, "question");
      openPage();
      startLevel(1);
      for (let n = 0; n < EAR_TOTAL; n++) {
        const q = current(spy);
        expect(q.variant).toBe("major");
        expect([1, 3, 5]).toContain(q.answer);
        tap(choices()[0]); tap(n + 1 < EAR_TOTAL ? "Next" : "Finish");
      }
    });

    it("Scenario: Level 3", () => {
      const { variant, ids } = ex.levels[2];
      const asked = new Set([...Array(500)].map(() => ex.question(ids, variant)).map((q) => { expect(q.variant).toBe("major"); return q.answer; }));
      expect(asked.size).toBe(7);
    });

    it("Scenario: Level 4", () => {
      const spy = vi.spyOn(ex, "question");
      openPage();
      startLevel(4);
      expect(current(spy).variant).toBe("minor");
      expect(choices()).toEqual(ORD);
    });

    it("Scenario: No locking", () => {
      openPage();
      startLevel(4);
      expect(screen.getByText("Which degree of the minor key is the last note?")).toBeTruthy();
    });
  });

  describe("Requirement: Degree Custom selection", () => {
    const chip = (label) => screen.getByRole("checkbox", { name: label });
    const radio = (label) => screen.getByRole("radio", { name: label });
    const ticked = () => screen.getAllByRole("checkbox").filter((c) => c.getAttribute("aria-checked") === "true").map((c) => c.textContent);

    it("starts as minor keys with the 1st, 3rd and 5th", () => {
      openPage();
      expect(radio("Minor keys").getAttribute("aria-checked")).toBe("true");
      expect(radio("Major keys").getAttribute("aria-checked")).toBe("false");
      expect(ticked()).toEqual(["1st", "3rd", "5th"]);
    });

    it("Scenario: Minor triad notes", () => {
      const spy = vi.spyOn(ex, "question");
      openPage();
      tap("Start custom");
      expect(choices()).toEqual(["1st", "3rd", "5th"]);
      for (let n = 0; n < EAR_TOTAL; n++) {
        expect(current(spy).variant).toBe("minor");
        expect([1, 3, 5]).toContain(current(spy).answer);
        tap(choices()[0]); tap(n + 1 < EAR_TOTAL ? "Next" : "Finish");
      }
    });

    it("Scenario: Too few degrees", () => {
      openPage();
      fireEvent.click(chip("1st")); fireEvent.click(chip("3rd"));
      expect(button("Tick at least two").disabled).toBe(true);
    });

    it("Scenario: Selection remembered", () => {
      const first = openPage();
      fireEvent.click(radio("Major keys"));
      fireEvent.click(chip("4th")); fireEvent.click(chip("7th"));
      fireEvent.click(chip("1st")); fireEvent.click(chip("3rd")); fireEvent.click(chip("5th"));
      first.unmount();
      openPage();
      expect(radio("Major keys").getAttribute("aria-checked")).toBe("true");
      expect(ticked()).toEqual(["4th", "7th"]);
    });

    it("stays playable when the selection cannot be stored", () => {
      blockStorage();
      openPage();
      fireEvent.click(radio("Major keys"));
      tap("Start custom");
      expect(screen.getByText("Which degree of the major key is the last note?")).toBeTruthy();
    });
  });

  describe("Requirement: Degree answer choices", () => {
    it("Scenario: Fixed positions", () => {
      openPage();
      startLevel(1);
      expect(choices()).toEqual(["1st", "3rd", "5th"]);
      tap("1st"); tap("Next");
      expect(choices()).toEqual(["1st", "3rd", "5th"]);
    });

    it("Scenario: Seven choices on a phone", () => {
      openPage();
      startLevel(3);
      expect(choices()).toEqual(ORD);
      expect(document.querySelector(".answers").classList.contains("two")).toBe(true);
    });
  });

  describe("Requirement: Degree sound controls", () => {
    it("plays the whole question again", () => {
      const spy = vi.spyOn(ex, "question");
      openPage();
      startLevel(2);
      const q = current(spy);
      tap("▶ Play again");
      expect(lastPlayed()[0]).toEqual([...q.chords, null, q.note]);
    });

    it("Scenario: Note only", () => {
      const spy = vi.spyOn(ex, "question");
      openPage();
      startLevel(2);
      tap("Note");
      expect(lastPlayed()[0]).toEqual([current(spy).note]);
    });

    it("Scenario: Key only", () => {
      const spy = vi.spyOn(ex, "question");
      openPage();
      startLevel(2);
      tap("Key");
      expect(lastPlayed()[0]).toEqual(current(spy).chords);
      expect(lastPlayed()[0]).not.toContain(current(spy).note);
    });

    it("Scenario: Listening does not answer", () => {
      openPage();
      startLevel(2);
      tap("▶ Play again"); tap("Key"); tap("Note");
      expect(document.querySelector(".feedback")).toBeNull();
    });
  });

  describe("Requirement: Degree feedback", () => {
    it("Scenario: Wrong answer", () => {
      fixed("D", "major", 5);
      openPage();
      startLevel(1);
      tap("3rd");
      expect(text()).toContain("Not quite. You picked 3rd, it was 5th. The 5th of D major is A.");
      expect(button("Next")).toBeTruthy();
    });

    it("Scenario: Spelled as the key spells it", () => {
      fixed("F", "major", 4);
      openPage();
      startLevel(2);
      tap("4th");
      expect(text()).toContain("The 4th of F major is Bb.");
      expect(text()).not.toContain("A#");
    });

    it("Scenario: Comparing the pick with the answer", () => {
      fixed("D", "major", 5);
      openPage();
      startLevel(1);
      const q = ex.question.mock.results.at(-1).value;
      tap("3rd");
      tap("3rd");
      expect(lastPlayed()[0]).toEqual([q.tonic + 4]);
      tap("5th ✓");
      expect(lastPlayed()[0]).toEqual([q.tonic + 7]);
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
      expect(document.querySelector(".countdown")).toBeNull();
    });

    it("Scenario: Offline", async () => {
      // sound comes only from the recordings that ship with the app and are cached for offline use
      const { readFileSync, existsSync } = await import("node:fs");
      expect(readFileSync(`${process.cwd()}/vite.config.js`, "utf8")).toMatch(/globPatterns: \[[^\]]*mp3/);
      for (const voice of ["piano", "guitar"]) expect(existsSync(`${process.cwd()}/public/${voice}/C4.mp3`)).toBe(true);
      openPage();
      startLevel(1);
      expect(play).toHaveBeenCalledTimes(1); // the progressions and notes are played
    });

    it("Scenario: Plays by itself", () => {
      const spy = vi.spyOn(ex, "question");
      openPage();
      startLevel(1);
      tap(choices()[0]);
      play.mockClear();
      tap("Next");
      const q = current(spy);
      expect(lastPlayed()[0]).toEqual([...q.chords, null, q.note]);
    });

    it("Scenario: Results per degree", () => {
      const plan = [4, 1, 4, 2, 3, 4, 5, 1, 2, 3];
      let i = 0;
      vi.spyOn(ex, "question").mockImplementation((ids, v) => ({ ...inKey("C", v, plan[i]), key: i++ }));
      openPage();
      startLevel(2);
      plan.forEach((d, n) => { tap(d === 4 && n > 0 ? "1st" : ORD[d - 1]); tap(n + 1 < EAR_TOTAL ? "Next" : "Finish"); });
      const rows = [...document.querySelectorAll(".tally li")].map((li) => li.textContent);
      expect(rows).toEqual(["1st2/2", "2nd2/2", "3rd2/2", "4th1/3", "5th1/1"]);
      expect(screen.queryByRole("button", { name: "Review mistakes" })).toBeNull();
    });

    it("Scenario: Leaving a session", () => {
      openPage();
      startLevel(1);
      stop.mockClear();
      tap("Quit");
      expect(stop).toHaveBeenCalled();
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Degree training");
    });

    it("Scenario: Playing Custom again", () => {
      const spy = vi.spyOn(ex, "question");
      openPage();
      fireEvent.click(screen.getByRole("radio", { name: "Major keys" }));
      fireEvent.click(screen.getByRole("checkbox", { name: "7th" }));
      tap("Start custom");
      for (let n = 0; n < EAR_TOTAL; n++) { tap(choices()[0]); tap(n + 1 < EAR_TOTAL ? "Next" : "Finish"); }
      tap("Play again");
      expect(choices()).toEqual(["1st", "3rd", "5th", "7th"]);
      expect(current(spy).variant).toBe("major");
    });
  });
});
