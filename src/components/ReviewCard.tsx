import type { PlaceType, ReviewRow } from "../lib/reviews";
import type { Lang } from "../lib/i18n";
import { useLang } from "../lib/LanguageProvider";
import Stars from "./Stars";

function typeLabel(type: PlaceType | string, lang: Lang): string {
  switch (type) {
    case "restaurant":
      return lang === "es" ? "Restaurante" : "Restaurant";
    case "experience":
      return lang === "es" ? "Experiencia" : "Experience";
    case "discovery":
      return lang === "es" ? "Descubrimiento" : "Discovery";
    case "recommendation":
      return lang === "es" ? "Recomendación" : "Recommendation";
    default:
      return type;
  }
}

export default function ReviewCard({ review }: { review: ReviewRow }) {
  const { lang } = useLang();
  const meta = [review.cuisine, review.area, review.price_range]
    .filter((part): part is string => Boolean(part))
    .join(" · ");
  return (
    <a
      href={`#/review/${review.slug}`}
      className="rise block overflow-hidden rounded-2xl border border-line bg-panel transition-colors hover:border-saffron/60"
    >
      {review.cover_image_url && (
        <img
          src={review.cover_image_url}
          alt=""
          className="aspect-[16/9] w-full object-cover"
          loading="lazy"
        />
      )}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-panel-2 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-saffron">
            {typeLabel(review.place_type, lang)}
          </span>
          <Stars rating={review.rating} />
        </div>
        <h3 className="mt-3 text-xl font-black tracking-tight text-white">
          {review.place_name}
        </h3>
        {meta && <p className="mt-1 text-sm text-zinc-400">{meta}</p>}
      </div>
    </a>
  );
}
