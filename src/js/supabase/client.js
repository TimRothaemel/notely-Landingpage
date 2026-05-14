import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function normalizeValue(value) {
  if (typeof value !== "string") {
    return value;
  }

  return value.replace(/^"(.*)"$/, "$1").trim();
}

function isValidHttpUrl(value) {
  if (typeof value !== "string" || !value) {
    return false;
  }

  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}

function getPreferredConfigValue(...values) {
  for (const value of values) {
    const normalizedValue = normalizeValue(value);

    if (normalizedValue) {
      return normalizedValue;
    }
  }

  return "";
}

const envSupabaseUrl = normalizeValue(import.meta.env?.VITE_SUPABASE_URL);
const windowSupabaseUrl = normalizeValue(window.__SUPABASE_URL__);
const supabaseUrl = isValidHttpUrl(envSupabaseUrl)
  ? envSupabaseUrl
  : getPreferredConfigValue(windowSupabaseUrl, envSupabaseUrl);
const supabaseAnonKey = getPreferredConfigValue(
  import.meta.env?.VITE_SUPABASE_ANON_KEY,
  window.__SUPABASE_ANON_KEY__,
);

const hasValidSupabaseUrl = isValidHttpUrl(supabaseUrl);

export const hasSupabaseConfig = Boolean(hasValidSupabaseUrl && supabaseAnonKey);

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    })
  : null;

if (!hasValidSupabaseUrl && (envSupabaseUrl || windowSupabaseUrl)) {
  console.error("Supabase URL is invalid.", {
    envSupabaseUrl,
    windowSupabaseUrl,
    resolvedSupabaseUrl: supabaseUrl,
  });
}
