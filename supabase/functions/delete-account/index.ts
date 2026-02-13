import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceRoleKey) {
      console.error("SUPABASE_SERVICE_ROLE_KEY not set");
      return jsonResponse({ error: "Server configuration error" }, 500);
    }

    // Resolve user id from JWT (verify_jwt is true, so this request is already validated by Supabase)
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await anonClient.auth.getUser();
    if (userError || !user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const userId = user.id;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // 1. Anonymize: copy profile and sleep_entries into anonymized tables (service role bypasses RLS)
    const { data: profile } = await adminClient
      .from("profiles")
      .select("baby_date_of_birth, baby_gender, baby_weight, baby_height")
      .eq("id", userId)
      .maybeSingle();

    let anonymizedBabyId: string | null = null;

    if (profile) {
      const { data: inserted, error: insertProfileError } = await adminClient
        .from("anonymized_baby_profiles")
        .insert({
          baby_date_of_birth: profile.baby_date_of_birth ?? null,
          baby_gender: profile.baby_gender ?? null,
          baby_weight: profile.baby_weight ?? null,
          baby_height: profile.baby_height ?? null,
        })
        .select("id")
        .single();

      if (insertProfileError) {
        console.error("Anonymize profile error:", insertProfileError);
        return jsonResponse({ error: "Failed to anonymize data" }, 500);
      }
      anonymizedBabyId = inserted?.id ?? null;
    }

    const { data: entries } = await adminClient
      .from("sleep_entries")
      .select("start_time, end_time, type, created_at")
      .eq("user_id", userId);

    if (entries && entries.length > 0) {
      // If we have no profile but have entries, create a placeholder anonymized baby so FK is satisfied
      if (!anonymizedBabyId) {
        const { data: placeholder, error: placeError } = await adminClient
          .from("anonymized_baby_profiles")
          .insert({})
          .select("id")
          .single();
        if (placeError || !placeholder?.id) {
          console.error("Placeholder anonymized profile error:", placeError);
          return jsonResponse({ error: "Failed to anonymize data" }, 500);
        }
        anonymizedBabyId = placeholder.id;
      }

      const anonymizedRows = entries.map((e) => ({
        anonymized_baby_id: anonymizedBabyId,
        start_time: e.start_time,
        end_time: e.end_time ?? null,
        type: e.type,
        created_at: e.created_at ?? new Date().toISOString(),
      }));

      const { error: entriesError } = await adminClient
        .from("anonymized_sleep_entries")
        .insert(anonymizedRows);

      if (entriesError) {
        console.error("Anonymize sleep entries error:", entriesError);
        return jsonResponse({ error: "Failed to anonymize data" }, 500);
      }
    }

    // 2. Delete the auth user (cascade will remove profiles, sleep_entries, baby_shares)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error("Delete user error:", deleteError);
      return jsonResponse({ error: "Could not delete account" }, 500);
    }

    return jsonResponse({ success: true });
  } catch (err) {
    console.error("delete-account error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
