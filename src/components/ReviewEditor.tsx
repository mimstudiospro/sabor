import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  PLACE_TYPES,
  PRICE_RANGES,
  deleteReview,
  fetchAdminReview,
  fetchAdminReviews,
  saveReview,
  slugify,
  validateReview,
  validationMessage,
} from "../lib/reviews";
import type { PlaceType, ReviewRow } from "../lib/reviews";
import { t } from "../lib/i18n";
import ReviewBody from "./ReviewBody";

const inputClass =
  "mt-2 w-full rounded-xl border border-line bg-panel-2 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-saffron focus:outline-none disabled:opacity-50";
const labelClass =
  "block text-xs font-bold uppercase tracking-[0.18em] text-zinc-400";

/** Owner-only editor. The route is hidden from the header unless the
 * signed-in user is an admin, and the save itself is rejected by RLS
 * for anyone else — the UI gate is convenience, not the enforcement. */
export default function ReviewEditor({
  reviewId,
  user,
  isAdmin,
}: {
  reviewId: string | null;
  user: User | null;
  isAdmin: boolean;
}) {
  const [existing, setExisting] = useState<ReviewRow | null>(null);
  const [mine, setMine] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(reviewId !== null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [placeName, setPlaceName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [placeType, setPlaceType] = useState<PlaceType>("restaurant");
  const [cuisine, setCuisine] = useState("");
  const [area, setArea] = useState("");
  const [rating, setRating] = useState(4);
  const [priceRange, setPriceRange] = useState("");
  const [bodyEn, setBodyEn] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [preview, setPreview] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user || !isAdmin) return;
    if (reviewId) {
      setLoading(true);
      fetchAdminReview(reviewId)
        .then((row) => {
          if (row) {
            setExisting(row);
            setPlaceName(row.place_name);
            setSlug(row.slug);
            setSlugTouched(true);
            setPlaceType((row.place_type as PlaceType) ?? "restaurant");
            setCuisine(row.cuisine ?? "");
            setArea(row.area ?? "");
            setRating(row.rating);
            setPriceRange(row.price_range ?? "");
            setBodyEn(row.body_en);
            setCoverUrl(row.cover_image_url ?? "");
          }
        })
        .catch((e: unknown) => {
          setLoadError(e instanceof Error ? e.message : "Failed to load the review");
        })
        .finally(() => setLoading(false));
    } else {
      fetchAdminReviews()
        .then(setMine)
        .catch(() => setMine([]));
    }
  }, [reviewId, user, isAdmin]);

  if (!user) {
    return (
      <div className="py-16 text-center">
        <p className="text-xl font-black tracking-tight text-white">{t("signInToWrite")}</p>
        <p className="mt-2 text-sm text-zinc-400">{t("ownerOnlyWrite")}</p>
        <a
          href="#/signin"
          className="mt-6 inline-block rounded-full bg-saffron px-6 py-2 text-sm font-black uppercase tracking-wide text-black hover:bg-saffron-deep"
        >
          {t("signIn")}
        </a>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="py-16 text-center">
        <p className="text-xl font-black tracking-tight text-white">{t("notYourDesk")}</p>
        <p className="mt-2 text-sm text-zinc-400">{t("notYourDeskSub")}</p>
        <a
          href="#/"
          className="mt-6 inline-block rounded-full border border-line px-5 py-2 text-sm font-bold text-zinc-200 hover:border-saffron"
        >
          {t("backToReviews")}
        </a>
      </div>
    );
  }

  if (loading) {
    return <p className="py-16 text-center text-zinc-400">{t("loadingEditor")}</p>;
  }

  if (loadError) {
    return (
      <p role="alert" className="py-16 text-center text-red-300">
        {loadError}
      </p>
    );
  }

  if (reviewId && !existing) {
    return (
      <div className="py-16 text-center">
        <p className="text-xl font-black tracking-tight text-white">{t("noReviewHere")}</p>
        <a
          href="#/write"
          className="mt-6 inline-block rounded-full border border-line px-5 py-2 text-sm font-bold text-zinc-200 hover:border-saffron"
        >
          {t("writeHeading")}
        </a>
      </div>
    );
  }

  function onPlaceNameChange(value: string) {
    setPlaceName(value);
    if (!slugTouched) setSlug(slugify(value));
    setSaved(null);
  }

  async function save(publish: boolean) {
    if (saving || !user) return;
    const values = {
      slug: slug.trim(),
      place_name: placeName,
      place_type: placeType,
      cuisine,
      area,
      rating,
      price_range: priceRange,
      body_en: bodyEn,
      cover_image_url: coverUrl,
    };
    const problem = validateReview(values);
    if (problem) {
      setSaveError(validationMessage(problem));
      return;
    }
    setSaving(true);
    setSaveError(null);
    setSaved(null);
    try {
      const row = await saveReview({ ...values, id: reviewId, publish }, user.id);
      setSaved(publish ? t("published") : t("draft"));
      if (!reviewId) {
        window.location.hash = `#/write/${row.id}`;
      } else {
        setExisting(row);
      }
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Saving failed — try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!reviewId || deleting) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      await deleteReview(reviewId);
      window.location.hash = "#/write";
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Deleting failed — try again.");
      setConfirmDelete(false);
      setDeleting(false);
    }
  }

  const isPublished = existing?.status === "published";
  const typeLabel = (type: PlaceType): string => {
    if (type === "restaurant") return t("typeRestaurant");
    if (type === "experience") return t("typeExperience");
    if (type === "discovery") return t("typeDiscovery");
    return t("typeRecommendation");
  };

  return (
    <section className="mx-auto max-w-2xl pt-10 sm:pt-14">
      <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
        {reviewId ? t("editHeading") : t("writeHeading")}
      </h1>
      {existing && (
        <p className="mt-2 text-sm text-zinc-400">
          {isPublished ? (
            <>
              {t("publishedLive")}{" "}
              <a href={`#/review/${existing.slug}`} className="font-bold text-saffron hover:underline">
                {t("viewLive")}
              </a>
            </>
          ) : (
            t("draftNote")
          )}
        </p>
      )}

      <form
        className="mt-8 rounded-2xl border border-line bg-panel p-4 sm:p-5"
        onSubmit={(e) => {
          e.preventDefault();
          void save(false);
        }}
      >
        <label className={labelClass} htmlFor="review-place">
          {t("placeName")}
        </label>
        <input
          id="review-place"
          type="text"
          value={placeName}
          maxLength={120}
          disabled={saving}
          onChange={(e) => onPlaceNameChange(e.target.value)}
          placeholder="The name of the place"
          className={inputClass}
        />

        <label className={`${labelClass} mt-4`} htmlFor="review-slug">
          Slug
        </label>
        <input
          id="review-slug"
          type="text"
          value={slug}
          maxLength={80}
          disabled={saving}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugTouched(true);
          }}
          placeholder="the-place-name"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-zinc-500">The link: #/review/{slug || "your-slug"}</p>

        <span className={`${labelClass} mt-4`}>{t("placeType")}</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {PLACE_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setPlaceType(type)}
              aria-pressed={placeType === type}
              disabled={saving}
              className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-wide transition-colors ${
                placeType === type
                  ? "bg-saffron text-black"
                  : "border border-line text-zinc-300 hover:border-saffron"
              }`}
            >
              {typeLabel(type)}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="review-cuisine">
              {t("cuisine")}
            </label>
            <input
              id="review-cuisine"
              type="text"
              value={cuisine}
              disabled={saving}
              onChange={(e) => setCuisine(e.target.value)}
              placeholder="Mexican, Italian…"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="review-area">
              {t("area")}
            </label>
            <input
              id="review-area"
              type="text"
              value={area}
              disabled={saving}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Fort Wayne"
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="review-rating">
              {t("rating")} (1–5)
            </label>
            <input
              id="review-rating"
              type="number"
              min={1}
              max={5}
              step={0.5}
              value={rating}
              disabled={saving}
              onChange={(e) => setRating(Number(e.target.value))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="review-price">
              {t("price")}
            </label>
            <select
              id="review-price"
              value={priceRange}
              disabled={saving}
              onChange={(e) => setPriceRange(e.target.value)}
              className={inputClass}
            >
              <option value="">—</option>
              {PRICE_RANGES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-baseline justify-between">
          <label className={labelClass} htmlFor="review-body">
            {t("review")}
          </label>
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className="text-xs font-bold text-saffron hover:underline"
          >
            {preview ? t("backToWriting") : t("preview")}
          </button>
        </div>
        {preview ? (
          <div className="mt-2 rounded-xl border border-line bg-panel-2 px-3 py-2">
            {bodyEn.trim() ? (
              <ReviewBody bodyMarkdown={bodyEn} />
            ) : (
              <p className="text-sm text-zinc-500">{t("noReviewsYet")}</p>
            )}
          </div>
        ) : (
          <textarea
            id="review-body"
            value={bodyEn}
            rows={10}
            disabled={saving}
            onChange={(e) => {
              setBodyEn(e.target.value);
              setSaved(null);
            }}
            placeholder={"Write it in Markdown. # Headings, **bold**, [links](https://example.com)…"}
            className={`${inputClass} resize-y font-mono`}
          />
        )}

        <label className={`${labelClass} mt-4`} htmlFor="review-cover">
          {t("coverUrl")}
        </label>
        <input
          id="review-cover"
          type="url"
          value={coverUrl}
          disabled={saving}
          onChange={(e) => setCoverUrl(e.target.value)}
          placeholder="https://…"
          className={inputClass}
        />

        {saveError && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-red-500/50 bg-red-950 px-3 py-2 text-sm text-red-200"
          >
            {saveError}
          </p>
        )}
        {saved && !saveError && <p className="mt-4 text-sm text-saffron">{saved}</p>}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => void save(false)}
            disabled={saving}
            className="rounded-full border border-line px-6 py-3 text-sm font-black uppercase tracking-wide text-zinc-100 transition-colors hover:border-saffron disabled:opacity-50"
          >
            {saving ? "Saving…" : t("saveDraft")}
          </button>
          <button
            type="button"
            onClick={() => void save(true)}
            disabled={saving}
            className="rounded-full bg-saffron px-6 py-3 text-sm font-black uppercase tracking-wide text-black transition-colors hover:bg-saffron-deep disabled:opacity-50"
          >
            {saving ? "Saving…" : isPublished ? t("saveKeepPublished") : t("publish")}
          </button>
          {isPublished && (
            <button
              type="button"
              onClick={() => void save(false)}
              disabled={saving}
              className="rounded-full border border-line px-6 py-3 text-sm font-black uppercase tracking-wide text-zinc-100 transition-colors hover:border-saffron disabled:opacity-50"
            >
              {t("unpublish")}
            </button>
          )}
        </div>

        {reviewId && (
          <div className="mt-6 border-t border-line pt-4">
            <button
              type="button"
              onClick={() => void remove()}
              disabled={deleting}
              className="text-sm font-bold text-red-300 hover:underline disabled:opacity-50"
            >
              {confirmDelete ? t("deleteReviewConfirm") : t("deleteReview")}
            </button>
          </div>
        )}
      </form>

      {!reviewId && mine.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-black tracking-tight text-white">{t("yourReviews")}</h2>
          <ul className="mt-4 space-y-2">
            {mine.map((r) => (
              <li
                key={r.id}
                className="flex items-baseline justify-between gap-3 rounded-2xl border border-line bg-panel px-4 py-3"
              >
                <a href={`#/write/${r.id}`} className="font-bold text-zinc-100 hover:text-saffron">
                  {r.place_name || "(untitled)"}
                </a>
                <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-zinc-500">
                  {r.status === "published" ? t("published") : t("draft")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
