"use client";

import Image from "next/image";

interface QRDisplayProps {
  dataUrl: string;
  size?: number;
  alt?: string;
}

export default function QRDisplay({
  dataUrl,
  size = 200,
  alt = "QR Code",
}: QRDisplayProps) {
  if (!dataUrl) {
    return (
      <div
        style={{
          width: size,
          height: size,
          background: "var(--forest)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-s)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--faint)",
          fontSize: "0.72rem",
        }}
      >
        No QR
      </div>
    );
  }

  return (
    <Image
      src={dataUrl}
      width={size}
      height={size}
      alt={alt}
      style={{
        borderRadius: "var(--r-s)",
        border: "2px solid rgba(var(--accent-rgb), 0.3)",
        display: "block",
      }}
      unoptimized
    />
  );
}
