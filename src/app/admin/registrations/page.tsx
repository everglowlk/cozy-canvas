"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import StatusPill from "@/components/ui/StatusPill";
import type { IRegistration, IEvent, StatsResult } from "@/types";
import { formatMoney, timeAgo, getInitials } from "@/lib/utils";
import Image from "next/image";

/* ── Export helpers ── */
function exportRows(registrations: IRegistration[]) {
  return registrations.map((r) => ({
    "Reg ID": r.regId,
    "Name": r.name,
    "Email": r.email,
    "Phone": r.phone,
    "NIC": r.nic,
    "Country": r.country === "local" ? "Local" : "Foreign",
    "Easels": r.guests,
    "Tier": r.tier,
    "Pay Method": r.payMethod,
    "Pay Ref": r.payRef,
    "Amount": r.amount,
    "Currency": r.currency,
    "Status": r.status,
    "Ticket": r.ticket ?? "",
    "Checked In": r.checkedIn ? "Yes" : "No",
    "Checked In At": r.checkedInAt ? new Date(r.checkedInAt).toLocaleString() : "",
    "Notes": r.notes,
    "Registered At": new Date(r.createdAt).toLocaleString(),
  }));
}

async function exportCSV(registrations: IRegistration[], filename: string) {
  const rows = exportRows(registrations);
  const headers = Object.keys(rows[0] || {});
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      headers.map((h) => {
        const val = String((r as Record<string, unknown>)[h] ?? "").replace(/"/g, '""');
        return `"${val}"`;
      }).join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

async function exportExcel(registrations: IRegistration[], filename: string) {
  const { utils, writeFile } = await import("xlsx");
  const rows = exportRows(registrations);
  const ws = utils.json_to_sheet(rows);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Registrations");
  writeFile(wb, filename);
}

async function exportPDF(registrations: IRegistration[], filename: string) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  doc.setFillColor(6, 16, 13);
  doc.rect(0, 0, 297, 210, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(0, 229, 176);
  doc.text("THE COZY CANVAS", 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(180, 210, 200);
  doc.text(`Attendee List · ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}  ·  ${registrations.length} records`, 14, 25);

  autoTable(doc, {
    startY: 30,
    head: [["Reg ID", "Name", "Email", "Phone", "Easels", "Amount", "Pay Method", "Status", "Ticket", "Checked In", "Registered"]],
    body: registrations.map((r) => [
      r.regId,
      r.name,
      r.email,
      r.phone,
      r.guests,
      formatMoney(r.amount, r.currency),
      r.payMethod,
      r.status.toUpperCase(),
      r.ticket ?? "—",
      r.checkedIn ? "✓" : "—",
      new Date(r.createdAt).toLocaleDateString("en-GB"),
    ]),
    styles: { fontSize: 7.5, cellPadding: 3, textColor: [245, 255, 249], fillColor: [12, 24, 20] },
    headStyles: { fillColor: [13, 43, 33], textColor: [0, 229, 176], fontStyle: "bold", fontSize: 7.5 },
    alternateRowStyles: { fillColor: [8, 18, 14] },
    tableLineWidth: 0.1,
  });

  doc.save(filename);
}

/* ── Stats cards ── */
function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="card" style={{ padding: "1.3rem 1.4rem", flex: "1 1 150px", minWidth: 140 }}>
      <div
        style={{
          fontSize: "0.64rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: "0.6rem",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-d)",
          fontSize: "2rem",
          color: accent ? "var(--accent)" : "var(--white)",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: "0.72rem", color: "var(--faint)", marginTop: "0.4rem" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

/* ── Receipt lightbox ── */
function ReceiptLightbox({ url, onClose }: { url: string; onClose: () => void }) {
  const isPdf = url.toLowerCase().includes(".pdf") || url.toLowerCase().includes("/raw/");

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        background: "rgba(0,0,0,0.88)",
        backdropFilter: "blur(6px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        animation: "fadeIn 0.15s",
      }}
    >
      {/* toolbar */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.8rem",
          marginBottom: "1rem",
          width: "100%",
          maxWidth: 860,
          justifyContent: "flex-end",
        }}
      >
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-sm btn-ghost"
          onClick={(e) => e.stopPropagation()}
        >
          Open original ↗
        </a>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "none",
            color: "var(--white)",
            width: 36,
            height: 36,
            borderRadius: 8,
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      {/* content */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 860,
          width: "100%",
          maxHeight: "calc(100dvh - 8rem)",
          overflowY: "auto",
          borderRadius: "var(--r)",
          background: "var(--panel)",
          border: "1px solid var(--border-2)",
        }}
      >
        {isPdf ? (
          <iframe
            src={url}
            title="Payment slip"
            style={{ width: "100%", height: "80dvh", border: "none", borderRadius: "var(--r)" }}
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={url}
            alt="Payment slip"
            style={{ width: "100%", height: "auto", display: "block", borderRadius: "var(--r)" }}
          />
        )}
      </div>
    </div>
  );
}

/* ── Receipt thumbnail ── */
function ReceiptThumb({ reg, onClick }: { reg: IRegistration; onClick: () => void }) {
  const hasReceipt = reg.receiptUrl && reg.receiptUrl !== "/placeholder-receipt.jpg";
  const isPdf = hasReceipt && (reg.receiptUrl.toLowerCase().includes(".pdf") || reg.receiptUrl.toLowerCase().includes("/raw/"));

  if (!hasReceipt) {
    // Stylised placeholder slip (no real upload)
    return (
      <div
        style={{
          width: "100%",
          aspectRatio: "3/4",
          borderRadius: "var(--r-s)",
          background: "repeating-linear-gradient(0deg,#f7f9f8 0 28px,#eef2f0 28px 29px)",
          border: "1px solid var(--border)",
          padding: "1.4rem",
          color: "#33433d",
          fontFamily: "var(--font-m)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.06em", marginBottom: "0.8rem", color: "#0d2b21" }}>
          {reg.payMethod === "Wise transfer" ? "WISE" : reg.payMethod === "Card (link)" ? "CARD" : "COMMERCIAL BANK"}
        </div>
        {[
          ["AMOUNT", formatMoney(reg.amount, reg.currency)],
          ["REF", reg.payRef],
          ["TO", "EverGlow Events"],
          ["DATE", new Date(reg.createdAt).toLocaleDateString()],
          ["STATUS", "SUCCESS ✓"],
        ].map(([k, v], i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.74rem", padding: "0.3rem 0", borderBottom: "1px dashed #cdd8d3" }}>
            <span style={{ color: "#7a8a83" }}>{k}</span>
            <span style={{ fontWeight: 600 }}>{v}</span>
          </div>
        ))}
        <div style={{ position: "absolute", bottom: 10, right: 12, fontSize: "0.6rem", color: "#9aa8a2", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          payment slip
        </div>
      </div>
    );
  }

  if (isPdf) {
    return (
      <button
        onClick={onClick}
        style={{
          width: "100%",
          aspectRatio: "3/4",
          borderRadius: "var(--r-s)",
          border: "1px solid var(--border-2)",
          background: "rgba(var(--accent-rgb),0.05)",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.7rem",
          color: "var(--muted)",
          transition: "background 0.2s, border-color 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "rgba(var(--accent-rgb),0.1)";
          (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "rgba(var(--accent-rgb),0.05)";
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border-2)";
        }}
      >
        <span style={{ fontSize: "2.5rem" }}>📄</span>
        <span style={{ fontSize: "0.78rem", color: "var(--accent)" }}>Click to view PDF</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: 0,
        border: "none",
        background: "transparent",
        cursor: "zoom-in",
        borderRadius: "var(--r-s)",
        overflow: "hidden",
        display: "block",
        position: "relative",
      }}
    >
      <Image
        src={reg.receiptUrl}
        alt="Payment slip"
        width={300}
        height={400}
        style={{ width: "100%", height: "auto", display: "block", borderRadius: "var(--r-s)" }}
        unoptimized
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "var(--r-s)",
          transition: "background 0.2s",
          fontSize: "0.8rem",
          color: "transparent",
          fontWeight: 600,
          letterSpacing: "0.08em",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.45)";
          (e.currentTarget as HTMLElement).style.color = "var(--white)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0)";
          (e.currentTarget as HTMLElement).style.color = "transparent";
        }}
      >
        View full size ↗
      </div>
    </button>
  );
}

/* ── Detail drawer ── */
function DetailDrawer({
  reg: initialReg,
  onClose,
  onUpdate,
}: {
  reg: IRegistration;
  onClose: () => void;
  onUpdate: (updated: IRegistration) => void;
}) {
  const { data: session } = useSession();
  const [reg, setReg] = useState(initialReg);
  const [notes, setNotes] = useState(initialReg.notes || "");
  const [busy, setBusy] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const isOrganizer = session?.user.role === "Organizer";

  // Fetch QR when approved
  useEffect(() => {
    if (reg.status === "approved" && reg.ticket && !qrDataUrl) {
      import("qrcode").then((QRCode) => {
        const payload = JSON.stringify({
          e: "THE COZY CANVAS",
          t: reg.ticket,
          n: reg.name,
          g: reg.guests,
          id: reg.regId,
        });
        QRCode.toDataURL(payload, {
          errorCorrectionLevel: "M",
          width: 160,
          margin: 2,
          color: { dark: "#06100d", light: "#f5fff9" },
        }).then(setQrDataUrl);
      });
    }
  }, [reg, qrDataUrl]);

  async function saveNotes() {
    await fetch(`/api/registrations/${reg.regId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
  }

  async function approve() {
    setBusy(true);
    await saveNotes();
    const res = await fetch(`/api/registrations/${reg.regId}/approve`, { method: "POST" });
    setBusy(false);
    if (!res.ok) { toast.error("Failed to approve"); return; }
    const updated = await res.json();
    setReg(updated);
    onUpdate(updated);
    toast.success("Approved — QR email sent");
  }

  async function reject() {
    setBusy(true);
    await saveNotes();
    const res = await fetch(`/api/registrations/${reg.regId}/reject`, { method: "POST" });
    setBusy(false);
    if (!res.ok) { toast.error("Failed to reject"); return; }
    const updated = await res.json();
    setReg(updated);
    onUpdate(updated);
    toast.success("Rejected — email sent");
  }

  async function regen() {
    const res = await fetch(`/api/registrations/${reg.regId}/approve`, { method: "POST" });
    if (!res.ok) { toast.error("Failed to regenerate"); return; }
    const updated = await res.json();
    setReg(updated);
    onUpdate(updated);
    setQrDataUrl("");
    toast.success("QR regenerated & resent");
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        justifyContent: "flex-end",
        animation: "fadeIn 0.2s",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(560px, 100%)",
          height: "100%",
          background: "var(--panel)",
          borderLeft: "1px solid var(--border-2)",
          overflowY: "auto",
          boxShadow: "-30px 0 80px rgba(0,0,0,0.5)",
        }}
      >
        {/* drawer header */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            background: "var(--panel)",
            borderBottom: "1px solid var(--border)",
            padding: "1.3rem 1.6rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.7rem",
                marginBottom: "0.4rem",
              }}
            >
              <h2 style={{ fontFamily: "var(--font-d)", fontSize: "1.3rem" }}>
                {reg.name}
              </h2>
              <StatusPill status={reg.status} />
            </div>
            <div
              style={{
                fontSize: "0.74rem",
                color: "var(--muted)",
                fontFamily: "var(--font-m)",
              }}
            >
              {reg.regId} · {timeAgo(reg.createdAt)}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "none",
              color: "var(--muted)",
              width: 32,
              height: 32,
              borderRadius: 8,
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "1.6rem" }}>
          {/* Submitted details */}
          <h3
            style={{
              fontSize: "0.66rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: "1rem",
            }}
          >
            Submitted details
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem 1.4rem",
              marginBottom: "1.8rem",
            }}
          >
            {[
              ["Email", reg.email],
              ["Phone", reg.phone],
              ["NIC", reg.nic],
              ["Type", reg.country === "local" ? "Local" : "Visitor"],
              ["Tier", reg.tier],
              ["Easels", String(reg.guests)],
              ["Pay method", reg.payMethod],
              ["Reference", reg.payRef],
            ].map(([k, v]) => (
              <div key={k}>
                <div
                  style={{
                    fontSize: "0.62rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--faint)",
                    marginBottom: "0.25rem",
                  }}
                >
                  {k}
                </div>
                <div
                  style={{
                    fontSize: "0.88rem",
                    color: "var(--white)",
                    wordBreak: "break-word",
                  }}
                >
                  {v}
                </div>
              </div>
            ))}
          </div>

          {/* Amount */}
          <div
            className="card"
            style={{
              padding: "1rem 1.2rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.8rem",
              borderColor: "var(--border-2)",
            }}
          >
            <span
              style={{
                color: "var(--muted)",
                fontSize: "0.82rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Amount declared
            </span>
            <span
              style={{
                fontFamily: "var(--font-d)",
                fontSize: "1.4rem",
                color: "var(--accent)",
              }}
            >
              {formatMoney(reg.amount, reg.currency)}
            </span>
          </div>

          {/* Payment slip */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h3
              style={{
                fontSize: "0.66rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--accent)",
                margin: 0,
              }}
            >
              Payment slip
            </h3>
            {reg.receiptUrl && reg.receiptUrl !== "/placeholder-receipt.jpg" && (
              <a
                href={reg.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-ghost"
                style={{ fontSize: "0.7rem" }}
              >
                Open original ↗
              </a>
            )}
          </div>
          <div style={{ maxWidth: 300, marginBottom: "1.8rem" }}>
            <ReceiptThumb reg={reg} onClick={() => setLightboxOpen(true)} />
          </div>

          {lightboxOpen && reg.receiptUrl && reg.receiptUrl !== "/placeholder-receipt.jpg" && (
            <ReceiptLightbox url={reg.receiptUrl} onClose={() => setLightboxOpen(false)} />
          )}

          {/* QR if approved */}
          {reg.status === "approved" && reg.ticket && (
            <div style={{ marginBottom: "1.8rem" }}>
              <h3
                style={{
                  fontSize: "0.66rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  marginBottom: "1rem",
                }}
              >
                Issued ticket
              </h3>
              <div
                className="card"
                style={{
                  padding: "1.2rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1.2rem",
                  borderColor: "var(--border-2)",
                }}
              >
                {qrDataUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={qrDataUrl}
                    alt="QR"
                    style={{ width: 92, height: 92, borderRadius: "var(--r-s)" }}
                  />
                ) : (
                  <div
                    style={{
                      width: 92,
                      height: 92,
                      background: "var(--forest)",
                      borderRadius: "var(--r-s)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.7rem",
                      color: "var(--faint)",
                    }}
                  >
                    Loading…
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-m)",
                      fontSize: "1rem",
                      color: "var(--accent)",
                      letterSpacing: "0.1em",
                      marginBottom: "0.3rem",
                    }}
                  >
                    {reg.ticket}
                  </div>
                  {isOrganizer && (
                    <button className="btn btn-soft btn-sm" onClick={regen}>
                      ↻ Regenerate &amp; resend
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Check-in status */}
          {reg.checkedIn && (
            <div
              className="card"
              style={{
                padding: "1rem 1.2rem",
                borderColor: "rgba(var(--accent-rgb),0.3)",
                marginBottom: "1.8rem",
                display: "flex",
                alignItems: "center",
                gap: "0.8rem",
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>✅</span>
              <div>
                <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--accent)" }}>
                  Checked in
                </div>
                <div style={{ fontSize: "0.76rem", color: "var(--muted)" }}>
                  By {reg.checkedInBy} ·{" "}
                  {reg.checkedInAt ? timeAgo(reg.checkedInAt) : ""}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <h3
            style={{
              fontSize: "0.66rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: "0.8rem",
            }}
          >
            Organizer notes
          </h3>
          <textarea
            className="textarea"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={saveNotes}
            placeholder="Internal notes — not shown to the registrant"
            style={{ resize: "vertical", marginBottom: "1.6rem", width: "100%" }}
          />

          {/* Actions */}
          {isOrganizer && (
            <div
              style={{
                position: "sticky",
                bottom: 0,
                background: "var(--panel)",
                paddingTop: "1rem",
                borderTop: "1px solid var(--border)",
              }}
            >
              {reg.status === "pending" ? (
                <div style={{ display: "flex", gap: "0.8rem" }}>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={approve}
                    disabled={busy}
                  >
                    ✓ Approve &amp; send QR
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ flex: 1 }}
                    onClick={reject}
                    disabled={busy}
                  >
                    ✕ Reject
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    gap: "0.8rem",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--muted)",
                      flex: 1,
                    }}
                  >
                    {reg.status === "approved" ? "Approved" : "Rejected"}{" "}
                    {reg.decidedAt ? timeAgo(reg.decidedAt) : ""} · email sent
                  </span>
                  {reg.status === "rejected" && (
                    <button
                      className="btn btn-soft btn-sm"
                      onClick={approve}
                      disabled={busy}
                    >
                      Approve instead
                    </button>
                  )}
                  {reg.status === "approved" && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={reject}
                      disabled={busy}
                    >
                      Revoke
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main page ── */
export default function RegistrationsPage() {
  const { data: session } = useSession();
  const [registrations, setRegistrations] = useState<IRegistration[]>([]);
  const [stats, setStats] = useState<StatsResult>({
    total: 0, pending: 0, approved: 0, rejected: 0,
    revenueLKR: 0, seats: 0, checkedIn: 0, seatCap: 20,
  });
  const [events, setEvents] = useState<IEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (eventId = selectedEvent) => {
    const params = new URLSearchParams();
    if (eventId !== "all") params.set("eventId", eventId);
    const res = await fetch(`/api/registrations?${params}`);
    if (res.ok) {
      const data = await res.json();
      setRegistrations(data.registrations);
      setStats(data.stats);
    }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEvent]);

  useEffect(() => {
    fetch("/api/events").then((r) => r.json()).then(setEvents).catch(() => {});
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => {
    return registrations.filter((r) => {
      if (filter === "checked-in") return r.checkedIn;
      if (filter !== "all" && r.status !== filter) return false;
      if (q.trim()) {
        const hay = `${r.name} ${r.email} ${r.regId} ${r.payRef}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [registrations, filter, q]);

  const openReg = registrations.find((r) => r.regId === openId) ?? null;

  const FILTERS = [
    ["all", "All", stats.total],
    ["pending", "Pending", stats.pending],
    ["approved", "Approved", stats.approved],
    ["rejected", "Rejected", stats.rejected],
    ["checked-in", "Checked in", stats.checkedIn],
  ] as const;

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <div
          style={{
            width: 32, height: 32,
            border: "2px solid var(--border-2)",
            borderTopColor: "var(--accent)",
            borderRadius: "50%",
            animation: "spinSlow 0.8s linear infinite",
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Stats */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.6rem" }}>
        <StatCard label="Registrations" value={stats.total} sub={`${stats.pending} awaiting review`} />
        <StatCard label="Pending" value={stats.pending} sub="need a decision" accent={stats.pending > 0} />
        <StatCard label="Approved" value={stats.approved} sub={`${stats.seats} / ${stats.seatCap} seats filled`} accent />
        <StatCard
          label="Attended"
          value={stats.checkedIn}
          sub={`${stats.approved > 0 ? Math.round((stats.checkedIn / stats.approved) * 100) : 0}% of approved`}
          accent={stats.checkedIn > 0}
        />
        <StatCard
          label="Revenue"
          value={`LKR ${(stats.revenueLKR / 1000).toFixed(1)}k`}
          sub="incl. foreign @ ~300"
        />
      </div>

      {/* Seat capacity bar */}
      <div className="card" style={{ padding: "1rem 1.3rem", marginBottom: "1.6rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.5rem",
            fontSize: "0.76rem",
          }}
        >
          <span style={{ color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Seats filled this session
          </span>
          <span style={{ color: "var(--accent)", fontWeight: 600 }}>
            {stats.seats} / {stats.seatCap}
          </span>
        </div>
        <div
          style={{
            height: 8,
            background: "rgba(255,255,255,0.06)",
            borderRadius: 100,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.min(100, (stats.seats / stats.seatCap) * 100)}%`,
              background: "var(--accent)",
              borderRadius: 100,
              transition: "width 0.5s",
              boxShadow: "0 0 16px rgba(var(--accent-rgb),0.6)",
            }}
          />
        </div>
      </div>

      {/* Event selector */}
      {events.length > 0 && (
        <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.8rem" }}>
          <span style={{ fontSize: "0.76rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>Event</span>
          <select
            className="select"
            value={selectedEvent}
            onChange={(e) => {
              setSelectedEvent(e.target.value);
              setLoading(true);
              fetchData(e.target.value);
            }}
            style={{ maxWidth: 380 }}
          >
            <option value="all">All events</option>
            {events.map((ev) => (
              <option key={ev.eventId} value={ev.eventId}>
                {ev.title} · {new Date(ev.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                {ev.status === "open" ? " ✦ Open" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Search + filters */}
      <div
        style={{
          display: "flex",
          gap: "0.8rem",
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: "1.2rem",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 240px" }}>
          <span
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--faint)",
            }}
          >
            ⌕
          </span>
          <input
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, ref…"
            style={{ paddingLeft: "2.4rem" }}
          />
        </div>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {FILTERS.map(([k, label, n]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className="btn btn-sm"
              style={{
                background: filter === k ? "var(--accent)" : "rgba(255,255,255,0.04)",
                color: filter === k ? "#04130e" : "var(--muted)",
                border: `1px solid ${filter === k ? "var(--accent)" : "var(--border)"}`,
              }}
            >
              {label} <span style={{ opacity: 0.7 }}>{n}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: "hidden", padding: 0 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.6fr 1fr 0.7fr 0.8fr 1fr 0.6fr auto",
            gap: "1rem",
            padding: "0.9rem 1.3rem",
            borderBottom: "1px solid var(--border)",
            fontSize: "0.64rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--faint)",
          }}
        >
          <span>Painter</span>
          <span>Reference</span>
          <span>Easels</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Attended</span>
          <span />
        </div>

        {filtered.length === 0 && (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              color: "var(--faint)",
              fontSize: "0.88rem",
            }}
          >
            No registrations match your filter.
          </div>
        )}

        {filtered.map((r) => (
          <div
            key={r.regId}
            onClick={() => setOpenId(r.regId)}
            style={{
              display: "grid",
              gridTemplateColumns: "1.6fr 1fr 0.7fr 0.8fr 1fr 0.6fr auto",
              gap: "1rem",
              padding: "1rem 1.3rem",
              borderBottom: "1px solid var(--border)",
              alignItems: "center",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background =
                "rgba(var(--accent-rgb),0.04)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "transparent")
            }
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "var(--white)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {r.name}
              </div>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "var(--muted)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {r.email}
              </div>
            </div>
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--muted)",
                fontFamily: "var(--font-m)",
              }}
            >
              {r.payRef}
            </span>
            <span style={{ fontSize: "0.86rem", color: "var(--white)" }}>
              {r.guests}
            </span>
            <span style={{ fontSize: "0.84rem", color: "var(--white)" }}>
              {formatMoney(r.amount, r.currency)}
            </span>
            <span>
              <StatusPill status={r.status} />
            </span>
            <span>
              {r.checkedIn ? (
                <span
                  title={`Checked in${r.checkedInAt ? " · " + new Date(r.checkedInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    background: "rgba(var(--accent-rgb),0.12)",
                    color: "var(--accent)",
                    borderRadius: 100,
                    padding: "0.2rem 0.6rem",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                  }}
                >
                  ✓ In
                </span>
              ) : (
                <span style={{ color: "var(--faint)", fontSize: "0.76rem" }}>—</span>
              )}
            </span>
            <span style={{ color: "var(--faint)", fontSize: "1.1rem" }}>›</span>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "1.2rem",
          flexWrap: "wrap",
          gap: "0.6rem",
        }}
      >
        <p style={{ fontSize: "0.72rem", color: "var(--faint)" }}>
          Showing {filtered.length} of {stats.total} registrations
        </p>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => {
              const ts = new Date().toISOString().slice(0, 10);
              exportCSV(filtered, `cozy-canvas-attendees-${ts}.csv`);
            }}
            title="Export CSV"
          >
            ↓ CSV
          </button>
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => {
              const ts = new Date().toISOString().slice(0, 10);
              exportExcel(filtered, `cozy-canvas-attendees-${ts}.xlsx`);
            }}
            title="Export Excel"
          >
            ↓ Excel
          </button>
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => {
              const ts = new Date().toISOString().slice(0, 10);
              exportPDF(filtered, `cozy-canvas-attendees-${ts}.pdf`);
            }}
            title="Export PDF"
          >
            ↓ PDF
          </button>
        </div>
      </div>

      {openReg && (
        <DetailDrawer
          reg={openReg}
          onClose={() => setOpenId(null)}
          onUpdate={(updated) => {
            setRegistrations((prev) =>
              prev.map((r) => (r.regId === updated.regId ? updated : r))
            );
          }}
        />
      )}
    </div>
  );
}
