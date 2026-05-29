"use client";

import Link from "next/link";
import Particles from "./Particles";

const EVENT_DATA = {
  tagline: "An unhurried evening of guided painting, café drinks & quiet company — every weekend at Coffee Station Café.",
  schedule: "Saturday, August 2 · 5:00 PM",
  duration: "2–3 hours",
  seatCap: 20,
  venue: "Coffee Station Café, Colombo",
  priceLocal: "LKR 3,000",
  priceForeign: "$10 USD",
};

export default function Hero() {
  return (
    <header
      style={{
        position: "relative",
        minHeight: "92vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <div
        className="glow-orb"
        style={{
          width: 720,
          height: 720,
          top: "-22%",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />
      <div
        className="glow-orb"
        style={{
          width: 380,
          height: 380,
          bottom: "4%",
          left: "-6%",
          background:
            "radial-gradient(circle, rgba(240,168,104,0.32) 0%, transparent 70%)",
        }}
      />
      <Particles count={42} />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 1180,
          margin: "0 auto",
          padding: "0 clamp(1.2rem,5vw,4rem)",
          textAlign: "center",
        }}
      >
        <div className="fade-up" style={{ animationDelay: "0.1s" }}>
          <span className="eg-eyebrow center">
            EverGlow × Coffee Station Café
          </span>
        </div>

        <h1
          className="fade-up"
          style={{
            animationDelay: "0.25s",
            fontFamily: "var(--font-d)",
            fontSize: "clamp(3.2rem, 9vw, 8rem)",
            lineHeight: 0.94,
            letterSpacing: "-0.02em",
            margin: "1.4rem 0 1.2rem",
          }}
        >
          The Cozy
          <br />
          <span style={{ color: "var(--accent)" }}>Canvas</span>
        </h1>

        <p
          className="fade-up"
          style={{
            animationDelay: "0.4s",
            fontSize: "clamp(1rem,2.2vw,1.3rem)",
            fontWeight: 300,
            color: "var(--muted)",
            letterSpacing: "0.04em",
            maxWidth: 620,
            margin: "0 auto 2.2rem",
            lineHeight: 1.6,
          }}
        >
          {EVENT_DATA.tagline}
        </p>

        <div
          className="fade-up"
          style={{
            animationDelay: "0.55s",
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href="/register" className="btn btn-primary">
            Reserve your seat — {EVENT_DATA.priceLocal}
          </Link>
          <a href="#experience" className="btn btn-ghost">
            See the experience
          </a>
        </div>

        <div
          className="fade-up"
          style={{
            animationDelay: "0.7s",
            display: "flex",
            gap: "2.4rem",
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: "3rem",
          }}
        >
          {[
            ["📅", EVENT_DATA.schedule],
            ["⏳", EVENT_DATA.duration],
            ["🎨", `Only ${EVENT_DATA.seatCap} easels`],
            ["📍", EVENT_DATA.venue],
          ].map(([icon, label], i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                fontSize: "0.82rem",
                color: "var(--muted)",
              }}
            >
              <span style={{ fontSize: "1rem" }}>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
