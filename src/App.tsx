import { useEffect, useState } from "react";
import { fetchPublishedReviews } from "./lib/reviews";
import type { ReviewRow } from "./lib/reviews";
import { consumeOAuthReturn, fetchIsAdmin, getDisplayName, signOut, useSession } from "./lib/auth";
import { parseHash } from "./lib/routes";
import type { Route } from "./lib/routes";
import { supabaseConfigured } from "./lib/supabase";
import { LANGS } from "./lib/i18n";
import type { Lang } from "./lib/i18n";
import { LanguageProvider, useLang } from "./lib/LanguageProvider";
import HomePage from "./components/HomePage";
import ReviewPage from "./components/ReviewPage";
import SignInPage from "./components/SignInPage";
import ReviewEditor from "./components/ReviewEditor";

function routeFromHash(): Route {
  return parseHash(window.location.hash);
}

function LanguageToggle() {
  const { lang, setLang } = useLang();
  return (
    <span className="flex items-center rounded-full border border-line p-0.5" role="group" aria-label="Language / Idioma">
      {LANGS.map((code: Lang) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`rounded-full px-2.5 py-1 text-xs font-black uppercase tracking-wide transition-colors ${
            lang === code ? "bg-saffron text-black" : "text-zinc-300 hover:text-saffron"
          }`}
        >
          {code}
        </button>
      ))}
    </span>
  );
}

function Shell() {
  const [route, setRoute] = useState<Route>(routeFromHash);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { user } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const { t } = useLang();

  useEffect(() => {
    const onHash = () => {
      setRoute(routeFromHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchPublishedReviews()
      .then((all) => {
        if (!cancelled) setReviews(all);
      })
      .catch((e: unknown) => {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "Failed to load reviews");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // After a Google OAuth callback lands on the bare origin (no hash),
  // take the user back to the page they were on when they clicked
  // "Continue with Google" — or home when there was none. Only when
  // the URL has no hash: a stale key from an abandoned attempt must
  // not yank the user away from wherever they are.
  useEffect(() => {
    if (!user) return;
    const hash = window.location.hash;
    if (hash && hash !== "#/" && hash !== "#/signin") return;
    const backTo = consumeOAuthReturn();
    if (backTo && backTo !== hash) {
      window.location.hash = backTo;
    }
  }, [user]);

  // Admin status is a UI convenience only — RLS enforces review
  // writes server-side regardless of what the header shows.
  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setIsAdmin(false);
      return;
    }
    void fetchIsAdmin(user?.id ?? null).then((admin) => {
      if (!cancelled) setIsAdmin(admin);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-canvas text-zinc-100">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4">
          <a href="#/" className="flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight">
              SA<span className="text-saffron">BOR</span>
            </span>
          </a>
          <nav className="flex items-center gap-4 text-sm font-bold">
            <a href="#/" className="text-zinc-300 hover:text-saffron">
              {t("reviews")}
            </a>
            {isAdmin && (
              <a href="#/write" className="text-zinc-300 hover:text-saffron">
                {t("write")}
              </a>
            )}
            {user ? (
              <>
                <span className="hidden max-w-40 truncate text-xs text-zinc-500 sm:block" title={user.email}>
                  {getDisplayName(user)}
                </span>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="text-zinc-300 hover:text-saffron"
                >
                  {t("signOut")}
                </button>
              </>
            ) : (
              <a href="#/signin" className="text-zinc-300 hover:text-saffron">
                {t("signIn")}
              </a>
            )}
            <LanguageToggle />
          </nav>
          <span className="hidden w-full text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 lg:block">
            {t("tagline")}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16">
        {route.view === "review" ? (
          <ReviewPage slug={route.slug} />
        ) : route.view === "signin" ? (
          <SignInPage />
        ) : route.view === "write" || route.view === "write-edit" ? (
          <ReviewEditor
            reviewId={route.view === "write-edit" ? route.id : null}
            user={user}
            isAdmin={isAdmin}
          />
        ) : (
          <HomePage
            reviews={reviews}
            loading={loading}
            loadError={loadError}
            configured={supabaseConfigured}
          />
        )}
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-zinc-500 sm:flex-row">
          <span>
            <span className="font-black text-zinc-300">Sabor</span> — {t("footerLine")}
          </span>
          <span>© {new Date().getFullYear()} Sabor</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <Shell />
    </LanguageProvider>
  );
}
