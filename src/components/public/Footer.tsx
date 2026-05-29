import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        position: "relative",
        overflow: "hidden",
        borderTop: "1px solid var(--border)",
        padding: "clamp(3rem,6vw,5rem) clamp(1.2rem,5vw,4rem) 2.4rem",
        textAlign: "center",
      }}
    >
      <div
        className="glow-orb"
        style={{
          width: 360,
          height: 180,
          bottom: -90,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />
      <div style={{ position: "relative", zIndex: 2 }}>
        <h3
          style={{
            fontFamily: "var(--font-d)",
            fontSize: "clamp(1.6rem,4vw,2.6rem)",
            letterSpacing: "-0.01em",
            marginBottom: "0.8rem",
          }}
        >
          Ready to{" "}
          <span style={{ color: "var(--accent)" }}>make something?</span>
        </h3>
        <Link
          href="/register"
          className="btn btn-primary"
          style={{ display: "inline-flex", marginBottom: "2.4rem" }}
        >
          Reserve your easel
        </Link>

        <hr
          className="eg-divider"
          style={{ maxWidth: 600, margin: "0 auto 2rem" }}
        />

        <div
          style={{
            fontFamily: "var(--font-d)",
            fontSize: "1.3rem",
            color: "var(--accent)",
            letterSpacing: "0.12em",
            marginBottom: "0.4rem",
          }}
        >
          EVERGLOW
        </div>
        <p
          style={{
            color: "var(--muted)",
            fontSize: "0.72rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginBottom: "1.2rem",
          }}
        >
          Turning concepts into iconic events
        </p>

        <div
          style={{
            display: "flex",
            gap: "1.4rem",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: "1rem",
          }}
        >
          <Link
            href="/terms"
            style={{
              color: "var(--muted)",
              fontSize: "0.76rem",
              letterSpacing: "0.04em",
              textDecoration: "underline",
            }}
          >
            Terms &amp; Conditions
          </Link>
          <Link
            href="/register"
            style={{
              color: "var(--muted)",
              fontSize: "0.76rem",
              letterSpacing: "0.04em",
              textDecoration: "underline",
            }}
          >
            Reserve a seat
          </Link>
          <a
            href="mailto:hello@everglow.events"
            style={{
              color: "var(--muted)",
              fontSize: "0.76rem",
              letterSpacing: "0.04em",
              textDecoration: "underline",
            }}
          >
            Contact us
          </a>
        </div>

        <p style={{ color: "var(--faint)", fontSize: "0.74rem" }}>
          The Cozy Canvas · in partnership with Coffee Station Café
        </p>
      </div>
    </footer>
  );
}
