import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const indexHtml = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
const i18n = readFileSync(new URL("../lib/i18n.ts", import.meta.url), "utf8");
const home = readFileSync(new URL("../components/HomePage.tsx", import.meta.url), "utf8");
const readme = readFileSync(new URL("../../README.md", import.meta.url), "utf8");

describe("copy from Hiram's brief only", () => {
  it("uses the brief's line verbatim, in English", () => {
    expect(indexHtml).toContain("Food reviews from Fort Wayne");
    expect(i18n).toContain("Food reviews from Fort Wayne");
    expect(i18n).toContain("No reviews yet — the first one is coming.");
  });

  it("has no seeded reviews and no invented restaurant content", () => {
    // The home page renders only what the database returns; the
    // empty state is the only copy shown before Hiram writes.
    expect(home).toContain("emptyReviews");
    expect(i18n).not.toMatch(/Messi|Ronaldo|GOAT Debate/i);
  });
});

describe("English-only", () => {
  it("no Spanish copy anywhere in the app, the page, or the README", () => {
    for (const [name, text] of [
      ["index.html", indexHtml],
      ["i18n.ts", i18n],
      ["HomePage.tsx", home],
      ["README.md", readme],
    ]) {
      expect(text, name).not.toMatch(/Reseñas|español|Español/i);
      expect(text, name).not.toContain("Solo disponible");
    }
  });

  it("the copy module holds English strings only", () => {
    expect(i18n).not.toContain('es: "');
    expect(i18n).not.toContain("es: '");
    expect(i18n).toContain('export const COPY');
  });
});
