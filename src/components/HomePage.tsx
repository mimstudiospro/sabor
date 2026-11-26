import { useState } from "react";
import type { PlaceType, ReviewRow } from "../lib/reviews";
import { PLACE_TYPES } from "../lib/reviews";
import { useLang } from "../lib/LanguageProvider";
import ReviewCard from "./ReviewCard";

type Filter = "all" | PlaceType;

export default function HomePage({
  reviews,
  loading,
  loadError,
  configured,
}: {
  reviews: ReviewRow[];
  loading: boolean;
  loadError: string | null;
  configured: boolean;
}) {
  const { t } = useLang();
  const [filter, setFilter] = useState<Filter>("all");

  const shown = filter === "all" ? reviews : reviews.filter((r) => r.place_type === filter);

  const filterLabel = (f: Filter): string => {
    if (f === "all") return t("all");
    if (f === "restaurant") return t("typeRestaurant");
    if (f === "experience") return t("typeExperience");
    if (f === "discovery") return t("typeDiscovery");
    return t("typeRecommendation");
  };

  return (
    <>
      <section className="pb-8 pt-10 text-center sm:pt-14">
        <h1 className="text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl">
          SA<span className="text-saffron">BOR</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-zinc-300">{t("tagline")}</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">{t("heroSub")}</p>
        {!configured && (
          <p className="mx-auto mt-5 max-w-md rounded-xl border border-line bg-panel px-4 py-3 text-sm text-zinc-300">
            {t("notConnected")}
          </p>
        )}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black tracking-tight text-white">{t("latest")}</h2>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t("latest")}>
          {(["all", ...PLACE_TYPES] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-wide transition-colors ${
                filter === f
                  ? "bg-saffron text-black"
                  : "border border-line text-zinc-300 hover:border-saffron"
              }`}
            >
              {filterLabel(f)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="py-16 text-center text-zinc-400">{t("loadingReviews")}</p>
      ) : loadError ? (
        <p role="alert" className="py-16 text-center text-red-300">
          {loadError}
        </p>
      ) : shown.length === 0 ? (
        <p className="py-16 text-center text-zinc-400">{t("emptyReviews")}</p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {shown.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </>
  );
}
