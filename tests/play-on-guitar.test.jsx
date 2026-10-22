// @vitest-environment jsdom
// openspec/specs/play-on-guitar/spec.md
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { KINDS, listener, showMap } from "../src/play.js";
import { KEYS, TUNING, scale, pc } from "../src/theory.js";
import { play, stop, context } from "../src/audio.js";
import Play from "../src/Play.jsx";
import { openApp, openEntry, tap, button, text } from "./helpers/app.jsx";
import { guitar } from "./helpers/guitar.js";
import { recording, listen, dbfs, noise, RATE } from "./helpers/sound.js";
import { FakeAudioContext } from "./helpers/audio-context.js";

// The microphone: a fake that hands the page's listen callback to the test, or with `mic.real`
// the app's own useMic against a fake getUserMedia
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
const SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const real = { ...KINDS }; // the generators, kept before any test spies on them
// A question of `kind` built by the real generator from the given random draws
function make(kind, ...draws) {
  const rnd = vi.spyOn(Math, "random");
  for (const d of draws) rnd.mockReturnValueOnce(d);
  const q = real[kind]();
  rnd.mockRestore();
  return q;
}
const draw = (i, n) => (i + 0.5) / n;
const fretQ = (s, p) => make("fretboard", draw(s, 6), draw(p, 12));
const backQ = (target) => make("back", draw(target - 40, 33));
const keysQ = (root, type, k) => make("keys", draw(KEYS.findIndex(([r, t]) => r === root && t === type), 24), draw(k, 7));
// Questions in order: each entry is used once, then the real generator takes over
function serve(kind, list) {
  const queue = [...list];
  return vi.spyOn(KINDS, kind).mockImplementation(() => queue.shift() ?? real[kind]());
}
const current = (spy) => spy.mock.results.at(-1).value;
// A MIDI note that answers a question correctly
const rightNote = (q) => q.target ?? (q.shape ? GUITAR[q.shape.findIndex((f) => f.length)] + q.shape.find((f) => f.length)[0] : 48 + ((pc(q.name) - 48) % 12 + 12) % 12);
const shown = () => document.querySelector(".reading .note").textContent;
const status = () => document.querySelector(".reading .cents").textContent;
const header = () => document.querySelector(".bar span").textContent;
const openPlay = (kind, title = "Test") => render(<Play kind={kind} title={title} onExit={vi.fn()} />);
// Play it back plays its note first; the page listens again once it has died away (1.85 s)
async function openBack() {
  openPlay("back");
  await act(async () => {});
  g.run(1900);
}
let g;

beforeEach(() => {
  vi.useFakeTimers();
  mic.listen = null; mic.problem = null; mic.retry = vi.fn(); mic.real = false;
  play.mockClear(); stop.mockClear();
  g = guitar(() => mic.listen);
});

describe("play-on-guitar", () => {
  describe("Requirement: Play on guitar entries", () => {
    it("Scenario: One tap", () => {
      openApp();
      openEntry("Fretboard notes");
      expect(screen.getByRole("heading", { level: 2 }).textContent).toMatch(/^Play [A-G]#? on the (low E|A|D|G|B|high E) string$/);
      expect(mic.listen).toBeTypeOf("function");
      expect(status()).toBe("Listening… play the note");
    });

    it("starts Key notes and Play it back at once too", () => {
      for (const [title, re] of [["Key notes", /^Play the \d\w\w note of /], ["Play it back", /^Play back the note you hear$/]]) {
        const { unmount } = openApp();
        openEntry(title);
        expect(screen.getByRole("heading", { level: 2 }).textContent).toMatch(re);
        unmount();
      }
    });

    it("Scenario: Scale runs opens its page", () => {
      openApp();
      openEntry("Scale runs");
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Scale runs");
      expect(mic.listen).toBeNull();
    });

    it("has no speed game or best score", () => {
      openApp();
      const section = screen.getByRole("heading", { name: "Play on guitar" }).closest("section");
      expect(section.textContent).not.toMatch(/Speed|Best/);
    });
  });

  describe("Requirement: Key notes questions", () => {
    it("asks for a note of the 24 keys by position, naming the key in full", () => {
      const keys = new Set();
      for (let i = 0; i < 1500; i++) {
        const q = KINDS.keys();
        const [, n, root, type] = q.prompt.match(/^Play the (\d)\w\w note of (\S+) (major|minor)$/);
        keys.add(`${root} ${type}`);
        expect(q.name).toBe(scale(root, type)[n - 1]);
      }
      expect(keys.size).toBe(24);
    });

    it("Scenario: Any octave", () => {
      const q = keysQ("E", "major", 4);
      expect(q.prompt).toBe("Play the 5th note of E major");
      for (const b of [47, 59, 71]) expect(q.check(b)).toBe(true);
      for (const m of [45, 58, 60]) expect(q.check(m)).toBe(false);
    });

    it("Scenario: Flat key", () => {
      const q = keysQ("F", "major", 3);
      expect(q.prompt).toBe("Play the 4th note of F major");
      expect(q.check(GUITAR[1] + 1)).toBe(true);
      expect(q.name).toBe("Bb");
    });
  });

  describe("Requirement: Fretboard notes questions", () => {
    it("names notes with sharps and the E strings as low E and high E", () => {
      expect(fretQ(0, 4).prompt).toBe("Play E on the low E string");
      expect(fretQ(5, 1).prompt).toBe("Play C# on the high E string");
      for (let i = 0; i < 300; i++) expect(KINDS.fretboard().prompt).not.toMatch(/b /);
    });

    it("Scenario: Exact pitch", () => {
      const q = fretQ(2, 9);
      expect(q.prompt).toBe("Play A on the D string");
      expect(q.check(50 + 7)).toBe(true);
    });

    it("Scenario: Same note, wrong octave", () => {
      expect(fretQ(2, 9).check(GUITAR[1])).toBe(false);
      expect(fretQ(2, 9).check(69)).toBe(false);
    });

    it("Scenario: Open string or 12th fret", () => {
      const q = fretQ(0, 4);
      expect(q.check(40)).toBe(true);
      expect(q.check(52)).toBe(true);
      expect(q.check(64)).toBe(false);
    });

    it("Scenario: String not checked", () => {
      expect(fretQ(2, 9).check(GUITAR[3] + 2)).toBe(true);
    });

    it("counts only pitches on the named string between fret 0 and fret 12", () => {
      for (let s = 0; s < 6; s++) {
        for (let p = 0; p < 12; p++) {
          const q = fretQ(s, p);
          for (let m = 30; m < 90; m++) expect(q.check(m)).toBe(m >= GUITAR[s] && m <= GUITAR[s] + 12 && m % 12 === p);
        }
      }
    });
  });

  describe("Requirement: Play it back questions", () => {
    it("chooses the note from E2 to C5", () => {
      const targets = new Set([...Array(2000)].map(() => KINDS.back().target));
      expect(Math.min(...targets)).toBe(40);
      expect(Math.max(...targets)).toBe(72);
      expect(targets.size).toBe(33);
    });

    it("Scenario: New question", () => {
      serve("back", [backQ(57)]);
      openPlay("back");
      expect(play).toHaveBeenCalledWith([57, null], 1.0, "guitar");
      expect(shown()).toBe("?");
      expect(text()).not.toContain("A3");
    });

    it("Scenario: Hearing it again", () => {
      serve("back", [backQ(57)]);
      openPlay("back");
      play.mockClear();
      tap("▶ Hear it again");
      tap("▶ Hear it again");
      expect(play).toHaveBeenCalledTimes(2);
      expect(play).toHaveBeenLastCalledWith([57, null], 1.0, "guitar");
      expect(shown()).toBe("?");
    });
  });

  describe("Requirement: Hearing a played note", () => {
    const heard = (plucks, to, setup = () => {}, range) => {
      const got = [];
      const l = listener((m) => got.push(m), () => dbfs(-60), range);
      setup(l);
      listen((b, r, t) => l.hear(b, r, t), recording(plucks), 0, to);
      return got;
    };

    it("counts a note held steadily, once per pluck", () => {
      expect(heard([{ midi: 57, at: 100, ring: true }], 3000)).toEqual([57]);
      expect(heard([{ midi: 40, at: 100 }], 1500)).toEqual([40]);
    });

    it("waits for the note to settle before counting it", () => {
      expect(heard([{ midi: 57, at: 100 }], 200)).toEqual([]);
      expect(heard([{ midi: 57, at: 100 }], 300)).toEqual([57]);
    });

    it("Scenario: Plucked again while ringing", () => {
      expect(heard([{ midi: 57, at: 100 }, { midi: 57, at: 900 }], 2000)).toEqual([57, 57]);
    });

    it("counts each note of a line once", () => {
      const line = [55, 57, 59, 60, 62].map((midi, i) => ({ midi, at: 100 + i * 300 }));
      expect(heard(line, 2000)).toEqual([55, 57, 59, 60, 62]);
    });

    it("does not count noise", () => {
      const got = [];
      const l = listener((m) => got.push(m), () => dbfs(-60));
      for (let i = 0, t = 0; i < 60; i++, t += 50) l.hear(noise({ rms: 0.1, seed: i + 1 }), RATE, t);
      expect(got).toEqual([]);
    });

    it("Scenario: App's own sound", () => {
      // the app's note sounds until 1.5 s; the page ignores the microphone until it has died away
      expect(heard([{ midi: 57, at: 100, until: 1500 }], 3000, (l) => l.mute(1900))).toEqual([]);
      expect(heard([{ midi: 57, at: 100, until: 1500 }, { midi: 52, at: 2000 }], 3000, (l) => l.mute(1900))).toEqual([52]);
    });

    it("Scenario: Previous note still ringing", () => {
      const spy = serve("fretboard", [fretQ(2, 9), fretQ(4, 0)]);
      openPlay("fretboard");
      g.pluck(57).pluck(57, 300);
      expect(status()).toBe("Correct!");
      g.run(1200); // the string rings on into the next question
      expect(current(spy).prompt).toBe("Play C on the B string");
      expect(status()).toBe("Listening… play the note");
      g.run(2000);
      expect(status()).toBe("Listening… play the note");
    });

    it("hears every note of the guitar's 12 frets", () => {
      for (const m of [40, 52, 64, 76]) expect(heard([{ midi: m, at: 100 }], 800)).toEqual([m]);
    });
  });

  describe("Requirement: Answering by playing a note twice", () => {
    it("Scenario: Searching past the right note", async () => {
      const spy = serve("back", [backQ(57)]);
      await openBack();
      for (const m of [55, 57, 59, 60]) g.pluck(m);
      expect(status()).toBe("C4 ●○ play it again to answer");
      expect(shown()).toBe("?");
      expect(current(spy).target).toBe(57);
      expect(header()).toBe("1 / 10 · 0 right");
    });

    it("Scenario: Answering", async () => {
      serve("back", [backQ(57)]);
      await openBack();
      for (const m of [55, 57, 59, 60]) g.pluck(m);
      g.twice(57);
      expect(status()).toBe("Correct!");
      expect(shown()).toBe("A3");
    });

    it("Scenario: Name hidden while searching", () => {
      serve("fretboard", [fretQ(2, 9)]);
      openPlay("fretboard");
      g.pluck(55);
      expect(status()).toBe("A note ●○ play it again to answer");
      expect(text()).not.toContain("G3");
    });

    it("does not name a searched note in Key notes either", () => {
      serve("keys", [keysQ("E", "major", 4)]);
      openPlay("keys");
      g.pluck(59);
      expect(status()).toBe("A note ●○ play it again to answer");
    });
  });

  describe("Requirement: Right answer", () => {
    it("Scenario: Correct", () => {
      const spy = serve("keys", [keysQ("E", "major", 4)]);
      openPlay("keys");
      g.pluck(59).pluck(59, 200);
      expect(status()).toBe("Correct!");
      expect(shown()).toBe("B");
      expect(document.querySelector(".reading").classList.contains("tuned")).toBe(true);
      const first = current(spy);
      g.run(700);
      expect(current(spy)).toBe(first);
      g.run(300);
      expect(current(spy)).not.toBe(first);
      expect(header()).toBe("2 / 10 · 1 right");
    });

    it("goes to the results after the last question", () => {
      const spy = vi.spyOn(KINDS, "fretboard");
      openPlay("fretboard", "Fretboard notes");
      for (let n = 0; n < 10; n++) { g.twice(rightNote(current(spy))); g.mute(1200); }
      expect(text()).toContain("Fretboard notes complete");
    });
  });

  describe("Requirement: Wrong answers and retries", () => {
    it("Scenario: Wrong then right", () => {
      serve("keys", [keysQ("D", "major", 4)]);
      openPlay("keys");
      g.twice(56);
      expect(status()).toBe("G#/Ab is not it");
      expect(shown()).toBe("?");
      g.twice(57);
      expect(status()).toBe("Correct!");
      g.run(1100);
      expect(header()).toBe("2 / 10 · 0 right");
    });

    it("names a wrong note with its octave where the octave matters", () => {
      serve("fretboard", [fretQ(2, 9)]);
      openPlay("fretboard");
      g.twice(45);
      expect(status()).toBe("A2 is not it");
    });

    it("Scenario: Wrong octave", async () => {
      serve("back", [backQ(57)]);
      await openBack();
      g.twice(45);
      expect(status()).toBe("Right note, but an octave too low");
      g.twice(69);
      expect(status()).toBe("Right note, but an octave too high");
      expect(shown()).toBe("?");
    });

    it("says how many octaves off a right note is", async () => {
      expect(backQ(69).check(45)).toEqual({ octave: -2 });
      serve("back", [backQ(69)]);
      await openBack();
      g.twice(45);
      expect(status()).toBe("Right note, but 2 octaves too low");
    });
  });

  describe("Requirement: Show me", () => {
    it("Scenario: Revealing a fretboard question", () => {
      serve("fretboard", [fretQ(2, 9)]);
      openPlay("fretboard");
      tap("Show me");
      expect(shown()).toBe("A");
      const full = [...document.querySelectorAll(".neck .mark")].filter((m) => !m.classList.contains("dim"));
      expect(full).toHaveLength(1);
      expect(full[0].textContent).toBe("A");
      expect(document.querySelector(".neck").getAttribute("aria-label")).toBe("Fretboard, frets 0 to 12");
      tap("Next");
      g.run(100);
      expect(header()).toBe("2 / 10 · 0 right");
    });

    it("marks the place of a Play it back note, and shows no fretboard for Key notes", () => {
      serve("back", [backQ(57)]);
      const first = openPlay("back");
      tap("Show me");
      expect(shown()).toBe("A3");
      expect(document.querySelectorAll(".neck .mark:not(.dim)").length).toBeGreaterThan(0);
      first.unmount();
      serve("keys", [keysQ("E", "major", 4)]);
      openPlay("keys");
      tap("Show me");
      expect(shown()).toBe("B");
      expect(document.querySelector(".neck")).toBeNull();
    });

    it("keeps listening and continues once the note is given", () => {
      serve("fretboard", [fretQ(2, 9)]);
      openPlay("fretboard");
      tap("Show me");
      g.twice(57);
      expect(status()).toBe("Correct!");
      g.run(1100);
      expect(header()).toBe("2 / 10 · 0 right");
    });

    it("Scenario: Moving on", () => {
      const spy = vi.spyOn(KINDS, "keys");
      openPlay("keys");
      const first = current(spy);
      tap("Show me");
      tap("Next");
      expect(current(spy)).not.toBe(first);
      expect(shown()).toBe("?");
    });

    it("marks only the answer's note on the diagram", () => {
      const map = showMap(fretQ(2, 9));
      expect(map.byPc.filter((n) => n.on).map((n) => n.name)).toEqual(["A"]);
      expect(map.byPc.map((n) => n.name)).toEqual(SHARP);
    });
  });

  describe("Requirement: Play on guitar session", () => {
    it("Scenario: Ten questions", () => {
      const spy = vi.spyOn(KINDS, "keys");
      openPlay("keys", "Key notes");
      const keys = [];
      for (let n = 0; n < 10; n++) {
        expect(header()).toBe(`${n + 1} / 10 · ${n} right`);
        keys.push(current(spy).key);
        g.twice(rightNote(current(spy)));
        g.mute(1200);
      }
      expect(new Set(keys).size).toBe(10);
      expect(text()).toContain("Key notes complete");
    });

    it("has no time limit", () => {
      openPlay("fretboard");
      g.run(60000);
      expect(header()).toBe("1 / 10 · 0 right");
      expect(document.querySelector(".countdown")).toBeNull();
    });

    it("Scenario: Quitting", () => {
      openApp();
      openEntry("Key notes");
      tap("Quit");
      expect(screen.getByRole("heading", { name: "Play on guitar" })).toBeTruthy();
      expect(text()).not.toContain("complete");
      expect(stop).toHaveBeenCalled();
    });
  });

  describe("Requirement: Play on guitar results", () => {
    it("Scenario: Results", () => {
      const spy = vi.spyOn(KINDS, "fretboard");
      openPlay("fretboard", "Fretboard notes");
      const missed = [];
      for (let n = 0; n < 10; n++) {
        const q = current(spy);
        vi.advanceTimersByTime(1000);
        if (n >= 7) { missed.push(q); g.twice(rightNote(q) + 1); }
        g.twice(rightNote(q));
        g.mute(1200);
      }
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("7 / 10");
      expect(text()).toContain("70%");
      expect(text()).toMatch(/Average time to find the note\d+\.\d seconds/);
      const rows = [...document.querySelectorAll(".tally li")].map((li) => [li.firstChild.textContent, li.lastChild.textContent]);
      expect(rows).toEqual(missed.map((q) => [q.prompt, q.name]));
    });

    it("times only questions answered right, from the question being shown, to one decimal", () => {
      const spy = vi.spyOn(KINDS, "keys");
      openPlay("keys");
      // 2 s of searching, then the note twice, 400 ms apart, heard once settled: about 2.6 s in all
      // (20 ms off the 50 ms analyses, so the rounding cannot fall either way)
      vi.advanceTimersByTime(20);
      g.run(2000).twice(rightNote(current(spy)));
      g.run(1000);
      // the rest are revealed and skipped, and do not count towards the average
      for (let n = 1; n < 10; n++) { g.run(5000); tap("Show me"); tap(n < 9 ? "Next" : "Finish"); }
      expect(text()).toContain("Average time to find the note2.6 seconds");
      expect(text()).toContain("1 / 10");
    });

    it("plays again in the same kind, or finishes", () => {
      const spy = vi.spyOn(KINDS, "back");
      const onExit = vi.fn();
      render(<Play kind="back" title="Play it back" onExit={onExit} />);
      for (let n = 0; n < 10; n++) { tap("Show me"); tap(n < 9 ? "Next" : "Finish"); }
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("0 / 10");
      expect(document.querySelectorAll(".tally li")).toHaveLength(10);
      tap("Play again");
      expect(header()).toBe("1 / 10 · 0 right");
      expect(spy).toHaveBeenCalled();
      for (let n = 0; n < 10; n++) { tap("Show me"); tap(n < 9 ? "Next" : "Finish"); }
      tap("Finish");
      expect(onExit).toHaveBeenCalled();
    });
  });

  describe("Requirement: Microphone in Play on guitar", () => {
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

    it("Scenario: Leaving releases the microphone", async () => {
      const page = openPlay("keys");
      await act(async () => {});
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
      page.unmount();
      expect(track.stop).toHaveBeenCalled();
    });

    it("releases the microphone on the results screen", async () => {
      openPlay("keys");
      await act(async () => {});
      for (let n = 0; n < 10; n++) { tap("Show me"); tap(n < 9 ? "Next" : "Finish"); await act(async () => {}); }
      expect(text()).toContain("complete");
      expect(track.stop).toHaveBeenCalledTimes(1);
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
    });

    it("Scenario: Microphone blocked", async () => {
      navigator.mediaDevices.getUserMedia.mockRejectedValue(Object.assign(new Error(), { name: "NotAllowedError" }));
      openPlay("fretboard");
      await act(async () => {});
      expect(text()).toContain("Play on guitar needs the microphone, and it is blocked for this site.");
      expect(button("Try again")).toBeTruthy();
      expect(status()).toBe("Not listening");
      tap("Show me");
      tap("Next");
      expect(header()).toBe("2 / 10 · 0 right");
    });
  });
});
