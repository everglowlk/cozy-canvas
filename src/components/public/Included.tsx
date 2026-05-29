"use client";

export default function Included() {
  const inc = [
    ["🎨", "Canvas & easel", "An 11×14 canvas, easel and apron set up at your spot."],
    ["🖌️", "All the paints", "Brushes, acrylics and palette — everything provided."],
    ["☕", "One café drink", "A Coffee Station coffee, tea or cooler of your choice."],
    ["🧑‍🎨", "Guided session", "A friendly host leads the whole 2–3 hour piece."],
    ["🖼️", "Your painting", "Take your finished artwork home the same evening."],
    ["📸", "Photo moment", "A little gallery wall + corner for end-of-night photos."],
  ];

  return (
    <section
      id="included"
      style={{
        background: "var(--deep)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding:
            "clamp(4rem,8vw,7rem) clamp(1.2rem,5vw,4rem)",
        }}
      >
        <div className="sec-label">02 — What&apos;s included</div>
        <h2
          style={{
            fontFamily: "var(--font-d)",
            fontSize: "clamp(1.8rem,4vw,3rem)",
            letterSpacing: "-0.02em",
            marginBottom: "2.6rem",
          }}
        >
          One ticket, everything covered.
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1rem",
          }}
        >
          {inc.map((it, i) => (
            <div
              key={i}
              className="card"
              style={{ padding: "1.6rem 1.5rem" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "var(--border-2)";
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "var(--border)";
                (e.currentTarget as HTMLElement).style.transform = "none";
              }}
            >
              <div style={{ fontSize: "1.6rem", marginBottom: "0.8rem" }}>
                {it[0]}
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-d)",
                  fontSize: "1rem",
                  color: "var(--white)",
                  marginBottom: "0.4rem",
                }}
              >
                {it[1]}
              </h3>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "0.86rem",
                  lineHeight: 1.6,
                }}
              >
                {it[2]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
