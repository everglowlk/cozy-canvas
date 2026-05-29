"use client";

import { useRef, useState } from "react";

export interface ReceiptValue {
  file: File;
  preview: string | null; // data URL for images, null for PDF
  name: string;
  kind: "img" | "pdf";
}

interface ReceiptUploadProps {
  value: ReceiptValue | null;
  onChange: (v: ReceiptValue | null) => void;
  error?: string;
}

export default function ReceiptUpload({
  value,
  onChange,
  error,
}: ReceiptUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  function handleFile(file: File | null) {
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isPDF = file.type === "application/pdf";

    if (!isImage && !isPDF) {
      alert("Please upload an image (JPG, PNG) or PDF of your payment slip.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File too large — maximum 10 MB.");
      return;
    }

    if (isPDF) {
      onChange({ file, preview: null, name: file.name, kind: "pdf" });
      return;
    }

    // Compress image
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const max = 1200;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        onChange({ file, preview: dataUrl, name: file.name, kind: "img" });
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleFile(e.dataTransfer.files[0] ?? null);
        }}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `1.5px dashed ${drag ? "var(--accent)" : error ? "var(--coral)" : "var(--border-2)"}`,
          borderRadius: "var(--r-m)",
          padding: value?.preview ? "1rem" : "2rem 1.5rem",
          textAlign: "center",
          cursor: "pointer",
          transition: "border-color 0.25s, background 0.25s",
          background: drag
            ? "rgba(var(--accent-rgb),0.05)"
            : "rgba(255,255,255,0.015)",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />

        {value?.preview ? (
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value.preview}
              alt="receipt"
              style={{
                maxHeight: 220,
                maxWidth: "100%",
                borderRadius: "var(--r-s)",
                margin: "0 auto",
                display: "block",
              }}
            />
            <p
              style={{
                color: "var(--accent)",
                fontSize: "0.78rem",
                marginTop: "0.7rem",
              }}
            >
              ✓ {value.name} — tap to replace
            </p>
          </div>
        ) : value?.kind === "pdf" ? (
          <div>
            <div style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>📄</div>
            <p style={{ color: "var(--accent)", fontSize: "0.84rem" }}>
              ✓ {value.name}
            </p>
            <p
              style={{
                color: "var(--faint)",
                fontSize: "0.74rem",
                marginTop: "0.3rem",
              }}
            >
              Tap to replace
            </p>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: "1.8rem", marginBottom: "0.6rem" }}>🧾</div>
            <p
              style={{
                color: "var(--white)",
                fontSize: "0.9rem",
                fontWeight: 500,
              }}
            >
              Drop your payment slip here
            </p>
            <p
              style={{
                color: "var(--faint)",
                fontSize: "0.76rem",
                marginTop: "0.35rem",
              }}
            >
              or tap to browse · JPG, PNG or PDF
            </p>
          </div>
        )}
      </div>
      {error && <p className="field-err" style={{ marginTop: "0.4rem" }}>{error}</p>}
    </div>
  );
}
