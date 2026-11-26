import { useEffect, useState } from "react";
import { fetchPublishedReview, formatReviewDate, pickBody } from "../lib/reviews";
import type { ReviewRow } from "../lib/reviews";
import { useLang } from "../lib/LanguageProvider";
import ReviewBody from "./ReviewBody";
import Stars from "./Stars";

export default function ReviewPage({ slug }: { slug: string }) {
  const { lang, t } = useLang();
  const [review, setReview] = useState<ReviewRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    void fetchPublishedReview(slug)
      .then((row) => {
        if (!cancelled) setReview(row);
      })
      .catch((e: unknown) => {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "Failed to load the review");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return <p className="py-16 text-center text-zinc-400">{t("loadingReviews")}</p>;
  }

  if (loadError) {
    return (
      <p role="alert" className="py-16 text-center text-red-300">
        {loadError}
      </p>
    );
  }

  if (!review) {
    return (
      <div className="py-16 text-center">
        <p className="text-xl font-black tracking-tight text-white">{t("noReviewHere")}</p>
        <a
          href="#/"
          className="mt-6 inline-block rounded-full border border-line px-5 py-2 text-sm font-bold text-zinc-200 hover:border-saffron"
        >
          {t("backToReviews")}
        </a>
      </div>
    );
  }

  const picked = pickBody(review, lang);
  const meta = [review.cuisine, review.area, review.price_range]
    .filter((part): part is string => Boolean(part))
    .join(" · ");

  return (
    <article className="mx-auto max-w-2xl pt-10 sm:pt-14">
      <a href="#/" className="text-sm font-bold text-saffron hover:underline">
        {t("backToReviews")}
      </a>
      {review.cover_image_url && (
        <img
          src={review.cover_image_url}
          alt=""
          className="mt-6 aspect-[16/9] w-full rounded-2xl border border-line object-cover"
        />
      )}
      <h1 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl">
        {review.place_name}
      </h1>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-400">
        <Stars rating={review.rating} />
        {meta && <span>{meta}</span>}
        <span>{formatReviewDate(review.published_at ?? review.created_at, lang)}</span>
      </div>
      {picked?.note && (
        <p className="mt-6 rounded-xl border border-line bg-panel px-4 py-3 text-sm text-zinc-300">
          {t(picked.note)}
        </p>
      )}
      {picked ? (
        <div className="mt-6">
          <ReviewBody bodyMarkdown={picked.body} />
        </div>
      ) : (
        <p className="mt-6 text-zinc-400">{t("emptyReviews")}</p>
      )}
    </article>
  );
}
