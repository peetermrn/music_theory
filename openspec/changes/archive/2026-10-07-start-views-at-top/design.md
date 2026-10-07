# Design

## Context

There is no router. `App.jsx` picks what to render from state (`ear`, `visuals`, `mode`, `done`, `n`), and `Ear.jsx` does the same for its own screens (`sel`, `done`, `n`). The scrolling element is the document itself: `html`, `body` and `#root` are `height: 100%` with no `overflow` set, and `.page` is `min-height: 100%`, so long screens scroll the window. Swapping the rendered screen never touches `window.scrollY`, which is why the new screen inherits the old one's depth (see proposal.md - Why).

## Goals / Non-Goals

**Goals:**
- One small, obvious mechanism per component, tied to "which screen is shown", so a screen added later gets the behaviour by being part of that key.

**Non-Goals:**
- A router, history entries or a shared navigation abstraction.
- Changing how the overlays (cheat sheet, "How it works", ear cheat sheet) scroll.

## Decisions

**A screen key plus a layout effect that scrolls the window to the top.** Each component derives a string naming the screen it is showing and runs `useLayoutEffect(() => { window.scrollTo(0, 0); }, [screen])`. The braces are required: see the risk on `scrollTo` returning a Promise below.
- `App`: `ear ? \`ear:${ear}\` : visuals ? "visuals" : !mode ? "home" : done ? "done" : \`q${n}\``. "Play again" and "Review mistakes" go from `done` to `q0`, so they also start at the top.
- `Ear`: `!sel ? "page" : done ? "done" : \`q${n}\``. App cannot see these screens, so Ear needs its own effect. Ear mounts fresh when opened, so its effect also covers the entry (App's effect does too; the second call is a no-op).
- `useLayoutEffect` rather than `useEffect`: it runs after the DOM is updated but before the browser paints, so the new screen is never drawn at the old depth for a frame.
- Alternatives considered:
  - *Remounting with a `key` on `<main>`*: does not reset the window's scroll, because the window is the scroller, not `<main>`.
  - *Calling `scrollTo` inside every navigation handler* (`setVisuals`, `setEar`, `start`, `next`, `home`, `begin`, `leave`, …): around ten call sites to keep in step, and easy to miss when a screen is added.
  - *One effect in App with a callback passed to Ear*: more plumbing than a second one-line effect.
  - *A shared `useScrollTop` hook in a new file*: two one-line uses do not justify a module; the line is duplicated instead.

**Home opens at the top too, rather than restoring its old position.** The request is that each new view starts at the top, and the home screen's sections are short enough that finding an entry again is quick. Restoring would need the position saved when leaving and replayed after the home screen renders. Left out (see proposal.md - Out of scope).

**Settings changes on a screen do not count as a new screen.** Visuals' dial, switches and positions, the home tick boxes, Ear's custom ticks and answering a question change state but not the screen key, so nothing scrolls. This matches the spec scenarios for the Visuals page and the overlays.

## Risks / Trade-offs

- [Newer browsers return a Promise from `scrollTo`; an effect written as `() => window.scrollTo(0, 0)` hands it to React as the cleanup, React calls it on the next screen change and throws "is not a function", blanking every page after the home screen] → the effect body is wrapped in braces so it returns nothing. Found after release: the first version shipped without braces, was reverted, and was reapplied with them; tests had passed because the test browser's `scrollTo` still returned `undefined`.
- [Speed games change `n` every few hundred milliseconds, so the effect runs on every question] → the page is already at the top there; `scrollTo(0, 0)` at the top does nothing visible and costs nothing measurable.
- [A future screen is added without being reflected in the screen key] → it would inherit the scroll position again. Mitigated by keeping the key next to the render branches it mirrors, with a comment saying so.
- [Ear's screen key and App's both fire when entering an exercise] → harmless double call, both to the top.

## Migration Plan

None. No stored data or settings change; reverting the two effects restores the old behaviour.
