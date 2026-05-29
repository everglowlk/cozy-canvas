"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { getInitials, timeAgo } from "@/lib/utils";

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: "Organizer" | "Door staff";
  addedAt: string;
}

interface AddForm {
  name: string;
  email: string;
  password: string;
  role: "Organizer" | "Door staff";
}

export default function TeamPage() {
  const { data: session } = useSession();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<AddForm>({
    name: "",
    email: "",
    password: "",
    role: "Door staff",
  });
  const [formErr, setFormErr] = useState("");
  const [adding, setAdding] = useState(false);

  const isOrganizer = session?.user.role === "Organizer";

  const fetchTeam = useCallback(async () => {
    const res = await fetch("/api/team");
    if (res.ok) {
      setTeam(await res.json());
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTeam(); }, [fetchTeam]);

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    setFormErr("");
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email) || form.password.length < 4) {
      setFormErr("Enter a name, valid email and a password of 4+ characters.");
      return;
    }
    setAdding(true);
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setAdding(false);
    if (!res.ok) {
      const err = await res.json();
      setFormErr(err.error || "Failed to add teammate");
      return;
    }
    toast.success(`${form.name} added to the team`);
    setForm({ name: "", email: "", password: "", role: "Door staff" });
    fetchTeam();
  }

  async function removeMember(id: string, name: string) {
    if (!confirm(`Remove ${name} from the team?`)) return;
    const res = await fetch(`/api/team/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success(`${name} removed`);
      setTeam((prev) => prev.filter((m) => m._id !== id));
    } else {
      toast.error("Failed to remove team member");
    }
  }

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
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div
        className="exp-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)",
          gap: "1.6rem",
          alignItems: "start",
        }}
      >
        {/* Team list */}
        <div>
          <h2
            style={{
              fontFamily: "var(--font-d)",
              fontSize: "1.3rem",
              marginBottom: "0.3rem",
            }}
          >
            Team
          </h2>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "0.84rem",
              marginBottom: "1.4rem",
            }}
          >
            Organizers can review &amp; approve registrations and manage the
            team. Door staff can run check-in.
          </p>

          <div className="card" style={{ overflow: "hidden", padding: 0 }}>
            {team.length === 0 && (
              <div
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  color: "var(--faint)",
                  fontSize: "0.84rem",
                }}
              >
                No team members yet.
              </div>
            )}
            {team.map((m) => (
              <div
                key={m._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem 1.3rem",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "rgba(var(--accent-rgb),0.15)",
                    color: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    flexShrink: 0,
                  }}
                >
                  {getInitials(m.name)}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                    {m.name}{" "}
                    {session?.user.email === m.email && (
                      <span style={{ color: "var(--accent)", fontSize: "0.7rem" }}>
                        · you
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: "0.76rem",
                      color: "var(--muted)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {m.email}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "var(--faint)", marginTop: "0.2rem" }}>
                    Added {timeAgo(m.addedAt)}
                  </div>
                </div>
                <span
                  className="pill"
                  style={{
                    background:
                      m.role === "Organizer"
                        ? "rgba(var(--accent-rgb),0.14)"
                        : "rgba(255,255,255,0.06)",
                    color:
                      m.role === "Organizer" ? "var(--accent)" : "var(--muted)",
                  }}
                >
                  {m.role}
                </span>
                {isOrganizer && session?.user.email !== m.email && (
                  <button
                    onClick={() => removeMember(m._id, m.name)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--faint)",
                      fontSize: "1rem",
                      cursor: "pointer",
                      padding: "0.2rem",
                      transition: "color 0.2s",
                    }}
                    title="Remove"
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.color = "var(--coral)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.color = "var(--faint)")
                    }
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add form */}
        <form
          onSubmit={addMember}
          className="card"
          style={{
            padding: "1.6rem",
            borderColor: "var(--border-2)",
            opacity: isOrganizer ? 1 : 0.55,
            pointerEvents: isOrganizer ? "auto" : "none",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-d)",
              fontSize: "1rem",
              color: "var(--accent)",
              marginBottom: "0.3rem",
            }}
          >
            Add a teammate
          </h3>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "0.78rem",
              marginBottom: "1.2rem",
            }}
          >
            {isOrganizer
              ? "Invite an organizer or door check-in staff member."
              : "Only organizers can add team members."}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="field">
              <label>Full name</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Nuwan Silva"
              />
            </div>
            <div className="field">
              <label>Email</label>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@everglow.events"
              />
            </div>
            <div className="field">
              <label>Temporary password</label>
              <input
                className="input"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="min 4 characters"
              />
            </div>
            <div className="field">
              <label>Role</label>
              <select
                className="select"
                value={form.role}
                onChange={(e) =>
                  setForm({
                    ...form,
                    role: e.target.value as "Organizer" | "Door staff",
                  })
                }
              >
                <option value="Door staff">Door staff</option>
                <option value="Organizer">Organizer</option>
              </select>
            </div>

            {formErr && (
              <div style={{ color: "var(--coral)", fontSize: "0.78rem" }}>
                {formErr}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
              disabled={adding}
            >
              {adding ? "Adding…" : "+ Add teammate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
