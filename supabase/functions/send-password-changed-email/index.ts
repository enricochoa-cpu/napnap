import { jsonResponse, optionsResponse } from "../_shared/cors.ts";
import { buildEmailHtml } from "../_shared/email-template.ts";

const RESEND_API_URL = "https://api.resend.com/emails";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return optionsResponse();
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

    const html = buildEmailHtml({
      title: "Your NapNap password was changed",
      heading: "Password changed",
      subheading:
        "Your NapNap password was successfully updated. You can continue using the app as normal.",
      instruction: `If you didn't make this change, please <a href="mailto:getnapnap@gmail.com" style="color:#9DBAB7;text-decoration:underline;">contact us</a> immediately.`,
      footer:
        "This is a security notification. No action is needed if this was you.",
    });

    const resendRes = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "NapNap <onboarding@resend.dev>",
        to: [email],
        subject: "Your NapNap password was changed",
        html,
      }),
    });

    if (!resendRes.ok) {
      const errorBody = await resendRes.text();
      console.error("Resend API error:", resendRes.status, errorBody);
      return jsonResponse(
        { error: "Failed to send email", details: errorBody },
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
