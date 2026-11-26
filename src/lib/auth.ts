import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "./supabase";

/** The signed-in user, or null. Tracks auth state changes so the
 * header updates on sign-in and sign-out without a reload. */
export function useSession(): { user: User | null; loading: boolean } {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!cancelled) setUser(data.session?.user ?? null);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) setUser(session?.user ?? null);
    });
    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}

/** Sign in with email + password. Throws with the Supabase message. */
export async function signInWithPassword(email: string, password: string): Promise<void> {
  if (!supabaseConfigured || !supabase) {
    throw new Error("Sign-in is not connected yet");
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
}

/**
 * The name the app shows for the signed-in user: the display name
 * from their account, else the part of their email before the @.
 * The owner is the only account that signs in here.
 */
export function getDisplayName(user: User | null): string {
  if (!user) return "";
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const fromMeta = (value: unknown): string =>
    typeof value === "string" ? value.trim() : "";
  const name = fromMeta(meta["display_name"]) || fromMeta(meta["full_name"]);
  if (name) return name.slice(0, 40);
  if (user.email) {
    const local = user.email.split("@")[0] ?? "";
    if (local) return local.slice(0, 40);
  }
  return "";
}

/** sessionStorage key holding the hash route to return to after a Google OAuth callback. */
const OAUTH_RETURN_KEY = "sabor-oauth-return";

/**
 * Sign in with Google — the owner's sign-in on the main site, and
 * the same account system here. The callback returns to the site
 * origin with a `?code=` param (PKCE), which the Supabase client
 * exchanges for a session on load. Throws with the Supabase message.
 * The browser leaves for Google on success, so the caller should not
 * expect to continue after the await resolves.
 */
export async function signInWithGoogle(): Promise<void> {
  if (!supabaseConfigured || !supabase) {
    throw new Error("Sign-in is not connected yet");
  }
  // Remember where the user was, so the callback can take them back.
  // The sign-in page itself is not a useful destination — home is.
  const hash = window.location.hash;
  if (hash && hash !== "#/signin") {
    try {
      window.sessionStorage.setItem(OAUTH_RETURN_KEY, hash);
    } catch {
      // Storage unavailable (private mode, etc.) — home is the fallback.
    }
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/` },
  });
  if (error) throw new Error(error.message);
}

/**
 * After an OAuth callback, the hash route saved by signInWithGoogle,
 * or null. Consumed once — the key is removed whether or not a value
 * was stored, so a stale key from an abandoned attempt never fires.
 */
export function consumeOAuthReturn(): string | null {
  try {
    const hash = window.sessionStorage.getItem(OAUTH_RETURN_KEY);
    window.sessionStorage.removeItem(OAUTH_RETURN_KEY);
    return hash;
  } catch {
    return null;
  }
}

/** Sign out the current user. */
export async function signOut(): Promise<void> {
  if (!supabaseConfigured || !supabase) return;
  await supabase.auth.signOut();
}

/**
 * Whether the signed-in user is an admin (has the 'admin' role on the
 * shared main-site account system). Checked the way the main site does
 * it — via the public has_role RPC against `user_roles`:
 *   supabase.rpc("has_role", { _user_id: userId, _role: "admin" })
 * Returns false when signed out, unconfigured, or when the call
 * errors. This is a UI convenience only: RLS enforces review writes
 * server-side regardless of what the UI shows.
 */
export async function fetchIsAdmin(userId: string | null): Promise<boolean> {
  if (!supabaseConfigured || !supabase || !userId) return false;
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) return false;
  return data === true;
}
