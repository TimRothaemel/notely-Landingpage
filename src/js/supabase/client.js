import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function normalizeValue(value) {
  if (typeof value !== "string") {
    return value;
  }

  return value.replace(/^"(.*)"$/, "$1").trim();
}

const supabaseUrl = normalizeValue(
  import.meta.env?.VITE_SUPABASE_URL || window.__SUPABASE_URL__,
);
const supabaseAnonKey = normalizeValue(
  import.meta.env?.VITE_SUPABASE_ANON_KEY || window.__SUPABASE_ANON_KEY__,
);

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    })
  : null;
