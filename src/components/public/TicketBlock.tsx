import Link from "next/link";

const EVENT = {
  schedule: "Every weekend · Sat & Sun",
  venue: "Coffee Station Café, Colombo",
  duration: "2–3 hours",
  seatCap: 20,
  priceLocal: "LKR 3,000",
  priceForeign: "$10 USD",
};

export default function TicketBlock() {
  return (
    <section
      id="schedule"
      style={{
        position: "relative",
        maxWidth: 1180,
        margin: "0 auto",
        padding: "clamp(4rem,9vw,8rem) clamp(1.2rem,5vw,4rem)",
        overflow: "hidden",
      }}
    >
      <div
        className="glow-orb"
        style={{ width: 480, height: 480, top: "10%", right: "-10%" }}
      />
      <div
        className="exp-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) minmax(0,420px)",
          gap: "clamp(2rem,5vw,4rem)",
          alignItems: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div>
          <div className="sec-label">03 — Reserve</div>
          <h2
            style={{
              fontFamily: "var(--font-d)",
              fontSize: "clamp(2rem,4.6vw,3.6rem)",
              lineHeight: 1.04,
              letterSpacing: "-0.02em",
              marginBottom: "1.2rem",
            }}
          >
            Twenty easels.
            <br />
            <span style={{ color: "var(--accent)" }}>Every weekend.</span>
          </h2>
          <p
            style={{
              color: "var(--muted)",
              lineHeight: 1.8,
              maxWidth: 460,
              marginBottom: "1.8rem",
            }}
          >
            Seats go fast and we keep the room small on purpose. Reserve your
            easel, transfer the fee, and upload your slip — our team confirms
            within a day and sends a QR ticket to your inbox.
          </p>
          <ul
            style={{
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: "0.7rem",
            }}
          >
            {[
              `${EVENT.schedule} · ${EVENT.duration}`,
              EVENT.venue,
              `Max ${EVENT.seatCap} painters per session`,
              "Confirmation by QR within 24 hours",
            ].map((x, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  gap: "0.7rem",
                  alignItems: "center",
                  color: "var(--muted)",
                  fontSize: "0.9rem",
                }}
              >
                <span style={{ color: "var(--accent)" }}>✦</span>
                {x}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="card"
          style={{
            padding: "2.2rem",
            borderColor: "var(--border-2)",
            boxShadow: "0 20px 60px rgba(var(--accent-rgb),0.1)",
          }}
        >
          <div className="pill pill-approved" style={{ marginBottom: "1.4rem" }}>
            <span className="dot" />
            Painter ticket
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "0.6rem",
              marginBottom: "0.3rem",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-d)",
                fontSize: "2.8rem",
                color: "var(--accent)",
              }}
            >
              {EVENT.priceLocal}
            </span>
            <span style={{ color: "var(--muted)", fontSize: "0.82rem" }}>
              per painter · locals
            </span>
          </div>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "0.82rem",
              marginBottom: "1.6rem",
            }}
          >
            {EVENT.priceForeign} for visitors from abroad
          </p>

          <hr className="eg-divider" style={{ margin: "0 0 1.4rem" }} />

          <ul
            style={{
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: "0.7rem",
              marginBottom: "1.8rem",
            }}
          >
            {[
              "Canvas, easel & all paints",
              "One Coffee Station drink",
              "Guided 2–3 hour session",
              "Your painting to take home",
            ].map((x, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  gap: "0.6rem",
                  fontSize: "0.86rem",
                  color: "var(--white)",
                }}
              >
                <span style={{ color: "var(--accent)" }}>✓</span>
                {x}
              </li>
            ))}
          </ul>

          <Link
            href="/register"
            className="btn btn-primary"
            style={{ display: "flex", width: "100%", justifyContent: "center" }}
          >
            Reserve a seat
          </Link>
          <p
            style={{
              textAlign: "center",
              color: "var(--faint)",
              fontSize: "0.72rem",
              marginTop: "0.9rem",
            }}
          >
            Pay by bank transfer · confirm by QR
          </p>
        </div>
      </div>
    </section>
  );
}
