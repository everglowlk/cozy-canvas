"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Particles from "@/components/public/Particles";

interface StatusResult {
  regId: string;
  name: string;
  status: "pending" | "approved" | "rejected";
  tier: string;
  guests: number;
  ticket: string | null;
  checkedIn: boolean;
  createdAt: string;
}

const STATUS_CONFIG = {
  pending: {
    icon: "⏳",
    label: "Under Review",
    color: "var(--amber)",
    bg: "rgba(255,196,107,0.08)",
    border: "rgba(255,196,107,0.3)",
    message: "Your registration is being reviewed by our team. We verify payment slips manually — this usually takes within 24 hours. Once confirmed, your QR ticket will be emailed to you.",
  },
  approved: {
    icon: "🎟️",
    label: "Confirmed",
    color: "var(--accent)",
    bg: "rgba(var(--accent-rgb),0.08)",
    border: "rgba(var(--accent-rgb),0.3)",
    message: "Your registration is confirmed! Check your inbox for the QR code ticket. Bring it to the door along with your ID.",
  },
  rejected: {
    icon: "✕",
    label: "Not Confirmed",
    color: "var(--coral)",
    bg: "rgba(255,80,80,0.08)",
    border: "rgba(255,80,80,0.3)",
    message: "We were unable to confirm your registration. This may be due to a payment verification issue. Please contact us at events@everglowlk.com with your Registration ID.",
  },
};

function StatusChecker() {
  const searchParams = useSearchParams();
  const [regId, setRegId] = useState(searchParams.get("id") ?? "");
  const [result, setResult] = useState<StatusResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-check if ID came from URL
  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setRegId(id.toUpperCase());
      fetch(`/api/status/${id.toUpperCase()}`)
        .then((r) => r.ok ? r.json() : Promise.reject(r.status))
        .then(setResult)
        .catch(() => setError("No registration found with that ID."));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    const id = regId.trim().toUpperCase();
    if (!id) return;
    setError("");
    setResult(null);
    setLoading(true);
    const res = await fetch(`/api/status/${id}`);
    setLoading(false);
    if (res.status === 404) {
      setError("No registration found with that ID. Please double-check and try again.");
      return;
    }
    if (!res.ok) {
      setError("Something went wrong. Please try again.");
      return;
    }
    setResult(await res.json());
  }

  const cfg = result ? STATUS_CONFIG[result.status] : null;

  return (
    <div style={{ position: "relative", zIndex: 2, maxWidth: 480, width: "100%" }}>

      {/* Heading */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div
          className="fade-up"
          style={{
            fontSize: "0.66rem",
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "var(--accent)",
            marginBottom: "0.8rem",
          }}
        >
          Registration Status
        </div>
        <h1
          className="fade-up"
          style={{
            fontFamily: "var(--font-d)",
            fontSize: "clamp(1.8rem,5vw,2.8rem)",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            animationDelay: "0.1s",
          }}
        >
          Check your{" "}
          <span style={{ color: "var(--accent)" }}>status</span>
        </h1>
        <p
          className="fade-up"
          style={{
            color: "var(--muted)",
            fontSize: "0.9rem",
            marginTop: "0.8rem",
            lineHeight: 1.65,
            animationDelay: "0.2s",
          }}
        >
          Enter your Registration ID to see your current status.
          <br />It was included in your confirmation email (e.g.{" "}
          <span style={{ fontFamily: "var(--font-m)", color: "var(--accent)" }}>
            REG-AB1234
          </span>
          ).
        </p>
      </div>

      {/* Search form */}
      <form
        onSubmit={check}
        className="card fade-up"
        style={{ padding: "1.6rem", marginBottom: "1.2rem", animationDelay: "0.3s" }}
      >
        <div className="field" style={{ marginBottom: "1rem" }}>
          <label>Registration ID</label>
          <input
            className="input"
            value={regId}
            onChange={(e) => setRegId(e.target.value.toUpperCase())}
            placeholder="REG-XXXXXX"
            style={{ fontFamily: "var(--font-m)", letterSpacing: "0.1em", fontSize: "1rem" }}
            autoFocus
          />
        </div>
        {error && (
          <div
            style={{
              background: "rgba(255,80,80,0.08)",
              border: "1px solid rgba(255,80,80,0.3)",
              borderRadius: "var(--r-s)",
              padding: "0.7rem 0.9rem",
              color: "var(--coral)",
              fontSize: "0.82rem",
              marginBottom: "1rem",
            }}
          >
            {error}
          </div>
        )}
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: "100%" }}
          disabled={loading || !regId.trim()}
        >
          {loading ? "Checking…" : "Check status"}
        </button>
      </form>

      {/* Result */}
      {result && cfg && (
        <div
          className="card fade-up"
          style={{
            padding: "1.6rem",
            borderColor: cfg.border,
            background: cfg.bg,
          }}
        >
          {/* Status badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "1.2rem" }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.4rem",
                flexShrink: 0,
              }}
            >
              {cfg.icon}
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-d)",
                  fontSize: "1.2rem",
                  color: cfg.color,
                }}
              >
                {cfg.label}
              </div>
              <div style={{ fontSize: "0.76rem", color: "var(--muted)", fontFamily: "var(--font-m)" }}>
                {result.regId}
              </div>
            </div>
          </div>

          {/* Attendee details */}
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              borderRadius: "var(--r-s)",
              padding: "1rem",
              marginBottom: "1.2rem",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.8rem 1.2rem",
            }}
          >
            {[
              ["Name", result.name],
              ["Tier", result.tier],
              ["Easels", `${result.guests} painter${result.guests > 1 ? "s" : ""}`],
              ["Registered", new Date(result.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })],
              ...(result.ticket ? [["Ticket code", result.ticket]] : []),
              ...(result.checkedIn ? [["Attended", "✓ Checked in at the door"]] : []),
            ].map(([k, v]) => (
              <div key={k}>
                <div
                  style={{
                    fontSize: "0.62rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--faint)",
                    marginBottom: "0.2rem",
                  }}
                >
                  {k}
                </div>
                <div
                  style={{
                    fontSize: "0.88rem",
                    color: k === "Ticket code" ? "var(--accent)" : "var(--white)",
                    fontFamily: k === "Ticket code" ? "var(--font-m)" : undefined,
                    fontWeight: 600,
                  }}
                >
                  {v}
                </div>
              </div>
            ))}
          </div>

          {/* Message */}
          <p style={{ fontSize: "0.84rem", color: "var(--muted)", lineHeight: 1.65, margin: 0 }}>
            {cfg.message}
          </p>

          {/* Ticket link if approved */}
          {result.status === "approved" && result.ticket && (
            <Link
              href={`/ticket/${result.regId}`}
              className="btn btn-primary"
              style={{ display: "block", textAlign: "center", marginTop: "1.2rem" }}
            >
              View QR ticket →
            </Link>
          )}

          {/* Contact if rejected */}
          {result.status === "rejected" && (
            <a
              href="mailto:events@everglowlk.com"
              className="btn btn-ghost"
              style={{ display: "block", textAlign: "center", marginTop: "1.2rem" }}
            >
              Contact us →
            </a>
          )}
        </div>
      )}

    </div>
  );
}

export default function StatusPage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "var(--black)",
      }}
    >
      {/* top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem clamp(1.2rem,5vw,3rem)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-d)",
            color: "var(--accent)",
            letterSpacing: "0.12em",
            textDecoration: "none",
          }}
        >
          EG
        </Link>
        <span
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--muted)",
          }}
        >
          The Cozy Canvas
        </span>
        <Link
          href="/"
          style={{
            fontSize: "0.78rem",
            color: "var(--faint)",
            textDecoration: "underline",
          }}
        >
          ← Back
        </Link>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          padding: "clamp(2rem,6vw,4rem) 1.2rem",
        }}
      >
        <div
          className="glow-orb"
          style={{ width: 500, height: 500, top: "-20%", left: "50%", transform: "translateX(-50%)" }}
        />
        <Particles count={20} />

        <Suspense fallback={null}>
          <StatusChecker />
        </Suspense>
      </div>
    </div>
  );
}
