"use client";

import Link from "next/link";

export default function TicketActions() {
  return (
    <div
      className="no-print"
      style={{
        display: "flex",
        gap: "0.8rem",
        justifyContent: "center",
        flexWrap: "wrap",
        marginBottom: "2.4rem",
      }}
    >
      <button className="btn btn-primary" onClick={() => window.print()}>
        ⬇ Save / print ticket
      </button>
      <Link href="/" className="btn btn-ghost">
        Back to event
      </Link>
    </div>
  );
}
