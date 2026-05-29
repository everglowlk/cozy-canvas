"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Nav() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem clamp(1.2rem, 5vw, 4rem)",
        background: solid ? "rgba(6,16,13,0.82)" : "transparent",
        backdropFilter: solid ? "blur(20px)" : "none",
        borderBottom: solid ? "1px solid var(--border)" : "1px solid transparent",
        transition: "background 0.3s, border-color 0.3s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
        <span
          style={{
            fontFamily: "var(--font-d)",
            fontSize: "1.1rem",
            color: "var(--accent)",
            letterSpacing: "0.14em",
          }}
        >
          EG
        </span>
        <span
          style={{
            width: 1,
            height: 16,
            background: "var(--border-2)",
          }}
        />
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
      </div>

      <div className="land-links" style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        {["Experience", "Included", "Schedule", "FAQ"].map((l) => (
          <a
            key={l}
            href={`#${l.toLowerCase()}`}
            style={{
              fontSize: "0.72rem",
              fontWeight: 500,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--muted)",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLElement).style.color = "var(--accent)")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.color = "var(--muted)")
            }
          >
            {l}
          </a>
        ))}
        <Link href="/register" className="btn btn-primary btn-sm">
          Reserve a seat
        </Link>
      </div>
    </nav>
  );
}
