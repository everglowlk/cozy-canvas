"use client";

import { useState } from "react";

const qa = [
  [
    "Do I need to know how to paint?",
    "Not at all. The whole session is guided and beginner-friendly — most people have never picked up a brush. The goal is to relax, not to impress.",
  ],
  [
    "How does payment work?",
    "After you fill in the form, we show you our bank transfer details. Make the transfer, upload a photo of your slip, and our team verifies it before sending your QR ticket.",
  ],
  [
    "When do I get my ticket?",
    "Once we confirm your payment (usually within 24 hours) you'll get an email with a QR code. Show it at the café door and you're in.",
  ],
  [
    "Can I bring friends?",
    "Yes — choose the number of guests on the form. Seats are limited to 20 per session, so reserve together early.",
  ],
  [
    "What if I need to cancel?",
    "Message us at least 48 hours before your session and we'll move you to another weekend at no cost.",
  ],
  [
    "What ID do I need to bring?",
    "Local attendees must bring their NIC. Visitors from abroad must bring a valid Passport. We check it at the door against your registration — see our Terms & Conditions for details.",
  ],
];

export default function FAQ() {
  const [open, setOpen] = useState<number>(0);

  return (
    <section
      id="faq"
      style={{
        background: "var(--deep)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          maxWidth: 880,
          margin: "0 auto",
          padding: "clamp(4rem,8vw,7rem) clamp(1.2rem,5vw,4rem)",
        }}
      >
        <div className="sec-label">04 — Questions</div>
        <h2
          style={{
            fontFamily: "var(--font-d)",
            fontSize: "clamp(1.8rem,4vw,3rem)",
            letterSpacing: "-0.02em",
            marginBottom: "2.4rem",
          }}
        >
          Good to know.
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          {qa.map((x, i) => (
            <div
              key={i}
              className="card"
              style={{
                padding: 0,
                overflow: "hidden",
                borderColor: open === i ? "var(--border-2)" : "var(--border)",
              }}
            >
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  color: "var(--white)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1.3rem 1.5rem",
                  textAlign: "left",
                  fontSize: "1rem",
                  fontWeight: 500,
                }}
              >
                {x[0]}
                <span
                  style={{
                    color: "var(--accent)",
                    fontSize: "1.3rem",
                    transition: "transform 0.3s",
                    transform: open === i ? "rotate(45deg)" : "none",
                    flexShrink: 0,
                  }}
                >
                  +
                </span>
              </button>
              <div
                style={{
                  maxHeight: open === i ? 200 : 0,
                  overflow: "hidden",
                  transition: "max-height 0.35s ease",
                }}
              >
                <p
                  style={{
                    color: "var(--muted)",
                    lineHeight: 1.7,
                    fontSize: "0.9rem",
                    padding: "0 1.5rem 1.4rem",
                  }}
                >
                  {x[1]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
