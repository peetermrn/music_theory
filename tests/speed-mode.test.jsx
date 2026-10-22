// @vitest-environment jsdom
// openspec/specs/speed-mode/spec.md
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { makeQuestion } from "../src/theory.js";
import { EXERCISES } from "../src/ear.js";
import Ear from "../src/Ear.jsx";
import { openApp, tap, button, text, wait } from "./helpers/app.jsx";
import { blockStorage } from "./helpers/storage.js";

vi.mock("../src/theory.js", async (importOriginal) => {
  const real = await importOriginal();
  return { ...real, makeQuestion: vi.fn(real.makeQuestion) };
});
vi.mock("../src/audio.js", () => ({ play: vi.fn(() => Promise.resolve()), stop: vi.fn(), setVoice: vi.fn(), context: vi.fn() }));

const q = () => makeQuestion.mock.results.at(-1).value;
const speed = (mode) => fireEvent.click(button(`${mode} speed game`));
const hearts = () => Number(document.querySelector(".hearts").getAttribute("aria-label").match(/^(\d+)/)[1]);
const score = () => Number(document.querySelector(".points").textContent);
const limit = () => parseFloat(document.querySelector(".countdown i").style.animationDuration);
const answers = () => [...document.querySelectorAll("button.answer")];
const prompt = () => screen.getByRole("heading", { level: 2 }).textContent;
// A right answer moves on after its short pause, a miss after its longer one
const right = () => { tap(q().answer); wait(300); };
const wrong = () => { tap(q().options.find((o) => o !== q().answer)); wait(600); };
const best = (mode) => button(`${mode} speed game`).querySelector("b")?.textContent ?? null;
const gameOver = () => screen.queryByText("Game over") !== null;

beforeEach(() => { vi.useFakeTimers(); });

describe("speed-mode", () => {
  describe("Requirement: Starting a speed game", () => {
    it("offers a speed game for every quiz mode", () => {
      openApp();
      for (const mode of ["Notes", "Scales", "Chords", "Relatives", "Mixed", "Guitar", "Bass"]) expect(button(`${mode} speed game`)).toBeTruthy();
      expect(screen.getAllByRole("button", { name: /speed game$/ })).toHaveLength(7);
    });

    it("Scenario: Starting from the home screen", () => {
      openApp();
      speed("Notes");
      expect(q().kind).toBe("notes");
      expect(hearts()).toBe(5);
      expect(score()).toBe(0);
      expect(limit()).toBe(20);
    });

    it("Scenario: Relatives speed game", () => {
      openApp();
      speed("Relatives");
      expect(q().kind).toBe("relatives");
      expect(prompt()).toMatch(/^What is the relative (major|minor) of/);
    });

    it("Scenario: Ear training has no speed entry", () => {
      const home = openApp();
      const ear = screen.getByRole("heading", { name: "Ear training" }).closest("section");
      expect(within(ear).queryByText(/Speed|Best/)).toBeNull();
      home.unmount();
      for (const ex of EXERCISES) {
        const { unmount } = render(<Ear exercise={ex} onExit={() => {}} />);
        expect(screen.queryByText(/Speed|Best/)).toBeNull();
        unmount();
      }
    });
  });

  describe("Requirement: Same questions as the normal mode", () => {
    it("Scenario: Mixed speed game", () => {
      openApp();
      speed("Mixed");
      for (let i = 0; i < 40; i++) {
        expect(["notes", "scales", "chords", "relatives"]).toContain(q().kind);
        expect(answers()).toHaveLength(4);
        right();
      }
    });

    it("asks the mode's questions with four choices", () => {
      openApp();
      speed("Guitar");
      for (let i = 0; i < 20; i++) {
        expect(q().kind).toBe("guitar");
        expect(answers().map((b) => b.textContent)).toEqual(q().options);
        right();
      }
    });
  });

  describe("Requirement: Countdown per question", () => {
    it("shows a countdown from the moment the question is displayed", () => {
      openApp();
      speed("Scales");
      const bar = document.querySelector(".countdown i");
      expect(bar.style.animationDuration).toBe("20s");
      expect(bar.style.animationPlayState).toBe("running");
    });

    it("Scenario: Time runs out", () => {
      openApp();
      speed("Chords");
      const asked = q();
      wait(19900);
      expect(hearts()).toBe(5);
      wait(100);
      expect(hearts()).toBe(4);
      expect(score()).toBe(0);
      expect(button(`${asked.answer} ✓`).className).toContain("right");
      expect(answers().filter((b) => b.className.includes("wrong"))).toHaveLength(0);
    });

    it("Scenario: Timed-out question is reviewable", () => {
      openApp();
      speed("Relatives");
      right(); right();
      const timedOut = q();
      wait(limit() * 1000); wait(600);
      for (let i = 0; i < 4; i++) wrong();
      expect(gameOver()).toBe(true);
      tap("Review mistakes");
      expect(text()).toContain("Review · 1 / 5");
      expect(q().prompt).toBe(timedOut.prompt);
    });
  });

  describe("Requirement: Time limit progression", () => {
    it("Scenario: Correct answer above the minimum", () => {
      openApp();
      speed("Notes");
      let before = limit();
      for (let i = 0; i < 5; i++) { right(); expect(limit()).toBeLessThan(before); before = limit(); }
    });

    it("Scenario: Correct answer at the minimum", () => {
      openApp();
      speed("Bass");
      for (let i = 0; i < 25; i++) right();
      expect(limit()).toBe(2);
      right();
      expect(limit()).toBe(2);
    });

    it("Scenario: Miss", () => {
      openApp();
      speed("Notes");
      for (let i = 0; i < 5; i++) right();
      const before = limit();
      wrong();
      expect(limit()).toBeGreaterThan(before);
      expect(limit()).toBeCloseTo(before / 0.81, 6);
      wrong(); wrong();
      expect(limit()).toBe(20);
    });
  });

  describe("Requirement: Hearts", () => {
    it("Scenario: Losing a heart", () => {
      openApp();
      speed("Scales");
      wrong(); wrong();
      expect(hearts()).toBe(3);
      tap(q().options.find((o) => o !== q().answer));
      expect(hearts()).toBe(2);
      expect(document.querySelector(".hearts").getAttribute("aria-label")).toBe("2 hearts left");
    });

    it("Scenario: Last heart", () => {
      openApp();
      speed("Notes");
      for (let i = 0; i < 4; i++) wrong();
      tap(q().options.find((o) => o !== q().answer));
      expect(gameOver()).toBe(false);
      wait(600);
      expect(gameOver()).toBe(true);
    });
  });

  describe("Requirement: Speed-game feedback", () => {
    it("Scenario: Correct answer advances by itself", () => {
      openApp();
      speed("Notes");
      const first = q();
      tap(first.answer);
      for (const b of answers()) expect(b.disabled).toBe(true);
      expect(document.querySelector(".countdown i").style.animationPlayState).toBe("paused");
      expect(button(`${first.answer} ✓`).className).toContain("right");
      expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
      wait(300);
      expect(q()).not.toBe(first);
      expect(score()).toBe(1);
    });

    it("Scenario: Wrong answer advances by itself", () => {
      openApp();
      speed("Chords");
      const first = q();
      const picked = first.options.find((o) => o !== first.answer);
      tap(picked);
      expect(button(picked).className).toContain("wrong");
      expect(button(`${first.answer} ✓`).className).toContain("right");
      wait(599);
      expect(q()).toBe(first);
      wait(1);
      expect(q()).not.toBe(first);
    });

    it("Scenario: Timeout advances by itself", () => {
      openApp();
      speed("Guitar");
      const first = q();
      wait(20000);
      expect(button(`${first.answer} ✓`).className).toContain("right");
      wait(600);
      expect(q()).not.toBe(first);
      expect(hearts()).toBe(4);
    });

    it("Scenario: Unattended game", () => {
      openApp();
      speed("Relatives");
      for (let i = 0; i < 5; i++) { expect(gameOver()).toBe(false); wait(20000); wait(600); }
      expect(gameOver()).toBe(true);
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("0");
    });

    it("has no cheat sheet in a speed game", () => {
      openApp();
      speed("Notes");
      expect(screen.queryByRole("button", { name: "Open cheat sheet" })).toBeNull();
    });
  });

  describe("Requirement: Endless play without recent repeats", () => {
    it("Scenario: Long game", () => {
      openApp();
      speed("Guitar");
      for (let i = 0; i < 50; i++) right();
      expect(gameOver()).toBe(false);
      expect(answers()).toHaveLength(4);
      expect(score()).toBe(50);
    });

    it("does not repeat a prompt among the most recent questions", () => {
      openApp();
      speed("Relatives"); // only 24 different prompts
      const prompts = [];
      for (let i = 0; i < 60; i++) { prompts.push(prompt()); right(); }
      prompts.forEach((p, i) => expect(prompts.slice(Math.max(0, i - 10), i)).not.toContain(p));
    });
  });

  describe("Requirement: Score and game over", () => {
    it("Scenario: Game over summary", () => {
      openApp();
      speed("Bass");
      for (let i = 0; i < 17; i++) right();
      for (let i = 0; i < 5; i++) wrong();
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("17");
      expect(text()).toContain("correct in Bass speed");
      expect(text()).toContain("Best Bass score");
      expect(text()).toContain("New best");
    });

    it("plays again in the same mode or returns home", () => {
      openApp();
      speed("Chords");
      for (let i = 0; i < 5; i++) wrong();
      tap("Play again");
      expect(q().kind).toBe("chords");
      expect(hearts()).toBe(5);
      for (let i = 0; i < 5; i++) wrong();
      tap("Finish");
      expect(screen.getByRole("heading", { name: "Keys" })).toBeTruthy();
    });

    it("Scenario: Reviewing misses", () => {
      openApp();
      speed("Notes");
      right();
      for (let i = 0; i < 5; i++) wrong();
      tap("Review mistakes");
      expect(text()).toContain("Review · 1 / 5");
      expect(document.querySelector(".countdown")).toBeNull();
      expect(document.querySelector(".hearts")).toBeNull();
      wait(60000);
      expect(document.querySelector(".feedback")).toBeNull();
    });
  });

  describe("Requirement: Best score", () => {
    const finish = (mode, n) => { speed(mode); for (let i = 0; i < n; i++) right(); for (let i = 0; i < 5; i++) wrong(); };

    it("Scenario: New best", () => {
      localStorage.setItem("theory-quiz.best.notes", "19");
      openApp();
      expect(best("Notes")).toBe("Best 19");
      finish("Notes", 23);
      expect(text()).toContain("New best");
      tap("Finish");
      expect(best("Notes")).toBe("Best 23");
    });

    it("does not replace a higher best", () => {
      localStorage.setItem("theory-quiz.best.notes", "19");
      openApp();
      finish("Notes", 4);
      expect(text()).not.toContain("New best");
      expect(within(document.querySelector(".avg").parentElement).getByText("19")).toBeTruthy();
      tap("Finish");
      expect(best("Notes")).toBe("Best 19");
    });

    it("Scenario: Best survives a restart", () => {
      const first = openApp();
      finish("Guitar", 3);
      first.unmount();
      openApp();
      expect(best("Guitar")).toBe("Best 3");
    });

    it("Scenario: Quitting does not record a score", () => {
      openApp();
      speed("Scales");
      for (let i = 0; i < 6; i++) right();
      tap("Quit");
      expect(best("Scales")).toBeNull();
      expect(localStorage.getItem("theory-quiz.best.scales")).toBeNull();
    });

    it("Scenario: Separate best per selection", () => {
      localStorage.setItem("theory-quiz.best.notes", "23");
      openApp();
      fireEvent.click(screen.getByRole("checkbox", { name: "Pentatonic" }));
      fireEvent.click(screen.getByRole("checkbox", { name: "Major & minor" }));
      expect(best("Notes")).toBeNull();
      finish("Notes", 2);
      tap("Finish");
      expect(best("Notes")).toBe("Best 2");
    });

    it("Scenario: Switching back", () => {
      localStorage.setItem("theory-quiz.best.notes", "23");
      openApp();
      fireEvent.click(screen.getByRole("checkbox", { name: "Pentatonic" }));
      fireEvent.click(screen.getByRole("checkbox", { name: "Major & minor" }));
      fireEvent.click(screen.getByRole("checkbox", { name: "Major & minor" }));
      fireEvent.click(screen.getByRole("checkbox", { name: "Pentatonic" }));
      expect(best("Notes")).toBe("Best 23");
    });

    it("Scenario: Modes without scale groups", () => {
      localStorage.setItem("theory-quiz.best.chords", "7");
      localStorage.setItem("theory-quiz.best.relatives", "8");
      localStorage.setItem("theory-quiz.best.guitar", "9");
      localStorage.setItem("theory-quiz.best.bass", "10");
      openApp();
      fireEvent.click(screen.getByRole("checkbox", { name: "Pentatonic" }));
      expect(["Chords", "Relatives", "Guitar", "Bass"].map(best)).toEqual(["Best 7", "Best 8", "Best 9", "Best 10"]);
      fireEvent.click(screen.getByRole("checkbox", { name: "Major & minor" }));
      expect(["Chords", "Relatives", "Guitar", "Bass"].map(best)).toEqual(["Best 7", "Best 8", "Best 9", "Best 10"]);
    });

    it("keeps scores stored before scale groups existed for the default selection", () => {
      localStorage.setItem("theory-quiz.best.mixed", "12");
      localStorage.setItem("theory-quiz.best.mixed.major-minor+pentatonic", "4");
      openApp();
      expect(best("Mixed")).toBe("Best 12");
      fireEvent.click(screen.getByRole("checkbox", { name: "Pentatonic" }));
      expect(best("Mixed")).toBe("Best 4");
    });

    it("shows no best on the home screen before one exists", () => {
      openApp();
      for (const mode of ["Notes", "Scales", "Chords", "Relatives", "Mixed", "Guitar", "Bass"]) expect(best(mode)).toBeNull();
    });

    it("stays playable when the score cannot be stored", () => {
      blockStorage();
      openApp();
      finish("Relatives", 2);
      expect(gameOver()).toBe(true);
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("2");
    });
  });

  describe("Requirement: Tuning values", () => {
    it("Scenario: First correct answer", () => {
      openApp();
      speed("Notes");
      right();
      expect(limit()).toBeCloseTo(18, 6);
    });

    it("uses the same values in every mode", () => {
      for (const mode of ["Scales", "Chords", "Relatives", "Mixed", "Guitar", "Bass"]) {
        const { unmount } = openApp();
        speed(mode);
        expect(hearts()).toBe(5);
        expect(limit()).toBe(20);
        right();
        expect(limit()).toBeCloseTo(18, 6);
        wrong();
        expect(limit()).toBe(20); // 18 / 0.9 / 0.9, capped at the start
        unmount();
      }
    });
  });
});
