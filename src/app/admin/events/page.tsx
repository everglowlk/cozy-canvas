"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import type { IEvent } from "@/types";

const STATUS_LABELS: Record<IEvent["status"], string> = {
  draft: "Draft",
  open: "Open",
  closed: "Closed",
  past: "Past",
};

const STATUS_COLORS: Record<IEvent["status"], string> = {
  draft: "rgba(255,255,255,0.12)",
  open: "rgba(var(--accent-rgb),0.15)",
  closed: "rgba(255,196,107,0.15)",
  past: "rgba(255,255,255,0.06)",
};

const STATUS_TEXT: Record<IEvent["status"], string> = {
  draft: "var(--muted)",
  open: "var(--accent)",
  closed: "var(--amber)",
  past: "var(--faint)",
};

const NEXT_STATUS: Partial<Record<IEvent["status"], { label: string; value: IEvent["status"] }[]>> = {
  draft: [{ label: "Open registrations", value: "open" }],
  open: [{ label: "Close registrations", value: "closed" }],
  closed: [{ label: "Mark as past", value: "past" }, { label: "Re-open", value: "open" }],
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "long", year: "numeric",
  });
}

export default function EventsPage() {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "6:30 PM",
    venue: "Coffee Station Café",
    capacity: 20,
    priceLKR: 3000,
    priceUSD: 10,
  });

  const fetchEvents = useCallback(async () => {
    const res = await fetch("/api/events");
    if (res.ok) setEvents(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  async function createEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.date) {
      toast.error("Title and date are required");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) { toast.error("Failed to create event"); return; }
    toast.success("Event created");
    setShowForm(false);
    setForm({ title: "", date: "", time: "6:30 PM", venue: "Coffee Station Café", capacity: 20, priceLKR: 3000, priceUSD: 10 });
    fetchEvents();
  }

  async function changeStatus(eventId: string, status: IEvent["status"]) {
    const res = await fetch(`/api/events/${eventId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) { toast.error("Failed to update status"); return; }
    toast.success(`Event ${status === "open" ? "opened for registrations" : status}`);
    fetchEvents();
  }

  async function deleteEvent(eventId: string) {
    if (!confirm("Delete this draft event?")) return;
    const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Cannot delete — only drafts can be removed"); return; }
    toast.success("Event deleted");
    fetchEvents();
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <div style={{ width: 32, height: 32, border: "2px solid var(--border-2)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spinSlow 0.8s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.6rem", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-d)", fontSize: "1.3rem", marginBottom: "0.3rem" }}>Events</h2>
          <p style={{ color: "var(--muted)", fontSize: "0.84rem" }}>
            Only one event can be <span style={{ color: "var(--accent)" }}>open</span> at a time. Opening a new one closes the current.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ New event"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={createEvent} className="card" style={{ padding: "1.6rem", marginBottom: "1.6rem", borderColor: "var(--border-2)" }}>
          <h3 style={{ fontFamily: "var(--font-d)", fontSize: "1rem", color: "var(--accent)", marginBottom: "1.2rem" }}>New event</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label>Event title *</label>
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="The Cozy Canvas — June Edition" />
            </div>
            <div className="field">
              <label>Date *</label>
              <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="field">
              <label>Time</label>
              <input className="input" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="6:30 PM" />
            </div>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label>Venue</label>
              <input className="input" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="Coffee Station Café" />
            </div>
            <div className="field">
              <label>Capacity (seats)</label>
              <input className="input" type="number" min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
            </div>
            <div className="field">
              <label>Price — LKR (per person)</label>
              <input className="input" type="number" min={0} value={form.priceLKR} onChange={(e) => setForm({ ...form, priceLKR: Number(e.target.value) })} />
            </div>
            <div className="field">
              <label>Price — USD (per person)</label>
              <input className="input" type="number" min={0} value={form.priceUSD} onChange={(e) => setForm({ ...form, priceUSD: Number(e.target.value) })} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.8rem", marginTop: "1.2rem" }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Creating…" : "Create event"}</button>
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Event list */}
      {events.length === 0 && (
        <div className="card" style={{ padding: "3rem", textAlign: "center", color: "var(--faint)" }}>
          No events yet. Create your first one above.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {events.map((ev) => (
          <div key={ev.eventId} className="card" style={{ padding: "1.4rem 1.6rem", borderColor: ev.status === "open" ? "var(--border-2)" : "var(--border)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "var(--font-d)", fontSize: "1.05rem", color: "var(--white)" }}>{ev.title}</span>
                  <span style={{ background: STATUS_COLORS[ev.status], color: STATUS_TEXT[ev.status], borderRadius: 100, padding: "0.15rem 0.7rem", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {STATUS_LABELS[ev.status]}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "1.4rem", flexWrap: "wrap", fontSize: "0.82rem", color: "var(--muted)" }}>
                  <span>📅 {formatDate(ev.date)}</span>
                  <span>🕐 {ev.time}</span>
                  <span>📍 {ev.venue}</span>
                  <span>👥 {ev.capacity} seats</span>
                  <span>💰 LKR {ev.priceLKR.toLocaleString()} · USD {ev.priceUSD}</span>
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--faint)", marginTop: "0.4rem", fontFamily: "var(--font-m)" }}>{ev.eventId}</div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0, flexWrap: "wrap" }}>
                {(NEXT_STATUS[ev.status] ?? []).map((action) => (
                  <button
                    key={action.value}
                    className={`btn btn-sm ${action.value === "open" ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => changeStatus(ev.eventId, action.value)}
                  >
                    {action.label}
                  </button>
                ))}
                {ev.status === "draft" && (
                  <button className="btn btn-sm btn-danger" onClick={() => deleteEvent(ev.eventId)}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
