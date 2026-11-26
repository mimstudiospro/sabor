import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync(new URL("../../supabase/schema.sql", import.meta.url), "utf8");
const addSql = readFileSync(new URL("../../supabase/add-sabor-reviews.sql", import.meta.url), "utf8");

describe("supabase/schema.sql", () => {
  it("add-sabor-reviews.sql is the same SQL as schema.sql (bodies identical, headers differ)", () => {
    // Strip comment lines: the two files differ only in their headers.
    const stripComments = (text: string): string =>
      text
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim();
    expect(stripComments(addSql)).toBe(stripComments(sql));
    // No email address may ever appear in either file.
    expect(addSql).not.toMatch(/@/);
    expect(sql).not.toMatch(/@/);
  });

  it("creates the sabor_reviews table — and nothing else", () => {
    expect(sql).toMatch(/create table if not exists public\.sabor_reviews/i);
    expect(sql).not.toMatch(/create table if not exists public\.articles/i);
    expect(sql).not.toMatch(/create table if not exists public\.admins/i);
  });

  it("enforces the review shape: type, half-step rating 1–5, price, slug, one body", () => {
    expect(sql).toMatch(/place_type in \('restaurant', 'experience', 'discovery', 'recommendation'\)/i);
    expect(sql).toMatch(/rating >= 1 and rating <= 5 and rating \* 2 = floor\(rating \* 2\)/i);
    expect(sql).toMatch(/price_range is null or price_range in \('\$', '\$\$', '\$\$\$', '\$\$\$\$'\)/i);
    expect(sql).toMatch(/slug ~ '\^\[a-z0-9\]\+\(-\[a-z0-9\]\+\)\*\$'/i);
    expect(sql).toMatch(/char_length\(btrim\(body_en\)\) > 0 or char_length\(btrim\(body_es\)\) > 0/i);
    expect(sql).toMatch(/status in \('draft', 'published'\)/i);
  });

  it("enables RLS: public reads published rows only, writes owner-only via has_role", () => {
    expect(sql).toMatch(/alter table public\.sabor_reviews enable row level security/i);
    expect(sql).toMatch(/create policy "Anyone can read published reviews" on public\.sabor_reviews/i);
    expect(sql).toMatch(/for select to anon, authenticated using \(status = 'published'\)/i);
    expect(sql).toMatch(/create policy "Admins read all reviews" on public\.sabor_reviews/i);
    expect(sql).toMatch(/create policy "Admins write reviews" on public\.sabor_reviews/i);
    expect(sql).toMatch(/create policy "Admins update reviews" on public\.sabor_reviews/i);
    expect(sql).toMatch(/create policy "Admins delete reviews" on public\.sabor_reviews/i);
    expect(sql).toMatch(/for insert to authenticated with check \(public\.has_role\(auth\.uid\(\), 'admin'\)\)/i);
    expect(sql).toMatch(/grant select on public\.sabor_reviews to anon, authenticated/i);
    expect(sql).toMatch(/grant insert, update, delete on public\.sabor_reviews to authenticated/i);
  });

  it("keeps updated_at honest with a trigger", () => {
    expect(sql).toMatch(/create or replace function public\.sabor_set_updated_at\(\)/i);
    expect(sql).toMatch(/create trigger sabor_reviews_updated_at/i);
  });

  it("seeds zero reviews — the table starts empty on purpose", () => {
    expect(sql).not.toMatch(/insert into public\.sabor_reviews/i);
  });
});
