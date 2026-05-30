import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Registration from "@/models/Registration";
import Event from "@/models/Event";
import { generateRegId } from "@/lib/utils";
import { sendReviewEmail } from "@/lib/email";
import { sendWhatsAppReview } from "@/lib/whatsapp";

export const runtime = "nodejs";

// GET /api/registrations — admin only
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q");
  const eventId = searchParams.get("eventId");

  const filter: Record<string, unknown> = {};
  if (status && status !== "all") filter.status = status;
  if (eventId && eventId !== "all") filter.eventId = eventId;

  if (q && q.trim()) {
    const regex = new RegExp(q.trim(), "i");
    filter.$or = [
      { name: regex },
      { email: regex },
      { regId: regex },
      { payRef: regex },
      { ticket: regex },
      { phone: regex },
    ];
  }

  const registrations = await Registration.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  // Calculate stats for the same event filter
  const statsFilter: Record<string, unknown> = {};
  if (eventId && eventId !== "all") statsFilter.eventId = eventId;
  const all = await Registration.find(statsFilter).lean();

  // Fetch event capacity for seatCap
  let seatCap = 20;
  if (eventId && eventId !== "all") {
    const ev = await Event.findOne({ eventId }).lean();
    if (ev) seatCap = ev.capacity;
  }
  const approved = all.filter((r) => r.status === "approved");
  const pending = all.filter((r) => r.status === "pending");
  const rejected = all.filter((r) => r.status === "rejected");

  let revenueLKR = 0;
  approved.forEach((r) => {
    revenueLKR += r.currency === "USD" ? r.amount * 300 : r.amount;
  });

  const seats = approved.reduce((s, r) => s + (r.guests || 1), 0);
  const checkedIn = approved.filter((r) => r.checkedIn).length;

  const stats = {
    total: all.length,
    pending: pending.length,
    approved: approved.length,
    rejected: rejected.length,
    revenueLKR,
    seats,
    checkedIn,
    seatCap,
  };

  return NextResponse.json({ registrations, stats });
}

// POST /api/registrations — public
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ["name", "email", "phone", "country", "guests", "payMethod", "amount", "currency", "receiptUrl"];
    for (const field of required) {
      if (!body[field] && body[field] !== 0) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate email
    if (!/^\S+@\S+\.\S+$/.test(body.email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Validate NIC/Passport
    if (!body.nic?.trim()) {
      return NextResponse.json(
        { error: body.country === "local" ? "NIC is required for local registrations" : "Passport number is required for foreign visitors" },
        { status: 400 }
      );
    }

    await connectDB();

    // Validate event exists and is open
    if (body.eventId) {
      const event = await Event.findOne({ eventId: body.eventId, status: "open" });
      if (!event) {
        return NextResponse.json({ error: "This event is no longer open for registrations" }, { status: 400 });
      }
    }

    // Generate unique regId
    let regId: string;
    let attempts = 0;
    do {
      regId = generateRegId();
      attempts++;
      if (attempts > 10) throw new Error("Could not generate unique regId");
    } while (await Registration.findOne({ regId }));

    const registration = await Registration.create({
      eventId: body.eventId || "LEGACY",
      regId,
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone.trim(),
      nic: body.nic?.trim() || "—",
      country: body.country,
      guests: Number(body.guests),
      tier: "Painter",
      payMethod: body.payMethod,
      payRef: body.payRef?.trim() || "—",
      amount: Number(body.amount),
      currency: body.currency,
      receiptUrl: body.receiptUrl || "",
      receiptPublicId: body.receiptPublicId || "",
      status: "pending",
      notes: "",
    });

    // Send review email + WhatsApp (in parallel, non-blocking)
    await Promise.allSettled([
      sendReviewEmail(registration).catch((err) =>
        console.error("[Email] Failed to send review email:", err)
      ),
      sendWhatsAppReview(registration.phone, registration.name, registration.regId).catch((err) =>
        console.error("[WhatsApp] Failed to send review message:", err)
      ),
    ]);

    return NextResponse.json({ regId: registration.regId }, { status: 201 });
  } catch (error) {
    console.error("[Registrations POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to create registration" },
      { status: 500 }
    );
  }
}
