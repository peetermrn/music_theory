// @vitest-environment jsdom
// openspec/specs/quiz-session/spec.md
import { describe, it, expect, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { makeQuestion } from "../src/theory.js";
import { openApp, openEntry, entry, tap, button, text } from "./helpers/app.jsx";

vi.mock("../src/theory.js", async (importOriginal) => {
  const real = await importOriginal();
  return { ...real, makeQuestion: vi.fn(real.makeQuestion) };
});
vi.mock("../src/audio.js", () => ({ play: vi.fn(() => Promise.resolve()), stop: vi.fn(), setVoice: vi.fn(), context: vi.fn() }));

const q = () => makeQuestion.mock.results.at(-1).value;
const answers = () => [...document.querySelectorAll("button.answer")];
const right = () => tap(q().answer);
const wrong = () => tap(q().options.find((o) => o !== q().answer));
const next = (n) => tap(n + 1 < 10 ? "Next" : "Finish");
const headings = () => [...document.querySelectorAll("h2.heading")].map((h) => h.textContent);
const section = (title) => screen.getByRole("heading", { name: title }).closest("section");
const titles = (title) => [...section(title).querySelectorAll("button.play strong")].map((s) => s.textContent);
// Plays a whole session: `plan(n)` says whether question n is answered right
function playSession(plan = () => true, before = () => {}) {
  const asked = [];
  for (let n = 0; n < 10; n++) {
    asked.push(q());
    before(n);
    plan(n) ? right() : wrong();
    next(n);
  }
  return asked;
}

describe("quiz-session", () => {
  describe("Requirement: Mode selection", () => {
    it("Scenario: Starting a session", () => {
      openApp();
      openEntry("Notes");
      expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(q().prompt);
      expect(q().kind).toBe("notes");
      expect(text()).toContain("1 / 10 · 0 correct");
    });

    it("Scenario: Grouped modes", () => {
      openApp();
      expect(titles("Keys")).toEqual(["Notes", "Scales", "Chords", "Relatives", "Mixed"]);
      expect(titles("Memorize the fretboard")).toEqual(["Guitar", "Bass"]);
    });

    it("Scenario: Fretboard mode in one tap", () => {
      openApp();
      openEntry("Bass");
      expect(q().kind).toBe("bass");
      expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(q().prompt);
    });

    it("starts each mode with one tap", () => {
      for (const [title, kinds] of [["Notes", ["notes"]], ["Scales", ["scales"]], ["Chords", ["chords"]], ["Relatives", ["relatives"]],
        ["Mixed", ["notes", "scales", "chords", "relatives"]], ["Guitar", ["guitar"]], ["Bass", ["bass"]]]) {
        const { unmount } = openApp();
        openEntry(title);
        expect(kinds).toContain(q().kind);
        unmount();
      }
    });

    it("shows the sections in order, all in the same heading style", () => {
      openApp();
      expect(headings()).toEqual(["Keys", "Memorize the fretboard", "Play on guitar", "Ear training", "Visuals", "Tools"]);
    });

    it("Scenario: Play on guitar entries", () => {
      openApp();
      expect(titles("Play on guitar")).toEqual(["Key notes", "Fretboard notes", "Play it back", "Scale runs"]);
      expect(within(section("Play on guitar")).queryByRole("button", { name: /speed game/ })).toBeNull();
    });

    it("Scenario: Ear training entry", () => {
      openApp();
      expect(titles("Ear training")).toEqual(["Interval training", "Chord training", "Degree training"]);
      expect(within(section("Ear training")).queryByText(/Level/)).toBeNull();
    });

    it("Scenario: Opening ear training", () => {
      openApp();
      openEntry("Interval training");
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Interval training");
      expect(screen.queryByText(/1 \/ 10/)).toBeNull();
    });

    it("Scenario: Visuals entry", () => {
      openApp();
      expect(titles("Visuals")).toEqual(["Circle & fretboard"]);
      expect(within(section("Visuals")).queryByRole("button", { name: /speed game/ })).toBeNull();
    });

    it("Scenario: Opening the Visuals page", () => {
      openApp();
      openEntry("Circle & fretboard");
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Visuals");
      expect(screen.queryByText(/1 \/ 10/)).toBeNull();
    });

    it("Scenario: Tools entries", () => {
      openApp();
      expect(titles("Tools")).toEqual(["Metronome", "Tuner"]);
      expect(within(section("Tools")).queryByRole("button", { name: /speed game/ })).toBeNull();
    });

    it("Scenario: Opening a tool", () => {
      vi.stubGlobal("navigator", { ...navigator, mediaDevices: undefined });
      openApp();
      openEntry("Tuner");
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Tuner");
      expect(screen.queryByText(/1 \/ 10/)).toBeNull();
    });
  });

  describe("Requirement: Session length", () => {
    it("Scenario: Session ends after ten questions", () => {
      openApp();
      openEntry("Chords");
      playSession();
      expect(screen.getByText("Session complete")).toBeTruthy();
    });

    it("does not repeat a prompt within one normal session", () => {
      for (const mode of ["Relatives", "Notes", "Bass"]) {
        const { unmount } = openApp();
        openEntry(mode);
        const prompts = playSession().map((x) => x.prompt);
        expect(new Set(prompts).size).toBe(10);
        unmount();
      }
    });
  });

  describe("Requirement: One question with four choices", () => {
    it("Scenario: Question display", () => {
      for (const mode of ["Notes", "Scales", "Chords", "Relatives", "Mixed", "Guitar", "Bass"]) {
        const { unmount } = openApp();
        openEntry(mode);
        for (let n = 0; n < 10; n++) {
          const shown = answers().map((b) => b.textContent);
          expect(shown).toHaveLength(4);
          expect(new Set(shown).size).toBe(4);
          expect(shown.filter((o) => o === q().answer)).toHaveLength(1);
          expect(text()).toContain(`${n + 1} / 10 · ${n} correct`);
          right(); next(n);
        }
        unmount();
      }
    });
  });

  describe("Requirement: Immediate feedback", () => {
    it("Scenario: Wrong answer", () => {
      openApp();
      openEntry("Scales");
      const picked = q().options.find((o) => o !== q().answer);
      tap(picked);
      expect(button(picked).className).toContain("wrong");
      expect(button(`${q().answer} ✓`).className).toContain("right");
      expect(text()).toContain(`Not quite. Answer: ${q().answer}`);
      for (const b of answers()) expect(b.disabled).toBe(true);
      expect(button("Next")).toBeTruthy();
    });

    it("says Correct! for a right answer", () => {
      openApp();
      openEntry("Notes");
      right();
      expect(text()).toContain("Correct!");
      expect(text()).toContain("1 / 10 · 1 correct");
    });

    it("Scenario: Last question", () => {
      openApp();
      openEntry("Guitar");
      for (let n = 0; n < 9; n++) { right(); tap("Next"); }
      right();
      expect(button("Finish")).toBeTruthy();
      expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
    });
  });

  describe("Requirement: Answer timing", () => {
    it("Scenario: Time on feedback is not counted", () => {
      vi.useFakeTimers();
      openApp();
      openEntry("Notes");
      playSession(() => true, () => vi.advanceTimersByTime(3000));
      // the 20 s on each feedback view are not counted
      expect(text()).toContain("3.0 seconds");
    });

    it("shows no countdown in a normal session", () => {
      vi.useFakeTimers();
      openApp();
      openEntry("Notes");
      expect(document.querySelector(".countdown")).toBeNull();
      vi.advanceTimersByTime(120000);
      expect(document.querySelector(".feedback")).toBeNull();
      expect(text()).toContain("1 / 10 · 0 correct");
    });
  });

  describe("Requirement: Per-question result record", () => {
    it("Scenario: Result recorded", () => {
      openApp();
      openEntry("Mixed");
      const asked = playSession((n) => n % 3 !== 0);
      // each record shows up in the results: one per question, counted by type
      const rows = Object.fromEntries([...document.querySelectorAll(".tally li")].map((li) => [li.firstChild.textContent, li.lastChild.textContent]));
      const LABEL = { notes: "Notes", scales: "Scales", chords: "Chords", relatives: "Relatives" };
      const expected = {};
      asked.forEach((x, n) => { const l = LABEL[x.kind]; const [c, t] = (expected[l] ?? "0/0").split("/").map(Number); expected[l] = `${c + (n % 3 !== 0 ? 1 : 0)}/${t + 1}`; });
      expect(rows).toEqual(expected);
    });

    it("is not kept between sessions", () => {
      openApp();
      openEntry("Notes");
      playSession(() => false);
      tap("Finish");
      openEntry("Notes");
      playSession(() => true);
      expect(text()).toContain("10 / 10");
      expect(Object.keys(localStorage).filter((k) => !k.startsWith("theory-quiz.scales"))).toEqual([]);
    });
  });

  describe("Requirement: Results screen", () => {
    it("Scenario: Results summary", () => {
      vi.useFakeTimers();
      openApp();
      openEntry("Relatives");
      // eight answers at 3.6 s and two at 4.0 s: a mean of 3.68 s
      playSession((n) => n < 8, (n) => vi.advanceTimersByTime(n < 8 ? 3600 : 4000));
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("8 / 10");
      expect(text()).toContain("80%");
      expect(text()).toContain("3.7 seconds");
      expect([...document.querySelectorAll(".tally li")].map((li) => li.textContent)).toEqual(["Relatives8/10"]);
    });

    it("Scenario: Leaving the results screen", () => {
      openApp();
      openEntry("Chords");
      playSession();
      tap("Play again");
      expect(text()).toContain("1 / 10 · 0 correct");
      expect(q().kind).toBe("chords");
      playSession();
      tap("Finish");
      expect(headings()[0]).toBe("Keys");
    });
  });

  describe("Requirement: Review mistakes", () => {
    it("Scenario: Review offered", () => {
      openApp();
      openEntry("Notes");
      const asked = playSession((n) => n !== 2 && n !== 7);
      tap("Review mistakes");
      expect(text()).toContain("Review · 1 / 2");
      const missed = [asked[2], asked[7]];
      for (let n = 0; n < 2; n++) {
        expect(q().prompt).toBe(missed[n].prompt);
        expect(q().answer).toBe(missed[n].answer);
        expect(q().spec).toEqual(missed[n].spec);
        expect(answers()).toHaveLength(4);
        right();
        tap(n === 0 ? "Next" : "Finish");
      }
      expect(screen.getByText("Session complete")).toBeTruthy();
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("2 / 2");
    });

    it("rebuilds each review question with freshly generated choices", () => {
      openApp();
      openEntry("Bass");
      const asked = playSession((n) => n !== 0);
      makeQuestion.mockClear();
      tap("Review mistakes");
      expect(makeQuestion).toHaveBeenCalledWith("bass", asked[0].spec, expect.anything());
      expect(q()).not.toBe(asked[0]);
    });

    it("Scenario: No mistakes", () => {
      openApp();
      openEntry("Scales");
      playSession();
      expect(screen.queryByRole("button", { name: "Review mistakes" })).toBeNull();
    });
  });

  describe("Requirement: Quitting a session", () => {
    it("Scenario: Quit mid-session", () => {
      openApp();
      openEntry("Relatives");
      right(); tap("Next");
      tap("Quit");
      expect(headings()[0]).toBe("Keys");
      expect(screen.queryByText("Session complete")).toBeNull();
      expect(entry("Relatives")).toBeTruthy();
    });
  });
});
