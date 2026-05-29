import type { Metadata } from "next";
import { Righteous, DM_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const righteous = Righteous({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-righteous",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Cozy Canvas — Café Painting Experience",
  description:
    "A guided café painting session by EverGlow Events in partnership with Coffee Station Café. Reserve your easel for an unhurried evening of paint, coffee & quiet company.",
  keywords: ["painting", "café", "event", "Sri Lanka", "EverGlow", "Coffee Station"],
  openGraph: {
    title: "The Cozy Canvas",
    description: "Reserve your easel for an evening of paint & coffee.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${righteous.variable} ${dmSans.variable}`}>
      <body>
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "var(--accent)",
              color: "#04130e",
              fontWeight: 600,
              fontSize: "0.82rem",
              borderRadius: "100px",
              padding: "0.8rem 1.4rem",
            },
            success: {
              iconTheme: {
                primary: "#04130e",
                secondary: "var(--accent)",
              },
            },
            error: {
              style: {
                background: "var(--coral)",
                color: "#fff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
