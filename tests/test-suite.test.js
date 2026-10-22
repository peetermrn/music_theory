// openspec/specs/test-suite/spec.md
// Keeps the suite tied to the specs: every capability has a test file, and every requirement and
// scenario of its spec has a test of the same name.
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";

const root = process.cwd();
const read = (path) => readFileSync(`${root}/${path}`, "utf8");
const capabilities = readdirSync(`${root}/openspec/specs`, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
const testFile = (cap) => ["js", "jsx"].map((ext) => `tests/${cap}.test.${ext}`).find((f) => existsSync(`${root}/${f}`));

// A spec's requirements, each with its scenarios
function requirements(cap) {
  const reqs = [];
  for (const line of read(`openspec/specs/${cap}/spec.md`).split("\n")) {
    const req = line.match(/^### Requirement: (.+?)\s*$/);
    const scenario = line.match(/^#### Scenario: (.+?)\s*$/);
    if (req) reqs.push({ name: req[1], scenarios: [] });
    if (scenario) reqs.at(-1).scenarios.push(scenario[1]);
  }
  return reqs;
}
// The test file's block for a requirement: from its describe to the next requirement's
function block(source, req) {
  const start = source.indexOf(`describe("Requirement: ${req}"`);
  if (start < 0) return null;
  const next = source.indexOf('describe("Requirement: ', start + 1);
  return source.slice(start, next < 0 ? undefined : next);
}

describe("test-suite", () => {
  describe("Requirement: One command runs the suite", () => {
    it("Scenario: Passing suite", () => {
      const pkg = JSON.parse(read("package.json"));
      expect(pkg.scripts.test).toBe("vitest run");
      expect(existsSync(`${root}/vitest.config.js`)).toBe(true);
    });

    it("Scenario: Broken behaviour", () => {
      // a wrong G major is caught by a theory-questions test that names it
      expect(read("tests/theory-questions.test.js")).toContain('expect(scale("G", "major").join(" ")).toBe("G A B C D E F#")');
    });

    it("Scenario: Offline machine", () => {
      // no test reaches the network or a real device: sound, microphone and storage are fakes
      for (const f of readdirSync(`${root}/tests`).filter((f) => /\.test\.jsx?$/.test(f))) {
        expect(read(`tests/${f}`)).not.toMatch(/https?:\/\/(?!claude)/);
      }
    });
  });

  describe("Requirement: Tests follow the specs", () => {
    it("Scenario: A capability without tests", () => {
      expect(capabilities.length).toBeGreaterThan(0);
      for (const cap of capabilities) expect(testFile(cap), `tests/${cap}.test.js(x)`).toBeDefined();
    });

    it("Scenario: Finding the spec of a failing test", () => {
      for (const cap of capabilities) {
        const source = read(testFile(cap));
        expect(source, cap).toContain(`describe("${cap}", () => {`);
        for (const { name, scenarios } of requirements(cap)) {
          const tests = block(source, name);
          expect(tests, `${cap} > Requirement: ${name}`).not.toBeNull();
          for (const s of scenarios) expect(tests, `${cap} > ${name} > Scenario: ${s}`).toContain(`it("Scenario: ${s}"`);
        }
      }
    });
  });

  describe("Requirement: Tests stay out of the app", () => {
    it("Scenario: Building the app", () => {
      // the build starts from index.html and follows imports; nothing in the app imports test code or tools
      expect(read("index.html")).toContain('src="/src/main.jsx"');
      for (const f of readdirSync(`${root}/src`)) {
        expect(read(`src/${f}`), f).not.toMatch(/from ["'](\.\.\/tests|vitest|@testing-library|jsdom)/);
      }
      expect(read("vite.config.js")).not.toMatch(/vitest|tests\//);
      const pkg = JSON.parse(read("package.json"));
      for (const tool of ["vitest", "jsdom", "@testing-library/react", "@testing-library/dom"]) {
        expect(pkg.devDependencies[tool], tool).toBeDefined();
        expect(pkg.dependencies[tool], tool).toBeUndefined();
      }
    });
  });
});
