// @vitest-environment jsdom
// openspec/specs/mic-sensitivity/spec.md
// The pages run with the app's own useMic; the phone's microphone is a fake analyser that returns `signal`.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { context } from "../src/audio.js";
import { listener } from "../src/play.js";
import { pc } from "../src/theory.js";
import { tone, recording, listen, frameAt, dbfs } from "./helpers/sound.js";
import { FakeAudioContext } from "./helpers/audio-context.js";
import { blockStorage } from "./helpers/storage.js";

vi.mock("../src/audio.js", () => ({ play: vi.fn(() => Promise.resolve()), stop: vi.fn(), setVoice: vi.fn(), context: vi.fn() }));

let signal = null; // what the microphone hears now; null is silence
let track;
class MicContext extends FakeAudioContext {
  createAnalyser() {
    const a = super.createAnalyser();
    a.getFloatTimeDomainData = (buf) => (signal ? buf.set(signal.subarray(0, buf.length)) : buf.fill(0));
    return a;
  }
}

// Mic.jsx reads the stored setting when it is first loaded, so each test loads the pages afresh
async function load() {
  vi.resetModules();
  const [Mic, Tuner, Play, Metronome, Ear, ear] = await Promise.all([
    import("../src/Mic.jsx"), import("../src/Tuner.jsx"), import("../src/Play.jsx"),
    import("../src/Metronome.jsx"), import("../src/Ear.jsx"), import("../src/ear.js"),
  ]);
  return { Mic, Tuner: Tuner.default, Play: Play.default, Metronome: Metronome.default, Ear: Ear.default, EXERCISES: ear.EXERCISES };
}
const settle = () => act(async () => {});           // the microphone has been granted
const run = (ms) => act(() => { vi.advanceTimersByTime(ms); }); // analyses keep coming
const gear = () => screen.queryByRole("button", { name: "Microphone sensitivity" });
const panel = () => screen.queryByRole("region", { name: "Microphone sensitivity" }) ?? document.querySelector("section.mic");
const slider = () => screen.getByRole("slider", { name: "Sensitivity: more sensitive to the left" });
const setSlider = (db) => fireEvent.change(slider(), { target: { value: String(db) } });
const reading = () => document.querySelector(".reading .note")?.textContent;

beforeEach(() => {
  vi.useFakeTimers();
  signal = null;
  track = { stop: vi.fn() };
  context.mockImplementation(() => new MicContext());
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia: vi.fn(async () => ({ getTracks: () => [track] })) },
  });
});

describe("mic-sensitivity", () => {
  describe("Requirement: Sensitivity control on listening pages", () => {
    it("Scenario: Opening on the Tuner", async () => {
      const { Tuner } = await load();
      render(<Tuner onExit={() => {}} />);
      await settle();
      expect(gear().closest("header")).not.toBeNull();
      expect(gear().getAttribute("aria-expanded")).toBe("false");
      fireEvent.click(gear());
      expect(panel()).not.toBeNull();
      expect(gear().getAttribute("aria-expanded")).toBe("true");
      signal = tone(110);
      run(400);
      expect(reading()).toBe("A2");
      expect(track.stop).not.toHaveBeenCalled();
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
      fireEvent.click(gear());
      expect(panel()).toBeNull();
    });

    it("Scenario: Opening during a question", async () => {
      const { Play } = await load();
      const { KINDS } = await import("../src/play.js"); // the copy the freshly loaded page uses
      const spy = vi.spyOn(KINDS, "keys");
      render(<Play kind="keys" title="Key notes" onExit={() => {}} />);
      await settle();
      const prompt = screen.getByRole("heading", { level: 2 }).textContent;
      fireEvent.click(gear());
      expect(panel()).not.toBeNull();
      expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(prompt);
      // a note played twice still answers it
      const q = spy.mock.results.at(-1).value;
      const midi = 48 + ((pc(q.name) - 48) % 12 + 12) % 12;
      const sample = recording([{ midi, at: 0 }, { midi, at: 400 }]);
      const start = performance.now();
      for (let ms = 0; ms < 800; ms += 16) { signal = frameAt(sample, performance.now() - start); run(16); }
      expect(document.querySelector(".reading .cents").textContent).toBe("Correct!");
    });

    it("Scenario: Not on other pages", async () => {
      const { Metronome, Ear, EXERCISES, Play } = await load();
      const a = render(<Metronome onExit={() => {}} />);
      expect(gear()).toBeNull();
      a.unmount();
      const b = render(<Ear exercise={EXERCISES[0]} onExit={() => {}} />);
      fireEvent.click(screen.getByRole("button", { name: /^Level 1/ }));
      expect(gear()).toBeNull();
      b.unmount();
      render(<Play kind="fretboard" title="Fretboard notes" onExit={() => {}} />);
      await settle();
      expect(gear()).not.toBeNull();
      for (let n = 0; n < 10; n++) {
        fireEvent.click(screen.getByRole("button", { name: "Show me" }));
        fireEvent.click(screen.getByRole("button", { name: n < 9 ? "Next" : "Finish" }));
      }
      expect(screen.getByText("Fretboard notes complete")).toBeTruthy();
      expect(gear()).toBeNull();
    });
  });

  describe("Requirement: Sensitivity sets the silence level", () => {
    it("runs from -80 dBFS to -30 dBFS in steps of 2 dB, labelled without decibels", async () => {
      const { Tuner } = await load();
      render(<Tuner onExit={() => {}} />);
      fireEvent.click(gear());
      expect([slider().min, slider().max, slider().step]).toEqual(["-80", "-30", "2"]);
      expect(panel().textContent).toContain("More sensitive");
      expect(panel().textContent).toContain("Less sensitive");
      expect(panel().textContent).not.toMatch(/dB/);
    });

    it("Scenario: A quiet microphone", async () => {
      const { Tuner } = await load();
      render(<Tuner onExit={() => {}} />);
      await settle();
      signal = tone(110, { rms: dbfs(-66) });
      run(600);
      expect(document.querySelector(".reading .cents").textContent).toBe("Play a note");
      fireEvent.click(gear());
      setSlider(-70);
      run(600);
      expect(reading()).toBe("A2");
      expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Tuner");
    });

    it("Scenario: A noisy room", async () => {
      const { Mic } = await load();
      // background sound at -50 dBFS: heard at the default, silence once less sensitive than -50
      const heard = () => {
        const got = [];
        const l = listener((m) => got.push(m), Mic.floor);
        listen((b, r, t) => l.hear(b, r, t), recording([{ midi: 57, at: 0, ring: true }], { level: dbfs(-50) / 0.81, decay: 0 }), 0, 1000);
        return got;
      };
      expect(heard()).toEqual([57]);
      render(<Mic.MicSettings />);
      setSlider(-46);
      expect(heard()).toEqual([]);
    });

    it("rounds a setting to the slider's steps and keeps it within its ends", async () => {
      const { Mic } = await load();
      render(<Mic.MicSettings />);
      setSlider(-71);
      expect(Mic.floor()).toBeCloseTo(dbfs(-70), 9);
      setSlider(-90);
      expect(Mic.floor()).toBeCloseTo(dbfs(-80), 9);
    });
  });

  describe("Requirement: Live input meter", () => {
    const bar = () => document.querySelector(".mic .level i");

    it("Scenario: Playing past the mark", async () => {
      const { Tuner } = await load();
      render(<Tuner onExit={() => {}} />);
      await settle();
      fireEvent.click(gear());
      signal = tone(196, { rms: dbfs(-40) });
      run(300);
      expect(parseFloat(bar().style.width)).toBeCloseTo(80, 1); // -40 on a scale from -80 to -30
      expect(bar().classList.contains("heard")).toBe(true);
      expect(panel().textContent).toContain("Play a string: the bar should pass the slider. In silence it should stay below it.");
    });

    it("Scenario: Silence under the mark", async () => {
      const { Tuner } = await load();
      render(<Tuner onExit={() => {}} />);
      await settle();
      fireEvent.click(gear());
      signal = tone(196, { rms: dbfs(-72) });
      run(300);
      expect(parseFloat(bar().style.width)).toBeCloseTo(16, 1);
      expect(bar().classList.contains("heard")).toBe(false);
    });

    it("shows no level when the microphone is unavailable", async () => {
      navigator.mediaDevices.getUserMedia.mockRejectedValue(Object.assign(new Error(), { name: "NotAllowedError" }));
      const { Tuner } = await load();
      render(<Tuner onExit={() => {}} />);
      await settle();
      fireEvent.click(gear());
      signal = tone(196, { rms: dbfs(-40) });
      run(300);
      expect(bar().style.width).toBe("0px");
    });
  });

  describe("Requirement: Default and reset", () => {
    it("Scenario: First use", async () => {
      const { Tuner, Mic } = await load();
      render(<Tuner onExit={() => {}} />);
      fireEvent.click(gear());
      expect(slider().value).toBe("-60");
      expect(Mic.floor()).toBeCloseTo(0.001, 9);
      expect(screen.getByRole("button", { name: "Reset" }).disabled).toBe(true);
    });

    it("Scenario: Reset", async () => {
      const { Tuner, Mic } = await load();
      render(<Tuner onExit={() => {}} />);
      fireEvent.click(gear());
      setSlider(-40);
      expect(Mic.floor()).toBeCloseTo(dbfs(-40), 9);
      fireEvent.click(screen.getByRole("button", { name: "Reset" }));
      expect(slider().value).toBe("-60");
      expect(Mic.floor()).toBeCloseTo(0.001, 9);
    });
  });

  describe("Requirement: Setting kept on the device", () => {
    it("Scenario: Shared between pages", async () => {
      const { Tuner, Play } = await load();
      const tuner = render(<Tuner onExit={() => {}} />);
      fireEvent.click(gear());
      setSlider(-74);
      tuner.unmount();
      render(<Play kind="keys" title="Key notes" onExit={() => {}} />);
      fireEvent.click(gear());
      expect(slider().value).toBe("-74");
    });

    it("Scenario: Kept after closing the app", async () => {
      const first = await load();
      const page = render(<first.Tuner onExit={() => {}} />);
      fireEvent.click(gear());
      setSlider(-52);
      page.unmount();
      const second = await load();
      expect(second.Mic.floor()).toBeCloseTo(dbfs(-52), 9);
      render(<second.Tuner onExit={() => {}} />);
      fireEvent.click(gear());
      expect(slider().value).toBe("-52");
    });

    it("uses the default for a stored value it cannot read", async () => {
      for (const stored of ["loud", "-100", "-10", ""]) {
        localStorage.setItem("micGate", stored);
        const { Mic } = await load();
        expect(Mic.floor()).toBeCloseTo(0.001, 9);
      }
    });

    it("uses the default and keeps working when storage is blocked", async () => {
      blockStorage();
      const { Tuner, Mic } = await load();
      expect(Mic.floor()).toBeCloseTo(0.001, 9);
      render(<Tuner onExit={() => {}} />);
      await settle();
      fireEvent.click(gear());
      setSlider(-70);
      expect(slider().value).toBe("-70");
      signal = tone(110);
      run(400);
      expect(reading()).toBe("A2");
    });
  });
});
