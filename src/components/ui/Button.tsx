"use client";

import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "soft" | "danger";
  size?: "sm" | "md";
  loading?: boolean;
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variantClass = {
    primary: "btn-primary",
    ghost: "btn-ghost",
    soft: "btn-soft",
    danger: "btn-danger",
  }[variant];

  const sizeClass = size === "sm" ? "btn-sm" : "";

  return (
    <button
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              width: 14,
              height: 14,
              border: "2px solid currentColor",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spinSlow 0.8s linear infinite",
              display: "inline-block",
            }}
          />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
