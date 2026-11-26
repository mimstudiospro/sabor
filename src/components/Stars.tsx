/** Star rating display: five stars with the filled portion clipped
 * to the rating, so halves render exactly (4.5 shows four and a half). */
export default function Stars({ rating }: { rating: number }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  return (
    <span className="inline-flex items-baseline gap-1.5" aria-label={`${rating} out of 5`}>
      <span className="relative inline-block leading-none whitespace-nowrap" aria-hidden="true">
        <span className="text-zinc-600">★★★★★</span>
        <span
          className="absolute inset-0 overflow-hidden whitespace-nowrap text-saffron"
          style={{ width: `${pct}%` }}
        >
          ★★★★★
        </span>
      </span>
      <span className="text-sm font-bold text-zinc-100">{rating.toFixed(1)} / 5</span>
    </span>
  );
}
