import { describe, expect, it } from "vitest";
import { DICT, readStoredLang, translate } from "../lib/i18n";

describe("dictionary completeness", () => {
  it("every key has a non-empty English and Spanish string", () => {
    for (const [key, value] of Object.entries(DICT)) {
      expect(value.en.trim().length, `${key} en`).toBeGreaterThan(0);
      expect(value.es.trim().length, `${key} es`).toBeGreaterThan(0);
    }
  });

  it("translates the tagline in both languages", () => {
    expect(translate("tagline", "en")).toBe("Food reviews from Fort Wayne");
    expect(translate("tagline", "es")).toBe("Reseñas de comida de Fort Wayne");
  });

  it("keeps the honest empty state in both languages", () => {
    expect(translate("emptyReviews", "en")).toBe("No reviews yet — the first one is coming.");
    expect(translate("emptyReviews", "es")).toBe("Aún no hay reseñas.");
  });
});

describe("stored language", () => {
  it("defaults to English without a DOM", () => {
    expect(readStoredLang()).toBe("en");
  });
});
