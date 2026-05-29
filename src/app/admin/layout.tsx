"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import SessionProvider from "@/components/admin/SessionProvider";
import { getInitials } from "@/lib/utils";

function AdminShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated" && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [status, router, pathname]);

  // Login page renders itself — don't wrap it in the shell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (status === "loading") {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--black)",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: "2px solid var(--border-2)",
            borderTopColor: "var(--accent)",
            borderRadius: "50%",
            animation: "spinSlow 0.8s linear infinite",
          }}
        />
      </div>
    );
  }

  if (!session) return null;

  const isOrganizer = session.user.role === "Organizer";
  const tabs = [
    { id: "registrations", label: "Registrations", icon: "📋", href: "/admin/registrations", roles: ["Organizer", "Door staff"] },
    { id: "checkin", label: "Door check-in", icon: "📷", href: "/admin/checkin", roles: ["Organizer", "Door staff"] },
    { id: "team", label: "Team", icon: "👥", href: "/admin/team", roles: ["Organizer"] },
  ].filter((t) => t.roles.includes(session.user.role));

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "var(--black)",
      }}
    >
      {/* header */}
      <div
        style={{
          background: "var(--panel)",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem clamp(1.2rem,4vw,2.4rem) 0.8rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
            <span
              style={{
                fontFamily: "var(--font-d)",
                color: "var(--accent)",
                letterSpacing: "0.12em",
                fontSize: "1.05rem",
              }}
            >
              EG
            </span>
            <span
              style={{
                width: 1,
                height: 18,
                background: "var(--border-2)",
              }}
            />
            <div style={{ lineHeight: 1.25 }}>
              <div
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  color: "var(--white)",
                }}
              >
                Organizer Console
              </div>
              <div
                style={{
                  fontSize: "0.66rem",
                  color: "var(--muted)",
                  whiteSpace: "nowrap",
                }}
              >
                The Cozy Canvas
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.7rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.74rem",
                color: "var(--muted)",
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "rgba(var(--accent-rgb),0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent)",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {getInitials(session.user.name)}
              </span>
              <span style={{ display: "none" }} className="admin-user">
                {session.user.name} · {session.user.role}
              </span>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
            >
              Log out
            </button>
            <Link href="/" className="btn btn-ghost btn-sm">
              View site ↗
            </Link>
          </div>
        </div>

        {/* tabs */}
        <div
          style={{
            display: "flex",
            gap: "0.3rem",
            padding: "0 clamp(1.2rem,4vw,2.4rem)",
            overflowX: "auto",
          }}
        >
          {tabs.map((t) => {
            const active = pathname === t.href || pathname.startsWith(t.href + "/");
            return (
              <Link
                key={t.id}
                href={t.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  background: "transparent",
                  border: "none",
                  borderBottom: `2px solid ${active ? "var(--accent)" : "transparent"}`,
                  color: active ? "var(--white)" : "var(--muted)",
                  padding: "0.7rem 0.6rem",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  textDecoration: "none",
                  transition: "color 0.2s, border-color 0.2s",
                }}
              >
                <span>{t.icon}</span>
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* page content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "clamp(1.2rem,4vw,2rem)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminShell>{children}</AdminShell>
    </SessionProvider>
  );
}
