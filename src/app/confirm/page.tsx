import Link from "next/link";
import Particles from "@/components/public/Particles";

interface ConfirmPageProps {
  searchParams: { regId?: string };
}

export const metadata = {
  title: "Registration Received — The Cozy Canvas",
};

const steps = [
  {
    label: "Registration received",
    desc: "We've got your details and payment slip.",
    state: "done",
  },
  {
    label: "Our team reviews your slip",
    desc: "We verify the transfer against your registration — usually within 24 hours.",
    state: "active",
  },
  {
    label: "QR ticket lands in your inbox",
    desc: "Once confirmed, your scannable QR ticket is emailed to you.",
    state: "wait",
  },
];

export default function ConfirmPage({ searchParams }: ConfirmPageProps) {
  const regId = searchParams.regId;

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
        <span
          style={{
            fontFamily: "var(--font-d)",
            color: "var(--accent)",
            letterSpacing: "0.12em",
          }}
        >
          EG
        </span>
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
        <span style={{ width: 20 }} />
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
          style={{
            width: 600,
            height: 600,
            top: "-30%",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
        <Particles count={26} />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: 560,
            width: "100%",
            textAlign: "center",
          }}
        >
          {/* Icon */}
          <div
            className="fade-up"
            style={{
              width: 84,
              height: 84,
              borderRadius: "50%",
              margin: "0 auto 1.8rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(var(--accent-rgb),0.12)",
              border: "1px solid var(--border-2)",
              boxShadow: "0 0 50px rgba(var(--accent-rgb),0.4)",
            }}
          >
            <span style={{ fontSize: "2.2rem" }}>🎨</span>
          </div>

          {regId && (
            <div
              className="fade-up"
              style={{ animationDelay: "0.1s" }}
            >
              <span className="eg-eyebrow center">
                Registration #{regId}
              </span>
            </div>
          )}

          <h1
            className="fade-up"
            style={{
              animationDelay: "0.2s",
              fontFamily: "var(--font-d)",
              fontSize: "clamp(2rem,5vw,3.4rem)",
              letterSpacing: "-0.02em",
              margin: "1rem 0",
              lineHeight: 1.05,
            }}
          >
            Thank you for
            <br />
            <span style={{ color: "var(--accent)" }}>registering!</span>
          </h1>

          <p
            className="fade-up"
            style={{
              animationDelay: "0.3s",
              color: "var(--muted)",
              lineHeight: 1.75,
              marginBottom: "2.4rem",
              fontSize: "1rem",
            }}
          >
            We&apos;ve received your registration and payment slip. Our team
            will review your details and confirm your payment — once approved,
            we&apos;ll email you a{" "}
            <strong style={{ color: "var(--white)" }}>QR code ticket</strong> to
            show at the door.
          </p>

          {/* Progress steps */}
          <div
            className="card fade-up"
            style={{
              animationDelay: "0.4s",
              padding: "1.6rem",
              textAlign: "left",
              marginBottom: "2rem",
            }}
          >
            {steps.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "1rem",
                  paddingBottom: i < 2 ? "1.3rem" : 0,
                  position: "relative",
                }}
              >
                {i < 2 && (
                  <div
                    style={{
                      position: "absolute",
                      left: 15,
                      top: 32,
                      bottom: 6,
                      width: 1,
                      background: "var(--border-2)",
                    }}
                  />
                )}
                <div
                  style={{
                    flexShrink: 0,
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    background:
                      s.state === "done"
                        ? "var(--accent)"
                        : s.state === "active"
                        ? "rgba(var(--accent-rgb),0.14)"
                        : "rgba(255,255,255,0.04)",
                    color:
                      s.state === "done"
                        ? "#04130e"
                        : s.state === "active"
                        ? "var(--accent)"
                        : "var(--faint)",
                    border:
                      s.state === "active"
                        ? "1px solid var(--accent)"
                        : "1px solid transparent",
                    animation:
                      s.state === "active" ? "pulseGlow 2s infinite" : "none",
                  }}
                >
                  {s.state === "done" ? "✓" : i + 1}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.92rem",
                      fontWeight: 600,
                      color:
                        s.state === "wait" ? "var(--muted)" : "var(--white)",
                      marginBottom: "0.2rem",
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--muted)",
                      lineHeight: 1.55,
                    }}
                  >
                    {s.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div
            className="fade-up"
            style={{
              animationDelay: "0.6s",
              display: "flex",
              gap: "0.8rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link href="/" className="btn btn-ghost">
              Back to event
            </Link>
          </div>

          <p
            className="fade-up"
            style={{
              animationDelay: "0.7s",
              color: "var(--faint)",
              fontSize: "0.74rem",
              marginTop: "1.6rem",
            }}
          >
            To manage registrations, visit the{" "}
            <Link
              href="/admin"
              style={{
                color: "var(--accent)",
                textDecoration: "underline",
                fontSize: "0.74rem",
              }}
            >
              Admin panel
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
