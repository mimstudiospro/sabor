-- ================= Sabor — schema (canonical copy) =================
--
-- Run ONCE in the MAIN mimstudiospro project's SQL editor (Lovable Cloud:
-- Database > Manage > SQL editor). Do NOT run this on any other project.
-- Idempotent: safe to run again (CREATE IF NOT EXISTS,
-- DROP POLICY IF EXISTS, CREATE OR REPLACE).
--
-- What this does: creates public.sabor_reviews, the table behind
-- sabor.mimstudiospro.com — Hiram's food review site for Fort Wayne.
-- Reviews are written by the owner only (has_role admin, the same
-- gating the main site and GOAT Debate use); everyone else reads
-- published rows only. Reviews carry one English body (body_en).
-- Sabor is English-only (Hiram, Nov 26 2026: the only sites with
-- Spanish are CongHub and Lang).
--
-- What this does NOT do:
--   * It does NOT seed any reviews. The table starts empty on purpose:
--     Hiram writes the first real review from the site. No restaurant,
--     dish, rating, or photo is invented here.
--   * It does NOT create any SECURITY DEFINER function for reads:
--     there are no tokens to hide, so plain RLS is enough.
--   * It does NOT touch the shared articles table or any other site.
--
-- Prerequisites (must already exist in the main project — they do):
--   * public.user_roles + public.has_role (migration 0001)
--   * auth.users (Supabase Auth) — Hiram's account is already an admin.
--
-- This file's content is identical to supabase/schema.sql in this repo:
-- that file is the canonical copy for a fresh setup; this file is the
-- one to run in the main project's editor. Keep the two in sync.

-- 1. Table ---------------------------------------------------------------
create table if not exists public.sabor_reviews (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  place_name text not null,
  place_type text not null check (place_type in ('restaurant', 'experience', 'discovery', 'recommendation')),
  cuisine text,
  area text,
  rating numeric not null check (rating >= 1 and rating <= 5 and rating * 2 = floor(rating * 2)),
  price_range text check (price_range is null or price_range in ('$', '$$', '$$$', '$$$$')),
  body_en text not null default '',
  cover_image_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  author_id uuid references auth.users (id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sabor_reviews_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint sabor_reviews_place_name check (char_length(btrim(place_name)) between 1 and 120),
  constraint sabor_reviews_body_present check (char_length(btrim(body_en)) > 0)
);

create index if not exists sabor_reviews_status_idx on public.sabor_reviews (status, published_at desc);
create index if not exists sabor_reviews_place_type_idx on public.sabor_reviews (place_type);

-- Keep updated_at honest on every edit.
create or replace function public.sabor_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists sabor_reviews_updated_at on public.sabor_reviews;
create trigger sabor_reviews_updated_at
  before update on public.sabor_reviews
  for each row execute function public.sabor_set_updated_at();

-- 2. Row level security ----------------------------------------------------
alter table public.sabor_reviews enable row level security;

drop policy if exists "Anyone can read published reviews" on public.sabor_reviews;
create policy "Anyone can read published reviews" on public.sabor_reviews
  for select to anon, authenticated using (status = 'published');

drop policy if exists "Admins read all reviews" on public.sabor_reviews;
create policy "Admins read all reviews" on public.sabor_reviews
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins write reviews" on public.sabor_reviews;
create policy "Admins write reviews" on public.sabor_reviews
  for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins update reviews" on public.sabor_reviews;
create policy "Admins update reviews" on public.sabor_reviews
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins delete reviews" on public.sabor_reviews;
create policy "Admins delete reviews" on public.sabor_reviews
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- 3. Grants ---------------------------------------------------------------
-- Public read is limited by RLS to published rows; writes are
-- authenticated-only and gated by the admin policies above.
grant select on public.sabor_reviews to anon, authenticated;
grant insert, update, delete on public.sabor_reviews to authenticated;

-- Verification (run one at a time in the SQL editor):
-- select count(*) from public.sabor_reviews;        -- expect 0 (no seeded reviews)
-- select tablename, rowsecurity from pg_tables where schemaname = 'public' and tablename = 'sabor_reviews'; -- expect 1 row, rowsecurity true
-- select policyname from pg_policies where schemaname = 'public' and tablename = 'sabor_reviews'; -- expect: Anyone can read published reviews, Admins read all reviews, Admins write reviews, Admins update reviews, Admins delete reviews
-- select has_table_privilege('anon', 'public.sabor_reviews', 'SELECT'); -- expect true (public read of published rows via RLS)
