import { useState } from "react";
import {
  consumeOAuthReturn,
  signInWithGoogle,
  signInWithPassword,
} from "../lib/auth";
import { supabaseConfigured } from "../lib/supabase";
import { t } from "../lib/i18n";

/** Google "G" mark for the Continue with Google button. */
function GoogleMark() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.223 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

/**
 * Owner-only sign-in: there is no public sign-up on Sabor in v1 —
 * readers don't need accounts, and only the owner writes reviews.
 * The Write link only appears for the admin, and the server enforces
 * it regardless of what the UI shows.
 */
export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function goHome() {
    window.location.hash = consumeOAuthReturn() ?? "#/";
  }

  async function submit() {
    if (busy) return;
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signInWithPassword(email.trim(), password);
      goHome();
    } catch (e) {
      setError(e instanceof Error ? e.message : "That didn't go through — try again.");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    if (googleBusy) return;
    setGoogleBusy(true);
    setError(null);
    try {
      // On success the browser leaves for Google; nothing runs after.
      await signInWithGoogle();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Google sign-in failed — try again.");
    } finally {
      setGoogleBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-md pt-10 sm:pt-14">
      <h1 className="text-center text-4xl font-black tracking-tight">
        {t("signInHeading")}
      </h1>
      <p className="mt-3 text-center text-sm text-zinc-400">{t("signInSub")}</p>

      <button
        type="button"
        onClick={() => void google()}
        disabled={googleBusy || busy || !supabaseConfigured}
        className="mt-8 flex w-full items-center justify-center gap-3 rounded-full border border-line bg-panel-2 py-3 text-sm font-bold text-zinc-100 transition-colors hover:border-saffron/60 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <GoogleMark />
        {googleBusy ? "Opening Google…" : "Continue with Google"}
      </button>

      <div className="mt-5 flex items-center gap-3 text-xs text-zinc-500" aria-hidden="true">
        <span className="h-px flex-1 bg-line" />
        <span>or sign in with email</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <form
        className="mt-5 rounded-2xl border border-line bg-panel p-4 sm:p-5"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <label
          className="block text-xs font-bold uppercase tracking-[0.18em] text-zinc-400"
          htmlFor="signin-email"
        >
          Email
        </label>
        <input
          id="signin-email"
          type="email"
          autoComplete="email"
          value={email}
          disabled={busy || !supabaseConfigured}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-2 w-full rounded-xl border border-line bg-panel-2 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-saffron focus:outline-none disabled:opacity-50"
        />

        <label
          className="mt-4 block text-xs font-bold uppercase tracking-[0.18em] text-zinc-400"
          htmlFor="signin-password"
        >
          Password
        </label>
        <input
          id="signin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          disabled={busy || !supabaseConfigured}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          className="mt-2 w-full rounded-xl border border-line bg-panel-2 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-saffron focus:outline-none disabled:opacity-50"
        />

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-xl border border-red-500/50 bg-red-950 px-3 py-2 text-sm text-red-200"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || !supabaseConfigured}
          className="mt-5 w-full rounded-full bg-saffron py-3 text-sm font-black uppercase tracking-wide text-black transition-colors hover:bg-saffron-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Hold on…" : t("signIn")}
        </button>
        {!supabaseConfigured && (
          <p className="mt-3 text-center text-xs text-zinc-500">{t("notConnected")}</p>
        )}
      </form>
    </section>
  );
}
