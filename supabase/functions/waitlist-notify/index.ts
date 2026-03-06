const RESEND_API_URL = "https://api.resend.com/emails";
const NOTIFY_EMAIL = "getnapnap@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function buildNotificationHtml(subscriberEmail: string): string {
  const now = new Date().toLocaleString("en-GB", { timeZone: "Europe/Madrid" });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New waitlist signup</title>
</head>
<body style="margin:0;padding:0;background-color:#12141C;font-family:'Plus Jakarta Sans',system-ui,-apple-system,sans-serif;">
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

              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#F0F0F5;">
                New waitlist signup
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#9CA3AF;line-height:1.6;">
                Someone wants to hear from NapNap.
              </p>

              <!-- Email badge -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom:28px;width:100%;">
                <tr>
                  <td style="background-color:rgba(157,186,183,0.15);border-radius:12px;padding:16px 20px;">
                    <span style="font-size:13px;color:#9DBAB7;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
                      Email
                    </span>
                    <span style="display:block;font-size:16px;color:#F0F0F5;margin-top:6px;word-break:break-all;">
                      ${subscriberEmail}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Timestamp -->
              <p style="margin:0;font-size:13px;color:#6B7280;text-align:center;">
                Signed up at ${now}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:32px;">
              <p style="margin:0;font-size:12px;color:#4B5563;line-height:1.5;">
                This is an automated notification from the NapNap landing page.
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
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return jsonResponse({ error: "Valid email is required" }, 400);
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return jsonResponse({ error: "RESEND_API_KEY not configured" }, 500);
    }

    const html = buildNotificationHtml(email.trim().toLowerCase());

    const resendRes = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "NapNap <onboarding@resend.dev>",
        to: [NOTIFY_EMAIL],
        subject: `Waitlist signup: ${email}`,
        html,
      }),
    });

    if (!resendRes.ok) {
      const errorBody = await resendRes.text();
      console.error("Resend API error:", resendRes.status, errorBody);
      return jsonResponse(
        { error: "Failed to send notification", details: errorBody },
        502
      );
    }

    const resendData = await resendRes.json();
    return jsonResponse({ success: true, emailId: resendData.id });
  } catch (err) {
    console.error("Edge function error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
