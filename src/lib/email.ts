import nodemailer from "nodemailer";
import type { IRegistration } from "@/types";
import { formatMoney } from "./utils";

// Omit _id so lean() results (ObjectId) and plain objects both satisfy this type
type RegEmailData = Omit<IRegistration, "_id"> & { _id?: unknown };

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || "EverGlow Events <hello@everglow.events>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function emailShell(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>The Cozy Canvas</title>
<style>
  body { margin: 0; padding: 0; background: #06100d; font-family: 'DM Sans', Arial, sans-serif; color: #f5fff9; }
  .wrapper { max-width: 560px; margin: 0 auto; padding: 20px; }
  .header { background: #0d2b21; border-bottom: 1px solid rgba(0,229,176,0.26); padding: 24px 32px; border-radius: 16px 16px 0 0; }
  .header-brand { font-size: 0.72rem; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(245,255,249,0.55); }
  .header-title { font-size: 1.3rem; font-weight: 700; color: #00e5b0; letter-spacing: 0.08em; margin-top: 4px; }
  .body { background: #0c1814; border: 1px solid rgba(0,229,176,0.13); border-top: none; padding: 32px; border-radius: 0 0 16px 16px; }
  .h1 { font-size: 1.4rem; font-weight: 700; color: #f5fff9; margin: 0 0 12px; }
  .p { font-size: 0.9rem; line-height: 1.75; color: rgba(245,255,249,0.75); margin: 0 0 16px; }
  .card { background: rgba(0,229,176,0.04); border: 1px solid rgba(0,229,176,0.2); border-radius: 12px; padding: 20px 24px; margin: 20px 0; }
  .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(0,229,176,0.08); font-size: 0.84rem; }
  .row:last-child { border-bottom: none; }
  .row-label { color: rgba(245,255,249,0.55); text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.72rem; }
  .row-value { color: #f5fff9; font-weight: 600; }
  .btn { display: inline-block; background: #00e5b0; color: #04130e; padding: 12px 28px; border-radius: 100px; font-weight: 700; font-size: 0.84rem; letter-spacing: 0.04em; text-decoration: none; margin: 4px 0; }
  .accent { color: #00e5b0; }
  .muted { color: rgba(245,255,249,0.55); font-size: 0.8rem; }
  .warn-box { background: rgba(255,196,107,0.08); border: 1px solid rgba(255,196,107,0.3); border-radius: 12px; padding: 16px 20px; margin: 20px 0; }
  .warn-title { color: #ffc46b; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 6px; }
  .footer { padding: 24px 0 8px; text-align: center; }
  .footer-brand { font-size: 1rem; font-weight: 700; color: #00e5b0; letter-spacing: 0.12em; margin-bottom: 4px; }
  .footer-muted { font-size: 0.72rem; color: rgba(245,255,249,0.34); letter-spacing: 0.1em; text-transform: uppercase; }
  .footer-links { margin-top: 12px; }
  .footer-links a { color: rgba(245,255,249,0.55); font-size: 0.76rem; text-decoration: underline; margin: 0 8px; }
  .divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(0,229,176,0.26), transparent); margin: 24px 0; border: none; }
  .qr-wrap { text-align: center; margin: 24px 0; }
  .qr-wrap img { border-radius: 12px; border: 2px solid rgba(0,229,176,0.3); }
  .ticket-code { font-family: 'Courier New', monospace; font-size: 1.4rem; color: #00e5b0; letter-spacing: 0.12em; text-align: center; margin: 8px 0; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div class="header-brand">EverGlow Events</div>
    <div class="header-title">THE COZY CANVAS</div>
  </div>
  <div class="body">
    ${content}
    <hr class="divider" />
    <div class="warn-box">
      <div class="warn-title">🪪 Bring your ID to the door</div>
      <p class="p" style="margin:0;font-size:0.84rem;">Locals: bring your <strong style="color:#f5fff9;">NIC</strong>. Visitors from abroad: bring your <strong style="color:#f5fff9;">Passport</strong>. We check it against your registration when you arrive.</p>
    </div>
  </div>
  <div class="footer">
    <div class="footer-brand">EVERGLOW</div>
    <div class="footer-muted">Turning concepts into iconic events</div>
    <div class="footer-links">
      <a href="${APP_URL}/terms">Terms &amp; Conditions</a>
      <a href="mailto:events@everglowlk.com">Contact us</a>
    </div>
    <p class="muted" style="margin-top:12px;">The Cozy Canvas · in partnership with Coffee Station Café</p>
  </div>
</div>
</body>
</html>
`;
}

/**
 * Send "we've received your registration" email
 */
export async function sendReviewEmail(reg: RegEmailData): Promise<void> {
  if (!process.env.SMTP_HOST) {
    console.log("[Email] SMTP not configured — skipping review email for", reg.email);
    return;
  }

  const content = `
    <h1 class="h1">We've received your registration 🎨</h1>
    <p class="p">Hi <strong style="color:#f5fff9;">${reg.name.split(" ")[0]}</strong>, thank you for reserving a seat at The Cozy Canvas. Our team will review your payment slip and confirm your registration within 24 hours.</p>

    <div class="card">
      <div class="row"><span class="row-label">Registration ID</span><span class="row-value" style="font-family:'Courier New',monospace;">${reg.regId}</span></div>
      <div class="row"><span class="row-label">Ticket tier</span><span class="row-value">${reg.tier}</span></div>
      <div class="row"><span class="row-label">Painters</span><span class="row-value">${reg.guests} easel${reg.guests > 1 ? "s" : ""}</span></div>
      <div class="row"><span class="row-label">Amount</span><span class="row-value">${formatMoney(reg.amount, reg.currency)}</span></div>
      <div class="row"><span class="row-label">Payment method</span><span class="row-value">${reg.payMethod}</span></div>
    </div>

    <p class="p">Once we've confirmed your payment, we'll send you a QR code ticket by email. Keep an eye on your inbox!</p>
    <p class="p muted">Your registration ID is <span style="font-family:'Courier New',monospace;color:#00e5b0;">${reg.regId}</span>. Keep it handy in case you need to contact us.</p>
  `;

  await transporter.sendMail({
    from: FROM,
    to: reg.email,
    subject: "We've received your Cozy Canvas registration 🎨",
    html: emailShell(content),
  });
}

/**
 * Send confirmation email with QR code
 */
export async function sendConfirmEmail(
  reg: RegEmailData,
  qrDataUrl: string
): Promise<void> {
  if (!process.env.SMTP_HOST) {
    console.log("[Email] SMTP not configured — skipping confirm email for", reg.email);
    return;
  }

  const ticketUrl = `${APP_URL}/ticket/${reg.regId}`;

  // Strip the data:image/png;base64, prefix to get raw base64 for CID attachment
  const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, "");

  const content = `
    <h1 class="h1">You're confirmed! 🎟️</h1>
    <p class="p">Hi <strong style="color:#f5fff9;">${reg.name.split(" ")[0]}</strong>, great news — your payment has been verified and your seat at The Cozy Canvas is confirmed. Show your QR code at the door.</p>

    <div class="qr-wrap">
      <img src="cid:qrcode@everglow" width="200" height="200" alt="Your QR ticket" style="border-radius:12px;border:2px solid rgba(0,229,176,0.3);" />
      <div class="ticket-code">${reg.ticket}</div>
      <p class="muted">Your unique ticket code</p>
    </div>

    <div class="card">
      <div class="row"><span class="row-label">Name</span><span class="row-value">${reg.name}</span></div>
      <div class="row"><span class="row-label">Admits</span><span class="row-value">${reg.guests} painter${reg.guests > 1 ? "s" : ""}</span></div>
      <div class="row"><span class="row-label">Tier</span><span class="row-value">${reg.tier}</span></div>
      <div class="row"><span class="row-label">Registration</span><span class="row-value" style="font-family:'Courier New',monospace;">${reg.regId}</span></div>
    </div>

    <div style="text-align:center;margin:24px 0;">
      <a href="${ticketUrl}" class="btn">View your ticket online →</a>
    </div>

    <p class="p" style="font-size:0.84rem;"><strong style="color:#f5fff9;">Before you come:</strong></p>
    <ul style="color:rgba(245,255,249,0.75);font-size:0.84rem;line-height:1.75;padding-left:20px;margin:0 0 16px;">
      <li>Arrive 10 minutes early to settle in and grab your drink.</li>
      <li>Wear something you don't mind getting a little paint on.</li>
      <li>Everything's provided — just bring yourself (and good vibes).</li>
    </ul>
  `;

  await transporter.sendMail({
    from: FROM,
    to: reg.email,
    subject: "You're in! Your Cozy Canvas ticket + QR 🎟️",
    html: emailShell(content),
    attachments: [
      {
        filename: "ticket-qr.png",
        content: Buffer.from(base64Data, "base64"),
        cid: "qrcode@everglow", // referenced by cid: in the img src above
      },
    ],
  });
}

/**
 * Send rejection email
 */
export async function sendRejectEmail(reg: RegEmailData): Promise<void> {
  if (!process.env.SMTP_HOST) {
    console.log("[Email] SMTP not configured — skipping reject email for", reg.email);
    return;
  }

  const content = `
    <h1 class="h1">About your Cozy Canvas registration</h1>
    <p class="p">Hi <strong style="color:#f5fff9;">${reg.name.split(" ")[0]}</strong>, unfortunately we were unable to confirm your registration for The Cozy Canvas at this time.</p>

    <div class="card">
      <div class="row"><span class="row-label">Registration ID</span><span class="row-value" style="font-family:'Courier New',monospace;">${reg.regId}</span></div>
      <div class="row"><span class="row-label">Amount</span><span class="row-value">${formatMoney(reg.amount, reg.currency)}</span></div>
    </div>

    <p class="p">This may be because we couldn't verify your payment slip. If you believe this is an error or have questions, please contact us at <a href="mailto:hello@everglow.events" style="color:#00e5b0;">hello@everglow.events</a> with your registration ID.</p>
    <p class="p">We'd love to see you at a future session — you're welcome to register again for an upcoming date.</p>

    <div style="text-align:center;margin:24px 0;">
      <a href="${APP_URL}/register" class="btn">Register for another session →</a>
    </div>
  `;

  await transporter.sendMail({
    from: FROM,
    to: reg.email,
    subject: "About your Cozy Canvas registration",
    html: emailShell(content),
  });
}
