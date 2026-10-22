import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Kept apart from vite.config.js so the PWA plugin stays out of the tests.
// Logic tests run in node; a test file that renders a page asks for jsdom in its first line.
export default defineConfig({
  plugins: [react()],
  test: {
    include: ["tests/**/*.test.{js,jsx}"],
    setupFiles: ["tests/setup.js"],
  },
});
