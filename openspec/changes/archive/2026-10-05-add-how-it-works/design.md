# Design

## Context

`src/App.jsx` already has everything the help needs to describe: `SECTIONS` holds each mode's name and one-line description, `SPEED` holds the hearts and starting time, `TOTAL` the session length, and `GROUPS` (from `src/theory.js`) the scale groups. The cheat sheet is an `.overlay` with a `.sheet` panel that closes on ✕ or an outside tap.

## Goals / Non-Goals

**Goals:**
- A help overlay that needs no upkeep when modes or tuning values change.

**Non-Goals:**
- No new overlay mechanics, routing or stored "seen it" flag.

## Decisions

**Reuse the cheat sheet's overlay.** The help is a second panel using the same `.overlay` and `.sheet` classes and the same close behaviour. Alternative considered: a separate help screen, rejected because it adds navigation for one page of text.

**Numbers and lists come from data; sentences are hand-written.** The session length, hearts and starting time are read from `TOTAL` and `SPEED`. The mode list is rendered from `SECTIONS` under its two headings, and the scale names from `GROUPS`. Only the three short explanatory paragraphs are fixed text. Alternative considered: fully hand-written help, rejected because it would go stale with the next mode.

**Which modes follow the tick boxes is stated from `SCALED`.** The help names the modes in that list, so the sentence stays true if another mode starts following the selection.

**The button is a round "?" in the top right corner of the home screen**, at least 44px, with the accessible name "How it works". It sits level with the top of the page, clear of the title. Alternative considered: a text link under the subtitle, rejected because it pushes the mode cards further down.

**Open state is one boolean in `App`**, like `cheat`. It is only reachable from the home screen, so it needs no reset when a session starts.

## Risks / Trade-offs

- [The overlay grows as modes are added and may need scrolling] → The `.sheet` panel already scrolls. One line per mode keeps it short.
- [The fixed paragraphs can still go stale if session rules change] → They describe behaviour that is fixed in the specs; a change to those rules touches this text in the same change.
