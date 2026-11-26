import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const indexHtml = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
const i18n = readFileSync(new URL("../lib/i18n.ts", import.meta.url), "utf8");
const home = readFileSync(new URL("../components/HomePage.tsx", import.meta.url), "utf8");

describe("copy from Hiram's brief only", () => {
  it("uses the brief's lines verbatim in both languages", () => {
    expect(indexHtml).toContain("Food reviews from Fort Wayne");
    expect(indexHtml).toContain("Reseñas de comida de Fort Wayne");
    expect(i18n).toContain("Food reviews from Fort Wayne");
    expect(i18n).toContain("Reseñas de comida de Fort Wayne");
    expect(i18n).toContain("No reviews yet — the first one is coming.");
    expect(i18n).toContain("Aún no hay reseñas.");
  });

  it("has no seeded reviews and no invented restaurant content", () => {
    // The home page renders only what the database returns; the
    // empty state is the only copy shown before Hiram writes.
    expect(home).toContain("emptyReviews");
    expect(i18n).not.toMatch(/Messi|Ronaldo|GOAT Debate/i);
  });
});
