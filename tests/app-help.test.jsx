// @vitest-environment jsdom
// openspec/specs/app-help/spec.md
import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { openApp, openEntry, button } from "./helpers/app.jsx";

vi.mock("../src/audio.js", () => ({ play: vi.fn(() => Promise.resolve()), stop: vi.fn(), setVoice: vi.fn(), context: vi.fn() }));

const openHelp = () => { openApp(); fireEvent.click(button("How it works")); return document.querySelector(".sheet"); };
const help = () => document.querySelector(".sheet").textContent;
const headings = () => [...document.querySelectorAll(".sheet h3")].map((h) => h.textContent);
// The entries listed under a heading of the overlay: the bold names up to the next heading
function listed(title) {
  const names = [];
  let el = [...document.querySelectorAll(".sheet h3")].find((h) => h.textContent === title).nextElementSibling;
  for (; el && el.tagName !== "H3"; el = el.nextElementSibling) {
    for (const p of el.matches("p.how") ? [el] : el.querySelectorAll("p.how")) names.push([p.querySelector("b").textContent, p.querySelector("span").textContent]);
  }
  return names;
}
// Mode lists of the home screen sit in divs that hold their own h3
function modes(title) {
  const h = [...document.querySelectorAll(".sheet h3")].find((x) => x.textContent === title);
  return [...h.parentElement.querySelectorAll("p.how")].map((p) => [p.querySelector("b").textContent, p.querySelector("span").textContent]);
}
const names = (rows) => rows.map(([n]) => n);
// All the text under a heading of the overlay, up to the next heading
function under(title) {
  let el = [...document.querySelectorAll(".sheet h3")].find((h) => h.textContent === title).nextElementSibling, words = "";
  for (; el && el.tagName !== "H3"; el = el.nextElementSibling) words += el.textContent;
  return words;
}

describe("app-help", () => {
  describe("Requirement: Help access", () => {
    it("Scenario: Opening and closing", () => {
      localStorage.setItem("theory-quiz.best.chords", "6");
      openApp();
      fireEvent.click(screen.getByRole("checkbox", { name: "Pentatonic" }));
      const before = document.querySelector("main").innerHTML;
      fireEvent.click(button("How it works"));
      expect(screen.getByRole("heading", { name: "How it works" })).toBeTruthy();
      fireEvent.click(button("Close how it works"));
      expect(document.querySelector(".sheet")).toBeNull();
      expect(document.querySelector("main").innerHTML).toBe(before);
      expect(localStorage.getItem("theory-quiz.scales")).toBe("major-minor+pentatonic");
      expect(localStorage.getItem("theory-quiz.best.chords")).toBe("6");
    });

    it("closes by tapping outside the panel", () => {
      openHelp();
      fireEvent.click(document.querySelector(".overlay"));
      expect(document.querySelector(".sheet")).toBeNull();
    });

    it("Scenario: Not during a quiz", () => {
      openApp();
      openEntry("Notes");
      expect(screen.queryByRole("button", { name: "How it works" })).toBeNull();
      fireEvent.click(button("Quit"));
      fireEvent.click(button("Bass speed game"));
      expect(screen.queryByRole("button", { name: "How it works" })).toBeNull();
    });
  });

  describe("Requirement: Explains sessions and speed games", () => {
    it("Scenario: Normal session summary", () => {
      openHelp();
      expect(help()).toContain("answer 10 questions, each with four choices and no time limit");
      expect(help()).toContain("cheat sheet");
      expect(help()).toContain("review the questions you missed");
    });

    it("Scenario: Speed game summary", () => {
      openHelp();
      expect(help()).toContain("An endless game");
      expect(help()).toContain("You start with 5 hearts and lose one for a wrong answer or when time runs out");
      expect(help()).toContain("The time limit starts at 20 seconds and gets shorter with every correct answer");
      expect(help()).toContain("Your best score is saved on this device");
    });
  });

  describe("Requirement: Explains the scale selection", () => {
    it("Scenario: Scale selection summary", () => {
      openHelp();
      expect(help()).toContain("Choose which scales Notes, Scales and Mixed ask about: Major & minor, Pentatonic.");
    });
  });

  describe("Requirement: Lists every mode", () => {
    it("Scenario: Mode list", () => {
      openHelp();
      expect(names(modes("Keys"))).toEqual(["Notes", "Scales", "Chords", "Relatives", "Mixed"]);
      expect(names(modes("Memorize the fretboard"))).toEqual(["Guitar", "Bass"]);
      for (const [, desc] of [...modes("Keys"), ...modes("Memorize the fretboard")]) expect(desc.length).toBeGreaterThan(5);
    });

    it("uses the same descriptions as the home screen", () => {
      openHelp();
      for (const [name, desc] of modes("Keys")) {
        const home = [...document.querySelectorAll("main button.play")].find((b) => b.querySelector("strong").textContent === name);
        expect(home.querySelector("span").textContent).toBe(desc);
      }
    });

    it("Scenario: Ear training entry", () => {
      openHelp();
      expect(headings().indexOf("Ear training")).toBeGreaterThan(headings().indexOf("Play on guitar"));
      expect(names(listed("Ear training"))[0]).toBe("Interval training");
    });

    it("Scenario: Play on guitar entries", () => {
      openHelp();
      expect(headings().indexOf("Play on guitar")).toBe(headings().indexOf("Memorize the fretboard") + 1);
      expect(names(listed("Play on guitar"))).toEqual(["Key notes", "Fretboard notes", "Play it back", "Scale runs"]);
      for (const [, desc] of listed("Play on guitar")) expect(desc.length).toBeGreaterThan(5);
    });
  });

  describe("Requirement: Fits a phone", () => {
    it("Scenario: Narrow screen", () => {
      // layout is checked by hand; here: the overlay is one scrollable panel holding every section
      openHelp();
      expect(headings().at(-1)).toBe("Tools");
      expect(document.querySelector(".overlay .sheet")).not.toBeNull();
    });
  });

  describe("Requirement: Explains ear training", () => {
    it("Scenario: Ear training summary", () => {
      openHelp();
      expect(help()).toContain("Interval training has its own page with 6 levels");
      expect(help()).toContain("and Custom, where you tick the intervals to drill");
      expect(help()).toContain("Each question plays two notes, the lower one first, and you pick the interval from one choice per interval");
      expect(help()).toContain("Replay the notes together or one at a time");
      expect(help()).toContain("There is no speed game and no Review mistakes");
    });

    it("Scenario: Not described as four choices", () => {
      openHelp();
      const words = under("Ear training");
      expect(words).not.toContain("four choices");
      expect(words).toContain("10 questions with no time limit");
    });

    it("Scenario: Sounds and credits", () => {
      openHelp();
      expect(help()).toContain("The sound button switches between piano and acoustic guitar");
      expect(help()).toContain("tap any choice to hear it");
      expect(help()).toContain("Piano: Salamander Grand Piano");
      expect(help()).toContain("Acoustic guitar: tonejs-instruments");
    });
  });

  describe("Requirement: Explains chord training", () => {
    it("Scenario: Chord training summary", () => {
      openHelp();
      expect(help()).toContain("Chord training has its own page with 5 levels");
      expect(help()).toContain("Each question plays a chord one note at a time and then together, and you pick its type");
      expect(help()).toContain("Replay it one by one or together");
    });

    it("Scenario: Listed with the other exercises", () => {
      openHelp();
      expect(names(listed("Ear training"))).toEqual(["Interval training", "Chord training", "Degree training"]);
    });
  });

  describe("Requirement: Explains degree training", () => {
    it("Scenario: Degree training summary", () => {
      openHelp();
      expect(help()).toContain("Degree training has its own page with 4 levels and Custom");
      expect(help()).toContain("Each question plays a few chords to set a key, then one note, and you pick which degree of that key the note is");
      expect(help()).toContain("The key changes with every question");
      expect(help()).toContain("After answering, the key and the note are named");
    });

    it("Scenario: Listed with the other exercises", () => {
      openHelp();
      const [, , degree] = listed("Ear training");
      expect(degree[0]).toBe("Degree training");
      expect(degree[1]).toBeTruthy();
    });
  });

  describe("Requirement: Explains the Visuals page", () => {
    it("Scenario: Listed under Visuals", () => {
      openHelp();
      expect(headings().indexOf("Visuals")).toBe(headings().indexOf("Ear training") + 1);
      expect(listed("Visuals")).toEqual([["Circle & fretboard", "See a key's notes on a dial and on the neck"]]);
    });

    it("Scenario: Visuals summary", () => {
      openHelp();
      expect(help()).toContain("A page for looking, with no questions and no score");
      expect(help()).toContain("Turn the dial by dragging it, tapping a note or using the arrows, and the key changes");
      expect(help()).toContain("Major / Minor switches to the relative key, which uses the same notes");
      expect(help()).toContain("The fretboard below shows where the same key's notes are on guitar or bass");
    });

    it("Scenario: Pentatonic numbering", () => {
      openHelp();
      expect(help()).toContain("A pentatonic keeps its seven-note degree numbers here, so the note that Notes calls the 3rd note of A minor pentatonic is shown as 4");
    });

    it("Scenario: Positions summary", () => {
      openHelp();
      expect(help()).toContain("Pick a position to see one shape to practise");
      expect(help()).toContain("the five positions, and three notes per string");
    });

    it("Scenario: Not described as a session", () => {
      openHelp();
      expect(under("Visuals")).not.toMatch(/10 questions|speed game|Review mistakes/);
    });
  });

  describe("Requirement: Lists the tools", () => {
    it("Scenario: Tools listed", () => {
      openHelp();
      expect(headings().indexOf("Tools")).toBe(headings().indexOf("Visuals") + 1);
      expect(names(listed("Tools"))).toEqual(["Metronome", "Tuner"]);
      for (const [, desc] of listed("Tools")) expect(desc.length).toBeGreaterThan(5);
      expect(help()).toContain("with no questions and no score");
    });
  });

  describe("Requirement: Explains the tools", () => {
    it("explains the metronome", () => {
      openHelp();
      expect(help()).toContain("The metronome starts at 100 BPM");
      expect(help()).toContain("Change the tempo by 1 or 10");
      expect(help()).toContain("The first beat of every bar has a higher click");
      expect(help()).toContain("it stops when you leave the page");
    });

    it("Scenario: Microphone explained", () => {
      openHelp();
      expect(help()).toContain("The tuner listens through the microphone");
      expect(help()).toContain("Choose Guitar or Bass");
      expect(help()).toContain("Manual names any note you play");
      expect(help()).toContain("Tap a string to hear its note and tune only that string");
      expect(help()).toContain("The microphone is only used while the Tuner page is open");
    });
  });

  describe("Requirement: Explains Play on guitar", () => {
    it("Scenario: Play on guitar summary", () => {
      openHelp();
      expect(help()).toContain("Answer on your guitar: the app listens through the microphone");
      expect(help()).toContain("Play a note twice in a row to give it as your answer; a note played once is only searching");
      expect(help()).toContain("Key notes takes the note in any octave; Fretboard notes and Play it back need the exact pitch");
      expect(help()).toContain("only a right first answer scores");
      expect(help()).toContain("Show me reveals the answer, with its place on the neck, and counts the question as missed");
      expect(help()).toContain("The app hears the pitch, not the string");
    });
  });

  describe("Requirement: Explains microphone sensitivity", () => {
    it("Scenario: Sensitivity explained", () => {
      openHelp();
      const said = help().split("adjust the microphone sensitivity with ⚙");
      // once in the Play on guitar explanation and once in the Tuner's
      expect(said).toHaveLength(3);
      expect(said[0]).toContain("Answer on your guitar");
      expect(said[1]).toContain("The tuner listens");
    });
  });

  describe("Requirement: Explains Scale runs", () => {
    it("Scenario: Scale runs summary", () => {
      openHelp();
      expect(help()).toContain("A run plays every note of one position from its lowest note to its highest and back down, heard through the microphone");
      expect(help()).toContain("The right next note counts with one pluck; any other note is a mistake");
      expect(help()).toContain("A first run shows the shape with each note lighting up as you play it; after that the run is from memory");
      expect(help()).toContain("A clean run, with no mistakes and no Show me, fills in the map");
      expect(help()).toContain("A known position comes back as due after a week");
      expect(help()).toContain("the string is not checked, only the pitch");
    });
  });
});
