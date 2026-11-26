import { describe, expect, it } from "vitest";
import {
  formatReviewDate,
  isValidRating,
  pickBody,
  renderReviewMarkdown,
  slugify,
  validateReview,
  validationMessage,
} from "../lib/reviews";
import type { ReviewFormValues, ReviewRow } from "../lib/reviews";

function row(partial: Partial<ReviewRow>): ReviewRow {
  return {
    id: "00000000-0000-4000-8000-000000000000",
    slug: "cafe-ole",
    place_name: "Café Olé",
    place_type: "restaurant",
    cuisine: "Mexican",
    area: "Fort Wayne",
    rating: 4.5,
    price_range: "$$",
    body_en: "Great tacos.",
    body_es: "Tacos buenísimos.",
    cover_image_url: null,
    status: "published",
    author_id: null,
    published_at: "2026-11-26T12:00:00.000Z",
    created_at: "2026-11-26T12:00:00.000Z",
    updated_at: "2026-11-26T12:00:00.000Z",
    ...partial,
  };
}

function values(partial: Partial<ReviewFormValues>): ReviewFormValues {
  return {
    slug: "cafe-ole",
    place_name: "Café Olé",
    place_type: "restaurant",
    cuisine: "Mexican",
    area: "Fort Wayne",
    rating: 4.5,
    price_range: "$$",
    body_en: "Great tacos.",
    body_es: "Tacos buenísimos.",
    cover_image_url: "",
    ...partial,
  };
}

describe("slugify", () => {
  it("lowercases, strips accents, and joins words with hyphens", () => {
    expect(slugify("Café Olé")).toBe("cafe-ole");
    expect(slugify("  Taqueria El Camino  ")).toBe("taqueria-el-camino");
    expect(slugify("")).toBe("untitled");
  });
});

describe("ratings", () => {
  it("accepts 1–5 in half steps only", () => {
    for (const good of [1, 1.5, 2, 3.5, 4.5, 5]) {
      expect(isValidRating(good), String(good)).toBe(true);
    }
    for (const bad of [0, 0.5, 5.5, 6, 4.3, Number.NaN]) {
      expect(isValidRating(bad), String(bad)).toBe(false);
    }
  });

  it("rejects an out-of-range or non-half rating in validation", () => {
    expect(validateReview(values({ rating: 4.3 }))).toBe("errorRating");
    expect(validateReview(values({ rating: 0 }))).toBe("errorRating");
    expect(validateReview(values({ rating: 5 }))).toBeNull();
  });
});

describe("validateReview", () => {
  it("accepts a complete review", () => {
    expect(validateReview(values({}))).toBeNull();
  });

  it("requires at least one language body", () => {
    expect(validateReview(values({ body_en: "  ", body_es: "" }))).toBe("errorBody");
    expect(validateReview(values({ body_en: "", body_es: "Bueno." }))).toBeNull();
  });

  it("rejects a bad slug, a missing place name, and a bad cover URL", () => {
    expect(validateReview(values({ slug: "Café Olé" }))).toBe("errorSlug");
    expect(validateReview(values({ place_name: "   " }))).toBe("errorPlaceName");
    expect(validateReview(values({ cover_image_url: "http://example.com/x.jpg" }))).toBe(
      "errorCover",
    );
    expect(validateReview(values({ cover_image_url: "not a url" }))).toBe("errorCover");
  });

  it("rejects an unknown price range", () => {
    expect(validateReview(values({ price_range: "$$$$$" }))).toBe("errorPrice");
    expect(validateReview(values({ price_range: "" }))).toBeNull();
  });

  it("explains each problem in both languages", () => {
    expect(validationMessage("errorRating", "en")).toMatch(/1 to 5/);
    expect(validationMessage("errorRating", "es")).toMatch(/1 a 5/);
    expect(validationMessage("errorBody", "es")).toMatch(/inglés/);
  });
});

describe("pickBody — bilingual fallback", () => {
  it("shows the reader's language when it exists", () => {
    expect(pickBody(row({}), "en")).toEqual({ body: "Great tacos.", note: null });
    expect(pickBody(row({}), "es")).toEqual({ body: "Tacos buenísimos.", note: null });
  });

  it("falls back to the other language with a note, never inventing copy", () => {
    expect(pickBody(row({ body_es: "  " }), "es")).toEqual({
      body: "Great tacos.",
      note: "onlyEn",
    });
    expect(pickBody(row({ body_en: "" }), "en")).toEqual({
      body: "Tacos buenísimos.",
      note: "onlyEs",
    });
  });

  it("returns null when the review has no body at all", () => {
    expect(pickBody(row({ body_en: "", body_es: " " }), "en")).toBeNull();
  });
});

describe("renderReviewMarkdown", () => {
  it("returns empty without a DOM (node test env)", () => {
    expect(renderReviewMarkdown("# Hello")).toBe("");
  });
});

describe("formatReviewDate", () => {
  it("formats in English and Spanish and returns empty for garbage", () => {
    expect(formatReviewDate("2026-11-26T12:00:00.000Z", "en")).toBe("Nov 26, 2026");
    expect(formatReviewDate("2026-11-26T12:00:00.000Z", "es")).toMatch(/26/);
    expect(formatReviewDate("not a date", "en")).toBe("");
    expect(formatReviewDate(null, "en")).toBe("");
  });
});
