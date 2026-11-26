/** The site is fully bilingual: every string lives here in English
 * and Spanish. Nothing is machine-translated — the dictionary is the
 * whole UI copy, written once in each language. */

export type Lang = "en" | "es";

export const LANGS: Lang[] = ["en", "es"];

const STORAGE_KEY = "sabor-lang";

export function readStoredLang(): Lang {
  if (typeof window === "undefined") return "en";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "es" || stored === "en") return stored;
  } catch {
    // Storage unavailable — English is the fallback.
  }
  return "en";
}

export function storeLang(lang: Lang): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Storage unavailable — the choice just doesn't persist.
  }
}

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
  | "onlyEn"
  | "onlyEs"
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
  | "reviewEn"
  | "reviewEs"
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

export const DICT: Record<DictKey, { en: string; es: string }> = {
  tagline: { en: "Food reviews from Fort Wayne", es: "Reseñas de comida de Fort Wayne" },
  heroSub: {
    en: "Restaurants, food experiences, culinary discoveries, and recommendations.",
    es: "Restaurantes, experiencias gastronómicas, descubrimientos culinarios y recomendaciones.",
  },
  latest: { en: "Latest reviews", es: "Reseñas recientes" },
  all: { en: "All", es: "Todo" },
  typeRestaurant: { en: "Restaurants", es: "Restaurantes" },
  typeExperience: { en: "Experiences", es: "Experiencias" },
  typeDiscovery: { en: "Discoveries", es: "Descubrimientos" },
  typeRecommendation: { en: "Recommendations", es: "Recomendaciones" },
  emptyReviews: {
    en: "No reviews yet — the first one is coming.",
    es: "Aún no hay reseñas.",
  },
  loadingReviews: { en: "Loading the reviews…", es: "Cargando las reseñas…" },
  notConnected: {
    en: "Reviews open once the database is connected.",
    es: "Las reseñas se activan cuando se conecte la base de datos.",
  },
  rating: { en: "Rating", es: "Calificación" },
  price: { en: "Price", es: "Precio" },
  cuisine: { en: "Cuisine", es: "Cocina" },
  area: { en: "Area", es: "Zona" },
  backToReviews: { en: "← Back to the reviews", es: "← Volver a las reseñas" },
  onlyEn: { en: "Available in English only", es: "Solo disponible en inglés" },
  onlyEs: { en: "Available in Spanish only", es: "Solo disponible en español" },
  signIn: { en: "Sign in", es: "Iniciar sesión" },
  signOut: { en: "Sign out", es: "Cerrar sesión" },
  write: { en: "Write", es: "Escribir" },
  reviews: { en: "Reviews", es: "Reseñas" },
  footerLine: {
    en: "Food reviews from Fort Wayne.",
    es: "Reseñas de comida de Fort Wayne.",
  },
  signInToWrite: { en: "Sign in to write.", es: "Inicia sesión para escribir." },
  ownerOnlyWrite: {
    en: "Only the site owner writes reviews.",
    es: "Solo el dueño del sitio escribe reseñas.",
  },
  signInHeading: { en: "Sign in", es: "Iniciar sesión" },
  signInSub: {
    en: "Sign in to write reviews. Only the site owner writes here.",
    es: "Inicia sesión para escribir reseñas. Solo el dueño del sitio escribe aquí.",
  },
  writeHeading: { en: "Write a review", es: "Escribe una reseña" },
  editHeading: { en: "Edit review", es: "Editar reseña" },
  placeName: { en: "Place name", es: "Nombre del lugar" },
  placeType: { en: "Type", es: "Tipo" },
  reviewEn: { en: "Review in English (Markdown)", es: "Reseña en inglés (Markdown)" },
  reviewEs: { en: "Review in Spanish (Markdown)", es: "Reseña en español (Markdown)" },
  coverUrl: {
    en: "Cover image URL (optional)",
    es: "URL de la imagen de portada (opcional)",
  },
  saveDraft: { en: "Save draft", es: "Guardar borrador" },
  publish: { en: "Publish", es: "Publicar" },
  unpublish: { en: "Unpublish", es: "Despublicar" },
  saveKeepPublished: { en: "Save & keep published", es: "Guardar y seguir publicado" },
  deleteReview: { en: "Delete this review", es: "Eliminar esta reseña" },
  deleteReviewConfirm: {
    en: "Click again to delete for good",
    es: "Haz clic de nuevo para eliminar definitivamente",
  },
  preview: { en: "Preview", es: "Vista previa" },
  backToWriting: { en: "Back to writing", es: "Volver a escribir" },
  yourReviews: { en: "Your reviews", es: "Tus reseñas" },
  draft: { en: "Draft", es: "Borrador" },
  published: { en: "Published", es: "Publicado" },
  publishedLive: { en: "Published —", es: "Publicado —" },
  draftNote: { en: "Draft — nobody can see it yet.", es: "Borrador — nadie puede verlo aún." },
  noReviewHere: { en: "No review here.", es: "No hay ninguna reseña aquí." },
  loadingEditor: { en: "Loading the editor…", es: "Cargando el editor…" },
  notYourDesk: { en: "Not your desk.", es: "No es tu lugar." },
  notYourDeskSub: {
    en: "Only the site owner writes reviews. Everyone else just reads.",
    es: "Solo el dueño del sitio escribe reseñas. Los demás solo leen.",
  },
  noReviewsYet: { en: "No reviews yet.", es: "Aún no hay reseñas." },
  viewLive: { en: "view it live", es: "verla en vivo" },
};

export function translate(key: DictKey, lang: Lang): string {
  return DICT[key][lang];
}
