/** Sabor is English-only: every UI string lives here, in English.
 * (Hiram, Nov 26 2026: the only sites with Spanish are CongHub and
 * Lang.) Nothing is machine-translated — the dictionary is the whole
 * UI copy, written once. */

export type DictKey =
  | "tagline"
  | "heroSub"
  | "latest"
  | "all"
  | "typeRestaurant"
  | "typeExperience"
  | "typeDiscovery"
  | "typeRecommendation"
  | "emptyReviews"
  | "loadingReviews"
  | "notConnected"
  | "rating"
  | "price"
  | "cuisine"
  | "area"
  | "backToReviews"
  | "signIn"
  | "signOut"
  | "write"
  | "reviews"
  | "footerLine"
  | "signInToWrite"
  | "ownerOnlyWrite"
  | "signInHeading"
  | "signInSub"
  | "writeHeading"
  | "editHeading"
  | "placeName"
  | "placeType"
  | "review"
  | "coverUrl"
  | "saveDraft"
  | "publish"
  | "unpublish"
  | "saveKeepPublished"
  | "deleteReview"
  | "deleteReviewConfirm"
  | "preview"
  | "backToWriting"
  | "yourReviews"
  | "draft"
  | "published"
  | "publishedLive"
  | "draftNote"
  | "noReviewHere"
  | "loadingEditor"
  | "notYourDesk"
  | "notYourDeskSub"
  | "noReviewsYet"
  | "viewLive";

export const COPY: Record<DictKey, string> = {
  tagline: "Food reviews from Fort Wayne",
  heroSub: "Restaurants, food experiences, culinary discoveries, and recommendations.",
  latest: "Latest reviews",
  all: "All",
  typeRestaurant: "Restaurants",
  typeExperience: "Experiences",
  typeDiscovery: "Discoveries",
  typeRecommendation: "Recommendations",
  emptyReviews: "No reviews yet — the first one is coming.",
  loadingReviews: "Loading the reviews…",
  notConnected: "Reviews open once the database is connected.",
  rating: "Rating",
  price: "Price",
  cuisine: "Cuisine",
  area: "Area",
  backToReviews: "← Back to the reviews",
  signIn: "Sign in",
  signOut: "Sign out",
  write: "Write",
  reviews: "Reviews",
  footerLine: "Food reviews from Fort Wayne.",
  signInToWrite: "Sign in to write.",
  ownerOnlyWrite: "Only the site owner writes reviews.",
  signInHeading: "Sign in",
  signInSub: "Sign in to write reviews. Only the site owner writes here.",
  writeHeading: "Write a review",
  editHeading: "Edit review",
  placeName: "Place name",
  placeType: "Type",
  review: "Review (Markdown)",
  coverUrl: "Cover image URL (optional)",
  saveDraft: "Save draft",
  publish: "Publish",
  unpublish: "Unpublish",
  saveKeepPublished: "Save & keep published",
  deleteReview: "Delete this review",
  deleteReviewConfirm: "Click again to delete for good",
  preview: "Preview",
  backToWriting: "Back to writing",
  yourReviews: "Your reviews",
  draft: "Draft",
  published: "Published",
  publishedLive: "Published —",
  draftNote: "Draft — nobody can see it yet.",
  noReviewHere: "No review here.",
  loadingEditor: "Loading the editor…",
  notYourDesk: "Not your desk.",
  notYourDeskSub: "Only the site owner writes reviews. Everyone else just reads.",
  noReviewsYet: "No reviews yet.",
  viewLive: "view it live",
};

export function t(key: DictKey): string {
  return COPY[key];
}
