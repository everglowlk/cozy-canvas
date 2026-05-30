"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import CopyRow from "./CopyRow";
import ReceiptUpload, { type ReceiptValue } from "./ReceiptUpload";
import { formatMoney } from "@/lib/utils";
import type { IEvent } from "@/types";

interface FormData {
  name: string;
  email: string;
  phone: string;
  nic: string; // NIC for locals, Passport for foreigners
  country: "local" | "foreign";
  guests: number;
  payMethod: string;
  payRef: string;
}

interface Errors {
  name?: string;
  email?: string;
  phone?: string;
  nic?: string;
  receipt?: string;
}

export default function RegisterForm() {
  const router = useRouter();
  const [event, setEvent] = useState<IEvent | null>(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [f, setF] = useState<FormData>({
    name: "", email: "", phone: "", nic: "",
    country: "local", guests: 1,
    payMethod: "Bank transfer", payRef: "",
  });
  const [receipt, setReceipt] = useState<ReceiptValue | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setF((p) => ({ ...p, [k]: v }));

  // Fetch the currently open event
  useEffect(() => {
    fetch("/api/events?status=open")
      .then((r) => r.json())
      .then((events: IEvent[]) => setEvent(events[0] ?? null))
      .catch(() => setEvent(null))
      .finally(() => setEventLoading(false));
  }, []);

  const unitPrice = event
    ? (f.country === "local" ? event.priceLKR : event.priceUSD)
    : (f.country === "local" ? 3000 : 10);
  const currency = f.country === "local" ? "LKR" : "USD";
  const total = unitPrice * f.guests;

  const idLabel = f.country === "local" ? "NIC" : "Passport number";
  const idPlaceholder = f.country === "local" ? "200145600789" : "N1234567";

  // Compute readiness — all mandatory fields filled
  const isReady = useMemo(() => {
    const emailValid = /^\S+@\S+\.\S+$/.test(f.email);
    return (
      f.name.trim() !== "" &&
      emailValid &&
      f.phone.trim() !== "" &&
      f.nic.trim() !== "" &&
      receipt !== null
    );
  }, [f, receipt]);

  function validate(): boolean {
    const e: Errors = {};
    if (!f.name.trim()) e.name = "Tell us your name";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email";
    if (!f.phone.trim()) e.phone = "We need a phone number";
    if (!f.nic.trim()) e.nic = f.country === "local" ? "NIC is required" : "Passport number is required";
    if (!receipt) e.receipt = "Upload your payment slip";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      // 1. Upload receipt
      let receiptUrl = "";
      let receiptPublicId = "";
      if (receipt) {
        const fd = new FormData();
        fd.append("file", receipt.file);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          throw new Error(err.error || "Failed to upload receipt");
        }
        const uploadData = await uploadRes.json();
        receiptUrl = uploadData.url;
        receiptPublicId = uploadData.publicId;
      }

      // 2. Submit registration
      const regRes = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event?.eventId,
          name: f.name.trim(),
          email: f.email.trim().toLowerCase(),
          phone: f.phone.trim(),
          nic: f.nic.trim(),
          country: f.country,
          guests: f.guests,
          tier: "Painter",
          payMethod: f.payMethod,
          payRef: f.payRef.trim() || "—",
          amount: total,
          currency,
          receiptUrl,
          receiptPublicId,
        }),
      });

      if (!regRes.ok) {
        const err = await regRes.json();
        throw new Error(err.error || "Registration failed");
      }

      const { regId } = await regRes.json();
      router.push(`/confirm?regId=${regId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  const err = (k: keyof Errors) => errors[k];

  // Loading state
  if (eventLoading) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--black)" }}>
        <div style={{ width: 32, height: 32, border: "2px solid var(--border-2)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spinSlow 0.8s linear infinite" }} />
      </div>
    );
  }

  // No open event
  if (!event) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--black)", padding: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1.2rem" }}>🎨</div>
        <h1 style={{ fontFamily: "var(--font-d)", fontSize: "2rem", color: "var(--accent)", marginBottom: "0.8rem" }}>Registrations are closed</h1>
        <p style={{ color: "var(--muted)", maxWidth: 400, lineHeight: 1.7, marginBottom: "2rem" }}>
          There are no sessions open for registration right now. Follow us for updates on the next Cozy Canvas date.
        </p>
        <Link href="/" className="btn btn-ghost">← Back to event site</Link>
      </div>
    );
  }

  return (
    <div style={{ height: "100dvh", overflowY: "auto" }}>
      {/* sticky top bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem clamp(1.2rem,5vw,3rem)", background: "rgba(6,16,13,0.88)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)" }}>
        <Link href="/" style={{ color: "var(--muted)", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          ← Back
        </Link>
        <span style={{ fontSize: "0.7rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)" }}>
          The Cozy Canvas · Reserve
        </span>
        <span style={{ fontFamily: "var(--font-d)", color: "var(--accent)", letterSpacing: "0.12em" }}>EG</span>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "clamp(2rem,5vw,3.5rem) clamp(1.2rem,5vw,3rem) 6rem" }}>

        {/* Event banner */}
        <div className="card" style={{ padding: "1rem 1.4rem", marginBottom: "2rem", borderColor: "var(--border-2)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.6rem" }}>
          <div>
            <div style={{ fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "0.2rem" }}>Now open</div>
            <div style={{ fontFamily: "var(--font-d)", fontSize: "1rem", color: "var(--white)" }}>{event.title}</div>
          </div>
          <div style={{ display: "flex", gap: "1.2rem", fontSize: "0.8rem", color: "var(--muted)", flexWrap: "wrap" }}>
            <span>📅 {new Date(event.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}</span>
            <span>🕐 {event.time}</span>
            <span>📍 {event.venue}</span>
          </div>
        </div>

        <div className="sec-label">Reserve your easel</div>
        <h1 style={{ fontFamily: "var(--font-d)", fontSize: "clamp(1.9rem,4.6vw,3rem)", letterSpacing: "-0.02em", marginBottom: "0.7rem" }}>
          Tell us who&apos;s painting.
        </h1>
        <p style={{ color: "var(--muted)", maxWidth: 560, lineHeight: 1.7, marginBottom: "2.4rem" }}>
          Fill in your details, transfer the fee to the account below, and upload your slip. Our team reviews every registration and emails your QR ticket once payment is confirmed.
        </p>

        <form onSubmit={submit} noValidate className="reg-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,360px)", gap: "clamp(1.5rem,4vw,3rem)", alignItems: "start" }}>

          {/* ── left: details ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.3rem" }}>

            {/* Name */}
            <div className="field">
              <label>Full name <span className="req">*</span></label>
              <input className={`input${err("name") ? " input-err" : ""}`} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Tharushi Fernando" />
              {err("name") && <span className="field-err">{err("name")}</span>}
            </div>

            {/* Email + Phone */}
            <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="field">
                <label>Email <span className="req">*</span></label>
                <input className={`input${err("email") ? " input-err" : ""}`} type="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="you@email.com" />
                {err("email") && <span className="field-err">{err("email")}</span>}
              </div>
              <div className="field">
                <label>Phone <span className="req">*</span></label>
                <input className={`input${err("phone") ? " input-err" : ""}`} value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+94 7X XXX XXXX" />
                {err("phone") && <span className="field-err">{err("phone")}</span>}
              </div>
            </div>

            {/* Country + NIC/Passport */}
            <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="field">
                <label>You are a…</label>
                <select className="select" value={f.country} onChange={(e) => { set("country", e.target.value as "local" | "foreign"); set("nic", ""); }}>
                  <option value="local">Local (Sri Lanka)</option>
                  <option value="foreign">Visitor from abroad</option>
                </select>
              </div>
              <div className="field">
                <label>{idLabel} <span className="req">*</span></label>
                <input
                  className={`input${err("nic") ? " input-err" : ""}`}
                  value={f.nic}
                  onChange={(e) => set("nic", e.target.value)}
                  placeholder={idPlaceholder}
                />
                {err("nic") && <span className="field-err">{err("nic")}</span>}
              </div>
            </div>

            {/* Tier + Guests */}
            <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="field">
                <label>Ticket tier</label>
                <select className="select" value="Painter" disabled>
                  <option value="Painter">Painter — full session</option>
                </select>
              </div>
              <div className="field">
                <label>Number of painters</label>
                <select className="select" value={f.guests} onChange={(e) => set("guests", Number(e.target.value))}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? "easel" : "easels"}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bank transfer instructions */}
            <div className="card" style={{ padding: "1.5rem", marginTop: "0.4rem" }}>
              <h3 style={{ fontFamily: "var(--font-d)", fontSize: "0.9rem", color: "var(--accent)", letterSpacing: "0.04em", marginBottom: "0.3rem" }}>
                Step 1 — Transfer the fee
              </h3>
              <p style={{ color: "var(--muted)", fontSize: "0.82rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                Send <strong style={{ color: "var(--white)" }}>{formatMoney(total, currency)}</strong> to the account below, then add your reference and slip.
              </p>
              <CopyRow label="Bank" value="Commercial Bank PLC" />
              <CopyRow label="Account name" value="EverGlow Events (Pvt) Ltd" />
              <CopyRow label="Account no." value="8001 234 567" />
              <CopyRow label="Branch" value="Colombo 03 · 7056" />
            </div>

            {/* Pay method + ref */}
            <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="field">
                <label>Payment method</label>
                <select className="select" value={f.payMethod} onChange={(e) => set("payMethod", e.target.value)}>
                  {["Bank transfer", "Online banking", "Wise transfer", "Card (link)"].map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Transfer reference</label>
                <input className="input" value={f.payRef} onChange={(e) => set("payRef", e.target.value)} placeholder="e.g. COM-991043" />
              </div>
            </div>

            {/* Receipt upload */}
            <div className="field">
              <label>Step 2 — Upload payment slip <span className="req">*</span></label>
              <ReceiptUpload
                value={receipt}
                onChange={(v) => { setReceipt(v); setErrors((p) => ({ ...p, receipt: undefined })); }}
                error={err("receipt")}
              />
            </div>
          </div>

          {/* ── right: sticky summary ── */}
          <div style={{ position: "sticky", top: 88 }}>
            <div className="card" style={{ padding: "1.8rem", borderColor: "var(--border-2)" }}>
              <div className="pill pill-approved" style={{ marginBottom: "1.2rem" }}>
                <span className="dot" />Painter ticket
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.86rem", color: "var(--muted)", marginBottom: "0.7rem" }}>
                <span>{formatMoney(unitPrice, currency)} × {f.guests}</span>
                <span style={{ color: "var(--white)" }}>{formatMoney(total, currency)}</span>
              </div>

              <hr className="eg-divider" style={{ margin: "0.4rem 0 1rem" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1.4rem" }}>
                <span style={{ color: "var(--muted)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Total</span>
                <span style={{ fontFamily: "var(--font-d)", fontSize: "1.8rem", color: "var(--accent)" }}>{formatMoney(total, currency)}</span>
              </div>

              {/* Checklist — shows what's still missing */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1.2rem" }}>
                {[
                  { label: "Full name", done: f.name.trim() !== "" },
                  { label: "Email & phone", done: f.email.trim() !== "" && f.phone.trim() !== "" },
                  { label: idLabel, done: f.nic.trim() !== "" },
                  { label: "Payment slip uploaded", done: receipt !== null },
                ].map(({ label, done }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.76rem", color: done ? "var(--accent)" : "var(--faint)" }}>
                    <span style={{ fontSize: "0.7rem" }}>{done ? "✓" : "○"}</span>
                    {label}
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", opacity: isReady ? 1 : 0.45, cursor: isReady ? "pointer" : "not-allowed" }}
                disabled={submitting || !isReady}
              >
                {submitting ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ width: 14, height: 14, border: "2px solid #04130e", borderTopColor: "transparent", borderRadius: "50%", animation: "spinSlow 0.8s linear infinite", display: "inline-block" }} />
                    Submitting…
                  </span>
                ) : isReady ? "Submit registration" : "Complete all fields to continue"}
              </button>

              <p style={{ color: "var(--faint)", fontSize: "0.72rem", textAlign: "center", lineHeight: 1.6, marginTop: "0.9rem" }}>
                We&apos;ll review your slip and email a QR ticket within 24 hours.
              </p>
              <p style={{ color: "var(--faint)", fontSize: "0.72rem", textAlign: "center", lineHeight: 1.6, marginTop: "0.5rem" }}>
                By submitting you agree to our{" "}
                <Link href="/terms" style={{ color: "var(--accent)", textDecoration: "underline", fontSize: "0.72rem" }}>Terms &amp; Conditions</Link>
                , incl. ID check at the door.
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start", marginTop: "1rem", padding: "0 0.3rem" }}>
              <span style={{ color: "var(--accent)", fontSize: "0.9rem" }}>🔒</span>
              <p style={{ color: "var(--faint)", fontSize: "0.74rem", lineHeight: 1.6 }}>
                Your details are only used to confirm your seat for this session.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
