"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Particles from "@/components/public/Particles";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Those credentials don't match an organizer account.");
    } else {
      router.push("/admin/registrations");
      router.refresh();
    }
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "1.5rem",
        background: "var(--black)",
      }}
    >
      <div
        className="glow-orb"
        style={{
          width: 560,
          height: 560,
          top: "-26%",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />
      <Particles count={22} />

      <div
        style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 420 }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              fontFamily: "var(--font-d)",
              color: "var(--accent)",
              letterSpacing: "0.14em",
              fontSize: "1.3rem",
              marginBottom: "0.4rem",
            }}
          >
            EVERGLOW
          </div>
          <div
            style={{
              fontSize: "0.66rem",
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "var(--muted)",
            }}
          >
            Organizer Console
          </div>
        </div>

        <form
          onSubmit={submit}
          className="card"
          style={{ padding: "2rem", borderColor: "var(--border-2)" }}
        >
          <h1
            style={{
              fontFamily: "var(--font-d)",
              fontSize: "1.5rem",
              marginBottom: "0.4rem",
            }}
          >
            Sign in
          </h1>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "0.84rem",
              marginBottom: "1.6rem",
            }}
          >
            Restricted to The Cozy Canvas organizers &amp; door staff.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <div className="field">
              <label>Work email</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@everglow.events"
                autoComplete="username"
                required
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div
                style={{
                  background: "rgba(255,80,80,0.1)",
                  border: "1px solid rgba(255,80,80,0.3)",
                  borderRadius: "var(--r-s)",
                  padding: "0.7rem 0.9rem",
                  color: "var(--coral)",
                  fontSize: "0.8rem",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </div>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.2rem" }}>
          <a
            href="/"
            style={{
              color: "var(--faint)",
              fontSize: "0.78rem",
              textDecoration: "underline",
            }}
          >
            ← Back to event site
          </a>
        </div>
      </div>
    </div>
  );
}
