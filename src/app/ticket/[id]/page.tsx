import { notFound } from "next/navigation";
import Link from "next/link";
import connectDB from "@/lib/mongodb";
import Registration from "@/models/Registration";
import { buildQRPayload, generateQRDataUrl } from "@/lib/qr";
import TicketCard from "@/components/ui/TicketCard";
import Particles from "@/components/public/Particles";
import type { IRegistration } from "@/types";

interface TicketPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: TicketPageProps) {
  return {
    title: `Ticket ${params.id} — The Cozy Canvas`,
  };
}

async function getRegistration(regId: string): Promise<IRegistration | null> {
  await connectDB();
  const reg = await Registration.findOne({ regId }).lean();
  if (!reg) return null;
  return JSON.parse(JSON.stringify(reg)) as IRegistration;
}

export default async function TicketPage({ params }: TicketPageProps) {
  const reg = await getRegistration(params.id);

  if (!reg) notFound();

  // Not yet approved
  if (reg.status !== "approved") {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "2rem",
          gap: "1.2rem",
          background: "var(--black)",
        }}
      >
        <span style={{ fontSize: "2.6rem" }}>⏳</span>
        <h2
          style={{
            fontFamily: "var(--font-d)",
            fontSize: "1.6rem",
            color: "var(--white)",
          }}
        >
          No confirmed ticket yet
        </h2>
        <p
          style={{
            color: "var(--muted)",
            maxWidth: 380,
            lineHeight: 1.6,
          }}
        >
          Your ticket appears here once an organizer approves your
          registration. Current status:{" "}
          <strong style={{ color: "var(--amber)" }}>{reg.status}</strong>
        </p>
        <Link href="/" className="btn btn-ghost">
          Back to event
        </Link>
      </div>
    );
  }

  // Generate QR server-side
  const qrDataUrl = reg.ticket
    ? await generateQRDataUrl(
        buildQRPayload(reg.ticket, reg.name, reg.guests, reg.regId)
      )
    : "";

  return (
    <div
      style={{
        minHeight: "100dvh",
        overflowY: "auto",
        position: "relative",
        background: "var(--black)",
      }}
    >
      <div
        className="glow-orb"
        style={{
          width: 620,
          height: 620,
          top: "-24%",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />
      <Particles count={28} />

      {/* top bar */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem clamp(1.2rem,5vw,3rem)",
        }}
      >
        <Link
          href="/"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--muted)",
            fontSize: "0.82rem",
          }}
        >
          ← Event site
        </Link>
        <span
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--muted)",
          }}
        >
          Your Ticket
        </span>
        <span
          style={{
            fontFamily: "var(--font-d)",
            color: "var(--accent)",
            letterSpacing: "0.12em",
          }}
        >
          EG
        </span>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 700,
          margin: "0 auto",
          padding:
            "clamp(1.5rem,4vw,3rem) clamp(1.2rem,5vw,2rem) 5rem",
          textAlign: "center",
        }}
      >
        <div className="fade-up">
          <span className="eg-eyebrow center">Confirmed · {reg.regId}</span>
        </div>

        <h1
          className="fade-up"
          style={{
            animationDelay: "0.1s",
            fontFamily: "var(--font-d)",
            fontSize: "clamp(1.8rem,4.6vw,2.8rem)",
            letterSpacing: "-0.02em",
            margin: "0.9rem 0 0.6rem",
          }}
        >
          See you at the easel,{" "}
          <span style={{ color: "var(--accent)" }}>
            {reg.name.split(" ")[0]}.
          </span>
        </h1>

        <p
          className="fade-up"
          style={{
            animationDelay: "0.2s",
            color: "var(--muted)",
            marginBottom: "2.4rem",
          }}
        >
          Show this QR at Coffee Station Café — that&apos;s all you need.
        </p>

        <div
          className="fade-up"
          style={{
            animationDelay: "0.3s",
            display: "flex",
            justifyContent: "center",
            marginBottom: "2rem",
          }}
        >
          <TicketCard registration={reg} qrDataUrl={qrDataUrl} />
        </div>

        <div
          className="fade-up no-print"
          style={{
            animationDelay: "0.4s",
            display: "flex",
            gap: "0.8rem",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: "2.4rem",
          }}
        >
          <button
            className="btn btn-primary"
            onClick={() => window.print()}
          >
            ⬇ Save / print ticket
          </button>
          <Link href="/" className="btn btn-ghost">
            Back to event
          </Link>
        </div>

        <div
          className="card fade-up"
          style={{
            animationDelay: "0.5s",
            padding: "1.6rem",
            textAlign: "left",
            maxWidth: 520,
            margin: "0 auto",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-d)",
              fontSize: "0.9rem",
              color: "var(--accent)",
              marginBottom: "1rem",
              letterSpacing: "0.04em",
            }}
          >
            Before you come
          </h3>
          <ul
            style={{
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: "0.7rem",
            }}
          >
            {[
              "Arrive 10 minutes early to settle in and grab your drink.",
              "Wear something you don't mind getting a little paint on.",
              "Everything's provided — just bring yourself (and good vibes).",
              `Your QR admits ${reg.guests} painter${reg.guests > 1 ? "s" : ""}.`,
              reg.country === "local"
                ? `Bring your NIC (${reg.nic}) for door verification.`
                : "Bring your Passport for door verification.",
            ].map((x, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  gap: "0.7rem",
                  fontSize: "0.88rem",
                  color: "var(--muted)",
                  lineHeight: 1.5,
                }}
              >
                <span style={{ color: "var(--accent)" }}>✦</span>
                {x}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
