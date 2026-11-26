# Sabor

Food reviews from Fort Wayne. Reseñas de comida de Fort Wayne.

A food review site: restaurants, food experiences, culinary
discoveries, and recommendations — in English and Spanish. Reviews
are written by the owner, signed in; everyone else just reads.

## Stack

Vite + React 19 + TypeScript + Tailwind v4 (plain Vite SPA, hash
routing). Reviews live in Supabase (the main mimstudiospro.com
project) in the `sabor_reviews` table.

## Run

```sh
npm install
npm run dev
```

## Database

Apply `supabase/schema.sql` once in the main project's Lovable Cloud
SQL editor. It creates `sabor_reviews`, its RLS policies (public read
of published rows only; writes owner-only via `has_role`), and an
`updated_at` trigger. No reviews are seeded — the first one is
written from the site.

## Configure

Copy `.env.example` to `.env` and fill in the main project's values:

```sh
VITE_SUPABASE_URL=https://freqksgnswajwhfbubec.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
```

Without them the app still runs and shows the empty state, with
reviews disabled and a plain line saying reviews open once the
database is connected.

## Test

```sh
npm test
```
