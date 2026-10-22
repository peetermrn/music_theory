// openspec/specs/theory-questions/spec.md
import { describe, it, expect } from "vitest";
import { makeQuestion, scale, spell, triads, pc, KEYS, SCALES, GROUPS } from "../src/theory.js";

const LETTERS = "CDEFGAB";
const MAJORS = ["C", "G", "D", "A", "E", "B", "F#", "Db", "Ab", "Eb", "Bb", "F"];
const MINORS = ["A", "E", "B", "F#", "C#", "G#", "Eb", "Bb", "F", "C", "G", "D"];
const ALL = GROUPS.map((g) => g.id);
const mod12 = (x) => ((x % 12) + 12) % 12;
const many = (mode, groups, n = 400) => [...Array(n)].map(() => makeQuestion(mode, null, groups));
const ask = (spec) => makeQuestion(null, spec);
const semitone = (a, b) => [1, 11].includes(mod12(pc(a) - pc(b)));
const sameLetter = (a, b) => a[0] === b[0];

// Every question: one prompt, exactly four distinct choices, one of them the answer
function expectFourChoices(q) {
  expect(q.options).toHaveLength(4);
  expect(new Set(q.options).size).toBe(4);
  expect(q.options).toContain(q.answer);
}

describe("theory-questions", () => {
  describe("Requirement: Programmatic generation from theory data", () => {
    it("Scenario: Scale derived from intervals", () => {
      expect(scale("G", "major").join(" ")).toBe("G A B C D E F#");
    });

    it("uses the major and natural minor interval data", () => {
      expect(SCALES.major).toEqual([0, 2, 4, 5, 7, 9, 11]);
      expect(SCALES.minor).toEqual([0, 2, 3, 5, 7, 8, 10]);
    });

    it("every key's scale follows its intervals from the root", () => {
      for (const [root, type] of KEYS) {
        const notes = scale(root, type);
        expect(notes.map((n) => mod12(pc(n) - pc(root)))).toEqual(SCALES[type]);
      }
    });
  });

  describe("Requirement: Supported keys", () => {
    it("draws on the 12 major and 12 natural minor keys", () => {
      expect(KEYS.filter(([, t]) => t === "major").map(([r]) => r)).toEqual(MAJORS);
      expect(KEYS.filter(([, t]) => t === "minor").map(([r]) => r)).toEqual(MINORS);
    });

    it("Scenario: Minor key question", () => {
      for (const q of many("notes", ["major-minor"])) {
        if (q.spec.type !== "minor") continue;
        const [, n] = q.prompt.match(/^What is the (\d)\w\w note of/);
        expect(q.answer).toBe(scale(q.spec.root, "minor")[n - 1]);
      }
    });

    it("Scenario: Pentatonic roots", () => {
      const qs = [...many("notes", ["pentatonic"]), ...many("scales", ["pentatonic"])];
      for (const q of qs) {
        if (q.spec.type === "minor pentatonic") expect(MINORS).toContain(q.spec.root);
        else expect(MAJORS).toContain(q.spec.root);
      }
      expect(qs.some((q) => q.spec.type === "minor pentatonic")).toBe(true);
    });

    it("every key-mode question is in a supported key", () => {
      for (const mode of ["notes", "scales", "chords", "relatives"]) {
        for (const q of many(mode, ["major-minor"], 200)) {
          expect(KEYS.some(([r, t]) => r === q.spec.root && t === q.spec.type)).toBe(true);
        }
      }
    });
  });

  describe("Requirement: Correct note spelling", () => {
    it("Scenario: Flat key spelling", () => {
      expect(scale("Bb", "major").join(" ")).toBe("Bb C D Eb F G A");
    });

    it("spells every key with one of each letter name", () => {
      for (const [root, type] of KEYS) {
        const notes = scale(root, type);
        const start = LETTERS.indexOf(root[0]);
        expect(notes.map((n) => n[0])).toEqual([...Array(7)].map((_, k) => LETTERS[(start + k) % 7]));
      }
    });

    it("uses only the accidentals of the key", () => {
      expect(scale("F", "major")).toContain("Bb");
      expect(scale("F", "major")).not.toContain("A#");
      expect(scale("F#", "major").join(" ")).toBe("F# G# A# B C# D# E#");
      expect(scale("Eb", "minor").join(" ")).toBe("Eb F Gb Ab Bb Cb Db");
      expect(scale("G#", "minor").join(" ")).toBe("G# A# B C# D# E F#");
      for (const [root, type] of KEYS) {
        const notes = scale(root, type);
        // a key has sharps or flats, never both, and no double accidentals
        const sharps = notes.some((n) => n.includes("#")), flats = notes.some((n) => n.slice(1).includes("b"));
        expect(sharps && flats).toBe(false);
        for (const n of notes) expect(n.length).toBeLessThanOrEqual(2);
      }
    });
  });

  describe("Requirement: No answer-revealing notation", () => {
    it("Scenario: Chord prompt wording", () => {
      const q = ask({ kind: "chords", root: "C", type: "major", k: 1 });
      expect(q.prompt).toBe("What chord is built on the 2nd degree of C major?");
      expect(q.prompt).not.toMatch(/\bii\b/);
    });

    it("no prompt of any key mode uses Roman numerals", () => {
      for (const mode of ["notes", "scales", "chords", "relatives", "mixed"]) {
        for (const q of many(mode, ALL, 200)) {
          expect(q.prompt).not.toMatch(/\b[ivxIVX]+\b/);
          expect(q.prompt).not.toMatch(/\b(dim|aug|maj|min)\b|°|\+/);
        }
      }
    });

    it("refers to degrees with Arabic ordinals", () => {
      const ords = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th"];
      ords.forEach((o, k) => {
        expect(ask({ kind: "chords", root: "D", type: "minor", k }).prompt).toContain(`the ${o} degree`);
        expect(ask({ kind: "notes", root: "D", type: "minor", k }).prompt).toContain(`the ${o} note`);
      });
    });
  });

  describe("Requirement: Notes mode", () => {
    it("Scenario: Scale-degree note question", () => {
      const q = ask({ kind: "notes", root: "A", type: "major", k: 4 });
      expect(q.prompt).toBe("What is the 5th note of A major?");
      expect(q.answer).toBe("E");
      expectFourChoices(q);
      const a = scale("A", "major");
      for (const o of q.options.filter((o) => o !== "E")) expect(a.includes(o) || semitone(o, "E")).toBe(true);
    });

    it("Scenario: Pentatonic note question", () => {
      const q = ask({ kind: "notes", root: "A", type: "minor pentatonic", k: 2 });
      expect(q.prompt).toBe("What is the 3rd note of A minor pentatonic?");
      expect(q.answer).toBe("D");
    });

    it("Scenario: No sixth note of a pentatonic", () => {
      const qs = many("notes", ["pentatonic"], 600);
      const asked = new Set(qs.map((q) => q.spec.k));
      expect([...asked].sort()).toEqual([0, 1, 2, 3, 4]);
      for (const q of qs) expect(q.prompt).toMatch(/the (1st|2nd|3rd|4th|5th) note of/);
    });

    it("asks 1st to 7th of a seven-note scale and names the scale in full", () => {
      const qs = many("notes", ALL, 600);
      expect(new Set(qs.filter((q) => !q.spec.type.includes("pentatonic")).map((q) => q.spec.k)).size).toBe(7);
      for (const q of qs) {
        expect(q.prompt).toBe(`What is the ${["1st", "2nd", "3rd", "4th", "5th", "6th", "7th"][q.spec.k]} note of ${q.spec.root} ${q.spec.type}?`);
        expect(q.answer).toBe(spell(q.spec.root, q.spec.type).notes[q.spec.k]);
      }
    });

    it("gives plausible distractors: scale notes, a semitone neighbour, and a left-out note for a pentatonic", () => {
      for (const q of many("notes", ALL, 600)) {
        expectFourChoices(q);
        const { notes, left } = spell(q.spec.root, q.spec.type);
        for (const o of q.options.filter((o) => o !== q.answer)) {
          expect(notes.includes(o) || left.includes(o) || (semitone(o, q.answer) && sameLetter(o, q.answer))).toBe(true);
        }
      }
    });

    it("a pentatonic question can offer a parent-scale note the pentatonic leaves out", () => {
      const qs = many("notes", ["pentatonic"], 300);
      expect(qs.some((q) => q.options.some((o) => spell(q.spec.root, q.spec.type).left.includes(o)))).toBe(true);
    });
  });

  describe("Requirement: Scales mode", () => {
    it("Scenario: Scale question", () => {
      for (let i = 0; i < 50; i++) {
        const q = ask({ kind: "scales", root: "A", type: "minor" });
        expect(q.prompt).toBe("Which set of notes is the A minor scale?");
        expect(q.answer).toBe("A B C D E F G");
        expectFourChoices(q);
        const right = q.answer.split(" ");
        for (const o of q.options.filter((o) => o !== q.answer)) {
          const notes = o.split(" ");
          expect(notes).toHaveLength(7);
          const diff = notes.map((n, i) => i).filter((i) => notes[i] !== right[i]);
          expect(diff.length).toBeGreaterThanOrEqual(1);
          expect(diff.length).toBeLessThanOrEqual(2);
          // each changed note is the same note altered by a semitone
          for (const i of diff) expect(sameLetter(notes[i], right[i]) && semitone(notes[i], right[i])).toBe(true);
        }
      }
    });

    it("Scenario: Pentatonic scale question", () => {
      for (let i = 0; i < 50; i++) {
        const q = ask({ kind: "scales", root: "A", type: "minor pentatonic" });
        expect(q.prompt).toBe("Which set of notes is the A minor pentatonic scale?");
        expect(q.answer).toBe("A C D E G");
        expectFourChoices(q);
        for (const o of q.options) {
          expect(o.split(" ")).toHaveLength(5);
          expect(o.split(" ")[0]).toBe("A");
        }
      }
    });

    it("Scenario: Left-out note as a wrong answer", () => {
      let seen = false;
      for (let i = 0; i < 100; i++) {
        const q = ask({ kind: "scales", root: "A", type: "minor pentatonic" });
        for (const o of q.options.filter((o) => o.split(" ").includes("F"))) {
          seen = true;
          expect(o).not.toBe(q.answer);
        }
      }
      expect(seen).toBe(true);
    });

    it("pentatonic distractors differ by one note, altered by a semitone or swapped for a left-out note", () => {
      for (const q of many("scales", ["pentatonic"], 400)) {
        expectFourChoices(q);
        const { notes, left, parent } = spell(q.spec.root, q.spec.type);
        for (const o of q.options.filter((o) => o !== q.answer)) {
          const got = o.split(" ");
          expect(got[0]).toBe(q.spec.root);
          const out = notes.filter((n) => !got.includes(n)), into = got.filter((n) => !notes.includes(n));
          expect(out).toHaveLength(1);
          expect(into).toHaveLength(1);
          const swapped = left.includes(into[0]);
          expect(swapped || (sameLetter(into[0], out[0]) && semitone(into[0], out[0]))).toBe(true);
          // a swap keeps the notes in the parent scale's order
          if (swapped) {
            const idx = got.map((n) => parent.indexOf(n));
            expect(idx).toEqual([...idx].sort((a, b) => a - b));
          }
        }
      }
    });

    it("seven-note distractors alter one or two notes by a semitone and never the root", () => {
      for (const q of many("scales", ["major-minor"], 400)) {
        expectFourChoices(q);
        const right = q.answer.split(" ");
        expect(right).toEqual(scale(q.spec.root, q.spec.type));
        for (const o of q.options.filter((o) => o !== q.answer)) {
          const notes = o.split(" ");
          expect(notes[0]).toBe(right[0]);
          const diff = notes.map((_, i) => i).filter((i) => notes[i] !== right[i]);
          expect([1, 2]).toContain(diff.length);
          for (const i of diff) expect(sameLetter(notes[i], right[i]) && semitone(notes[i], right[i])).toBe(true);
        }
      }
    });
  });

  describe("Requirement: Chords mode", () => {
    it("Scenario: Major-key triad", () => {
      expect(ask({ kind: "chords", root: "C", type: "major", k: 6 }).answer).toBe("B diminished");
    });

    it("Scenario: Minor-key triad", () => {
      const q = ask({ kind: "chords", root: "A", type: "minor", k: 4 });
      expect(q.prompt).toBe("What chord is built on the 5th degree of A minor?");
      expect(q.answer).toBe("E minor");
    });

    it("computes each triad's quality from the scale in every key", () => {
      const MAJOR = ["major", "minor", "minor", "major", "major", "minor", "diminished"];
      const MINOR = ["minor", "diminished", "major", "minor", "minor", "major", "major"];
      for (const [root, type] of KEYS) {
        const ts = triads(root, type);
        expect(ts.map((t) => t.quality)).toEqual(type === "major" ? MAJOR : MINOR);
        expect(ts.map((t) => t.root)).toEqual(scale(root, type));
        ts.forEach((t) => expect(t.name).toBe(`${t.root} ${t.quality}`));
      }
    });

    it("answers with root and quality, and offers the same root with another quality and other triads of the key", () => {
      for (const q of many("chords", ["major-minor"], 400)) {
        expectFourChoices(q);
        const ts = triads(q.spec.root, q.spec.type).map((t) => t.name);
        expect(q.answer).toBe(ts[q.spec.k]);
        const [aRoot] = q.answer.split(" ");
        const wrong = q.options.filter((o) => o !== q.answer);
        expect(wrong.some((o) => o.split(" ")[0] === aRoot)).toBe(true);
        for (const o of wrong) expect(ts.includes(o) || o.split(" ")[0] === aRoot).toBe(true);
        for (const o of wrong) expect(o).toMatch(/ (major|minor|diminished)$/);
      }
    });
  });

  describe("Requirement: Mixed mode", () => {
    it("Scenario: Mixed session content", () => {
      const kinds = new Set(many("mixed", ["major-minor"], 400).map((q) => q.kind));
      expect([...kinds].sort()).toEqual(["chords", "notes", "relatives", "scales"]);
    });

    it("Scenario: Mixed with pentatonics on", () => {
      const qs = many("mixed", ALL, 800);
      const penta = (q) => q.spec.type.includes("pentatonic");
      expect(qs.filter((q) => q.kind === "notes").some(penta)).toBe(true);
      expect(qs.filter((q) => q.kind === "scales").some(penta)).toBe(true);
      expect(qs.filter((q) => q.kind === "chords" || q.kind === "relatives").some(penta)).toBe(false);
    });

    it("never asks a Guitar or Bass question", () => {
      for (const q of many("mixed", ALL, 400)) expect(["guitar", "bass"]).not.toContain(q.kind);
    });
  });

  describe("Requirement: Relatives mode", () => {
    it("Scenario: Relative minor", () => {
      for (let i = 0; i < 30; i++) {
        const q = ask({ kind: "relatives", root: "G", type: "major" });
        expect(q.prompt).toBe("What is the relative minor of G major?");
        expect(q.answer).toBe("E minor");
        expectFourChoices(q);
        for (const o of q.options) expect(o).toMatch(/ minor$/);
      }
    });

    it("Scenario: Relative major", () => {
      for (let i = 0; i < 30; i++) {
        const q = ask({ kind: "relatives", root: "C#", type: "minor" });
        expect(q.prompt).toBe("What is the relative major of C# minor?");
        expect(q.answer).toBe("E major");
        for (const o of q.options) expect(o).toMatch(/ major$/);
      }
    });

    it("Scenario: Answer outside the supported keys", () => {
      expect(ask({ kind: "relatives", root: "F#", type: "major" }).answer).toBe("D# minor");
    });

    it("Scenario: Parallel key as a wrong answer", () => {
      let seen = false;
      for (let i = 0; i < 100; i++) {
        const q = ask({ kind: "relatives", root: "G", type: "major" });
        const parallel = q.options.filter((o) => pc(o.split(" ")[0]) === pc("G"));
        for (const o of parallel) { seen = true; expect(o).toBe("G minor"); expect(o).not.toBe(q.answer); }
      }
      expect(seen).toBe(true);
    });

    it("answers every key with the matching note of its scale", () => {
      for (const [root, type] of KEYS) {
        const q = ask({ kind: "relatives", root, type });
        const sc = scale(root, type);
        expect(q.answer).toBe(type === "major" ? `${sc[5]} minor` : `${sc[2]} major`);
        expect(mod12(pc(q.answer.split(" ")[0]) - pc(root))).toBe(type === "major" ? 9 : 3);
      }
    });

    it("gives distractors of the same quality: the parallel key, other degrees of the scale, or a semitone from the answer", () => {
      for (const q of many("relatives", ["major-minor"], 400)) {
        expectFourChoices(q);
        const to = q.spec.type === "major" ? "minor" : "major";
        const scalePcs = scale(q.spec.root, q.spec.type).map(pc);
        const ans = pc(q.answer.split(" ")[0]);
        for (const o of q.options.filter((o) => o !== q.answer)) {
          const [r, t] = o.split(" ");
          expect(t).toBe(to);
          expect(scalePcs.includes(pc(r)) || [1, 11].includes(mod12(pc(r) - ans))).toBe(true);
        }
      }
    });
  });

  describe("Requirement: Pentatonic scales", () => {
    it("Scenario: Minor pentatonic", () => {
      expect(spell("A", "minor pentatonic").notes.join(" ")).toBe("A C D E G");
    });

    it("Scenario: Major pentatonic in a flat key", () => {
      expect(spell("Bb", "major pentatonic").notes.join(" ")).toBe("Bb C D F G");
    });

    it("takes 1 2 3 5 6 of the major and 1 3 4 5 7 of the natural minor, spelled as the parent", () => {
      for (const [root, type] of KEYS) {
        const parent = scale(root, type);
        const { notes, left } = spell(root, `${type} pentatonic`);
        const keep = type === "major" ? [0, 1, 2, 4, 5] : [0, 2, 3, 4, 6];
        expect(notes).toEqual(keep.map((i) => parent[i]));
        expect(left).toEqual(parent.filter((_, i) => !keep.includes(i)));
      }
    });
  });
});
