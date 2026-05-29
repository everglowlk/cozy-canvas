"use client";

import type { IRegistration } from "@/types";
import { formatMoney } from "@/lib/utils";

interface TicketCardProps {
  registration: IRegistration;
  qrDataUrl?: string;
}

const EVENT_DATE = "Saturday, August 2 · 5:00 PM";
const EVENT_VENUE = "Coffee Station Café, Colombo";

export default function TicketCard({ registration, qrDataUrl }: TicketCardProps) {
  return (
    <div
      className="ticket-card"
      style={{
        width: "min(420px, 100%)",
        background: "var(--panel)",
        border: "1px solid var(--border-2)",
        borderRadius: "var(--r-l)",
        overflow: "hidden",
        boxShadow: "0 20px 80px rgba(var(--accent-rgb), 0.12), 0 40px 100px rgba(0,0,0,0.5)",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--forest) 0%, #0d2520 100%)",
          padding: "1.8rem 2rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="glow-orb"
          style={{
            width: 300,
            height: 300,
            top: "-60%",
            right: "-20%",
            opacity: 0.6,
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "1.4rem",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--font-d)",
                  fontSize: "0.7rem",
                  letterSpacing: "0.22em",
                  color: "var(--accent)",
                  marginBottom: "0.3rem",
                }}
              >
                EVERGLOW EVENTS
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-d)",
                  fontSize: "1.4rem",
                  letterSpacing: "0.04em",
                  color: "var(--white)",
                }}
              >
                THE COZY CANVAS
              </h2>
            </div>
            <span className="pill pill-approved">
              <span className="dot" />
              {registration.tier}
            </span>
          </div>

          <div
            style={{
              fontFamily: "var(--font-d)",
              fontSize: "1.6rem",
              color: "var(--white)",
              marginBottom: "0.4rem",
            }}
          >
            {registration.name.split(" ")[0]}{" "}
            <span style={{ color: "var(--accent)" }}>
              {registration.name.split(" ").slice(1).join(" ")}
            </span>
          </div>

          <div
            style={{
              fontSize: "0.8rem",
              color: "var(--muted)",
            }}
          >
            {registration.guests} painter{registration.guests > 1 ? "s" : ""} ·{" "}
            {formatMoney(registration.amount, registration.currency)}
          </div>
        </div>
      </div>

      {/* Tear line */}
      <div
        style={{
          height: 1,
          background:
            "repeating-linear-gradient(90deg, var(--border-2) 0 8px, transparent 8px 14px)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -16,
            top: "50%",
            transform: "translateY(-50%)",
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--black)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -16,
            top: "50%",
            transform: "translateY(-50%)",
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--black)",
          }}
        />
      </div>

      {/* Body */}
      <div style={{ padding: "1.8rem 2rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.2rem 1.6rem",
            marginBottom: "1.8rem",
          }}
        >
          {[
            ["Date", EVENT_DATE],
            ["Venue", EVENT_VENUE],
            ["Admission", `${registration.guests} easel${registration.guests > 1 ? "s" : ""}`],
            ["Type", registration.country === "local" ? "Local" : "Visitor"],
          ].map(([label, value]) => (
            <div key={label}>
              <div
                style={{
                  fontSize: "0.6rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--faint)",
                  marginBottom: "0.25rem",
                }}
              >
                {label}
              </div>
              <div style={{ fontSize: "0.86rem", color: "var(--white)" }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* QR Code */}
        {qrDataUrl && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "1.4rem",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <img
                src={qrDataUrl}
                width={160}
                height={160}
                alt="Ticket QR"
                style={{
                  borderRadius: "var(--r-s)",
                  border: "2px solid rgba(var(--accent-rgb), 0.3)",
                  display: "block",
                  margin: "0 auto",
                }}
              />
              <div
                style={{
                  fontFamily: "var(--font-m)",
                  fontSize: "0.9rem",
                  color: "var(--accent)",
                  letterSpacing: "0.12em",
                  marginTop: "0.7rem",
                }}
              >
                {registration.ticket}
              </div>
            </div>
          </div>
        )}

        {/* Reg ID */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.7rem 0",
            borderTop: "1px solid var(--border)",
            fontSize: "0.72rem",
            color: "var(--faint)",
          }}
        >
          <span>Reg ID</span>
          <span
            style={{ fontFamily: "var(--font-m)", color: "var(--muted)" }}
          >
            {registration.regId}
          </span>
        </div>
      </div>
    </div>
  );
}
