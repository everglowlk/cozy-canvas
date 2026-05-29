"use client";

import { useRef } from "react";

interface ParticleConfig {
  left: number;
  top: number;
  size: number;
  dur: number;
  delay: number;
  op: number;
}

interface ParticlesProps {
  count?: number;
}

export default function Particles({ count = 36 }: ParticlesProps) {
  const dotsRef = useRef<ParticleConfig[] | null>(null);

  if (!dotsRef.current) {
    dotsRef.current = Array.from({ length: count }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 1 + Math.random() * 2.5,
      dur: 6 + Math.random() * 10,
      delay: -Math.random() * 12,
      op: 0.15 + Math.random() * 0.5,
    }));
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {dotsRef.current.map((d, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            borderRadius: "50%",
            background: "var(--accent)",
            opacity: d.op,
            boxShadow: "0 0 8px var(--accent)",
            animation: `floaty ${d.dur}s ${d.delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}
