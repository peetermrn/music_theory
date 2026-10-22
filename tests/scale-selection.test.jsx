// @vitest-environment jsdom
// openspec/specs/scale-selection/spec.md
import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { makeQuestion, GROUPS, DEFAULT_GROUPS } from "../src/theory.js";
import { openApp, openEntry, tap, button, wait } from "./helpers/app.jsx";
import { blockStorage } from "./helpers/storage.js";

vi.mock("../src/theory.js", async (importOriginal) => {
  const real = await importOriginal();
  return { ...real, makeQuestion: vi.fn(real.makeQuestion) };
});
vi.mock("../src/audio.js", () => ({ play: vi.fn(() => Promise.resolve()), stop: vi.fn(), setVoice: vi.fn(), context: vi.fn() }));

const chip = (label) => screen.getByRole("checkbox", { name: label });
const on = () => screen.getAllByRole("checkbox").filter((c) => c.getAttribute("aria-checked") === "true").map((c) => c.textContent);
const q = () => makeQuestion.mock.results.at(-1).value;
const PENTA = ["major pentatonic", "minor pentatonic"];
// The scale types asked in a whole session of `mode`
function sessionTypes(mode) {
  openEntry(mode);
  const types = [];
  for (let n = 0; n < 10; n++) { types.push(q().spec.type); tap(q().answer); tap(n < 9 ? "Next" : "Finish"); }
  tap("Finish");
  return types;
}

describe("scale-selection", () => {
  describe("Requirement: Scale chips", () => {
    it("Scenario: Chips shown", () => {
      openApp();
      const row = document.querySelector(".chips");
      expect(row.querySelector("span").textContent).toBe("Scales");
      expect(screen.getAllByRole("checkbox").map((c) => c.textContent)).toEqual(["Major & minor", "Pentatonic"]);
      expect(chip("Major & minor").getAttribute("aria-checked")).toBe("true");
      expect(chip("Pentatonic").getAttribute("aria-checked")).toBe("false");
      // at the top of the Keys section, above the Notes card
      const keys = screen.getByRole("heading", { name: "Keys" }).closest("section");
      expect(keys.contains(row)).toBe(true);
      expect(row.compareDocumentPosition(keys.querySelector(".modes")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it("has the two groups of scales", () => {
      expect(GROUPS).toEqual([
        { id: "major-minor", label: "Major & minor", scales: ["major", "minor"] },
        { id: "pentatonic", label: "Pentatonic", scales: PENTA },
      ]);
    });
  });

  describe("Requirement: Toggling scale groups", () => {
    it("Scenario: Adding a group", () => {
      openApp();
      fireEvent.click(chip("Pentatonic"));
      expect(on()).toEqual(["Major & minor", "Pentatonic"]);
    });

    it("Scenario: Drilling one group alone", () => {
      openApp();
      fireEvent.click(chip("Pentatonic"));
      fireEvent.click(chip("Major & minor"));
      expect(on()).toEqual(["Pentatonic"]);
    });

    it("Scenario: Last chip", () => {
      openApp();
      fireEvent.click(chip("Pentatonic"));
      fireEvent.click(chip("Major & minor"));
      fireEvent.click(chip("Pentatonic"));
      expect(on()).toEqual(["Pentatonic"]);
      fireEvent.click(chip("Major & minor"));
      fireEvent.click(chip("Pentatonic"));
      fireEvent.click(chip("Major & minor"));
      expect(on()).toEqual(["Major & minor"]);
    });
  });

  describe("Requirement: Default and remembered selection", () => {
    it("Scenario: First use", () => {
      openApp();
      expect(on()).toEqual(["Major & minor"]);
      expect(DEFAULT_GROUPS).toEqual(["major-minor"]);
    });

    it("Scenario: Selection survives a restart", () => {
      const first = openApp();
      fireEvent.click(chip("Pentatonic"));
      first.unmount();
      openApp();
      expect(on()).toEqual(["Major & minor", "Pentatonic"]);
    });

    it("ignores an unreadable stored selection", () => {
      localStorage.setItem("theory-quiz.scales", "nonsense+more");
      openApp();
      expect(on()).toEqual(["Major & minor"]);
    });

    it("Scenario: Storage unavailable", () => {
      blockStorage();
      openApp();
      expect(on()).toEqual(["Major & minor"]);
      fireEvent.click(chip("Pentatonic"));
      expect(on()).toEqual(["Major & minor", "Pentatonic"]);
      for (const mode of ["Notes", "Scales", "Chords", "Relatives", "Mixed", "Guitar", "Bass"]) {
        openEntry(mode);
        expect(document.querySelectorAll("button.answer")).toHaveLength(4);
        tap("Quit");
      }
    });
  });

  describe("Requirement: Modes the selection applies to", () => {
    it("Scenario: Default selection", () => {
      openApp();
      for (const t of sessionTypes("Notes")) expect(["major", "minor"]).toContain(t);
    });

    it("Scenario: Pentatonic only", () => {
      openApp();
      fireEvent.click(chip("Pentatonic"));
      fireEvent.click(chip("Major & minor"));
      for (const t of sessionTypes("Scales")) expect(PENTA).toContain(t);
    });

    it("Scenario: Chords ignores the selection", () => {
      openApp();
      fireEvent.click(chip("Pentatonic"));
      fireEvent.click(chip("Major & minor"));
      for (const t of sessionTypes("Chords")) expect(["major", "minor"]).toContain(t);
      for (const t of sessionTypes("Relatives")) expect(["major", "minor"]).toContain(t);
    });

    it("applies to speed games and to Notes and Scales inside Mixed", () => {
      vi.useFakeTimers();
      openApp();
      fireEvent.click(chip("Pentatonic"));
      fireEvent.click(chip("Major & minor"));
      fireEvent.click(button("Notes speed game"));
      for (let i = 0; i < 10; i++) {
        expect(PENTA).toContain(q().spec.type);
        tap(q().answer);
        wait(300);
      }
      tap("Quit");
      makeQuestion.mockClear();
      openEntry("Mixed");
      for (const [, , groups] of makeQuestion.mock.calls) expect(groups).toEqual(["pentatonic"]);
    });

    it("leaves Guitar and Bass unaffected", () => {
      const all = GROUPS.map((g) => g.id);
      for (let i = 0; i < 100; i++) {
        for (const kind of ["guitar", "bass"]) expect(makeQuestion(kind, null, ["pentatonic"]).kind).toBe(kind);
      }
      expect(makeQuestion("chords", null, all).spec.type).toMatch(/^(major|minor)$/);
    });

    it("still starts a mode with one tap", () => {
      openApp();
      fireEvent.click(chip("Pentatonic"));
      openEntry("Notes");
      expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(q().prompt);
    });
  });
});
