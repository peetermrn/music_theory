// @vitest-environment jsdom
// openspec/specs/scale-runs/spec.md
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within, act } from "@testing-library/react";
import { CELLS, POSITIONS, cellId, runNotes, top, begin, follow, today, stateOf, settle, suggest, readRuns, writeRuns } from "../src/runs.js";
import { position } from "../src/shapes.js";
import { listener } from "../src/play.js";
import { KEYS, TUNING, pc } from "../src/theory.js";
import { context } from "../src/audio.js";
import Runs from "../src/Runs.jsx";
import { openApp, openEntry, tap, button, text } from "./helpers/app.jsx";
import { guitar } from "./helpers/guitar.js";
import { recording, listen, frameAt, dbfs } from "./helpers/sound.js";
import { blockStorage } from "./helpers/storage.js";
import { FakeAudioContext } from "./helpers/audio-context.js";

const mic = vi.hoisted(() => ({ listen: null, problem: null, retry: null, real: false }));
vi.mock("../src/Mic.jsx", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useMic: (listen) => {
      if (mic.real) return actual.useMic(listen);
      mic.listen = listen;
      return { problem: mic.problem, retry: mic.retry };
    },
  };
});
vi.mock("../src/audio.js", () => ({ play: vi.fn(() => Promise.resolve()), stop: vi.fn(), setVoice: vi.fn(), context: vi.fn() }));

const GUITAR = TUNING.guitar;
const DAY = "2026-10-22";
const daysAgo = (n) => today(new Date(2026, 9, 22 - n, 12));
const MAJORS = ["C", "G", "D", "A", "E", "B", "F#", "Db", "Ab", "Eb", "Bb", "F"];
const MINORS = ["A", "E", "B", "F#", "C#", "G#", "Eb", "Bb", "F", "C", "G", "D"];
const cell = (root, type, k) => CELLS.find((c) => c.id === cellId(root, type, k));
const store = (s) => localStorage.setItem("scale-runs", JSON.stringify(s));
const stored = () => JSON.parse(localStorage.getItem("scale-runs") || "{}");
const openPage = () => render(<Runs onExit={() => {}} />);
const mapCell = (label) => screen.getByRole("button", { name: new RegExp(`^${label.replace(/[#]/g, "\\#")}, `) });
const cellState = (label) => mapCell(label).getAttribute("aria-label").split(", ").at(-1);
const count = () => document.querySelector(".reading .note")?.textContent;
const status = () => document.querySelector(".reading .cents")?.textContent;
const header = () => document.querySelector(".bar span").textContent;
const shownFrets = () => {
  const svg = document.querySelector("svg.neck");
  if (!svg) return null;
  const first = Number(svg.getAttribute("aria-label").match(/frets (\d+) to/)[1]);
  const col = first ? 320 / 13 : 300 / 12;
  return [...svg.querySelectorAll(".mark")].map((g) => {
    const c = g.querySelector("circle");
    const cx = Number(c.getAttribute("cx")), cy = Number(c.getAttribute("cy"));
    return {
      s: 5 - Math.round((cy - 16) / 26), f: first ? Math.round(cx / col - 0.5 + first) : cx < 20 ? 0 : Math.round((cx - 20) / col + 0.5),
      dim: g.classList.contains("dim"), played: g.classList.contains("played"), label: g.textContent, root: g.classList.contains("root"),
    };
  });
};
let g;
// Plays notes of a run through the microphone, one pluck each
const playNotes = (run, from, to) => { for (let i = from; i < to; i++) g.pluck(run[i].midi, 300); };

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, 22, 12));
  mic.listen = null; mic.problem = null; mic.retry = vi.fn(); mic.real = false;
  g = guitar(() => mic.listen);
});

describe("scale-runs", () => {
  describe("Requirement: Scale runs page", () => {
    it("Scenario: Opening", () => {
      openApp();
      openEntry("Scale runs");
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Scale runs");
      expect(within(screen.getByRole("group", { name: "Key type" })).getByRole("button", { name: "Major" }).getAttribute("aria-pressed")).toBe("true");
      expect(screen.getByRole("group", { name: "major keys by position" })).toBeTruthy();
      expect(button(/^Next run: /).textContent).toBe("Next run: C major, position 1");
      expect(mic.listen).toBeNull();
      expect(count()).toBeUndefined();
    });

    it("Scenario: Switching to minor", () => {
      openPage();
      fireEvent.click(button("Minor"));
      const map = screen.getByRole("group", { name: "minor keys by position" });
      expect([...map.querySelectorAll(".root")].map((r) => r.textContent)).toEqual(MINORS);
      expect(button(/^Next run: /).textContent).toBe("Next run: C major, position 1");
    });

    it("opens on Major each time", () => {
      const first = openPage();
      fireEvent.click(button("Minor"));
      first.unmount();
      openPage();
      expect(screen.getByRole("group", { name: "major keys by position" })).toBeTruthy();
    });

    it("has a control back to the home screen", () => {
      openApp();
      openEntry("Scale runs");
      tap("‹ Back");
      expect(screen.getByRole("heading", { name: "Play on guitar" })).toBeTruthy();
    });
  });

  describe("Requirement: The map", () => {
    it("has one row per key in the home screen's order and one column per position", () => {
      openPage();
      const map = screen.getByRole("group", { name: "major keys by position" });
      expect([...map.querySelectorAll(".root")].map((r) => r.textContent)).toEqual(MAJORS);
      expect([...map.querySelectorAll(".pos")].map((p) => p.textContent)).toEqual(["1", "2", "3", "4", "5"]);
      const cells = within(map).getAllByRole("button");
      expect(cells).toHaveLength(60);
      expect(cells.slice(0, 6).map((c) => c.getAttribute("aria-label").split(",").slice(0, 2).join(","))).toEqual(
        ["C major, position 1", "C major, position 2", "C major, position 3", "C major, position 4", "C major, position 5", "G major, position 1"]);
      expect(CELLS).toHaveLength(120);
      expect(POSITIONS).toBe(5);
      expect(CELLS.map((c) => `${c.root} ${c.type}`).filter((x, i, a) => a.indexOf(x) === i)).toEqual(KEYS.map(([r, t]) => `${r} ${t}`));
    });

    it("Scenario: Empty map", () => {
      openPage();
      const map = screen.getByRole("group", { name: "major keys by position" });
      for (const c of within(map).getAllByRole("button")) expect(c.getAttribute("aria-label")).toMatch(/, not started$/);
      expect(text()).toContain("0 of 60 known");
    });

    it("shows each cell's state, and counts known and due cells", () => {
      store({ [cellId("C", "major", 0)]: { state: "seen" }, [cellId("C", "major", 1)]: { state: "known", day: daysAgo(1) },
        [cellId("G", "major", 2)]: { state: "known", day: daysAgo(10) }, [cellId("A", "minor", 0)]: { state: "known", day: DAY } });
      openPage();
      expect(["C major, position 1", "C major, position 2", "G major, position 3", "D major, position 1"].map(cellState)).toEqual(["seen", "known", "due", "not started"]);
      expect(mapCell("G major, position 3").classList.contains("due")).toBe(true);
      expect(text()).toContain("2 of 60 known");
      fireEvent.click(button("Minor"));
      expect(text()).toContain("1 of 60 known");
    });

    it("Scenario: Tapping a cell", () => {
      openPage();
      fireEvent.click(mapCell("Bb major, position 3"));
      expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Bb major, position 3");
      expect(count()).toBe(`0 / ${runNotes("Bb", "major", 2).length}`);
    });
  });

  describe("Requirement: Run shapes", () => {
    it("Scenario: Same shape as Visuals", () => {
      openPage();
      fireEvent.click(button("Minor"));
      fireEvent.click(mapCell("A minor, position 1"));
      const marks = shownFrets().filter((m) => !m.dim);
      const byString = [...Array(6)].map((_, s) => marks.filter((m) => m.s === s).map((m) => m.f).sort((a, b) => a - b));
      expect(byString).toEqual([[5, 7, 8], [5, 7, 8], [5, 7], [4, 5, 7], [5, 6, 8], [5, 7, 8]]);
    });

    it("uses the Visuals page's five-position seven-note shape of every cell", () => {
      for (const c of CELLS) {
        const shape = position(c.root, c.type, false, "five", c.k, GUITAR);
        const up = runNotes(c.root, c.type, c.k).slice(0, top(runNotes(c.root, c.type, c.k)) + 1);
        expect(up.map((n) => `${n.s}.${n.f}`).sort()).toEqual(shape.flatMap((fs, s) => fs.map((f) => `${s}.${f}`)).sort());
        for (const n of up) expect(n.midi).toBe(GUITAR[n.s] + n.f);
      }
    });

    it("numbers a minor key's positions from its own root", () => {
      expect(runNotes("A", "minor", 0)[0].midi % 12).toBe(pc("A"));
      expect(runNotes("C", "major", 0)[0].midi % 12).toBe(pc("C"));
    });
  });

  describe("Requirement: The notes of a run", () => {
    it("Scenario: A minor, position 1", () => {
      const run = runNotes("A", "minor", 0);
      expect(run).toHaveLength(33);
      expect(run[0]).toEqual({ midi: 45, s: 0, f: 5 });
      expect(run[16]).toEqual({ midi: 72, s: 5, f: 8 }); // up 17 notes
      expect(run.slice(0, 17).every((n, i) => !i || n.midi > run[i - 1].midi)).toBe(true);
      expect(top(run)).toBe(16);
      expect(run.at(-1)).toEqual(run[0]);
    });

    it("goes up in pitch to the highest note, played once, then back down", () => {
      for (const c of CELLS) {
        const run = runNotes(c.root, c.type, c.k).map((n) => n.midi);
        const t = top(run);
        expect(Number.isInteger(t)).toBe(true);
        for (let i = 1; i <= t; i++) expect(run[i]).toBeGreaterThan(run[i - 1]);
        for (let i = t + 1; i < run.length; i++) expect(run[i]).toBeLessThan(run[i - 1]);
        expect(run.slice(t + 1)).toEqual(run.slice(0, t).reverse());
        expect(new Set(run.slice(0, t + 1)).size).toBe(t + 1); // no pitch twice in a shape
      }
    });

    it("Scenario: Another octave does not count", () => {
      const run = runNotes("A", "minor", 0);
      const st = follow(run, begin(), 57); // A3 when A2 is next
      expect(st.i).toBe(0);
      expect(st.mistakes).toBe(1);
    });
  });

  describe("Requirement: Following a run", () => {
    const run = runNotes("A", "minor", 0);
    const after = (notes) => notes.reduce((st, m) => follow(run, st, m), begin());

    it("Scenario: Right note", () => {
      const st = after(run.slice(0, 4).map((n) => n.midi));
      expect(st.i).toBe(4);
      expect(follow(run, st, run[4].midi).i).toBe(5);
      openPage();
      fireEvent.click(button("Minor"));
      fireEvent.click(mapCell("A minor, position 1"));
      playNotes(run, 0, 4);
      expect(count()).toBe("4 / 33");
      expect(status()).toBe("↑ Going up");
    });

    it("Scenario: Plucked twice", () => {
      const st = after([45, 47, 47]);
      expect(st).toEqual({ i: 2, mistakes: 0, wrong: null });
      openPage();
      fireEvent.click(button("Minor"));
      fireEvent.click(mapCell("A minor, position 1"));
      g.pluck(45, 300).pluck(47, 300).pluck(47, 300);
      expect(count()).toBe("2 / 33");
      expect(header()).toBe("Shown");
    });

    it("Scenario: Wrong note", () => {
      // A minor position 1 goes A B C D E F G: after E comes F; after F comes G
      const st = after([45, 47, 48, 50, 52, 53]);
      expect(run[6].midi).toBe(55);
      const wrong = follow(run, st, 53 + 12);
      expect(wrong).toEqual({ i: 6, mistakes: 1, wrong: 65 });
      openPage();
      fireEvent.click(button("Minor"));
      fireEvent.click(mapCell("A minor, position 1"));
      playNotes(run, 0, 6);
      g.pluck(65, 300);
      expect(status()).toBe("F is not next");
      expect(header()).toBe("Shown · 1 mistake");
      expect(count()).toBe("6 / 33");
      g.pluck(55, 300);
      expect(count()).toBe("7 / 33");
      expect(status()).toBe("↑ Going up");
    });

    it("Scenario: The turn", () => {
      const st = after(run.slice(0, 16).map((n) => n.midi));
      expect(follow(run, st, 72).i).toBe(17);
      openPage();
      fireEvent.click(button("Minor"));
      fireEvent.click(mapCell("A minor, position 1"));
      playNotes(run, 0, 17);
      expect(count()).toBe("17 / 33");
      expect(status()).toBe("↓ Going down");
    });

    it("asks for the lowest note first", () => {
      openPage();
      fireEvent.click(mapCell("C major, position 1"));
      expect(status()).toBe("Listening… start on the lowest note");
    });

    it("ignores notes after the run has ended", () => {
      const done = after(run.map((n) => n.midi));
      expect(follow(run, done, 50)).toBe(done);
    });
  });

  describe("Requirement: Hearing notes in a run", () => {
    it("Scenario: Highest shapes", () => {
      const highest = Math.max(...CELLS.map((c) => Math.max(...runNotes(c.root, c.type, c.k).map((n) => n.midi))));
      expect(highest).toBeLessThanOrEqual(GUITAR[5] + 15);
      const got = [];
      const l = listener((m) => got.push(m), () => dbfs(-60), [70, 800]);
      listen((b, r, t) => l.hear(b, r, t), recording([{ midi: 79, at: 100 }]), 0, 800);
      expect(got).toEqual([79]);
    });

    it("plays the run that reaches highest on the neck to its result", () => {
      const tops = CELLS.map((x) => Math.max(...runNotes(x.root, x.type, x.k).map((n) => n.midi)));
      const c = CELLS[tops.indexOf(Math.max(...tops))];
      const run = runNotes(c.root, c.type, c.k);
      openPage();
      if (c.type === "minor") fireEvent.click(button("Minor"));
      fireEvent.click(mapCell(`${c.root} ${c.type}, position ${c.k + 1}`));
      playNotes(run, 0, run.length);
      expect(screen.getByText("Scale run complete")).toBeTruthy();
      expect(text()).toContain("Clean run");
    });

    it("does not count a note still ringing from before the run", () => {
      openPage();
      fireEvent.click(mapCell("C major, position 1"));
      g.pluck(48, 300); // C3, the first note
      tap("Quit");
      fireEvent.click(mapCell("C major, position 1"));
      g.run(600); // still ringing
      expect(count()).toBe("0 / " + runNotes("C", "major", 0).length);
    });
  });

  describe("Requirement: Shown runs", () => {
    it("Scenario: First run of a cell", () => {
      openPage();
      fireEvent.click(mapCell("G major, position 2"));
      expect(header()).toBe("Shown");
      const marks = shownFrets();
      expect(marks.some((m) => !m.dim)).toBe(true);
      expect(marks.some((m) => m.dim)).toBe(true);
      expect(marks.filter((m) => m.root).every((m) => m.label === "1")).toBe(true);
      expect(marks.every((m) => /^[1-7]$/.test(m.label))).toBe(true);
      expect(marks.some((m) => m.played)).toBe(false);
    });

    it("Scenario: Notes light up", () => {
      const run = runNotes("G", "major", 1);
      openPage();
      fireEvent.click(mapCell("G major, position 2"));
      playNotes(run, 0, 3);
      const played = shownFrets().filter((m) => m.played).map((m) => `${m.s}.${m.f}`).sort();
      expect(played).toEqual(run.slice(0, 3).map((n) => `${n.s}.${n.f}`).sort());
    });

    it("lights the notes again on the way down", () => {
      const run = runNotes("A", "minor", 0);
      openPage();
      fireEvent.click(button("Minor"));
      fireEvent.click(mapCell("A minor, position 1"));
      playNotes(run, 0, 19);
      const played = shownFrets().filter((m) => m.played).map((m) => `${m.s}.${m.f}`).sort();
      expect(played).toEqual(run.slice(16, 19).map((n) => `${n.s}.${n.f}`).sort());
    });
  });

  describe("Requirement: Runs from memory", () => {
    it("Scenario: From memory", () => {
      store({ [cellId("D", "major", 3)]: { state: "seen" } });
      openPage();
      fireEvent.click(mapCell("D major, position 4"));
      expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("D major, position 4");
      expect(header()).toBe("From memory");
      expect(document.querySelector("svg.neck")).toBeNull();
      expect(button("Show me")).toBeTruthy();
    });

    it("runs known and due cells from memory too", () => {
      store({ [cellId("D", "major", 0)]: { state: "known", day: DAY }, [cellId("D", "major", 1)]: { state: "known", day: daysAgo(9) } });
      openPage();
      fireEvent.click(mapCell("D major, position 1"));
      expect(header()).toBe("From memory");
      tap("Quit");
      fireEvent.click(mapCell("D major, position 2"));
      expect(header()).toBe("From memory");
    });

    it("Scenario: Show me", () => {
      store({ [cellId("C", "major", 0)]: { state: "seen" } });
      const run = runNotes("C", "major", 0);
      openPage();
      fireEvent.click(mapCell("C major, position 1"));
      playNotes(run, 0, 10);
      tap("Show me");
      const played = shownFrets().filter((m) => m.played).map((m) => `${m.s}.${m.f}`).sort();
      expect(played).toEqual(run.slice(0, 10).map((n) => `${n.s}.${n.f}`).sort());
      expect(count()).toBe(`10 / ${run.length}`);
      playNotes(run, 10, 11);
      expect(count()).toBe(`11 / ${run.length}`);
    });
  });

  describe("Requirement: Clean runs and cell states", () => {
    it("moves cells as the spec says", () => {
      expect(settle(undefined, { memory: false, clean: true }, DAY)).toEqual({ state: "seen" });
      expect(settle(undefined, { memory: false, clean: false }, DAY)).toBeUndefined();
      expect(settle({ state: "seen" }, { memory: true, clean: true }, DAY)).toEqual({ state: "known", day: DAY });
      expect(settle({ state: "known", day: daysAgo(3) }, { memory: true, clean: true }, DAY)).toEqual({ state: "known", day: DAY });
      expect(settle({ state: "known", day: daysAgo(3) }, { memory: true, clean: false }, DAY)).toEqual({ state: "seen" });
      expect(settle({ state: "known", day: daysAgo(30) }, { memory: true, clean: false }, DAY)).toEqual({ state: "seen" });
      expect(settle({ state: "seen" }, { memory: true, clean: false }, DAY)).toEqual({ state: "seen" });
    });

    it("Scenario: Learning a cell", () => {
      const run = runNotes("C", "major", 0);
      openPage();
      fireEvent.click(mapCell("C major, position 1"));
      playNotes(run, 0, run.length);
      expect(text()).toContain("This position is now seen");
      expect(stored()[cellId("C", "major", 0)]).toEqual({ state: "seen" });
      tap("Again");
      expect(header()).toBe("From memory");
    });

    it("Scenario: Knowing a cell", () => {
      store({ [cellId("C", "major", 0)]: { state: "seen" } });
      const run = runNotes("C", "major", 0);
      openPage();
      fireEvent.click(mapCell("C major, position 1"));
      playNotes(run, 0, run.length);
      expect(stored()[cellId("C", "major", 0)]).toEqual({ state: "known", day: DAY });
    });

    it("Scenario: Forgetting a cell", () => {
      store({ [cellId("C", "major", 0)]: { state: "known", day: daysAgo(2) } });
      const run = runNotes("C", "major", 0);
      openPage();
      fireEvent.click(mapCell("C major, position 1"));
      playNotes(run, 0, 5);
      g.pluck(run[5].midi + 1, 300).pluck(run[5].midi - 1, 300);
      playNotes(run, 5, run.length);
      expect(text()).toContain("2 mistakes");
      expect(text()).toContain("This position is now seen");
      expect(stored()[cellId("C", "major", 0)]).toEqual({ state: "seen" });
    });

    it("Scenario: Shown run with a mistake", () => {
      const run = runNotes("C", "major", 0);
      openPage();
      fireEvent.click(mapCell("C major, position 1"));
      playNotes(run, 0, 3);
      g.pluck(run[3].midi + 1, 300);
      playNotes(run, 3, run.length);
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("1 mistake");
      expect(text()).toContain("This position is now not started");
      expect(stored()[cellId("C", "major", 0)]).toBeUndefined();
    });

    it("a run from memory with Show me counts as shown", () => {
      store({ [cellId("C", "major", 0)]: { state: "seen" } });
      const run = runNotes("C", "major", 0);
      openPage();
      fireEvent.click(mapCell("C major, position 1"));
      playNotes(run, 0, 4);
      tap("Show me");
      playNotes(run, 4, run.length);
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("0 mistakes");
      expect(text()).toContain("C major, position 1, with Show me");
      expect(stored()[cellId("C", "major", 0)]).toEqual({ state: "seen" });
    });
  });

  describe("Requirement: Due cells", () => {
    it("Scenario: A week later", () => {
      expect(stateOf({ state: "known", day: daysAgo(8) }, DAY)).toBe("due");
      expect(stateOf({ state: "known", day: daysAgo(7) }, DAY)).toBe("known");
      expect(stateOf({ state: "seen" }, DAY)).toBe("seen");
      expect(stateOf(undefined, DAY)).toBe("new");
      store({ [cellId("E", "minor", 2)]: { state: "known", day: daysAgo(8) } });
      openPage();
      fireEvent.click(button("Minor"));
      expect(cellState("E minor, position 3")).toBe("due");
      expect(text()).toContain("1 of 60 known");
    });

    it("writes days as local dates", () => {
      expect(today(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
      expect(today()).toBe(DAY);
    });
  });

  describe("Requirement: Suggested run", () => {
    const id = (r, t, k) => cellId(r, t, k);

    it("Scenario: First suggestion", () => {
      expect(suggest({}, DAY).id).toBe(id("C", "major", 0));
    });

    it("Scenario: One key across the neck first", () => {
      const s = Object.fromEntries([0, 1, 2, 3].map((k) => [id("C", "major", k), { state: "known", day: DAY }]));
      expect(suggest(s, DAY).id).toBe(id("C", "major", 4));
      store(s);
      openPage();
      expect(button(/^Next run: /).textContent).toBe("Next run: C major, position 5");
      expect(mapCell("C major, position 5").classList.contains("next")).toBe(true);
    });

    it("Scenario: Recall before new shapes", () => {
      expect(suggest({ [id("C", "major", 0)]: { state: "seen" } }, DAY).id).toBe(id("C", "major", 0));
      expect(suggest({ [id("F", "minor", 3)]: { state: "seen" } }, DAY).id).toBe(id("F", "minor", 3));
    });

    it("Scenario: Due first", () => {
      const s = { [id("C", "major", 0)]: { state: "seen" }, [id("G", "major", 1)]: { state: "seen" }, [id("D", "minor", 3)]: { state: "known", day: daysAgo(9) } };
      expect(suggest(s, DAY).id).toBe(id("D", "minor", 3));
    });

    it("takes the longest due first and the oldest known last", () => {
      const due = { [id("A", "major", 0)]: { state: "known", day: daysAgo(9) }, [id("E", "major", 1)]: { state: "known", day: daysAgo(20) } };
      expect(suggest(due, DAY).id).toBe(id("E", "major", 1));
      const known = Object.fromEntries(CELLS.map((c, i) => [c.id, { state: "known", day: daysAgo(i % 7) }]));
      known[id("Bb", "minor", 2)] = { state: "known", day: daysAgo(7) };
      expect(suggest(known, DAY).id).toBe(id("Bb", "minor", 2));
    });

    it("takes major keys before minor keys, in the map's order", () => {
      const s = Object.fromEntries(CELLS.filter((c) => c.type === "major").map((c) => [c.id, { state: "known", day: DAY }]));
      expect(suggest(s, DAY).id).toBe(id("A", "minor", 0));
      delete s[id("F", "major", 4)];
      expect(suggest(s, DAY).id).toBe(id("F", "major", 4));
    });

    it("starts the suggested run", () => {
      store({ [id("G", "major", 2)]: { state: "seen" } });
      openPage();
      tap(/^Next run: G major, position 3$/);
      expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("G major, position 3");
    });
  });

  describe("Requirement: Quitting a run", () => {
    it("Scenario: Quit", () => {
      store({ [cellId("C", "major", 0)]: { state: "known", day: daysAgo(1) } });
      const run = runNotes("C", "major", 0);
      openPage();
      fireEvent.click(mapCell("C major, position 1"));
      playNotes(run, 0, 4);
      g.pluck(run[4].midi + 2, 300);
      tap("Quit");
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Scale runs");
      expect(cellState("C major, position 1")).toBe("known");
      expect(stored()[cellId("C", "major", 0)]).toEqual({ state: "known", day: daysAgo(1) });
    });
  });

  describe("Requirement: Run result", () => {
    it("Scenario: Clean run from memory", () => {
      store({ [cellId("A", "minor", 0)]: { state: "seen" } });
      const run = runNotes("A", "minor", 0);
      openPage();
      fireEvent.click(button("Minor"));
      fireEvent.click(mapCell("A minor, position 1"));
      playNotes(run, 0, run.length);
      expect(screen.getByText("Scale run complete")).toBeTruthy();
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Clean run");
      // 32 more notes at 300 ms each after the first
      expect(text()).toContain("Time from first note to last9.6 seconds");
      expect(text()).toContain("This position is now known");
      expect(button(/^Next run: /).textContent).toBe("Next run: C major, position 1");
    });

    it("Scenario: Again", () => {
      const run = runNotes("E", "major", 3);
      openPage();
      fireEvent.click(mapCell("E major, position 4"));
      g.pluck(run[0].midi + 1, 300);
      playNotes(run, 0, run.length);
      tap("Again");
      expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("E major, position 4");
      expect(count()).toBe(`0 / ${run.length}`);
      expect(header()).toBe("Shown");
    });

    it("offers Next run and a way back to the page", () => {
      const run = runNotes("C", "major", 0);
      openPage();
      fireEvent.click(mapCell("C major, position 1"));
      playNotes(run, 0, run.length);
      // C major 1 is now seen, so it is still the suggestion
      tap(/^Next run: C major, position 1$/);
      expect(header()).toBe("From memory");
      tap("Quit");
      fireEvent.click(mapCell("G major, position 1"));
      playNotes(runNotes("G", "major", 0), 0, runNotes("G", "major", 0).length);
      tap("‹ Scale runs");
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Scale runs");
      expect(cellState("G major, position 1")).toBe("seen");
    });
  });

  describe("Requirement: Stored progress", () => {
    it("Scenario: Progress survives a restart", () => {
      store({ [cellId("C", "major", 0)]: { state: "seen" } });
      const run = runNotes("C", "major", 0);
      const first = openPage();
      fireEvent.click(mapCell("C major, position 1"));
      playNotes(run, 0, run.length);
      first.unmount();
      openPage();
      expect(cellState("C major, position 1")).toBe("known");
    });

    it("Scenario: Storage unavailable", () => {
      blockStorage();
      const run = runNotes("C", "major", 0);
      openPage();
      expect(text()).toContain("0 of 60 known");
      fireEvent.click(mapCell("C major, position 1"));
      playNotes(run, 0, run.length);
      expect(screen.getByText("Scale run complete")).toBeTruthy();
      expect(text()).toContain("This position is now seen");
    });

    it("reads only what it understands", () => {
      localStorage.setItem("scale-runs", "{bad");
      expect(readRuns()).toEqual({});
      store({
        [cellId("C", "major", 0)]: { state: "seen", extra: 1 },
        [cellId("C", "major", 1)]: { state: "known", day: "2026-10-01" },
        [cellId("C", "major", 2)]: { state: "known", day: "yesterday" },
        [cellId("C", "major", 3)]: { state: "mastered" },
        "H major/1": { state: "seen" },
        [cellId("G", "major", 0)]: null,
      });
      expect(readRuns()).toEqual({ [cellId("C", "major", 0)]: { state: "seen" }, [cellId("C", "major", 1)]: { state: "known", day: "2026-10-01" } });
      localStorage.setItem("scale-runs", "[1,2]");
      expect(readRuns()).toEqual({});
    });

    it("writes and reads back the map", () => {
      const s = { [cellId("D", "minor", 4)]: { state: "known", day: DAY } };
      writeRuns(s);
      expect(readRuns()).toEqual(s);
      blockStorage();
      expect(() => writeRuns(s)).not.toThrow();
      expect(readRuns()).toEqual({});
    });
  });

  describe("Requirement: Microphone in runs", () => {
    let track;
    beforeEach(() => {
      mic.real = true;
      track = { stop: vi.fn() };
      context.mockReturnValue(new FakeAudioContext());
      Object.defineProperty(navigator, "mediaDevices", {
        configurable: true,
        value: { getUserMedia: vi.fn(async () => ({ getTracks: () => [track] })) },
      });
    });

    it("listens only while a run is shown", async () => {
      openPage();
      await act(async () => {});
      expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled();
      fireEvent.click(mapCell("C major, position 1"));
      await act(async () => {});
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
      tap("Quit");
      expect(track.stop).toHaveBeenCalledTimes(1);
    });

    it("Scenario: Result releases the microphone", async () => {
      // the whole run reaches the page through the microphone: a recording the analyser plays back
      const run = runNotes("C", "major", 0);
      const origin = performance.now();
      const sample = recording(run.map((n, i) => ({ midi: n.midi, at: 200 + i * 300 })));
      context.mockReturnValue(new (class extends FakeAudioContext {
        createAnalyser() {
          const a = super.createAnalyser();
          a.getFloatTimeDomainData = (buf) => buf.set(frameAt(sample, performance.now() - origin));
          return a;
        }
      })());
      openPage();
      fireEvent.click(mapCell("C major, position 1"));
      await act(async () => {});
      for (let ms = 0; ms < 200 + run.length * 300; ms += 50) act(() => { vi.advanceTimersByTime(50); });
      expect(screen.getByText("Scale run complete")).toBeTruthy();
      expect(text()).toContain("Clean run");
      expect(track.stop).toHaveBeenCalledTimes(1);
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
    });

    it("Scenario: Microphone blocked", async () => {
      navigator.mediaDevices.getUserMedia.mockRejectedValue(Object.assign(new Error(), { name: "NotAllowedError" }));
      store({ [cellId("C", "major", 0)]: { state: "seen" } });
      openPage();
      fireEvent.click(mapCell("C major, position 1"));
      await act(async () => {});
      expect(text()).toContain("needs the microphone, and it is blocked for this site");
      expect(button("Try again")).toBeTruthy();
      expect(status()).toBe("Not listening");
      tap("Show me");
      expect(document.querySelector("svg.neck")).not.toBeNull();
      tap("Quit");
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Scale runs");
    });
  });
});
