import { jsonResponse, optionsResponse } from "../_shared/cors.ts";
import { buildEmailHtml } from "../_shared/email-template.ts";

const RESEND_API_URL = "https://api.resend.com/emails";

interface InvitationPayload {
  inviteeEmail: string;
  inviterName: string;
  babyName: string;
  role: "caregiver" | "viewer";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return optionsResponse();
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const payload: InvitationPayload = await req.json();
    const { inviteeEmail, inviterName, babyName, role } = payload;

    if (!inviteeEmail || !inviterName || !babyName || !role) {
      return jsonResponse({ error: "Missing required fields" }, 400);
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return jsonResponse({ error: "RESEND_API_KEY not configured" }, 500);
    }

    const appUrl = Deno.env.get("APP_URL") || "http://localhost:5173";

    const roleDescription =
      role === "caregiver"
        ? "add and edit sleep entries"
        : "view sleep entries";

    const html = buildEmailHtml({
      title: "You're invited to NapNap",
      heading: "You've been invited",
      subheading: `${inviterName} has invited you to help track <strong style="color:#F0F0F5;">${babyName}</strong>'s sleep.`,
      badge: {
        label: role === "caregiver" ? "Caregiver" : "Viewer",
        description: `You'll be able to ${roleDescription}`,
      },
      cta: { text: "Open NapNap", url: appUrl },
      instruction: `Sign in with <strong style="color:#9CA3AF;">this email address</strong> to accept the invitation.`,
      footer: `You received this because ${inviterName} invited you on NapNap.<br>If you weren't expecting this, you can safely ignore it.`,
    });

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
      return jsonResponse({ error: "Failed to send email", details: errorBody }, 502);
    }

    const resendData = await resendRes.json();
    return jsonResponse({ success: true, emailId: resendData.id });
  } catch (err) {
    console.error("Edge function error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
