import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        black: "#06100d",
        deep: "#0a1a15",
        forest: "#0d2b21",
        panel: "#0c1814",
        teal: "#00c49a",
        cyan: "#00e5b0",
        "mint-soft": "#79ecd1",
        cream: "#f3ead9",
        ember: "#f0a868",
        blush: "#e98a6a",
        white: "#f5fff9",
        coral: "#ff5050",
        amber: "#ffc46b",
      },
      fontFamily: {
        display: ["Righteous", "system-ui", "sans-serif"],
        body: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["Courier New", "monospace"],
      },
      borderRadius: {
        sm: "10px",
        md: "16px",
        lg: "24px",
      },
      animation: {
        "fade-up": "fadeUp 0.8s both",
        "fade-in": "fadeIn 0.3s both",
        floaty: "floaty 9s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "spin-slow": "spinSlow 8s linear infinite",
        "scan-line": "scanLine 2s linear infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "none" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        spinSlow: {
          to: { transform: "rotate(360deg)" },
        },
        scanLine: {
          "0%": { top: "4%" },
          "50%": { top: "92%" },
          "100%": { top: "4%" },
        },
      },
      backgroundImage: {
        "glow-radial":
          "radial-gradient(circle, rgba(0,229,176,0.4) 0%, transparent 70%)",
      },
    },
  },
  plugins: [forms],
};

export default config;
