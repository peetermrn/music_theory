// @vitest-environment jsdom
// openspec/specs/cheat-sheet/spec.md
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { makeQuestion } from "../src/theory.js";
import { EXERCISES } from "../src/ear.js";
import { play } from "../src/audio.js";
import Ear from "../src/Ear.jsx";
import { openApp, openEntry, tap, button, text } from "./helpers/app.jsx";

vi.mock("../src/theory.js", async (importOriginal) => {
  const real = await importOriginal();
  return { ...real, makeQuestion: vi.fn(real.makeQuestion) };
});
vi.mock("../src/audio.js", () => ({ play: vi.fn(() => Promise.resolve()), stop: vi.fn(), setVoice: vi.fn(), context: vi.fn() }));

const q = () => makeQuestion.mock.results.at(-1).value;
const sheet = () => document.querySelector(".sheet");
const openSheet = () => fireEvent.click(button("Open cheat sheet"));
const closeSheet = () => fireEvent.click(button("Close cheat sheet"));
const section = (title) => [...sheet().querySelectorAll("h3")].find((h) => h.textContent === title)?.nextElementSibling.textContent;
const ex = (id) => EXERCISES.find((e) => e.id === id);
const openEar = (id, level = 1) => { render(<Ear exercise={ex(id)} onExit={() => {}} />); tap(new RegExp(`^Level ${level}`)); };
const entries = () => [...sheet().querySelectorAll("button.entry")];
const row = (name) => entries().find((b) => b.querySelector("b").textContent === name);
const parts = (name) => [...row(name).children].map((c) => c.textContent);
const lastPlayed = () => play.mock.calls.at(-1);
const answerFirst = () => tap(document.querySelector(".answer.ear").textContent);

beforeEach(() => play.mockClear());

describe("cheat-sheet", () => {
  describe("Requirement: Cheat sheet access", () => {
    it("Scenario: Opening and closing", () => {
      openApp();
      openEntry("Chords");
      const before = q();
      const shown = [...document.querySelectorAll("button.answer")].map((b) => b.textContent);
      openSheet();
      expect(screen.getByRole("heading", { name: "Cheat sheet" })).toBeTruthy();
      closeSheet();
      expect(sheet()).toBeNull();
      expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(before.prompt);
      expect([...document.querySelectorAll("button.answer")].map((b) => b.textContent)).toEqual(shown);
      expect(document.querySelector(".feedback")).toBeNull();
      expect(q()).toBe(before);
    });

    it("closes by tapping outside the panel, but not inside it", () => {
      openApp();
      openEntry("Notes");
      openSheet();
      fireEvent.click(sheet());
      expect(sheet()).not.toBeNull();
      fireEvent.click(document.querySelector(".overlay"));
      expect(sheet()).toBeNull();
    });

    it("is available on the feedback view too", () => {
      openApp();
      openEntry("Notes");
      tap(q().answer);
      openSheet();
      closeSheet();
      expect(text()).toContain("Correct!");
    });

    it("Scenario: Speed game", () => {
      openApp();
      fireEvent.click(button("Notes speed game"));
      expect(screen.queryByRole("button", { name: "Open cheat sheet" })).toBeNull();
    });

    it("Scenario: Ear session", () => {
      openEar("intervals");
      openSheet();
      expect(screen.getByRole("heading", { name: "Intervals" })).toBeTruthy();
      expect(text()).not.toContain("Major-key triads");
    });

    it("Scenario: Chord session", () => {
      openEar("chords");
      openSheet();
      expect(screen.getByRole("heading", { name: "Chords" })).toBeTruthy();
      expect(row("Minor 3rd")).toBeUndefined();
    });

    it("Scenario: Degree session", () => {
      openEar("degrees");
      openSheet();
      expect(screen.getByRole("heading", { name: "Degrees of a major key" })).toBeTruthy();
      expect(row("Minor 3rd")).toBeUndefined();
      expect(row("Dominant 7th")).toBeUndefined();
    });
  });

  describe("Requirement: Cheat sheet content", () => {
    it("shows the step patterns of the major, natural minor and harmonic minor scales", () => {
      openApp();
      openEntry("Notes");
      openSheet();
      expect(section("Major scale")).toBe("2 2 1 2 2 2 1");
      expect(section("Natural minor")).toBe("2 1 2 2 1 2 2");
      expect(section("Harmonic minor")).toBe("2 1 2 2 1 3 1");
    });

    it("Scenario: Reference content", () => {
      openApp();
      openEntry("Notes");
      openSheet();
      const qualities = (s) => s.split("\n").map((l) => l.split(/\s+/)[1]);
      expect(qualities(section("Major-key triads"))).toEqual(["major", "minor", "minor", "major", "major", "minor", "diminished"]);
      expect(qualities(section("Minor-key triads"))).toEqual(["minor", "diminished", "major", "minor", "minor", "major", "major"]);
      expect(section("Scale degrees")).toBe("1 tonic\n2 supertonic\n3 mediant\n4 subdominant\n5 dominant\n6 submediant\n7 leading tone");
    });

    it("Scenario: Relative-key rule", () => {
      openApp();
      openEntry("Relatives");
      openSheet();
      expect(section("Relative keys")).toContain("relative minor = 6th note of the major scale");
      expect(section("Relative keys")).toContain("relative major = 3rd note of the minor scale");
    });

    it("Scenario: Pentatonic entries", () => {
      openApp();
      openEntry("Scales");
      openSheet();
      expect(section("Minor pentatonic")).toBe("3 2 2 3 2\nnatural minor without its 2nd and 6th");
      expect(section("Major pentatonic")).toBe("2 2 3 2 3\nmajor scale without its 4th and 7th");
    });
  });

  describe("Requirement: Does not reveal the current answer", () => {
    it("Scenario: Content independent of question", () => {
      openApp();
      openEntry("Mixed");
      openSheet();
      const first = sheet().innerHTML;
      closeSheet();
      tap(q().answer);
      tap("Next");
      openSheet();
      expect(sheet().innerHTML).toBe(first);
      expect(sheet().querySelector(".right, .wrong, mark, strong")).toBeNull();
    });
  });

  describe("Requirement: Ear cheat sheet content", () => {
    it("lists all twelve intervals at any level, with semitones and a description", () => {
      openEar("intervals", 1);
      openSheet();
      expect(entries().map((b) => b.querySelector("b").textContent)).toEqual(ex("intervals").items.map((i) => i.name));
      entries().forEach((b, k) => {
        expect(b.querySelector("i").textContent).toBe(String(k + 1));
        expect(b.querySelector("span").textContent.length).toBeGreaterThan(3);
      });
    });

    it("Scenario: Interval entry", () => {
      openEar("intervals");
      openSheet();
      const [name, semis, desc] = parts("Perfect 5th");
      expect([name, semis]).toEqual(["Perfect 5th", "7"]);
      expect(desc).toBeTruthy();
    });

    it("Scenario: Hearing an interval", () => {
      openEar("intervals");
      openSheet();
      fireEvent.click(row("Minor 3rd"));
      expect(lastPlayed()).toEqual([[60, 63], 0.6]);
      closeSheet();
      expect(document.querySelector(".feedback")).toBeNull();
    });

    it("Scenario: Same sound on every question", () => {
      openEar("intervals", 6);
      openSheet(); fireEvent.click(row("Minor 3rd")); const first = lastPlayed(); closeSheet();
      answerFirst(); tap("Next");
      openSheet(); fireEvent.click(row("Minor 3rd"));
      expect(lastPlayed()).toEqual(first);
    });
  });

  describe("Requirement: Chord cheat sheet content", () => {
    it("lists all nine chord types at any level, with formulas and descriptions", () => {
      openEar("chords", 1);
      openSheet();
      expect(entries().map((b) => b.querySelector("b").textContent)).toEqual(
        ["Major", "Minor", "Diminished", "Augmented", "Dominant 7th", "Major 7th", "Minor 7th", "Half-diminished", "Diminished 7th"]);
      expect(parts("Major")[1]).toBe("1 3 5");
      expect(parts("Minor")[1]).toBe("1 ♭3 5");
    });

    it("Scenario: Chord entry", () => {
      openEar("chords");
      openSheet();
      const [, formula, desc] = parts("Dominant 7th");
      expect(formula).toBe("1 3 5 ♭7");
      expect(desc).toBeTruthy();
    });

    it("Scenario: Hearing a chord", () => {
      openEar("chords");
      openSheet();
      fireEvent.click(row("Diminished"));
      expect(lastPlayed()[0]).toEqual([60, 63, 66, [60, 63, 66]]);
      closeSheet();
      expect(document.querySelector(".feedback")).toBeNull();
    });

    it("Scenario: Same sound on every question", () => {
      openEar("chords", 5);
      openSheet(); fireEvent.click(row("Minor")); const first = lastPlayed(); closeSheet();
      answerFirst(); tap("Next");
      openSheet(); fireEvent.click(row("Minor"));
      expect(lastPlayed()).toEqual(first);
    });
  });

  describe("Requirement: Degree cheat sheet content", () => {
    it("lists the seven degrees with names, for the session's key type", () => {
      openEar("degrees", 1);
      openSheet();
      expect(entries().map((b) => b.querySelector("i").textContent)).toEqual(
        ["tonic", "supertonic", "mediant", "subdominant", "dominant", "submediant", "leading tone"]);
      closeSheet();
      tap("Quit");
      tap(/^Level 4/);
      openSheet();
      expect(parts("7th")[1]).toBe("subtonic");
      expect(screen.getByRole("heading", { name: "Degrees of a minor key" })).toBeTruthy();
    });

    it("Scenario: Degree entry", () => {
      openEar("degrees");
      openSheet();
      const [name, degree, desc] = parts("5th");
      expect([name, degree]).toEqual(["5th", "dominant"]);
      expect(desc).toBeTruthy();
    });

    it("Scenario: Hearing a degree", () => {
      openEar("degrees", 3);
      openSheet();
      fireEvent.click(row("7th"));
      const [steps] = lastPlayed();
      const rest = steps.indexOf(null);
      expect(steps.slice(0, rest).every(Array.isArray)).toBe(true);
      expect(steps.slice(rest + 1)).toEqual([71]);
      closeSheet();
      expect(document.querySelector(".feedback")).toBeNull();
    });

    it("Scenario: Same sound on every question", () => {
      openEar("degrees", 3);
      openSheet(); fireEvent.click(row("3rd")); const first = lastPlayed(); closeSheet();
      answerFirst(); tap("Next");
      openSheet(); fireEvent.click(row("3rd"));
      expect(lastPlayed()).toEqual(first);
    });

    it("Scenario: Matches the session's key type", () => {
      openEar("degrees", 4);
      openSheet();
      fireEvent.click(row("3rd"));
      const [steps] = lastPlayed();
      const tonic = steps[0][0];
      expect(steps.at(-1)).toBe(tonic + 3);
      expect(steps.at(-2)).toBeNull();
      // the progression ends on a minor chord on the tonic
      expect(steps.at(-3).map((m) => m - tonic).sort((a, b) => a - b)).toEqual([0, 3, 7]);
    });

    it("does not name the key or the note of the current question", () => {
      const spy = vi.spyOn(ex("degrees"), "question");
      openEar("degrees", 3);
      openSheet();
      const { keyName } = spy.mock.results.at(-1).value;
      expect(sheet().textContent).not.toContain(keyName);
    });
  });
});
