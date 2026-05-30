import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Event from "@/models/Event";

export const runtime = "nodejs";

// PATCH /api/events/[id] — update status or details
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "Organizer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const body = await request.json();

  const allowed: Record<string, unknown> = {};
  if (body.status) allowed.status = body.status;
  if (body.title) allowed.title = body.title;
  if (body.date) allowed.date = new Date(body.date);
  if (body.time) allowed.time = body.time;
  if (body.venue) allowed.venue = body.venue;
  if (body.capacity) allowed.capacity = Number(body.capacity);
  if (body.priceLKR !== undefined) allowed.priceLKR = Number(body.priceLKR);
  if (body.priceUSD !== undefined) allowed.priceUSD = Number(body.priceUSD);

  // Only one event can be "open" at a time
  if (body.status === "open") {
    await Event.updateMany({ status: "open" }, { $set: { status: "closed" } });
  }

  const event = await Event.findOneAndUpdate(
    { eventId: params.id },
    { $set: allowed },
    { new: true }
  ).lean();

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json(event);
}

// DELETE /api/events/[id] — only draft events
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "Organizer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const event = await Event.findOne({ eventId: params.id });
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (event.status !== "draft") {
    return NextResponse.json({ error: "Only draft events can be deleted" }, { status: 400 });
  }
  await event.deleteOne();
  return NextResponse.json({ ok: true });
}
