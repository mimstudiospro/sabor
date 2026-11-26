import { renderReviewMarkdown } from "../lib/reviews";

/** A review body, rendered from Markdown. The HTML always goes
 * through DOMPurify (see renderReviewMarkdown) — never raw. */
export default function ReviewBody({ bodyMarkdown }: { bodyMarkdown: string }) {
  return (
    <div
      className="review-body"
      dangerouslySetInnerHTML={{ __html: renderReviewMarkdown(bodyMarkdown) }}
    />
  );
}
