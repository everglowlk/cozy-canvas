"use client";

export default function Experience() {
  const items = [
    [
      "Brush & breathe",
      "No experience needed. Our host walks everyone through a guided piece, stroke by stroke, at a calm pace.",
    ],
    [
      "Coffee in hand",
      "Every easel comes with a Coffee Station drink of your choice — the café hum is part of the canvas.",
    ],
    [
      "Take it home",
      "The 11×14 canvas you paint is yours to keep. A little glow from the evening, framed on your wall.",
    ],
  ];

  return (
    <section
      id="experience"
      style={{
        position: "relative",
        maxWidth: 1180,
        margin: "0 auto",
        padding: "clamp(4rem,9vw,8rem) clamp(1.2rem,5vw,4rem)",
      }}
    >
      <div className="sec-label">01 — The Experience</div>
      <div
        className="exp-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1.1fr) minmax(0,1fr)",
          gap: "clamp(2rem,5vw,5rem)",
          alignItems: "center",
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "var(--font-d)",
              fontSize: "clamp(2rem,4.4vw,3.4rem)",
              lineHeight: 1.04,
              letterSpacing: "-0.02em",
              marginBottom: "1.4rem",
            }}
          >
            An unhurried evening of{" "}
            <span style={{ color: "var(--accent)" }}>
              paint, coffee & quiet company.
            </span>
          </h2>
          <p
            style={{
              color: "var(--muted)",
              lineHeight: 1.8,
              fontSize: "1rem",
              marginBottom: "2rem",
              maxWidth: 520,
            }}
          >
            The Cozy Canvas is a small weekend painting session tucked inside
            Coffee Station Café. Twenty easels, warm light, a guided piece, and
            absolutely no pressure to be &ldquo;good&rdquo; at art. Just you, a brush, and a
            really nice few hours.
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {items.map((it, i) => (
              <div
                key={i}
                className="card"
                style={{ padding: "1.2rem 1.4rem" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "var(--border-2)";
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateX(6px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "var(--border)";
                  (e.currentTarget as HTMLElement).style.transform = "none";
                }}
              >
                <h3
                  style={{
                    fontFamily: "var(--font-d)",
                    fontSize: "0.98rem",
                    color: "var(--accent)",
                    marginBottom: "0.3rem",
                    letterSpacing: "0.02em",
                  }}
                >
                  {it[0]}
                </h3>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: "0.88rem",
                    lineHeight: 1.6,
                  }}
                >
                  {it[1]}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateRows: "1.3fr 1fr",
            gap: "1rem",
            height: "clamp(380px, 46vw, 560px)",
          }}
        >
          <div
            className="img-ph"
            style={{ animation: "floaty 9s ease-in-out infinite" }}
          >
            <span>
              photo — painters at easels
              <br />
              warm café light · 4:3
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div className="img-ph">
              <span>
                coffee +<br />
                palette
              </span>
            </div>
            <div className="img-ph">
              <span>
                finished
                <br />
                canvas
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
