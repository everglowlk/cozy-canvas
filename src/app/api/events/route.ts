import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Event from "@/models/Event";

export const runtime = "nodejs";

function generateEventId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return "EV-" + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// GET /api/events — public (for registration form) or admin
export async function GET(request: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;

  const events = await Event.find(filter).sort({ date: -1 }).lean();
  return NextResponse.json(events);
}

// POST /api/events — admin Organizer only
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "Organizer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const body = await request.json();

  let eventId: string;
  let attempts = 0;
  do {
    eventId = generateEventId();
    attempts++;
    if (attempts > 10) throw new Error("Could not generate unique eventId");
  } while (await Event.findOne({ eventId }));

  const event = await Event.create({
    eventId,
    title: body.title,
    date: new Date(body.date),
    time: body.time || "6:30 PM",
    venue: body.venue || "Coffee Station Café",
    capacity: Number(body.capacity) || 20,
    priceLKR: Number(body.priceLKR),
    priceUSD: Number(body.priceUSD),
    status: "draft",
  });

  return NextResponse.json(event, { status: 201 });
}
