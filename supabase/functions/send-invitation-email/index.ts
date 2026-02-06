import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_URL = "https://api.resend.com/emails";

interface InvitationPayload {
  inviteeEmail: string;
  inviterName: string;
  babyName: string;
  role: "caregiver" | "viewer";
}

function buildEmailHtml(
  inviterName: string,
  babyName: string,
  role: "caregiver" | "viewer",
  appUrl: string
): string {
  const roleDescription =
    role === "caregiver"
      ? "add and edit sleep entries"
      : "view sleep entries";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're invited to NapNap</title>
</head>
<body style="margin:0;padding:0;background-color:#12141C;font-family:'Nunito',system-ui,-apple-system,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#12141C;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-size:28px;font-weight:700;color:#E8D3A3;letter-spacing:1px;">NapNap</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#1E2230;border-radius:24px;padding:40px 32px;border:1px solid rgba(255,255,255,0.08);">

              <!-- Greeting -->
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#F0F0F5;">
                You've been invited
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#9CA3AF;line-height:1.6;">
                ${inviterName} has invited you to help track <strong style="color:#F0F0F5;">${babyName}</strong>'s sleep.
              </p>

              <!-- Role badge -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background-color:rgba(157,186,183,0.15);border-radius:12px;padding:12px 20px;">
                    <span style="font-size:13px;color:#9DBAB7;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
                      ${role === "caregiver" ? "Caregiver" : "Viewer"}
                    </span>
                    <span style="display:block;font-size:13px;color:#9CA3AF;margin-top:4px;">
                      You'll be able to ${roleDescription}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${appUrl}" target="_blank"
                       style="display:inline-block;background-color:#9DBAB7;color:#12141C;font-size:16px;font-weight:700;padding:14px 40px;border-radius:16px;text-decoration:none;">
                      Open NapNap
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;font-size:13px;color:#6B7280;text-align:center;line-height:1.5;">
                Sign in with <strong style="color:#9CA3AF;">this email address</strong> to accept the invitation.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:32px;">
              <p style="margin:0;font-size:12px;color:#4B5563;line-height:1.5;">
                You received this because ${inviterName} invited you on NapNap.<br>
                If you weren't expecting this, you can safely ignore it.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Verify JWT - caller must be authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse payload
    const payload: InvitationPayload = await req.json();
    const { inviteeEmail, inviterName, babyName, role } = payload;

    if (!inviteeEmail || !inviterName || !babyName || !role) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build email
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const appUrl = Deno.env.get("APP_URL") || "http://localhost:5173";
    const html = buildEmailHtml(inviterName, babyName, role, appUrl);

    const resendRes = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "NapNap <onboarding@resend.dev>",
        to: [inviteeEmail],
        subject: `${inviterName} invited you to track ${babyName}'s sleep`,
        html,
      }),
    });

    if (!resendRes.ok) {
      const errorBody = await resendRes.text();
      console.error("Resend API error:", resendRes.status, errorBody);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: errorBody }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const resendData = await resendRes.json();
    return new Response(
      JSON.stringify({ success: true, emailId: resendData.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
