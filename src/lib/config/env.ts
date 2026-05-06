export type SupabaseEnv = {
  url: string | null;
  anonKey: string | null;
  isConfigured: boolean;
};

export type MapEnv = {
  mapTilerKey: string | null;
  isMapTilerConfigured: boolean;
};

function readEnvValue(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function isValidUrl(value: string | null) {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function getSupabaseEnv(): SupabaseEnv {
  const rawUrl = readEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = readEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const url = isValidUrl(rawUrl) ? rawUrl : null;

  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey),
  };
}

export function getMapEnv(): MapEnv {
  const mapTilerKey = readEnvValue(process.env.NEXT_PUBLIC_MAPTILER_KEY);

  return {
    mapTilerKey,
    isMapTilerConfigured: Boolean(mapTilerKey),
  };
}

// Made with Bob
