/**
 * NapNap shared email template builder.
 *
 * Design approach:
 *   - Warm light outer background (#F5F0E8) for Gmail/Outlook readability
 *   - Dark card (#1E2230, 24px radius) preserves brand identity
 *   - High-contrast text inside card (#F0F0F5 primary, #D1D5DB secondary)
 *   - Inline SVG logo as data URI (no external hosting needed)
 *   - Sage CTA (#9DBAB7) with dark text
 *   - All link colors forced inline to prevent Gmail blue override
 *
 * Brand guidelines: calm clarity, no drama, no exclamation marks.
 */

// ── Tokens ──────────────────────────────────────────────────────────

const T = {
  bgOuter: "#F5F0E8",       // warm parchment — blends with light email clients
  bgCard: "#1E2230",        // dark card — brand identity
  nap: "#9DBAB7",           // sage — CTA, links, accents
  napBg: "rgba(157,186,183,0.15)",
  night: "#8A92B3",         // periwinkle — logo secondary stroke
  wake: "#E8D3A3",          // parchment — wordmark
  textPrimary: "#F0F0F5",   // bright — headings inside dark card
  textSecondary: "#D1D5DB", // readable — body text inside dark card
  textMuted: "#9CA3AF",     // still legible on dark
  textFooter: "#6B7280",    // muted but readable on light outer bg
  border: "rgba(255,255,255,0.08)",
  fontStack:
    "'Plus Jakarta Sans',system-ui,-apple-system,sans-serif",
} as const;

// Hosted PNG logo — Gmail blocks data: URIs and inline SVGs in emails.
// The PNG lives in public/ and is deployed with the app on Vercel.
const LOGO_URL = "https://napnap.vercel.app/logo-email.png";

// ── Types ───────────────────────────────────────────────────────────

export interface EmailOptions {
  /** HTML <title> */
  title: string;
  /** Main heading (22px, bold, primary color) */
  heading: string;
  /** Subheading paragraph below heading */
  subheading?: string;
  /** Optional badge (role, status, etc.) */
  badge?: { label: string; description?: string };
  /** Primary call-to-action button */
  cta?: { text: string; url: string };
  /** Fallback URL shown as text below CTA (e.g. for confirmation links) */
  fallbackUrl?: string;
  /** Instruction text below CTA (small, muted) */
  instruction?: string;
  /** Extra HTML sections injected after instruction, before footer */
  extra?: string;
  /** Footer text (12px, muted on light bg). Supports <br> for line breaks */
  footer: string;
}

// ── Builder ─────────────────────────────────────────────────────────

export function buildEmailHtml(opts: EmailOptions): string {
  const {
    title,
    heading,
    subheading,
    badge,
    cta,
    fallbackUrl,
    instruction,
    extra,
    footer,
  } = opts;

  // ── Badge block ──
  const badgeBlock = badge
    ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom:28px;">
        <tr>
          <td style="background-color:${T.napBg};border-radius:12px;padding:12px 20px;">
            <span style="font-size:13px;color:${T.nap};font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
              ${badge.label}
            </span>
            ${badge.description ? `<span style="display:block;font-size:13px;color:${T.textSecondary};margin-top:4px;">${badge.description}</span>` : ""}
          </td>
        </tr>
      </table>`
    : "";

  // ── CTA block ──
  const ctaBlock = cta
    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            <a href="${cta.url}" target="_blank"
               style="display:inline-block;background-color:${T.nap};color:${T.bgCard};font-size:16px;font-weight:700;padding:14px 40px;border-radius:16px;text-decoration:none;mso-line-height-rule:exactly;">
              ${cta.text}
            </a>
          </td>
        </tr>
      </table>`
    : "";

  // ── Fallback URL block ──
  const fallbackBlock = fallbackUrl
    ? `<p style="margin:24px 0 8px;font-size:13px;color:${T.textMuted};text-align:center;line-height:1.5;">
        If the button doesn't work, copy and paste this link:
      </p>
      <p style="margin:0;font-size:12px;text-align:center;word-break:break-all;line-height:1.5;">
        <a href="${fallbackUrl}" style="color:${T.nap};text-decoration:underline;">${fallbackUrl}</a>
      </p>`
    : "";

  // ── Instruction block ──
  const instructionBlock = instruction
    ? `<p style="margin:24px 0 0;font-size:13px;color:${T.textMuted};text-align:center;line-height:1.5;">
        ${instruction}
      </p>`
    : "";

  // ── Extra block ──
  const extraBlock = extra || "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:${T.bgOuter};font-family:${T.fontStack};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${T.bgOuter};">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;">

          <!-- Logo: hosted PNG symbol + HTML wordmark -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <img src="${LOGO_URL}" width="56" height="56" alt="" style="display:block;margin:0 auto 10px;" />
              <span style="font-size:24px;font-weight:700;color:#3D3529;letter-spacing:1px;font-family:'Plus Jakarta Sans',system-ui,-apple-system,sans-serif;">NapNap</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:${T.bgCard};border-radius:24px;padding:40px 32px;border:1px solid ${T.border};">

              <!-- Heading -->
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:${T.textPrimary};">
                ${heading}
              </p>
              ${subheading ? `<p style="margin:0 0 24px;font-size:15px;color:${T.textSecondary};line-height:1.6;">${subheading}</p>` : ""}

              ${badgeBlock}
              ${ctaBlock}
              ${fallbackBlock}
              ${instructionBlock}
              ${extraBlock}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:32px;">
              <p style="margin:0;font-size:12px;color:${T.textFooter};line-height:1.5;">
                ${footer}
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
