import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "@/lib/config/env";

let cachedClient: SupabaseClient | null | undefined;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (cachedClient !== undefined) {
    return cachedClient;
  }

  const env = getSupabaseEnv();

  if (!env.isConfigured || !env.url || !env.anonKey) {
    cachedClient = null;
    return cachedClient;
  }

  cachedClient = createBrowserClient(env.url, env.anonKey);
  return cachedClient;
}

// Made with Bob
