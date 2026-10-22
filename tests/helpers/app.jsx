// Page-test helpers: open the app as the user does and tap what the user sees
import { render, screen, fireEvent, act } from "@testing-library/react";
import { vi } from "vitest";
import App from "../../src/App.jsx";

export const openApp = () => render(<App />);
export const button = (name) => screen.getByRole("button", { name });
export const tap = (name) => fireEvent.click(typeof name === "object" && name.nodeType ? name : button(name));
// A home-screen entry: its name is the entry's title followed by its description
export const entry = (title) => screen.getByRole("button", { name: (n) => n.startsWith(title) && !n.endsWith("speed game") });
export const openEntry = (title) => fireEvent.click(entry(title));
export const text = () => document.body.textContent;
export const wait = (ms) => act(() => { vi.advanceTimersByTime(ms); });
