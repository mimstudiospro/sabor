import { describe, expect, it } from "vitest";
import {
  formatReviewDate,
  isValidRating,
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

  it("requires an English body", () => {
    expect(validateReview(values({ body_en: "  " }))).toBe("errorBody");
    expect(validateReview(values({ body_en: "Great tacos." }))).toBeNull();
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

  it("explains each problem in English", () => {
    expect(validationMessage("errorRating")).toMatch(/1 to 5/);
    expect(validationMessage("errorBody")).toMatch(/Write the review/);
    expect(validationMessage("no-such-key")).toBe("no-such-key");
  });
});

describe("review rows", () => {
  it("carry a single English body", () => {
    const r = row({});
    expect(r.body_en).toBe("Great tacos.");
    expect("body_es" in r).toBe(false);
  });
});

describe("renderReviewMarkdown", () => {
  it("returns empty without a DOM (node test env)", () => {
    expect(renderReviewMarkdown("# Hello")).toBe("");
  });
});

describe("formatReviewDate", () => {
  it("formats in English and returns empty for garbage", () => {
    expect(formatReviewDate("2026-11-26T12:00:00.000Z")).toBe("Nov 26, 2026");
    expect(formatReviewDate("not a date")).toBe("");
    expect(formatReviewDate(null)).toBe("");
  });
});
