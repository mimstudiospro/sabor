import DOMPurify from "dompurify";
import { marked } from "marked";
import { supabase, supabaseConfigured } from "./supabase";
import type { Lang } from "./i18n";

/** A food review: one place, rated, written in English and/or Spanish. */
export type PlaceType = "restaurant" | "experience" | "discovery" | "recommendation";

export const PLACE_TYPES: PlaceType[] = [
  "restaurant",
  "experience",
  "discovery",
  "recommendation",
];

export const PRICE_RANGES = ["$", "$$", "$$$", "$$$$"] as const;

export type ReviewRow = {
  id: string;
  slug: string;
  place_name: string;
  place_type: string;
  cuisine: string | null;
  area: string | null;
  rating: number;
  price_range: string | null;
  body_en: string;
  body_es: string;
  cover_image_url: string | null;
  status: string;
  author_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export const MAX_SLUG_LENGTH = 80;
export const MAX_PLACE_NAME_LENGTH = 120;

/**
 * URL slug from a place name: lowercase, words joined with hyphens,
 * accents stripped ("Café Olé" → "cafe-ole"). Falls back to
 * "untitled" when the name has no usable words.
 */
export function slugify(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, "");
  return slug || "untitled";
}

/** Ratings run 1–5 in half steps: 1, 1.5, 2, … 4.5, 5. */
export function isValidRating(value: number): boolean {
  return (
    Number.isFinite(value) &&
    value >= 1 &&
    value <= 5 &&
    Math.abs(value * 2 - Math.round(value * 2)) < 1e-9
  );
}

export interface ReviewFormValues {
  slug: string;
  place_name: string;
  place_type: PlaceType;
  cuisine: string;
  area: string;
  rating: number;
  price_range: string;
  body_en: string;
  body_es: string;
  cover_image_url: string;
}

/** Validate editor values against the `sabor_reviews` table
 * constraints. Returns a dictionary key for the first problem, or
 * null when the values are fine. */
export function validateReview(values: ReviewFormValues): string | null {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug) || values.slug.length > MAX_SLUG_LENGTH) {
    return "errorSlug";
  }
  const place = values.place_name.trim();
  if (place.length < 1 || place.length > MAX_PLACE_NAME_LENGTH) {
    return "errorPlaceName";
  }
  if (!PLACE_TYPES.includes(values.place_type)) {
    return "errorPlaceType";
  }
  if (!isValidRating(values.rating)) {
    return "errorRating";
  }
  if (values.price_range && !PRICE_RANGES.includes(values.price_range as (typeof PRICE_RANGES)[number])) {
    return "errorPrice";
  }
  const cover = values.cover_image_url.trim();
  if (cover) {
    try {
      if (new URL(cover).protocol !== "https:") {
        return "errorCover";
      }
    } catch {
      return "errorCover";
    }
  }
  if (values.body_en.trim().length === 0 && values.body_es.trim().length === 0) {
    return "errorBody";
  }
  return null;
}

/** Validation messages, in both languages. */
export const VALIDATION_MESSAGES: Record<string, { en: string; es: string }> = {
  errorSlug: {
    en: "Use lowercase letters, numbers, and hyphens for the slug.",
    es: "Usa minúsculas, números y guiones para el enlace.",
  },
  errorPlaceName: {
    en: "Give it a place name (up to 120 characters).",
    es: "Ponle el nombre del lugar (hasta 120 caracteres).",
  },
  errorPlaceType: {
    en: "Pick a type: restaurant, experience, discovery, or recommendation.",
    es: "Elige un tipo: restaurante, experiencia, descubrimiento o recomendación.",
  },
  errorRating: {
    en: "Give a rating from 1 to 5, in half steps.",
    es: "Pon una calificación de 1 a 5, en medios puntos.",
  },
  errorPrice: {
    en: "Pick a price range: $, $$, $$$ or $$$$.",
    es: "Elige un rango de precio: $, $$, $$$ o $$$$.",
  },
  errorCover: {
    en: "Use a secure https image URL for the cover.",
    es: "Usa una URL https válida para la portada.",
  },
  errorBody: {
    en: "Write the review in English, Spanish, or both.",
    es: "Escribe la reseña en inglés, en español o en ambos.",
  },
};

export function validationMessage(key: string, lang: Lang): string {
  return VALIDATION_MESSAGES[key]?.[lang] ?? key;
}

/**
 * The body to show a reader in their language, with the fallback
 * rule: if the review has no body in the reader's language, show the
 * other language with a note. Never machine-translate, never invent
 * copy — the note says plainly which language it is in.
 * Returns null when the review has no body at all.
 */
export function pickBody(
  review: ReviewRow,
  lang: Lang,
): { body: string; note: "onlyEn" | "onlyEs" | null } | null {
  const en = review.body_en.trim();
  const es = review.body_es.trim();
  if (lang === "en") {
    if (en) return { body: review.body_en, note: null };
    if (es) return { body: review.body_es, note: "onlyEs" };
    return null;
  }
  if (es) return { body: review.body_es, note: null };
  if (en) return { body: review.body_en, note: "onlyEn" };
  return null;
}

/**
 * Render review Markdown to HTML. The output ALWAYS goes through
 * DOMPurify — raw HTML in the body (script tags, javascript: links,
 * event handlers) is stripped before anything reaches the page.
 * Without a DOM (tests in a node environment) this returns "" — review
 * bodies only ever render in the browser, after the review is fetched,
 * so nothing is lost.
 */
export function renderReviewMarkdown(bodyMarkdown: string): string {
  if (typeof window === "undefined") return "";
  const raw = marked.parse(bodyMarkdown ?? "", { breaks: true });
  const html = typeof raw === "string" ? raw : "";
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}

/** Short date for listings: "Nov 26, 2026" / "26 nov 2026". */
export function formatReviewDate(iso: string | null | undefined, lang: Lang): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function requireClient() {
  if (!supabaseConfigured || !supabase) {
    throw new Error("Reviews are not connected yet");
  }
  return supabase;
}

/** Published reviews, newest first. Public read. */
export async function fetchPublishedReviews(): Promise<ReviewRow[]> {
  const client = requireClient();
  const { data, error } = await client
    .from("sabor_reviews")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ReviewRow[];
}

/** One published review by slug, or null. Public read. */
export async function fetchPublishedReview(slug: string): Promise<ReviewRow | null> {
  const client = requireClient();
  const { data, error } = await client
    .from("sabor_reviews")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as ReviewRow | null;
}

/** Every review, drafts included, newest-edited first. Admin only —
 * the RLS policy rejects anyone else. */
export async function fetchAdminReviews(): Promise<ReviewRow[]> {
  const client = requireClient();
  const { data, error } = await client
    .from("sabor_reviews")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ReviewRow[];
}

/** One review by id, draft or published. Admin only. */
export async function fetchAdminReview(id: string): Promise<ReviewRow | null> {
  const client = requireClient();
  const { data, error } = await client
    .from("sabor_reviews")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as ReviewRow | null;
}

export interface SaveReviewInput extends ReviewFormValues {
  /** Null for a new review; set when editing. */
  id: string | null;
  /** True when publishing now; false saves as draft. */
  publish: boolean;
}

/**
 * Insert or update a review. Publishing sets published_at (first
 * publish only); unpublishing clears it. The author is recorded from
 * the signed-in user. RLS rejects non-admins.
 */
export async function saveReview(input: SaveReviewInput, authorId: string): Promise<ReviewRow> {
  const client = requireClient();
  const values = {
    slug: input.slug.trim(),
    place_name: input.place_name.trim(),
    place_type: input.place_type,
    cuisine: input.cuisine.trim() || null,
    area: input.area.trim() || null,
    rating: input.rating,
    price_range: input.price_range || null,
    body_en: input.body_en,
    body_es: input.body_es,
    cover_image_url: input.cover_image_url.trim() || null,
    status: input.publish ? "published" : "draft",
    author_id: authorId,
    published_at: null as string | null,
  };
  if (input.publish) {
    if (input.id) {
      // Keep the original publish date when re-publishing an edit.
      const existing = await fetchAdminReview(input.id);
      values.published_at = existing?.published_at ?? new Date().toISOString();
    } else {
      values.published_at = new Date().toISOString();
    }
  }
  if (input.id) {
    const { data, error } = await client
      .from("sabor_reviews")
      .update(values)
      .eq("id", input.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return data as ReviewRow;
  }
  const { data, error } = await client.from("sabor_reviews").insert(values).select("*").single();
  if (error) throw new Error(error.message);
  return data as ReviewRow;
}

/** Delete a review. Admin only — RLS rejects anyone else. */
export async function deleteReview(id: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.from("sabor_reviews").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
