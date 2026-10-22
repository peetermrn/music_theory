import { vi } from "vitest";

// Device storage that is blocked, as in a private window with site data off: every call throws
export function blockStorage() {
  const fail = () => { throw new DOMException("blocked", "SecurityError"); };
  vi.stubGlobal("localStorage", { getItem: fail, setItem: fail, removeItem: fail, clear: fail, key: fail, length: 0 });
}
