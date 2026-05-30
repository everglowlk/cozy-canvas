"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Particles from "./Particles";
import type { IEvent } from "@/types";

const FALLBACK = {
  schedule: null as string | null,
  venue: "Coffee Station Café, Colombo",
  seatCap: 20,
  priceLocal: "LKR 3,000",
};

function formatEventDate(dateStr: string, time: string) {
  const date = new Date(dateStr);
  const day = date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return `${day} · ${time}`;
}

export default function Hero() {
  const [event, setEvent] = useState<IEvent | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/events?status=open")
      .then((r) => r.json())
      .then((events: IEvent[]) => {
        if (events.length > 0) setEvent(events[0]);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const schedule = event ? formatEventDate(event.date, event.time) : FALLBACK.schedule;
  const venue = event ? event.venue : FALLBACK.venue;
  const seatCap = event ? event.capacity : FALLBACK.seatCap;
  const priceLocal = event ? `LKR ${event.priceLKR.toLocaleString()}` : FALLBACK.priceLocal;
  const isOpen = !!event;

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
          An unhurried evening of guided painting, café drinks &amp; quiet company — every weekend at Coffee Station Café.
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
          {isOpen ? (
            <Link href="/register" className="btn btn-primary">
              Reserve your seat — {priceLocal}
            </Link>
          ) : (
            <span
              className="btn"
              style={{
                background: "rgba(255,255,255,0.05)",
                color: "var(--muted)",
                border: "1px solid var(--border)",
                cursor: "default",
              }}
            >
              Registrations closed
            </span>
          )}
          <a href="#experience" className="btn btn-ghost">
            See the experience
          </a>
        </div>

        {/* Event details strip */}
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
          {loaded ? (
            <>
              {schedule && (
                <EventMeta icon="📅" label={schedule} highlight={isOpen} />
              )}
              {!schedule && !isOpen && (
                <EventMeta icon="📅" label="Next date coming soon" />
              )}
              <EventMeta icon="⏳" label="2–3 hours" />
              <EventMeta icon="🎨" label={`Only ${seatCap} easels`} />
              <EventMeta icon="📍" label={venue} />
            </>
          ) : (
            /* skeleton while loading */
            [130, 160, 100, 180].map((w) => (
              <div
                key={w}
                style={{
                  height: 16,
                  width: w,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.06)",
                  animation: "pulse 1.4s ease-in-out infinite",
                }}
              />
            ))
          )}
        </div>

        {/* Next event badge */}
        {isOpen && event && (
          <div
            className="fade-up"
            style={{
              animationDelay: "0.85s",
              marginTop: "1.6rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(var(--accent-rgb),0.1)",
              border: "1px solid rgba(var(--accent-rgb),0.25)",
              borderRadius: 100,
              padding: "0.35rem 1rem",
              fontSize: "0.76rem",
              color: "var(--accent)",
              fontWeight: 600,
              letterSpacing: "0.06em",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--accent)",
                display: "inline-block",
                boxShadow: "0 0 8px rgba(var(--accent-rgb),0.8)",
                animation: "pulse 1.8s ease-in-out infinite",
              }}
            />
            {event.title}
          </div>
        )}
      </div>
    </header>
  );
}

function EventMeta({
  icon,
  label,
  highlight,
}: {
  icon: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        fontSize: "0.82rem",
        color: highlight ? "var(--white)" : "var(--muted)",
        fontWeight: highlight ? 600 : 400,
      }}
    >
      <span style={{ fontSize: "1rem" }}>{icon}</span>
      <span>{label}</span>
    </div>
  );
}
