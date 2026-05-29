"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import StatusPill from "@/components/ui/StatusPill";
import type { IRegistration } from "@/types";
import { formatMoney, timeAgo } from "@/lib/utils";

type ScanResult =
  | { kind: "found"; reg: IRegistration }
  | { kind: "error"; message: string }
  | null;

export default function CheckinPage() {
  const { data: session } = useSession();
  const [result, setResult] = useState<ScanResult>(null);
  const [manual, setManual] = useState("");
  const [camOn, setCamOn] = useState(false);
  const [camErr, setCamErr] = useState("");
  const [idChecked, setIdChecked] = useState(false);
  const [approvedTickets, setApprovedTickets] = useState<IRegistration[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  // Load approved tickets for demo picking
  useEffect(() => {
    fetch("/api/registrations?status=approved")
      .then((r) => r.json())
      .then((d) => setApprovedTickets(d.registrations || []));
  }, []);

  const stopCam = useCallback(() => {
    setCamOn(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => () => stopCam(), [stopCam]);

  async function lookup(code: string) {
    const normalized = code.trim().toUpperCase();
    setIdChecked(false);
    try {
      const res = await fetch(`/api/verify/${normalized}`);
      if (!res.ok) {
        const err = await res.json();
        setResult({ kind: "error", message: err.error || "Ticket not found" });
        stopCam();
        return;
      }
      const data = await res.json();
      // Re-fetch full reg from registrations API
      const regRes = await fetch(`/api/registrations/${data.regId}`);
      if (regRes.ok) {
        const reg = await regRes.json();
        setResult({ kind: "found", reg });
        stopCam();
      }
    } catch {
      setResult({ kind: "error", message: "Network error" });
    }
  }

  async function startCam() {
    setCamErr("");
    setResult(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setCamOn(true);

      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();

      // Dynamically import jsQR
      const { default: jsQR } = await import("jsqr");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

      const tick = () => {
        if (!streamRef.current) return;
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const qr = jsQR(img.data, img.width, img.height);
          if (qr) {
            let code = qr.data;
            try {
              const parsed = JSON.parse(code);
              if (parsed.t) code = parsed.t;
            } catch {}
            lookup(code);
            return;
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setCamErr(
        "Camera access unavailable. Use manual entry or pick a ticket below."
      );
      setCamOn(false);
    }
  }

  async function confirmCheckIn() {
    if (result?.kind !== "found") return;
    const reg = result.reg;
    const res = await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticket: reg.ticket,
        checkedInBy: session?.user.name || "Door staff",
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error || "Check-in failed");
      return;
    }
    const updated = await res.json();
    setResult({ kind: "found", reg: updated });
    toast.success(`${reg.name} checked in!`);
  }

  async function undoCheckIn() {
    if (result?.kind !== "found") return;
    const reg = result.reg;
    // Call PATCH to undo
    const res = await fetch(`/api/registrations/${reg.regId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkedIn: false, checkedInAt: null, checkedInBy: null }),
    });
    if (res.ok) {
      const updated = await res.json();
      setResult({ kind: "found", reg: updated });
      setIdChecked(false);
      toast("Check-in undone");
    }
  }

  const reg = result?.kind === "found" ? result.reg : null;
  const idLabel = reg ? (reg.country === "local" ? "NIC" : "Passport") : "";
  const idValue = reg
    ? reg.country === "local"
      ? reg.nic
      : "Visitor — check physical passport"
    : "";

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: "1.4rem" }}>
        <h2 style={{ fontFamily: "var(--font-d)", fontSize: "1.3rem", marginBottom: "0.3rem" }}>
          Door check-in
        </h2>
        <p style={{ color: "var(--muted)", fontSize: "0.84rem" }}>
          Scan an attendee&apos;s QR ticket, verify their identity document, then
          check them in.
        </p>
      </div>

      <div
        className="exp-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) minmax(0,1.1fr)",
          gap: "1.6rem",
          alignItems: "start",
        }}
      >
        {/* Scanner panel */}
        <div className="card" style={{ padding: "1.4rem" }}>
          <h3
            style={{
              fontSize: "0.66rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: "1rem",
            }}
          >
            1 · Scan ticket
          </h3>

          {/* Camera viewport */}
          <div
            style={{
              position: "relative",
              aspectRatio: "1/1",
              borderRadius: "var(--r-m)",
              overflow: "hidden",
              background: "#000",
              border: "1px solid var(--border-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem",
            }}
          >
            <video
              ref={videoRef}
              playsInline
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: camOn ? "block" : "none",
              }}
            />
            {camOn && (
              <div className="scan-reticle" />
            )}
            {!camOn && (
              <div style={{ textAlign: "center", color: "var(--faint)", padding: "1.5rem" }}>
                <div style={{ fontSize: "2.4rem", marginBottom: "0.6rem" }}>📷</div>
                <p style={{ fontSize: "0.84rem", color: "var(--muted)" }}>Camera is off</p>
              </div>
            )}
          </div>

          {!camOn ? (
            <button className="btn btn-primary" style={{ width: "100%" }} onClick={startCam}>
              Start camera scanner
            </button>
          ) : (
            <button className="btn btn-ghost" style={{ width: "100%" }} onClick={stopCam}>
              Stop camera
            </button>
          )}

          {camErr && (
            <p style={{ color: "var(--amber)", fontSize: "0.76rem", marginTop: "0.7rem", lineHeight: 1.5 }}>
              {camErr}
            </p>
          )}

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", margin: "1.2rem 0" }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: "0.68rem", color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              or enter code
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          {/* Manual entry */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (manual.trim()) lookup(manual.trim());
            }}
            style={{ display: "flex", gap: "0.5rem" }}
          >
            <input
              className="input"
              value={manual}
              onChange={(e) => setManual(e.target.value.toUpperCase())}
              placeholder="e.g. CC-9KX2-04"
              style={{ fontFamily: "var(--font-m)", textTransform: "uppercase" }}
            />
            <button className="btn btn-soft" type="submit">
              Find
            </button>
          </form>

          {/* Demo pick */}
          <div style={{ marginTop: "1.2rem" }}>
            <div
              style={{
                fontSize: "0.64rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--faint)",
                marginBottom: "0.6rem",
              }}
            >
              Pick an approved ticket
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {approvedTickets.length === 0 && (
                <span style={{ fontSize: "0.78rem", color: "var(--faint)" }}>
                  No approved tickets yet.
                </span>
              )}
              {approvedTickets.map((r) => (
                <button
                  key={r.regId}
                  onClick={() => lookup(r.ticket || "")}
                  className="btn btn-sm"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    color: "var(--muted)",
                    border: "1px solid var(--border)",
                    fontFamily: "var(--font-m)",
                  }}
                >
                  {r.ticket}
                  {r.checkedIn ? " ✓" : ""}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Verification panel */}
        <div
          className="card"
          style={{
            padding: "1.4rem",
            borderColor: reg ? "var(--border-2)" : "var(--border)",
            minHeight: 320,
          }}
        >
          <h3
            style={{
              fontSize: "0.66rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: "1rem",
            }}
          >
            2 · Verify &amp; admit
          </h3>

          {!result && (
            <div
              style={{
                height: "100%",
                minHeight: 240,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                color: "var(--faint)",
                gap: "0.7rem",
              }}
            >
              <span style={{ fontSize: "2.2rem", opacity: 0.5 }}>🎟️</span>
              <p style={{ fontSize: "0.88rem" }}>
                Scan or look up a ticket to see the attendee.
              </p>
            </div>
          )}

          {result?.kind === "error" && (
            <div
              style={{
                background: "rgba(255,80,80,0.1)",
                border: "1px solid rgba(255,80,80,0.3)",
                borderRadius: "var(--r-m)",
                padding: "1.4rem",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>⚠️</div>
              <p style={{ color: "var(--coral)", fontSize: "0.9rem" }}>
                {result.message}
              </p>
            </div>
          )}

          {reg && (
            <div>
              {/* Attendee header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginBottom: "1.2rem",
                }}
              >
                <span
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "rgba(var(--accent-rgb),0.15)",
                    color: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    flexShrink: 0,
                    fontSize: "1rem",
                  }}
                >
                  {reg.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "1.05rem", fontWeight: 600 }}>{reg.name}</div>
                  <div
                    style={{
                      fontFamily: "var(--font-m)",
                      fontSize: "0.8rem",
                      color: "var(--accent)",
                    }}
                  >
                    {reg.ticket}
                  </div>
                </div>
                {reg.checkedIn ? (
                  <span className="pill pill-approved">
                    <span className="dot" />Checked in
                  </span>
                ) : (
                  <span className="pill pill-pending">
                    <span className="dot" />Not yet
                  </span>
                )}
              </div>

              {/* Details grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.8rem 1.2rem",
                  marginBottom: "1.2rem",
                }}
              >
                {[
                  ["Admits", `${reg.guests} painter${reg.guests > 1 ? "s" : ""}`],
                  ["Tier", reg.tier],
                  ["Type", reg.country === "local" ? "Local" : "Visitor"],
                  ["Paid", formatMoney(reg.amount, reg.currency)],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div
                      style={{
                        fontSize: "0.6rem",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "var(--faint)",
                        marginBottom: "0.2rem",
                      }}
                    >
                      {k}
                    </div>
                    <div style={{ fontSize: "0.88rem", color: "var(--white)" }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* ID check */}
              <div
                style={{
                  background:
                    reg.country === "local"
                      ? "rgba(var(--accent-rgb),0.05)"
                      : "rgba(255,196,107,0.08)",
                  border: `1px solid ${
                    reg.country === "local"
                      ? "var(--border-2)"
                      : "rgba(255,196,107,0.3)"
                  }`,
                  borderRadius: "var(--r-m)",
                  padding: "1.1rem 1.2rem",
                  marginBottom: "1.2rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.7rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color:
                        reg.country === "local" ? "var(--accent)" : "var(--amber)",
                    }}
                  >
                    Required · check {idLabel}
                  </span>
                  <span style={{ fontSize: "1.1rem" }}>
                    {reg.country === "local" ? "🪪" : "🛂"}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "0.86rem",
                    color: "var(--white)",
                    marginBottom: "0.3rem",
                    fontFamily:
                      reg.country === "local" ? "var(--font-m)" : "var(--font-b)",
                  }}
                >
                  {idValue}
                </p>
                <p
                  style={{
                    fontSize: "0.76rem",
                    color: "var(--muted)",
                    lineHeight: 1.5,
                  }}
                >
                  {reg.country === "local"
                    ? "Confirm the NIC matches the registration before admitting."
                    : "Visitor — confirm a valid passport is presented at the door (T&C clause 4)."}
                </p>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    marginTop: "0.8rem",
                    cursor: "pointer",
                    fontSize: "0.84rem",
                    color: "var(--white)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={idChecked}
                    onChange={(e) => setIdChecked(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: "var(--accent)" }}
                  />
                  I verified the attendee&apos;s {idLabel}
                </label>
              </div>

              {!reg.checkedIn ? (
                <button
                  className="btn btn-primary"
                  style={{ width: "100%" }}
                  disabled={!idChecked}
                  onClick={confirmCheckIn}
                >
                  {idChecked ? "✓ Confirm check-in" : `Verify ${idLabel} to enable`}
                </button>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <p
                    style={{
                      color: "var(--accent)",
                      fontSize: "0.86rem",
                      marginBottom: "0.6rem",
                    }}
                  >
                    ✓ Admitted by {reg.checkedInBy} ·{" "}
                    {reg.checkedInAt ? timeAgo(reg.checkedInAt) : ""}
                  </p>
                  <button className="btn btn-ghost btn-sm" onClick={undoCheckIn}>
                    Undo check-in
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
