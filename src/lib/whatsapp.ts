/**
 * WhatsApp Cloud API (Meta) integration
 *
 * Setup:
 *  1. Go to https://developers.facebook.com → My Apps → Create App → Business
 *  2. Add "WhatsApp" product → set up a WhatsApp Business Account
 *  3. Get your Phone Number ID and a temporary access token (or permanent system user token)
 *  4. Create the 3 message templates below in Business Manager > WhatsApp > Message Templates
 *  5. Set WHATSAPP_TOKEN and WHATSAPP_PHONE_ID in your .env
 *
 * Free tier: 1,000 service conversations / month at no cost.
 *
 * ─── Template definitions (create these in Meta Business Manager) ──────────────
 *
 * Template 1 — Name: "registration_received"  Category: UTILITY  Language: English
 * Body:
 *   Hi {{1}}, we've received your registration for *The Cozy Canvas* 🎨
 *
 *   Your Registration ID is *{{2}}*. We're reviewing your payment slip and will
 *   confirm within 24 hours.
 *
 *   Questions? Email us at events@everglowlk.com
 *
 * Template 2 — Name: "registration_confirmed"  Category: UTILITY  Language: English
 * Body:
 *   Hi {{1}}, your spot at *The Cozy Canvas* is confirmed! 🎟️
 *
 *   Registration ID: *{{2}}*
 *   Ticket code: *{{3}}*
 *
 *   Your QR ticket has been emailed to you. Please bring it to the door along
 *   with your ID. See you there! 🎨
 *
 * Template 3 — Name: "registration_rejected"  Category: UTILITY  Language: English
 * Body:
 *   Hi {{1}}, unfortunately we couldn't confirm your registration for
 *   *The Cozy Canvas* (ID: *{{2}}*).
 *
 *   This is usually due to a payment verification issue. Please email us at
 *   events@everglowlk.com and we'll help sort it out.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

const GRAPH_URL = "https://graph.facebook.com/v19.0";

/**
 * Convert a phone number to E.164 format.
 * Handles Sri Lankan local format (07xxxxxxxx) and international formats.
 */
function toE164(raw: string): string {
  // Keep original + sign before stripping
  const hasPlus = raw.trimStart().startsWith("+");
  const digits = raw.replace(/\D/g, "");

  // Already international — just re-attach +
  if (hasPlus) return "+" + digits;

  // Sri Lankan local: starts with 0, 10 digits → +94 + last 9
  if (digits.startsWith("0") && digits.length === 10) {
    return "+94" + digits.slice(1);
  }

  // Already has 94 prefix (no +): 94xxxxxxxxx (11 digits)
  if (digits.startsWith("94") && digits.length === 11) {
    return "+" + digits;
  }

  // 9-digit bare Sri Lankan (no leading 0)
  if (digits.length === 9) {
    return "+94" + digits;
  }

  // Fallback — prepend + and hope for the best
  return "+" + digits;
}

interface TemplateComponent {
  type: string;
  parameters: { type: string; text: string }[];
}

async function sendTemplate(
  phone: string,
  templateName: string,
  components: TemplateComponent[]
): Promise<void> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  if (!token || !phoneId) {
    console.warn("[WhatsApp] WHATSAPP_TOKEN / WHATSAPP_PHONE_ID not set — skipping");
    return;
  }

  const to = toE164(phone);

  const res = await fetch(`${GRAPH_URL}/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: "en_US" },
        components,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // WhatsApp returns 400 with error code 131026 if the number is not on WhatsApp
    // — treat that as a soft failure so it doesn't block the main flow
    const errorCode = body?.error?.code;
    if (errorCode === 131026) {
      console.info(`[WhatsApp] ${to} is not a WhatsApp number — skipping`);
      return;
    }
    throw new Error(`[WhatsApp] API error ${res.status}: ${JSON.stringify(body)}`);
  }
}

/** Notify attendee that their registration is under review. */
export async function sendWhatsAppReview(
  phone: string,
  name: string,
  regId: string
): Promise<void> {
  await sendTemplate(phone, "registration_received", [
    {
      type: "body",
      parameters: [
        { type: "text", text: name },
        { type: "text", text: regId },
      ],
    },
  ]);
}

/** Notify attendee that their registration has been approved. */
export async function sendWhatsAppConfirm(
  phone: string,
  name: string,
  _regId: string,
  _ticket: string
): Promise<void> {
  await sendTemplate(phone, "registration_confirmed", [
    {
      type: "body",
      parameters: [
        { type: "text", text: name },
      ],
    },
  ]);
}

/** Notify attendee that their registration could not be confirmed. */
export async function sendWhatsAppReject(
  phone: string,
  name: string,
  regId: string
): Promise<void> {
  await sendTemplate(phone, "registration_rejected", [
    {
      type: "body",
      parameters: [
        { type: "text", text: name },
        { type: "text", text: regId },
      ],
    },
  ]);
}
