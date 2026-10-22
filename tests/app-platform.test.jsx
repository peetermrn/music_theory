// @vitest-environment jsdom
// openspec/specs/app-platform/spec.md
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within, act } from "@testing-library/react";
import { readFileSync, existsSync } from "node:fs";
import { makeQuestion } from "../src/theory.js";
import { EXERCISES } from "../src/ear.js";
import { runNotes } from "../src/runs.js";
import Runs from "../src/Runs.jsx";
import { openApp, openEntry, tap, button, wait } from "./helpers/app.jsx";
import { guitar } from "./helpers/guitar.js";
import { FakeAudioContext } from "./helpers/audio-context.js";
import { context } from "../src/audio.js";

const mic = vi.hoisted(() => ({ listen: null }));
vi.mock("../src/Mic.jsx", async (importOriginal) => ({
  ...(await importOriginal()),
  useMic: (listen) => { mic.listen = listen; return { problem: null, retry: () => {} }; },
}));
vi.mock("../src/audio.js", () => ({ play: vi.fn(() => Promise.resolve()), stop: vi.fn(), setVoice: vi.fn(), context: vi.fn() }));
vi.mock("../src/theory.js", async (importOriginal) => {
  const real = await importOriginal();
  return { ...real, makeQuestion: vi.fn(real.makeQuestion) };
});

const file = (path) => readFileSync(`${process.cwd()}/${path}`, "utf8");
const config = file("vite.config.js");
const q = () => makeQuestion.mock.results.at(-1).value;
const scrolled = () => window.scrollTo.mock.calls.length;
const toTop = () => expect(window.scrollTo).toHaveBeenLastCalledWith(0, 0);
const choose = (group, label) => fireEvent.click(within(screen.getByRole("group", { name: group })).getByRole("button", { name: label }));

beforeEach(() => { mic.listen = null; });

describe("app-platform", () => {
  describe("Requirement: Client-only application", () => {
    it("Scenario: No network dependency for quiz logic", () => {
      const fetch = vi.fn(), open = vi.fn();
      vi.stubGlobal("fetch", fetch);
      vi.stubGlobal("XMLHttpRequest", vi.fn(() => ({ open, send: vi.fn() })));
      openApp();
      for (const mode of ["Notes", "Scales", "Chords", "Relatives", "Mixed", "Guitar", "Bass"]) {
        openEntry(mode);
        for (let n = 0; n < 10; n++) { tap(q().answer); tap(n < 9 ? "Next" : "Finish"); }
        tap("Finish");
      }
      for (const ex of EXERCISES) for (let i = 0; i < 50; i++) ex.question(ex.levels.at(-1).ids ?? ex.levels.at(-1), "minor");
      expect(fetch).not.toHaveBeenCalled();
      expect(open).not.toHaveBeenCalled();
    });

    it("has no backend, accounts or server code", () => {
      const pkg = JSON.parse(file("package.json"));
      expect(Object.keys(pkg.dependencies)).toEqual(["react", "react-dom"]);
      for (const f of ["src/App.jsx", "src/theory.js", "src/ear.js", "src/runs.js", "src/play.js"]) {
        expect(file(f)).not.toMatch(/fetch\(|XMLHttpRequest|WebSocket|https?:\/\//);
      }
    });
  });

  describe("Requirement: Installable PWA", () => {
    it("Scenario: Installing on Android", () => {
      expect(config).toContain('name: "Music Theory Quiz"');
      expect(config).toContain('short_name: "Theory Quiz"');
      expect(config).toContain('display: "standalone"');
      expect(config).toContain('start_url: "/"');
      for (const icon of ["pwa-192.png", "pwa-512.png"]) {
        expect(config).toContain(`src: "${icon}"`);
        expect(existsSync(`${process.cwd()}/public/${icon}`)).toBe(true);
      }
    });
  });

  describe("Requirement: Offline use", () => {
    it("Scenario: Offline session", () => {
      // the service worker caches the app and its recordings, and replaces itself when a new version is online
      expect(config).toContain('registerType: "autoUpdate"');
      const globs = config.match(/globPatterns: \[([^\]]*)\]/)[1];
      for (const ext of ["js", "css", "html", "mp3"]) expect(globs).toContain(ext);
    });
  });

  describe("Requirement: Phone-first layout", () => {
    // Widths and scrolling are checked by hand on a phone; here, what the layout relies on
    it("Scenario: Narrow screen", () => {
      expect(file("index.html")).toMatch(/<meta name="viewport" content="width=device-width/);
      openApp();
      openEntry("Scales");
      expect(document.querySelectorAll("main .answers button.answer")).toHaveLength(4);
      expect(screen.getByRole("heading", { level: 2 }).closest("main")).not.toBeNull();
    });

    it("Scenario: Ear question with twelve choices", () => {
      openApp();
      openEntry("Interval training");
      tap(/^Level 6/);
      const answers = document.querySelector(".answers");
      expect(answers.classList.contains("two")).toBe(true);
      expect(answers.querySelectorAll("button")).toHaveLength(12);
      expect(file("src/styles.css")).toMatch(/\.answers\.two\s*\{[^}]*grid-template-columns:\s*1fr 1fr/);
    });

    it("lays out at most five ear choices in one column", () => {
      openApp();
      openEntry("Interval training");
      tap(/^Level 3/);
      expect(document.querySelector(".answers").classList.contains("two")).toBe(false);
    });
  });

  describe("Requirement: Screens open at the top", () => {
    it("Scenario: Opening the Visuals page", () => {
      openApp();
      window.scrollTo.mockClear();
      openEntry("Circle & fretboard");
      toTop();
    });

    it("Scenario: Opening an ear-training exercise", () => {
      openApp();
      window.scrollTo.mockClear();
      openEntry("Chord training");
      toTop();
      window.scrollTo.mockClear();
      tap(/^Level 1/);
      toTop();
    });

    it("Scenario: Next question", () => {
      openApp();
      openEntry("Notes");
      tap(q().answer);
      window.scrollTo.mockClear();
      tap("Next");
      toTop();
      expect(scrolled()).toBe(1);
    });

    it("opens each next speed-game question and the game-over screen at the top", () => {
      vi.useFakeTimers();
      openApp();
      fireEvent.click(button("Bass speed game"));
      window.scrollTo.mockClear();
      tap(q().answer);
      wait(300);
      toTop();
      window.scrollTo.mockClear();
      for (let i = 0; i < 5; i++) { tap(q().options.find((o) => o !== q().answer)); wait(600); }
      expect(screen.getByText("Game over")).toBeTruthy();
      expect(scrolled()).toBeGreaterThanOrEqual(5);
    });

    it("opens a result screen at the top", () => {
      openApp();
      openEntry("Guitar");
      for (let n = 0; n < 9; n++) { tap(q().answer); tap("Next"); }
      tap(q().answer);
      window.scrollTo.mockClear();
      tap("Finish");
      toTop();
    });

    it("Scenario: Back to home", () => {
      openApp();
      for (const [open, leave] of [["Notes", "Quit"], ["Circle & fretboard", "‹ Back"], ["Interval training", "‹ Back"], ["Metronome", "‹ Back"], ["Scale runs", "‹ Back"]]) {
        openEntry(open);
        window.scrollTo.mockClear();
        tap(leave);
        toTop();
      }
      openEntry("Relatives");
      for (let n = 0; n < 10; n++) { tap(q().answer); tap(n < 9 ? "Next" : "Finish"); }
      window.scrollTo.mockClear();
      tap("Finish");
      toTop();
    });

    it("Scenario: Using the Visuals page does not scroll it", () => {
      openApp();
      openEntry("Circle & fretboard");
      window.scrollTo.mockClear();
      choose("Instrument", "Bass");
      choose("Labels", "Degrees");
      choose("Shape system", "3 per string");
      choose("Position", "3");
      choose("Key type", "Minor");
      choose("Scale", "Pentatonic");
      tap("Up a semitone");
      tap("Down a semitone");
      expect(window.scrollTo).not.toHaveBeenCalled();
    });

    it("Scenario: Opening a tool", () => {
      openApp();
      window.scrollTo.mockClear();
      openEntry("Tuner");
      toTop();
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Tuner");
    });

    it("Scenario: Using a tool does not scroll it", () => {
      context.mockReturnValue(new FakeAudioContext());
      openApp();
      openEntry("Metronome");
      window.scrollTo.mockClear();
      tap("Up 10 BPM"); tap("Down 1 BPM");
      choose("Beats per bar", "3");
      tap("Start"); tap("Stop");
      expect(window.scrollTo).not.toHaveBeenCalled();
      tap("‹ Back");
      openEntry("Tuner");
      window.scrollTo.mockClear();
      choose("Instrument", "Bass");
      fireEvent.click(within(screen.getByRole("group", { name: "Strings" })).getAllByRole("button")[1]);
      choose("Instrument", "Guitar");
      expect(window.scrollTo).not.toHaveBeenCalled();
    });

    it("Scenario: Next Play on guitar question", () => {
      vi.useFakeTimers();
      openApp();
      openEntry("Fretboard notes");
      const g = guitar(() => mic.listen);
      tap("Show me");
      window.scrollTo.mockClear();
      tap("Next");
      toTop();
      // and by itself, once the right note is played
      window.scrollTo.mockClear();
      const prompt = screen.getByRole("heading", { level: 2 }).textContent;
      const [, note, string] = prompt.match(/^Play (\S+) on the (.+) string$/);
      const open = { "low E": 40, A: 45, D: 50, G: 55, B: 59, "high E": 64 }[string];
      const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
      const midi = open + ((names.indexOf(note) - open) % 12 + 12) % 12;
      g.twice(midi).run(1200);
      expect(screen.getByRole("heading", { level: 2 }).textContent).not.toBe(prompt);
      toTop();
    });

    it("opens the Play on guitar results at the top", () => {
      openApp();
      openEntry("Key notes");
      for (let n = 0; n < 9; n++) { tap("Show me"); tap("Next"); }
      tap("Show me");
      window.scrollTo.mockClear();
      tap("Finish");
      toTop();
    });

    it("Scenario: Overlays do not scroll the screen", () => {
      openApp();
      window.scrollTo.mockClear();
      tap("How it works");
      tap("Close how it works");
      openEntry("Chords");
      window.scrollTo.mockClear();
      tap("Open cheat sheet");
      tap("Close cheat sheet");
      expect(window.scrollTo).not.toHaveBeenCalled();
    });

    it("does not scroll an ear question when it is answered or replayed", () => {
      openApp();
      openEntry("Interval training");
      tap(/^Level 1/);
      window.scrollTo.mockClear();
      tap("▶ Play both");
      tap("Open cheat sheet"); tap("Close cheat sheet");
      fireEvent.click(document.querySelector(".answer.ear"));
      expect(window.scrollTo).not.toHaveBeenCalled();
    });

    it("opens the Scale runs page, a run and its result at the top", () => {
      vi.useFakeTimers();
      openApp();
      window.scrollTo.mockClear();
      openEntry("Scale runs");
      toTop();
      window.scrollTo.mockClear();
      tap(/^Next run: /);
      toTop();
      const run = runNotes("C", "major", 0);
      const g = guitar(() => mic.listen);
      for (const n of run.slice(0, -1)) g.pluck(n.midi, 300);
      window.scrollTo.mockClear();
      g.pluck(run.at(-1).midi, 300);
      expect(screen.getByText("Scale run complete")).toBeTruthy();
      toTop();
    });

    it("Scenario: Back to the Scale runs page", () => {
      vi.useFakeTimers();
      render(<Runs onExit={() => {}} />);
      tap(/^Next run: /);
      const g = guitar(() => mic.listen);
      for (const n of runNotes("C", "major", 0)) g.pluck(n.midi, 300);
      window.scrollTo.mockClear();
      tap("‹ Scale runs");
      toTop();
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Scale runs");
    });

    it("Scenario: Following a run does not scroll it", () => {
      vi.useFakeTimers();
      render(<Runs onExit={() => {}} />);
      tap(/^Next run: /);
      const g = guitar(() => mic.listen);
      window.scrollTo.mockClear();
      for (const n of runNotes("C", "major", 0).slice(0, 5)) g.pluck(n.midi, 300);
      g.pluck(61, 300); // a wrong note
      expect(document.querySelector(".reading .note").textContent).toMatch(/^5 \//);
      expect(window.scrollTo).not.toHaveBeenCalled();
    });

    it("scrolls without returning scrollTo's result to React", () => {
      // newer browsers return a Promise from scrollTo; React would call a returned value as the cleanup
      window.scrollTo.mockReturnValue(Promise.resolve());
      const { unmount } = openApp();
      openEntry("Notes");
      tap("Quit");
      expect(() => unmount()).not.toThrow();
      expect(() => act(() => {})).not.toThrow();
    });
  });
});
