// @vitest-environment jsdom
// openspec/specs/tuner/spec.md
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within, act } from "@testing-library/react";
import { detect, midiOf, hzOf, centsFrom, noteName, letter } from "../src/pitch.js";
import { TUNING } from "../src/theory.js";
import { play, context } from "../src/audio.js";
import Tuner from "../src/Tuner.jsx";
import { openApp, openEntry, tap, button, text } from "./helpers/app.jsx";
import { tone, weakFundamental, noise, RATE } from "./helpers/sound.js";
import { FakeAudioContext } from "./helpers/audio-context.js";

// The microphone: by default a fake that hands the tuner's listen callback to the test.
// With `mic.real` the app's own useMic runs, against a fake getUserMedia.
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

let t = 0;
// Analyses of `buf` every 50 ms for `ms`
const hear = (buf, ms = 300) => act(() => { for (const end = t + ms; t < end; t += 50) mic.listen(buf, RATE, t); });
const silence = (ms) => hear(new Float32Array(4096), ms);
const note = () => document.querySelector(".reading .note").textContent;
const cents = () => document.querySelector(".reading .cents").textContent;
const reading = () => document.querySelector(".reading");
const needle = () => document.querySelector(".meter i");
const strings = () => within(screen.getByRole("group", { name: "Strings" })).getAllByRole("button");
const highlighted = () => strings().findIndex((b) => b.classList.contains("on"));
const instrument = (name) => fireEvent.click(within(screen.getByRole("group", { name: "Instrument" })).getByRole("button", { name }));
const centsOff = (hz, c) => hz * 2 ** (c / 1200);
const openTuner = () => render(<Tuner onExit={() => {}} />);

beforeEach(() => { t = 0; mic.listen = null; mic.problem = null; mic.retry = vi.fn(); mic.real = false; play.mockClear(); });

describe("tuner", () => {
  describe("Requirement: Tuner page", () => {
    it("Scenario: Opening", () => {
      openApp();
      openEntry("Tuner");
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Tuner");
      expect(button("Guitar").getAttribute("aria-pressed")).toBe("true");
      expect(mic.listen).toBeTypeOf("function");
      expect(cents()).toBe("Play a note");
    });

    it("Scenario: Back to home", () => {
      localStorage.setItem("theory-quiz.best.bass", "4");
      openApp();
      fireEvent.click(screen.getByRole("checkbox", { name: "Pentatonic" }));
      const before = document.querySelector("main").innerHTML;
      openEntry("Tuner");
      hear(tone(110));
      tap("‹ Back");
      expect(document.querySelector("main").innerHTML).toBe(before);
    });

    it("has no questions, score or session", () => {
      openTuner();
      expect(text()).not.toMatch(/correct|Score|Best|\d+ \/ \d+/);
    });
  });

  describe("Requirement: Instrument choice", () => {
    it("offers Guitar, Bass and Manual, one at a time", () => {
      openTuner();
      const group = within(screen.getByRole("group", { name: "Instrument" }));
      expect(group.getAllByRole("button").map((b) => b.textContent)).toEqual(["Guitar", "Bass", "Manual"]);
      instrument("Manual");
      expect(group.getAllByRole("button").map((b) => b.getAttribute("aria-pressed"))).toEqual(["false", "false", "true"]);
    });

    it("tunes the guitar's six strings and the bass's four, in standard tuning", () => {
      openTuner();
      expect(strings().map((b) => b.textContent)).toEqual(["E", "A", "D", "G", "B", "E"]);
      expect(TUNING.guitar.map(noteName)).toEqual(["E2", "A2", "D3", "G3", "B3", "E4"]);
      expect(TUNING.bass.map(noteName)).toEqual(["E1", "A1", "D2", "G2"]);
      expect(hzOf(69)).toBe(440);
    });

    it("Scenario: Switching to Bass", () => {
      openTuner();
      instrument("Bass");
      expect(strings().map((b) => b.textContent)).toEqual(["E", "A", "D", "G"]);
      hear(tone(hzOf(38)));
      expect(note()).toBe("D2");
      expect(highlighted()).toBe(2);
    });

    it("Scenario: Not remembered", () => {
      const first = openTuner();
      instrument("Bass");
      first.unmount();
      openTuner();
      expect(button("Guitar").getAttribute("aria-pressed")).toBe("true");
    });

    it("does not scroll when the instrument changes", () => {
      openTuner();
      window.scrollTo.mockClear();
      instrument("Bass"); instrument("Manual");
      expect(window.scrollTo).not.toHaveBeenCalled();
    });
  });

  describe("Requirement: Pitch reading", () => {
    it("Scenario: In tune", () => {
      openTuner();
      hear(tone(110));
      expect(note()).toBe("A2");
      expect(highlighted()).toBe(1);
      expect(cents()).toBe("In tune");
      expect(reading().classList.contains("tuned")).toBe(true);
      expect(parseFloat(needle().style.left)).toBeCloseTo(50, 1);
    });

    it("Scenario: Slightly flat", () => {
      openTuner();
      hear(tone(108));
      expect(note()).toBe("A2");
      expect(cents()).toBe("−32 cents");
      expect(reading().classList.contains("tuned")).toBe(false);
      expect(parseFloat(needle().style.left)).toBeLessThan(50);
    });

    it("marks a note within 5 cents as in tune, and one further off as not", () => {
      openTuner();
      hear(tone(centsOff(196, 4.5)));
      expect(cents()).toBe("In tune");
      hear(tone(centsOff(196, -6)));
      expect(cents()).toBe("−6 cents");
      hear(tone(centsOff(196, 9)));
      expect(cents()).toBe("+9 cents");
    });

    it("reads a steady tone to within 2 cents", () => {
      for (const midi of [28, 33, 40, 45, 50, 55, 59, 64, 69, 76, 84]) {
        for (const c of [-30, -7, 0, 3, 18]) {
          const hz = centsOff(hzOf(midi), c);
          const found = detect(tone(hz), RATE, [38, 1100]);
          expect(Math.abs(centsFrom(found, midi) - c)).toBeLessThan(2);
        }
      }
    });

    it("reads as accurately at 44.1 kHz", () => {
      const found = detect(tone(110, { rate: 44100 }), 44100, [70, 420], true);
      expect(Math.abs(centsFrom(found, 45))).toBeLessThan(2);
    });
  });

  describe("Requirement: No note heard", () => {
    it("Scenario: Silence", () => {
      openTuner();
      silence(1000);
      expect(cents()).toBe("Play a note");
      expect(note()).toBe("—");
      expect(needle()).toBeNull();
      expect(detect(new Float32Array(4096), RATE, [70, 420])).toBeNull();
    });

    it("shows no reading from noise", () => {
      openTuner();
      act(() => { for (let seed = 1; seed <= 40; seed++, t += 50) mic.listen(noise({ rms: 0.1, seed }), RATE, t); });
      expect(cents()).toBe("Play a note");
      instrument("Manual");
      act(() => { for (let seed = 41; seed <= 80; seed++, t += 50) mic.listen(noise({ rms: 0.1, seed }), RATE, t); });
      expect(cents()).toBe("Play a note");
    });

    it("shows no reading from a voice gliding between pitches", () => {
      openTuner();
      act(() => { for (let i = 0; i < 20; i++, t += 50) mic.listen(tone(140 + (i % 3) * 25), RATE, t); });
      expect(cents()).toBe("Play a note");
    });

    it("Scenario: Reading held after the note fades", () => {
      openTuner();
      hear(tone(hzOf(64)));
      silence(350);
      expect(note()).toBe("E4");
      expect(reading().classList.contains("stale")).toBe(false);
      silence(200);
      expect(note()).toBe("E4");
      expect(reading().classList.contains("stale")).toBe(true);
      silence(9000);
      expect(note()).toBe("E4");
      silence(1000);
      expect(cents()).toBe("Play a note");
    });

    it("a new note replaces a held reading at once", () => {
      openTuner();
      hear(tone(hzOf(64)));
      silence(2000);
      hear(tone(hzOf(59)), 150);
      expect(note()).toBe("B3");
      expect(reading().classList.contains("stale")).toBe(false);
    });

    it("Scenario: Plucking again", () => {
      openTuner();
      hear(tone(hzOf(55)));
      for (let i = 0; i < 6; i++) {
        silence(600);
        expect(reading().classList.contains("stale")).toBe(true);
        hear(tone(hzOf(55)), 50); // a short pluck: one clean analysis
        expect(reading().classList.contains("stale")).toBe(false);
        expect(note()).toBe("G3");
      }
    });
  });

  describe("Requirement: Automatic string detection", () => {
    it("Scenario: Low E on guitar", () => {
      openTuner();
      hear(tone(centsOff(hzOf(40), 8)));
      expect(highlighted()).toBe(0);
      expect(note()).toBe("E2");
      expect(cents()).toBe("+8 cents");
    });

    it("Scenario: Bass string detected in the right octave", () => {
      expect(detect(weakFundamental(55), RATE, [35, 130], false)).toBeCloseTo(110, 0); // read naively: an octave up
      openTuner();
      instrument("Bass");
      hear(weakFundamental(55));
      expect(highlighted()).toBe(1);
      expect(note()).toBe("A1");
      expect(cents()).toBe("In tune");
    });

    it("measures a note far from every string against the closest one", () => {
      openTuner();
      hear(tone(100)); // between E2 and A2, nearer A2
      expect(highlighted()).toBe(1);
      expect(cents()).toMatch(/^−\d+ cents · tune up$/);
      expect(needle().style.left).toBe("0%");
    });
  });

  describe("Requirement: String selection with reference tone", () => {
    it("Scenario: Tuning a badly flat string", () => {
      openTuner();
      fireEvent.click(strings()[3]);
      hear(tone(hzOf(52))); // G3 three semitones flat
      expect(strings()[3].getAttribute("aria-pressed")).toBe("true");
      expect(highlighted()).toBe(3);
      expect(note()).toBe("G3");
      expect(needle().style.left).toBe("0%");
      expect(cents()).toBe("−300 cents · tune up");
    });

    it("hints to tune down for a sharp string", () => {
      openTuner();
      fireEvent.click(strings()[2]);
      hear(tone(hzOf(52)));
      expect(cents()).toBe("+200 cents · tune down");
      expect(needle().style.left).toBe("100%");
    });

    it("Scenario: Hearing the reference", () => {
      openTuner();
      fireEvent.click(strings()[2]);
      expect(play).toHaveBeenCalledWith([50], undefined, "guitar");
      expect(noteName(50)).toBe("D3");
      expect(text()).toContain("Tuning D3. Tap it again to find the string by itself.");
    });

    it("Scenario: Back to automatic", () => {
      openTuner();
      fireEvent.click(strings()[2]);
      fireEvent.click(strings()[2]);
      expect(strings().every((b) => b.getAttribute("aria-pressed") === "false")).toBe(true);
      expect(text()).toContain("Finds the string by itself.");
      hear(tone(hzOf(59)));
      expect(highlighted()).toBe(4);
    });

    it("returns to automatic detection when another instrument is chosen", () => {
      openTuner();
      fireEvent.click(strings()[1]);
      instrument("Bass");
      expect(strings().every((b) => b.getAttribute("aria-pressed") === "false")).toBe(true);
    });
  });

  describe("Requirement: Manual note naming", () => {
    it("Scenario: Natural note", () => {
      openTuner();
      instrument("Manual");
      hear(tone(440));
      expect(note()).toBe("A4");
      expect(cents()).toBe("In tune");
      expect(screen.queryByRole("group", { name: "Strings" })).toBeNull();
    });

    it("Scenario: Black key", () => {
      openTuner();
      instrument("Manual");
      hear(tone(277.2));
      expect(note()).toBe("C#4/Db4");
      expect(cents()).toBe("In tune");
    });

    it("reads notes from E1 to C6", () => {
      openTuner();
      instrument("Manual");
      hear(tone(41.2));
      expect(note()).toBe("E1");
      hear(tone(1046.5));
      expect(note()).toBe("C6");
    });

    it("names every note with its octave, black keys both ways", () => {
      expect([60, 61, 63, 66, 68, 70].map(noteName)).toEqual(["C4", "C#4/Db4", "D#4/Eb4", "F#4/Gb4", "G#4/Ab4", "A#4/Bb4"]);
      expect(letter(40)).toBe("E");
      expect(midiOf(440)).toBe(69);
      expect(centsFrom(hzOf(57) * 2 ** (10 / 1200), 57)).toBeCloseTo(10, 9);
    });
  });

  describe("Requirement: Microphone use", () => {
    let track, ctx;
    beforeEach(() => {
      mic.real = true;
      track = { stop: vi.fn() };
      ctx = new FakeAudioContext();
      context.mockReturnValue(ctx);
      Object.defineProperty(navigator, "mediaDevices", {
        configurable: true,
        value: { getUserMedia: vi.fn(async () => ({ getTracks: () => [track] })) },
      });
    });
    const setHidden = (hidden) => act(() => {
      Object.defineProperty(document, "hidden", { configurable: true, get: () => hidden });
      document.dispatchEvent(new Event("visibilitychange"));
    });

    it("listens while the Tuner page is shown, with the phone's call processing off", async () => {
      openTuner();
      await act(async () => {});
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      expect(ctx.streams).toHaveLength(1);
      // sound from the microphone goes to the analyser only, never to the speakers
      expect(ctx.streams[0].connected).toEqual([ctx.analysers[0]]);
    });

    it("Scenario: Leaving releases the microphone", async () => {
      const page = openTuner();
      await act(async () => {});
      page.unmount();
      expect(track.stop).toHaveBeenCalled();
    });

    it("Scenario: Coming back from another app", async () => {
      openTuner();
      await act(async () => {});
      setHidden(true);
      expect(track.stop).toHaveBeenCalledTimes(1);
      setHidden(false);
      await act(async () => {});
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(2);
      Object.defineProperty(document, "hidden", { configurable: true, get: () => false });
    });
  });

  describe("Requirement: Microphone unavailable", () => {
    it("Scenario: Permission denied", () => {
      mic.problem = "NotAllowedError";
      openTuner();
      expect(text()).toContain("The tuner needs the microphone, and it is blocked for this site. Allow it in the browser's site settings");
      tap("Try again");
      expect(mic.retry).toHaveBeenCalled();
      fireEvent.click(strings()[0]);
      expect(play).toHaveBeenCalledWith([40], undefined, "guitar");
    });

    it("explains a missing or busy microphone", () => {
      mic.problem = "NotFoundError";
      const first = openTuner();
      expect(text()).toContain("No microphone was found on this device.");
      first.unmount();
      mic.problem = "NotReadableError";
      openTuner();
      expect(text()).toContain("The microphone is in use by another app.");
    });
  });
});
