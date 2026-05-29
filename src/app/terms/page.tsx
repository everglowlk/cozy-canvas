import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions — The Cozy Canvas",
};

const sections = [
  {
    title: "1. About the event",
    paras: [
      "The Cozy Canvas is a guided café painting session presented by EverGlow Events in partnership with Coffee Station Café. Sessions run every weekend (Saturday & Sunday), last approximately 2–3 hours, and are limited to 20 painters per session.",
      "Each ticket includes a canvas, easel, paints, one café drink and a guided session. Your finished painting is yours to take home.",
    ],
  },
  {
    title: "2. Registration & payment",
    paras: [
      "A seat is only reserved once payment is received and confirmed by our team. Submitting the registration form alone does not guarantee a seat.",
      "Payment is made by bank transfer to the account shown during registration. You must upload a clear photo or PDF of your payment slip. Our team reviews each registration and, once payment is verified, issues a confirmation email containing a unique QR code ticket.",
      "Ticket prices are LKR 3,000 per painter for locals and $10 USD per painter for visitors from abroad, unless otherwise stated.",
    ],
  },
  {
    title: "3. Your QR ticket",
    paras: [
      "Your QR code is unique to your registration and admits the number of painters stated on it. Please keep it private — anyone presenting the code may be admitted.",
      "The QR code is scanned once at the door. A ticket already checked in cannot be reused.",
    ],
  },
  {
    title: "4. Identity verification at the door",
    paras: [
      "For everyone's safety and to prevent ticket misuse, we verify each attendee's identity at the door against their registration.",
      "Local attendees must present their National Identity Card (NIC) — the NIC number given at registration will be checked.",
      "Visitors from abroad must present a valid Passport for verification.",
      "If the identity document does not match the registration, or cannot be produced, EverGlow staff may decline entry without refund.",
    ],
  },
  {
    title: "5. Cancellations & rescheduling",
    paras: [
      "If you can no longer attend, message us at least 48 hours before your session and we will move you to another available weekend at no cost.",
      "Refunds are handled case by case; no-shows and late cancellations are generally non-refundable as seats are strictly limited.",
    ],
  },
  {
    title: "6. Conduct & liability",
    paras: [
      "Painting materials may stain clothing — please dress accordingly. Attendees are responsible for their personal belongings.",
      "EverGlow and Coffee Station Café reserve the right to refuse or remove anyone behaving in a way that disrupts the session.",
    ],
  },
  {
    title: "7. Photography & privacy",
    paras: [
      "We may take photographs during sessions for promotional use. Let a host know on the day if you prefer not to be photographed.",
      "Personal details you provide are used only to manage your registration and attendance for this event.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        overflowY: "auto",
        background: "var(--black)",
      }}
    >
      {/* sticky top bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem clamp(1.2rem,5vw,3rem)",
          background: "rgba(6,16,13,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link
          href="/"
          style={{
            color: "var(--muted)",
            fontSize: "0.82rem",
          }}
        >
          ← Back to event
        </Link>
        <span
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--muted)",
          }}
        >
          Terms &amp; Conditions
        </span>
        <span
          style={{
            fontFamily: "var(--font-d)",
            color: "var(--accent)",
            letterSpacing: "0.12em",
          }}
        >
          EG
        </span>
      </div>

      <div style={{ position: "relative", overflow: "hidden" }}>
        <div
          className="glow-orb"
          style={{ width: 460, height: 460, top: "-30%", right: "-8%" }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: 800,
            margin: "0 auto",
            padding:
              "clamp(2.5rem,6vw,4rem) clamp(1.2rem,5vw,2rem) 5rem",
          }}
        >
          <div className="sec-label">The Cozy Canvas</div>
          <h1
            style={{
              fontFamily: "var(--font-d)",
              fontSize: "clamp(2rem,5vw,3.2rem)",
              letterSpacing: "-0.02em",
              marginBottom: "0.8rem",
            }}
          >
            Terms &amp; <span style={{ color: "var(--accent)" }}>Conditions</span>
          </h1>
          <p
            style={{
              color: "var(--muted)",
              lineHeight: 1.7,
              marginBottom: "2.6rem",
              maxWidth: 600,
            }}
          >
            Please read these terms before registering. By reserving a seat for
            The Cozy Canvas you agree to the following.
          </p>

          {/* ID highlight */}
          <div
            className="card"
            style={{
              padding: "1.4rem 1.6rem",
              borderColor: "var(--border-2)",
              marginBottom: "2.4rem",
              display: "flex",
              gap: "1rem",
              alignItems: "flex-start",
            }}
          >
            <span style={{ fontSize: "1.6rem" }}>🪪</span>
            <div>
              <h3
                style={{
                  fontFamily: "var(--font-d)",
                  fontSize: "0.95rem",
                  color: "var(--accent)",
                  marginBottom: "0.4rem",
                }}
              >
                Bring your ID to the door
              </h3>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "0.88rem",
                  lineHeight: 1.65,
                }}
              >
                Locals: bring your{" "}
                <strong style={{ color: "var(--white)" }}>NIC</strong>. Visitors
                from abroad: bring your{" "}
                <strong style={{ color: "var(--white)" }}>Passport</strong>. We
                check it against your registration when you arrive (see clause 4).
              </p>
            </div>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
          >
            {sections.map((s, i) => (
              <div key={i}>
                <h2
                  style={{
                    fontFamily: "var(--font-d)",
                    fontSize: "1.15rem",
                    marginBottom: "0.8rem",
                    color: "var(--white)",
                  }}
                >
                  {s.title}
                </h2>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.8rem",
                  }}
                >
                  {s.paras.map((p, j) => (
                    <p
                      key={j}
                      style={{
                        color: "var(--muted)",
                        fontSize: "0.92rem",
                        lineHeight: 1.75,
                      }}
                    >
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <hr className="eg-divider" style={{ margin: "2.6rem 0 1.6rem" }} />

          <p
            style={{
              color: "var(--faint)",
              fontSize: "0.8rem",
              lineHeight: 1.6,
            }}
          >
            Questions about these terms? Email{" "}
            <a
              href="mailto:hello@everglow.events"
              style={{ color: "var(--accent)" }}
            >
              hello@everglow.events
            </a>
            . EverGlow Events × Coffee Station Café.
          </p>

          <Link
            href="/register"
            className="btn btn-soft"
            style={{ display: "inline-flex", marginTop: "1.6rem" }}
          >
            Got it — reserve a seat
          </Link>
        </div>
      </div>
    </div>
  );
}
