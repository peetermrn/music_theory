// @vitest-environment jsdom
// openspec/specs/visuals/spec.md
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { keyMap, position, scaleName } from "../src/shapes.js";
import { KEYS, TUNING, SCALES, spell, scale, pc } from "../src/theory.js";
import { play } from "../src/audio.js";
import Visuals from "../src/Visuals.jsx";
import { openApp, openEntry, tap, button, text } from "./helpers/app.jsx";

vi.mock("../src/audio.js", () => ({ play: vi.fn(() => Promise.resolve()), stop: vi.fn(), setVoice: vi.fn(), context: vi.fn() }));

const mod12 = (x) => ((x % 12) + 12) % 12;
const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// ---- reading the page back -------------------------------------------------------------------
const openPage = () => render(<Visuals onExit={() => {}} />);
const choose = (group, label) => fireEvent.click(within(screen.getByRole("group", { name: group })).getByRole("button", { name: label }));
const pressed = (group) => within(screen.getByRole("group", { name: group })).getAllByRole("button").filter((b) => b.getAttribute("aria-pressed") === "true").map((b) => b.textContent);
const readout = () => { const [key, notes, rel] = [...document.querySelectorAll(".key p > *")].map((e) => e.textContent); return { key, notes, rel }; };
const circle = () => screen.getByRole("img", { name: /^Note circle/ });
const rotation = () => Number(document.querySelector(".dial").style.transform.match(/rotate\((-?[\d.]+)deg\)/)[1]);
// The dial's windows: which note each shows, its degree number, and whether it is open or the root
function windows() {
  const turn = mod12(Math.round(rotation() / 30));
  return [...document.querySelectorAll(".dial > g")].map((g) => {
    const num = g.querySelector("text");
    const x = Number(num.getAttribute("x")) - 160, y = 160 - Number(num.getAttribute("y"));
    const iv = mod12(Math.round(Math.atan2(x, y) / (Math.PI / 6)));
    return { pc: mod12(iv + turn), degree: Number(num.textContent), open: g.classList.contains("open"), root: g.classList.contains("root") };
  });
}
const seen = () => windows().filter((w) => w.open).sort((a, b) => a.degree - b.degree);
const ringName = (p) => document.querySelector(`.ring[data-pc="${p}"] text`).textContent;
// The fretboard's marks, as string (0 = lowest) and fret
function neck() {
  const svg = document.querySelector("svg.neck");
  const first = Number(svg.getAttribute("aria-label").match(/frets (\d+) to/)[1]);
  const strings = svg.querySelectorAll("line.string").length;
  const col = first ? 320 / 13 : (320 - 20) / 12;
  const marks = [...svg.querySelectorAll(".mark")].map((g) => {
    const cx = Number(g.querySelector("circle").getAttribute("cx")), cy = Number(g.querySelector("circle").getAttribute("cy"));
    const f = first ? Math.round(cx / col - 0.5 + first) : cx < 20 ? 0 : Math.round((cx - 20) / col + 0.5);
    return { s: strings - 1 - Math.round((cy - 16) / 26), f, label: g.textContent, root: g.classList.contains("root"), dim: g.classList.contains("dim") };
  });
  return { first, strings, marks, nut: !!svg.querySelector("line.nut"), numbers: [...svg.querySelectorAll(".fretno")].map((t) => Number(t.textContent)) };
}
const fretsOn = (s, filter = () => true) => neck().marks.filter((m) => m.s === s && filter(m)).map((m) => m.f).sort((a, b) => a - b);
const full = (s) => fretsOn(s, (m) => !m.dim);
const shape = () => [...Array(neck().strings)].map((_, s) => full(s));
const fr = (str) => str.split(", ").map((x) => x.split(" ").map(Number));
const setKey = (root, type = "major") => {
  // turn with the step buttons to the major root, then switch as the user would
  const target = type === "major" ? pc(root) : mod12(pc(root) + 3);
  for (let i = 0; i < 12 && mod12(pc(readout().key.split(" ")[0])) !== target; i++) tap("Up a semitone");
  if (type === "minor") choose("Key type", "Minor");
};

describe("visuals", () => {
  describe("Requirement: Visuals page", () => {
    it("Scenario: Opening", () => {
      openApp();
      openEntry("Circle & fretboard");
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Visuals");
      expect(readout().key).toBe("C major");
      expect(pressed("Scale")).toEqual(["7 notes"]);
      expect(pressed("Instrument")).toEqual(["Guitar"]);
      expect(pressed("Labels")).toEqual(["Notes"]);
      expect(pressed("Position")).toEqual(["All"]);
      expect(circle().compareDocumentPosition(document.querySelector("svg.neck")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it("Scenario: Back to home", () => {
      localStorage.setItem("theory-quiz.best.notes", "9");
      openApp();
      fireEvent.click(screen.getByRole("checkbox", { name: "Pentatonic" }));
      const before = document.querySelector("main").innerHTML;
      const stored = { ...localStorage };
      openEntry("Circle & fretboard");
      tap("Up a semitone"); choose("Instrument", "Bass"); choose("Scale", "Pentatonic");
      tap("‹ Back");
      expect(document.querySelector("main").innerHTML).toBe(before);
      expect({ ...localStorage }).toEqual(stored);
    });

    it("Scenario: Nothing is remembered", () => {
      const first = openPage();
      setKey("E", "minor");
      choose("Instrument", "Bass");
      expect(readout().key).toBe("E minor");
      first.unmount();
      openPage();
      expect(readout().key).toBe("C major");
      expect(pressed("Instrument")).toEqual(["Guitar"]);
    });

    it("has no questions, score or sound", () => {
      openPage();
      tap("Up a semitone"); choose("Key type", "Minor"); fireEvent.click(document.querySelector('.ring[data-pc="4"]'));
      expect(play).not.toHaveBeenCalled();
      expect(text()).not.toMatch(/correct|Score|Best|\d+ \/ \d+/);
    });
  });

  describe("Requirement: Note circle", () => {
    it("shows the 12 notes clockwise in semitone order with C at the top", () => {
      openPage();
      const ring = [...document.querySelectorAll(".ring")];
      expect(ring.map((g) => g.textContent)).toEqual(NAMES);
      const angles = ring.map((g) => { const c = g.querySelector("circle"); return Math.atan2(c.getAttribute("cx") - 160, 160 - c.getAttribute("cy")); });
      expect(angles[0]).toBeCloseTo(0, 6);
      angles.forEach((a, p) => expect(mod12(Math.round(a / (Math.PI / 6)))).toBe(p));
    });

    it("Scenario: C major", () => {
      openPage();
      expect(seen().map((w) => NAMES[w.pc])).toEqual(["C", "D", "E", "F", "G", "A", "B"]);
      expect(windows().filter((w) => w.root).map((w) => NAMES[w.pc])).toEqual(["C"]);
    });

    it("keeps the ring still while the key changes", () => {
      openPage();
      const ring = document.querySelector(".ring").parentElement.innerHTML.split("<g class=\"dial")[0];
      tap("Up a semitone"); tap("Up a semitone");
      const now = document.querySelector(".ring").parentElement.innerHTML.split("<g class=\"dial")[0];
      expect(now.replace(/>[A-G][#b]?</g, "><")).toBe(ring.replace(/>[A-G][#b]?</g, "><"));
    });
  });

  describe("Requirement: Scale dial", () => {
    it("Scenario: Step pattern is visible", () => {
      openPage();
      for (let k = 0; k < 12; k++) {
        const w = seen();
        expect(w.map((x) => x.degree)).toEqual([1, 2, 3, 4, 5, 6, 7]);
        expect(w.map((x, i) => mod12((w[(i + 1) % 7].pc) - x.pc))).toEqual([2, 2, 1, 2, 2, 2, 1]);
        tap("Up a semitone");
      }
    });

    it("Scenario: Same shape in every key", () => {
      openPage();
      const before = rotation();
      tap("Up a semitone"); tap("Up a semitone");
      expect(rotation() - before).toBe(60);
      expect(readout().key).toBe("D major");
      expect(seen().map((w) => NAMES[w.pc])).toEqual(["D", "E", "F#", "G", "A", "B", "C#"]);
    });
  });

  describe("Requirement: Turning the dial", () => {
    const at = (deg) => ({ clientX: 50 + 50 * Math.sin((deg * Math.PI) / 180), clientY: 50 - 50 * Math.cos((deg * Math.PI) / 180), pointerId: 1 });
    const box = () => vi.spyOn(circle(), "getBoundingClientRect").mockReturnValue({ left: 0, top: 0, width: 100, height: 100 });

    it("Scenario: Dragging", () => {
      openPage();
      box();
      fireEvent.pointerDown(circle(), at(0));
      for (let d = 10; d <= 80; d += 10) fireEvent.pointerMove(circle(), at(d));
      expect(document.querySelector(".dial").classList.contains("held")).toBe(true);
      fireEvent.pointerUp(circle(), at(80));
      expect(readout().key).toBe("Eb major");
      expect(rotation()).toBe(90); // resting exactly on a note
      expect(document.querySelector(".dial").classList.contains("held")).toBe(false);
    });

    it("drags the short way round, anticlockwise too", () => {
      openPage();
      box();
      fireEvent.pointerDown(circle(), at(0));
      for (let d = -10; d >= -60; d -= 10) fireEvent.pointerMove(circle(), at(d));
      fireEvent.pointerUp(circle(), at(-60));
      expect(readout().key).toBe("Bb major");
      expect(rotation()).toBe(-60);
    });

    it("Scenario: Tapping a note", () => {
      openPage();
      box();
      const g = document.querySelector('.ring[data-pc="7"] text');
      fireEvent.pointerDown(g, at(210));
      fireEvent.pointerUp(g, at(210));
      expect(readout().key).toBe("G major");
    });

    it("Scenario: Step button", () => {
      openPage();
      tap("Up a semitone");
      expect(readout().key).toBe("Db major");
      tap("Down a semitone"); tap("Down a semitone");
      expect(readout().key).toBe("B major");
    });

    it("Scenario: Dragging does not scroll the page", () => {
      openPage();
      box();
      fireEvent.pointerDown(circle(), at(0));
      fireEvent.pointerMove(circle(), at(40));
      fireEvent.pointerUp(circle(), at(40));
      expect(window.scrollTo).not.toHaveBeenCalled();
    });

    it("operates the step buttons from the keyboard", () => {
      openPage();
      for (const label of ["Up a semitone", "Down a semitone"]) expect(button(label).tagName).toBe("BUTTON");
    });
  });

  describe("Requirement: Major and minor", () => {
    it("Scenario: Relative minor", () => {
      openPage();
      const turn = rotation();
      choose("Key type", "Minor");
      expect(readout().key).toBe("A minor");
      expect(rotation()).toBe(turn);
      expect(seen().map((w) => NAMES[w.pc])).toEqual(["A", "B", "C", "D", "E", "F", "G"]);
      expect(windows().find((w) => w.root).pc).toBe(9);
      expect(windows().find((w) => w.pc === 9).degree).toBe(1);
    });

    it("Scenario: Relative major", () => {
      openPage();
      setKey("E", "minor");
      const notes = seen().map((w) => w.pc).sort();
      choose("Key type", "Major");
      expect(readout().key).toBe("G major");
      expect(seen().map((w) => w.pc).sort()).toEqual(notes);
    });
  });

  describe("Requirement: Seven notes or pentatonic", () => {
    it("Scenario: Major pentatonic", () => {
      openPage();
      choose("Scale", "Pentatonic");
      expect(seen().map((w) => [NAMES[w.pc], w.degree])).toEqual([["C", 1], ["D", 2], ["E", 3], ["G", 5], ["A", 6]]);
      expect(windows().filter((w) => !w.open).map((w) => NAMES[w.pc]).sort()).toEqual(["B", "F"]);
      expect(neck().marks.some((m) => m.label === "F" || m.label === "B")).toBe(false);
    });

    it("Scenario: Minor pentatonic", () => {
      openPage();
      choose("Key type", "Minor");
      choose("Scale", "Pentatonic");
      expect(seen().map((w) => [NAMES[w.pc], w.degree])).toEqual([["A", 1], ["C", 3], ["D", 4], ["E", 5], ["G", 7]]);
    });

    it("Scenario: Relative pentatonics share notes", () => {
      openPage();
      choose("Scale", "Pentatonic");
      const notes = seen().map((w) => w.pc).sort();
      choose("Key type", "Minor");
      expect(readout().key).toBe("A minor pentatonic");
      expect(seen().map((w) => w.pc).sort()).toEqual(notes);
    });
  });

  describe("Requirement: Key naming and spelling", () => {
    it("Scenario: Readout", () => {
      openPage();
      setKey("D");
      expect(readout()).toEqual({ key: "D major", notes: "D E F# G A B C#", rel: "Relative minor: B minor" });
    });

    it("Scenario: Flat key", () => {
      openPage();
      setKey("Eb");
      expect(readout().key).toBe("Eb major");
      const notes = ["Eb", "F", "G", "Ab", "Bb", "C", "D"];
      expect(notes.map((n) => ringName(pc(n)))).toEqual(notes);
      expect(new Set(neck().marks.map((m) => m.label))).toEqual(new Set(notes));
      expect(document.querySelector(".circle").textContent).not.toContain("#");
    });

    it("Scenario: Usual name when turning", () => {
      openPage();
      tap("Up a semitone");
      expect(readout().key).toBe("Db major");
      for (let p = 0; p < 12; p++) {
        expect(KEYS).toContainEqual([readout().key.split(" ")[0], "major"]);
        tap("Up a semitone");
      }
      setKey("C");
      choose("Key type", "Minor");
      tap("Down a semitone");
      expect(readout().key).toBe("G# minor"); // not Ab minor
      tap("Up a semitone"); tap("Up a semitone");
      expect(readout().key).toBe("Bb minor"); // not A# minor
    });

    it("Scenario: Spelling kept across the switch", () => {
      openPage();
      setKey("F#");
      const names = readout().notes.split(" ");
      choose("Key type", "Minor");
      expect(readout().key).toBe("D# minor");
      expect(readout().notes.split(" ").sort()).toEqual(names.sort());
    });

    it("Scenario: Pentatonic readout", () => {
      openPage();
      choose("Key type", "Minor");
      choose("Scale", "Pentatonic");
      expect(readout().key).toBe("A minor pentatonic");
      expect(readout().notes).toBe("A C D E G");
    });

    it("writes notes outside the scale with flats in a flat key and sharps otherwise", () => {
      openPage();
      setKey("Bb");
      expect([1, 6, 11].map(ringName)).toEqual(["Db", "Gb", "B"]);
      setKey("A");
      expect([0, 5, 7].map(ringName)).toEqual(["C", "F", "G"]);
      expect([3, 10].map(ringName)).toEqual(["D#", "A#"]);
    });

    it("names every key's notes as the key spells them", () => {
      for (const [root, type] of KEYS) {
        const m = keyMap(root, type, false);
        expect(m.parent).toEqual(scale(root, type));
        m.parent.forEach((n, i) => expect(m.byPc[pc(n)]).toEqual({ name: n, degree: i + 1, on: true, root: i === 0 }));
      }
      expect(scaleName("minor", true)).toBe("minor pentatonic");
    });
  });

  describe("Requirement: Linked fretboard", () => {
    it("is 13 fret positions long, lowest string at the bottom, with fret numbers", () => {
      openPage();
      const n = neck();
      expect(n.first).toBe(0);
      expect(n.nut).toBe(true);
      expect(document.querySelectorAll("svg.neck line.fret, svg.neck line.nut")).toHaveLength(13);
      for (const f of [3, 5, 7, 9, 12]) expect(n.numbers).toContain(f);
      // lowest string at the bottom: its open note is E2's E at the largest y
      expect(fretsOn(0, (m) => m.f === 0).length).toBe(1);
    });

    it("marks every position of a scale note from fret 0 to 12, and no other", () => {
      openPage();
      for (let k = 0; k < 4; k++) {
        const on = new Set(seen().map((w) => w.pc));
        const marks = neck().marks;
        const expected = TUNING.guitar.flatMap((o, s) => [...Array(13)].map((_, f) => ({ s, f })).filter(({ f }) => on.has(mod12(o + f))));
        expect(marks.map(({ s, f }) => `${s}.${f}`).sort()).toEqual(expected.map(({ s, f }) => `${s}.${f}`).sort());
        tap("Up a semitone");
      }
    });

    it("Scenario: Marks follow the circle", () => {
      openPage();
      const at = (name) => neck().marks.filter((m) => m.label === name).map((m) => `${m.s}.${m.f}`).sort();
      const fPlaces = at("F");
      const cRoots = neck().marks.filter((m) => m.root).map((m) => m.label);
      expect(new Set(cRoots)).toEqual(new Set(["C"]));
      setKey("G");
      expect(at("F")).toEqual([]);
      expect(at("F#")).toEqual(fPlaces.map((x) => { const [s, f] = x.split(".").map(Number); return f === 12 ? `${s}.0` : `${s}.${f + 1}`; }).sort());
      expect(new Set(neck().marks.filter((m) => m.root).map((m) => m.label))).toEqual(new Set(["G"]));
    });

    it("Scenario: Known positions", () => {
      openPage();
      choose("Key type", "Minor");
      choose("Scale", "Pentatonic");
      expect(fretsOn(0)).toEqual([0, 3, 5, 8, 10, 12]);
      expect(neck().marks.find((m) => m.s === 0 && m.f === 5).root).toBe(true);
      expect(neck().marks.find((m) => m.s === 1 && m.f === 0).root).toBe(true);
    });

    it("Scenario: Relative keys differ only in the root", () => {
      openPage();
      const places = neck().marks.map((m) => `${m.s}.${m.f}`).sort();
      choose("Key type", "Minor");
      expect(neck().marks.map((m) => `${m.s}.${m.f}`).sort()).toEqual(places);
      expect(new Set(neck().marks.filter((m) => m.root).map((m) => m.label))).toEqual(new Set(["A"]));
    });
  });

  describe("Requirement: Scale positions", () => {
    it("offers All and one entry per position", () => {
      openPage();
      expect(within(screen.getByRole("group", { name: "Position" })).getAllByRole("button").map((b) => b.textContent)).toEqual(["All", "1", "2", "3", "4", "5"]);
    });

    it("Scenario: A position is highlighted", () => {
      openPage();
      choose("Key type", "Minor");
      choose("Scale", "Pentatonic");
      choose("Position", "1");
      expect(full(0)).toEqual([5, 8]);
      expect(fretsOn(0, (m) => m.dim)).toEqual([0, 3, 10, 12]);
      expect(neck().marks.filter((m) => !m.dim && m.root).map((m) => `${m.s}.${m.f}`).sort()).toEqual(["0.5", "2.7", "5.5"]);
    });

    it("Scenario: Back to all notes", () => {
      openPage();
      choose("Position", "3");
      expect(neck().marks.some((m) => m.dim)).toBe(true);
      choose("Position", "All");
      expect(neck().marks.some((m) => m.dim)).toBe(false);
    });

    it("Scenario: Following a position through keys", () => {
      openPage();
      choose("Key type", "Minor");
      choose("Position", "1");
      const before = shape();
      tap("Up a semitone"); tap("Up a semitone");
      expect(readout().key).toBe("B minor");
      expect(pressed("Position")).toEqual(["1"]);
      expect(shape()).toEqual(before.map((fs) => fs.map((f) => f + 2)));
    });
  });

  describe("Requirement: Five-position shapes", () => {
    it("Scenario: Pentatonic box", () => {
      openPage();
      choose("Key type", "Minor");
      choose("Scale", "Pentatonic");
      choose("Position", "1");
      expect(shape()).toEqual(fr("5 8, 5 7, 5 7, 5 7, 5 8, 5 8"));
    });

    it("Scenario: Seven-note position contains the box", () => {
      openPage();
      choose("Key type", "Minor");
      choose("Position", "1");
      expect(shape()).toEqual(fr("5 7 8, 5 7 8, 5 7, 4 5 7, 5 6 8, 5 7 8"));
    });

    it("Scenario: Numbering starts at the root", () => {
      openPage();
      choose("Position", "1");
      expect(full(0)[0]).toBe(8);
      expect(neck().marks.find((m) => m.s === 0 && m.f === 8).label).toBe("C");
    });

    it("plays the pentatonic two notes a string upwards, and starts each position on the next pentatonic note", () => {
      for (const [root, type] of KEYS) {
        const ivs = spell(root, `${type} pentatonic`).pos.map((i) => SCALES[type][i]);
        for (let k = 0; k < 5; k++) {
          const frets = position(root, type, true, "five", k, TUNING.guitar);
          const pitches = frets.flatMap((fs, s) => fs.map((f) => TUNING.guitar[s] + f));
          expect(frets.every((fs) => fs.length === 2)).toBe(true);
          expect(pitches).toEqual([...pitches].sort((a, b) => a - b));
          expect(mod12(pitches[0] - pc(root))).toBe(ivs[k]);
          expect(pitches.every((p) => ivs.includes(mod12(p - pc(root))))).toBe(true);
        }
      }
    });

    it("builds every seven-note position from its box plus the other notes, inside or one fret outside its span", () => {
      for (const [root, type] of KEYS) {
        for (let k = 0; k < 5; k++) {
          const box = position(root, type, true, "five", k, TUNING.guitar);
          const frets = position(root, type, false, "five", k, TUNING.guitar);
          box.forEach((fs, s) => fs.forEach((f) => expect(frets[s]).toContain(f)));
          const all = frets.flat(), boxAll = box.flat();
          const [lo, hi] = [Math.min(...boxAll), Math.max(...boxAll)];
          expect(Math.min(...all)).toBeGreaterThanOrEqual(Math.max(0, lo - 1));
          expect(Math.max(...all)).toBeLessThanOrEqual(hi + 1);
          const pitches = frets.flatMap((fs, s) => fs.map((f) => TUNING.guitar[s] + f));
          expect(new Set(pitches.map((p) => mod12(p - pc(root))))).toEqual(new Set(SCALES[type]));
          expect(new Set(pitches).size).toBe(pitches.length);
          // every scale note between the lowest and the highest is in the shape
          for (let p = Math.min(...pitches); p <= Math.max(...pitches); p++) {
            if (SCALES[type].includes(mod12(p - pc(root)))) expect(pitches).toContain(p);
          }
        }
      }
    });
  });

  describe("Requirement: Three-notes-per-string shapes", () => {
    it("Scenario: Three notes per string", () => {
      openPage();
      choose("Key type", "Minor");
      choose("Shape system", "3 per string");
      choose("Position", "1");
      expect(shape()).toEqual(fr("5 7 8, 5 7 8, 5 7 9, 5 7 9, 6 8 10, 7 8 10"));
    });

    it("Scenario: Seven positions", () => {
      openPage();
      choose("Shape system", "3 per string");
      expect(within(screen.getByRole("group", { name: "Position" })).getAllByRole("button").map((b) => b.textContent)).toEqual(["All", "1", "2", "3", "4", "5", "6", "7"]);
    });

    it("Scenario: Pentatonic uses the five positions", () => {
      openPage();
      choose("Shape system", "3 per string");
      choose("Position", "7");
      choose("Scale", "Pentatonic");
      expect(within(screen.getByRole("group", { name: "Shape system" })).getAllByRole("button").every((b) => b.disabled)).toBe(true);
      expect(pressed("Shape system")).toEqual(["5 positions"]);
      expect(within(screen.getByRole("group", { name: "Position" })).getAllByRole("button").map((b) => b.textContent)).toEqual(["All", "1", "2", "3", "4", "5"]);
      expect(pressed("Position")).toEqual(["All"]);
    });

    it("keeps a position that still exists after a switch", () => {
      openPage();
      choose("Shape system", "3 per string");
      choose("Position", "4");
      choose("Shape system", "5 positions");
      expect(pressed("Position")).toEqual(["4"]);
      choose("Shape system", "3 per string");
      choose("Position", "6");
      choose("Shape system", "5 positions");
      expect(pressed("Position")).toEqual(["All"]);
    });

    it("plays the scale three notes a string upwards, from each next note of the scale", () => {
      for (const [root, type] of KEYS) {
        for (let k = 0; k < 7; k++) {
          const frets = position(root, type, false, "three", k, TUNING.guitar);
          const pitches = frets.flatMap((fs, s) => fs.map((f) => TUNING.guitar[s] + f));
          expect(frets.every((fs) => fs.length === 3)).toBe(true);
          expect(pitches.every((p, i) => !i || p > pitches[i - 1])).toBe(true);
          expect(mod12(pitches[0] - pc(root))).toBe(SCALES[type][k]);
          // consecutive notes of the scale
          const degrees = pitches.map((p) => SCALES[type].indexOf(mod12(p - pc(root))));
          degrees.forEach((d, i) => expect(d).toBe((k + i) % 7));
        }
      }
    });
  });

  describe("Requirement: Shapes shared by relative keys", () => {
    it("Scenario: Same shape, different number", () => {
      openPage();
      choose("Position", "1");
      const major = shape();
      const roots = neck().marks.filter((m) => m.root).map((m) => m.label);
      choose("Key type", "Minor");
      choose("Position", "2");
      expect(shape()).toEqual(major);
      expect(new Set(roots)).toEqual(new Set(["C"]));
      expect(new Set(neck().marks.filter((m) => m.root).map((m) => m.label))).toEqual(new Set(["A"]));
    });

    it("gives every major key and its relative minor the same shapes in both systems", () => {
      const majors = KEYS.filter(([, t]) => t === "major").map(([r]) => r);
      for (const root of majors) {
        const rel = scale(root, "major")[5];
        for (const [system, count, offset] of [["five", 5, 1], ["three", 7, 5]]) {
          for (const penta of system === "five" ? [false, true] : [false]) {
            const a = [...Array(count)].map((_, k) => JSON.stringify(position(root, "major", penta, system, k, TUNING.guitar)));
            const b = [...Array(count)].map((_, k) => JSON.stringify(position(rel, "minor", penta, system, k, TUNING.guitar)));
            // the same set of shapes, numbered from each key's own root (up to the octave they are placed in)
            const norm = (s) => { const f = JSON.parse(s); const lo = Math.min(...f.flat()); return JSON.stringify(f.map((x) => x.map((y) => y - lo))); };
            expect(new Set(a.map(norm))).toEqual(new Set(b.map(norm)));
          }
        }
      }
    });
  });

  describe("Requirement: Placement on the neck", () => {
    it("Scenario: Open position", () => {
      openPage();
      setKey("E", "minor");
      choose("Scale", "Pentatonic");
      choose("Position", "1");
      expect(shape()).toEqual(fr("0 3, 0 2, 0 2, 0 2, 0 3, 0 3"));
      expect(neck().first).toBe(0);
      expect(neck().nut).toBe(true);
    });

    it("Scenario: Position past the 12th fret", () => {
      openPage();
      setKey("E");
      choose("Scale", "Pentatonic");
      choose("Position", "1");
      const all = shape().flat();
      expect(Math.min(...all)).toBe(11);
      expect(Math.max(...all)).toBe(14);
      expect(neck().first).toBe(2);
      expect(neck().nut).toBe(false);
      expect(neck().numbers).toContain(12);
      expect(document.querySelector("svg.neck").getAttribute("aria-label")).toBe("Fretboard, frets 2 to 14");
    });

    it("places every position at its lowest placement with no note below the nut", () => {
      for (const [root, type] of KEYS) {
        for (const penta of [false, true]) {
          for (let k = 0; k < 5; k++) {
            const frets = position(root, type, penta, "five", k, TUNING.guitar).flat();
            expect(Math.min(...frets)).toBeGreaterThanOrEqual(0);
            expect(Math.min(...frets)).toBeLessThan(12); // an octave lower would go below the nut
          }
        }
      }
    });
  });

  describe("Requirement: Fretboard instrument and labels", () => {
    it("Scenario: Bass", () => {
      openPage();
      choose("Instrument", "Bass");
      expect(neck().strings).toBe(4);
      expect(neck().marks.filter((m) => m.f === 0).sort((a, b) => a.s - b.s).map((m) => m.label)).toEqual(["E", "A", "D", "G"]);
      expect(readout().key).toBe("C major");
    });

    it("Scenario: Degree labels", () => {
      openPage();
      setKey("G");
      choose("Labels", "Degrees");
      const marks = neck().marks;
      const tuning = TUNING.guitar;
      for (const m of marks) {
        const note = mod12(tuning[m.s] + m.f);
        if (note === pc("G")) expect(m.label).toBe("1");
        if (note === pc("D")) expect(m.label).toBe("5");
      }
    });

    it("Scenario: Position on bass", () => {
      openPage();
      choose("Key type", "Minor");
      choose("Scale", "Pentatonic");
      choose("Position", "1");
      choose("Instrument", "Bass");
      expect(pressed("Position")).toEqual(["1"]);
      expect(shape()).toEqual(fr("5 8, 5 7, 5 7, 5 7"));
    });

    it("changes neither the key, the scale nor the position", () => {
      openPage();
      setKey("D", "minor");
      choose("Position", "3");
      choose("Instrument", "Bass");
      choose("Labels", "Degrees");
      expect(readout().key).toBe("D minor");
      expect(pressed("Position")).toEqual(["3"]);
      expect(pressed("Scale")).toEqual(["7 notes"]);
    });
  });

  describe("Requirement: Fits a phone and a desktop browser", () => {
    // Real widths are checked by hand on a phone; here, what the layout relies on
    it("Scenario: Narrow screen", () => {
      openPage();
      // both drawings scale to the column's width from a fixed view box, all 13 fret positions inside it
      expect(circle().getAttribute("viewBox")).toBe("-22 -22 364 364");
      const neckBox = document.querySelector("svg.neck").getAttribute("viewBox").split(" ").map(Number);
      expect(neckBox[2]).toBe(320);
      const xs = [...document.querySelectorAll("svg.neck line.fret, svg.neck line.nut")].map((l) => Number(l.getAttribute("x1")));
      expect(xs).toHaveLength(13);
      expect(Math.max(...xs)).toBeLessThanOrEqual(320);
      expect(neck().marks.every((m) => m.label.length <= 2)).toBe(true);
    });

    it("Scenario: Eight selector entries", () => {
      openPage();
      choose("Shape system", "3 per string");
      const entries = within(screen.getByRole("group", { name: "Position" })).getAllByRole("button");
      expect(entries.map((b) => b.textContent)).toEqual(["All", "1", "2", "3", "4", "5", "6", "7"]);
      expect(entries.every((b) => !b.disabled)).toBe(true);
    });

    it("Scenario: Desktop browser", () => {
      openPage();
      // every switch and step is a real button, reachable with the keyboard
      for (const b of screen.getAllByRole("button")) expect(b.tagName).toBe("BUTTON");
      expect(within(screen.getByRole("group", { name: "Position" })).getAllByRole("button")).toHaveLength(6);
    });
  });
});
