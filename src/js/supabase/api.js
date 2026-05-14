import { hasSupabaseConfig, supabase } from "./client.js";

function requireSupabase() {
  if (!hasSupabaseConfig || !supabase) {
    const error = new Error("Supabase is not configured.");
    error.userMessage = "Supabase is not configured. Check supabase-config.js or your Vite env values.";
    error.debugInfo = {
      reason: "missing_config",
    };
    throw error;
  }
}

function buildSupabaseError(error, context) {
  const wrappedError = new Error(error?.message || "Supabase request failed.");
  wrappedError.code = error?.code;
  wrappedError.details = error?.details;
  wrappedError.hint = error?.hint;
  wrappedError.debugInfo = {
    context,
    code: error?.code || null,
    details: error?.details || null,
    hint: error?.hint || null,
    message: error?.message || null,
  };

  if (error?.code === "23505") {
    wrappedError.userMessage = context === "early_access"
      ? "This email is already on the waitlist."
      : "This entry already exists.";
    return wrappedError;
  }

  if (error?.code === "42501") {
    wrappedError.userMessage = "Supabase rejected the request. Check your RLS policies and SQL setup.";
    return wrappedError;
  }

  wrappedError.userMessage = "Supabase request failed. Check the browser console for details.";
  return wrappedError;
}

export async function createEarlyAccessLead(email, source) {
  requireSupabase();

  const { error } = await supabase.from("early_access_leads").insert({
    email,
    source,
  });

  if (error) {
    throw buildSupabaseError(error, "early_access");
  }
}

export async function createSurveyResponse(payload) {
  requireSupabase();

  const { error } = await supabase.from("survey_responses").insert(payload);

  if (error) {
    throw buildSupabaseError(error, "survey");
  }
}

export async function loadLiveStats() {
  if (!hasSupabaseConfig || !supabase) {
    return null;
  }

  const { data, error } = await supabase.rpc("get_public_stats");

  if (error || !data?.length) {
    if (error) {
      console.error("Supabase stats error", {
        code: error.code,
        details: error.details,
        hint: error.hint,
        message: error.message,
      });
    }
    return null;
  }

  const stats = data[0];

  return {
    waitlist: Number(stats.waitlist ?? 0),
    responses: Number(stats.responses ?? 0),
  };
}
