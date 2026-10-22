// openspec/specs/fretboard-questions/spec.md
import { describe, it, expect } from "vitest";
import { makeQuestion, STRINGS, TUNING } from "../src/theory.js";

const SHARPS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const many = (mode, n = 500) => [...Array(n)].map(() => makeQuestion(mode));
const noteAt = (kind, s, f) => SHARPS[(TUNING[kind][s] + f) % 12];
const fretOf = (label) => parseInt(label, 10);

describe("fretboard-questions", () => {
  describe("Requirement: Instruments and tuning", () => {
    it("uses six strings on guitar and four on bass, in standard tuning", () => {
      expect(STRINGS.guitar.map(([, n]) => n)).toEqual(["E", "A", "D", "G", "B", "E"]);
      expect(STRINGS.bass.map(([, n]) => n)).toEqual(["E", "A", "D", "G"]);
      expect(TUNING.guitar).toEqual([40, 45, 50, 55, 59, 64]);
      expect(TUNING.bass).toEqual([28, 33, 38, 43]);
    });

    it("Scenario: Guitar E strings", () => {
      expect(makeQuestion(null, { kind: "guitar", dir: "note", str: 0, fret: 3 }).prompt).toContain("the low E string");
      expect(makeQuestion(null, { kind: "guitar", dir: "fret", str: 0, fret: 3 }).prompt).toContain("the low E string");
      expect(makeQuestion(null, { kind: "guitar", dir: "note", str: 5, fret: 3 }).prompt).toContain("the high E string");
    });

    it("asks about every string of each instrument", () => {
      for (const kind of ["guitar", "bass"]) {
        expect(new Set(many(kind).map((q) => q.spec.str)).size).toBe(STRINGS[kind].length);
      }
    });
  });

  describe("Requirement: Fret range", () => {
    it("Scenario: Highest fret", () => {
      for (const kind of ["guitar", "bass"]) {
        for (const q of many(kind)) {
          expect(q.spec.fret).toBeGreaterThanOrEqual(0);
          expect(q.spec.fret).toBeLessThanOrEqual(12);
          for (const n of q.prompt.match(/\d+/g) ?? []) expect(Number(n)).toBeLessThanOrEqual(12);
          if (q.spec.dir === "fret") for (const o of q.options) expect(fretOf(o)).toBeLessThanOrEqual(12);
        }
      }
    });
  });

  describe("Requirement: Fret to note questions", () => {
    it("Scenario: Fretted note", () => {
      const q = makeQuestion(null, { kind: "guitar", dir: "note", str: 0, fret: 5 });
      expect(q.prompt).toBe("What note is on the 5th fret of the low E string?");
      expect(q.answer).toBe("A");
    });

    it("Scenario: Open string", () => {
      const q = makeQuestion(null, { kind: "guitar", dir: "note", str: 3, fret: 0 });
      expect(q.prompt).toBe("What note is on the open G string?");
      expect(q.answer).toBe("G");
    });

    it("includes open strings and the 12th fret", () => {
      const frets = new Set(many("guitar", 1500).filter((q) => q.spec.dir === "note").map((q) => q.spec.fret));
      expect(frets.has(0)).toBe(true);
      expect(frets.has(12)).toBe(true);
    });

    it("names notes with sharps and offers notes within a few semitones", () => {
      for (const kind of ["guitar", "bass"]) {
        for (const q of many(kind).filter((q) => q.spec.dir === "note")) {
          expect(q.options).toHaveLength(4);
          expect(new Set(q.options).size).toBe(4);
          expect(q.answer).toBe(noteAt(kind, q.spec.str, q.spec.fret));
          const p = SHARPS.indexOf(q.answer);
          for (const o of q.options) {
            expect(SHARPS).toContain(o); // sharps only, never flats
            const d = Math.min((SHARPS.indexOf(o) - p + 12) % 12, (p - SHARPS.indexOf(o) + 12) % 12);
            expect(d).toBeLessThanOrEqual(3);
          }
        }
      }
    });
  });

  describe("Requirement: Note to fret questions", () => {
    it("Scenario: Locating a note", () => {
      const q = makeQuestion(null, { kind: "bass", dir: "fret", str: 0, fret: 3 });
      expect(q.prompt).toBe("Where is G on the E string?");
      expect(q.answer).toBe("3rd fret");
      expect(q.options.map(fretOf)).toEqual([...q.options.map(fretOf)].sort((a, b) => a - b));
    });

    it("uses frets 1 to 11 only, with exactly one correct choice listed in ascending order", () => {
      for (const kind of ["guitar", "bass"]) {
        for (const q of many(kind).filter((q) => q.spec.dir === "fret")) {
          expect(q.spec.fret).toBeGreaterThanOrEqual(1);
          expect(q.spec.fret).toBeLessThanOrEqual(11);
          expect(q.options).toHaveLength(4);
          const frets = q.options.map(fretOf);
          expect(frets).toEqual([...frets].sort((a, b) => a - b));
          const target = noteAt(kind, q.spec.str, q.spec.fret);
          expect(q.prompt).toBe(`Where is ${target} on the ${STRINGS[kind][q.spec.str][0]} string?`);
          // no other choice holds the same note on that string
          expect(frets.filter((f) => noteAt(kind, q.spec.str, f) === target)).toEqual([q.spec.fret]);
          for (const o of q.options) expect(o).toMatch(/^\d+(st|nd|rd|th) fret$/);
        }
      }
    });
  });

  describe("Requirement: Shared quiz flow", () => {
    it("Scenario: Reviewing a fretboard mistake", () => {
      for (const kind of ["guitar", "bass"]) {
        for (const q of many(kind, 50)) {
          const again = makeQuestion(kind, q.spec);
          expect(again.spec).toEqual(q.spec);
          expect(again.prompt).toBe(q.prompt);
          expect(again.answer).toBe(q.answer);
          expect(new Set(again.options).size).toBe(4);
        }
      }
    });
  });
});
