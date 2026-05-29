"use client";

import { useState } from "react";

interface CopyRowProps {
  label: string;
  value: string;
}

export default function CopyRow({ label, value }: CopyRowProps) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard?.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "1rem",
        padding: "0.7rem 0",
        borderBottom: "1px solid rgba(var(--accent-rgb),0.08)",
      }}
    >
      <span
        style={{
          color: "var(--muted)",
          fontSize: "0.78rem",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <button
        onClick={copy}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "transparent",
          border: "none",
          color: "var(--white)",
          fontFamily: "var(--font-m)",
          fontSize: "0.88rem",
          letterSpacing: "0.02em",
          cursor: "pointer",
        }}
      >
        {value}
        <span
          style={{
            fontSize: "0.64rem",
            color: copied ? "var(--accent)" : "var(--faint)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            minWidth: 34,
            transition: "color 0.2s",
          }}
        >
          {copied ? "✓ copied" : "copy"}
        </span>
      </button>
    </div>
  );
}
