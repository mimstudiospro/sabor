import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

/** True only when both env vars are set. */
export const supabaseConfigured = Boolean(url && key);

/**
 * Null when unconfigured — the app must not crash, it just shows the
 * empty state with reviews disabled.
 *
 * Auth is PKCE, not implicit: the Google OAuth callback arrives as a
 * `?code=` query param. The hash router owns the URL fragment, so an
 * `#access_token` fragment would break routing. `detectSessionInUrl`
 * exchanges that `?code=` for a session when the client is created
 * (before the app renders), so a returning OAuth user is signed in
 * on load — `getSession()` awaits that exchange.
 */
export const supabase: SupabaseClient | null =
  supabaseConfigured && url && key
    ? createClient(url, key, {
        auth: {
          flowType: "pkce",
          detectSessionInUrl: true,
        },
      })
    : null;
