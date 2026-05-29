import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Registration from "@/models/Registration";

export const runtime = "nodejs";

// POST /api/checkin — admin (door staff or organizer)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const body = await request.json();
  const { ticket, checkedInBy } = body;

  if (!ticket) {
    return NextResponse.json({ error: "Ticket code is required" }, { status: 400 });
  }

  // Normalize ticket code
  const normalizedTicket = String(ticket).trim().toUpperCase();

  const registration = await Registration.findOne({
    ticket: normalizedTicket,
  });

  if (!registration) {
    return NextResponse.json(
      { error: "No ticket found for this code" },
      { status: 404 }
    );
  }

  if (registration.status !== "approved") {
    return NextResponse.json(
      { error: "This ticket has not been approved" },
      { status: 400 }
    );
  }

  if (registration.checkedIn) {
    return NextResponse.json(
      { error: "This ticket has already been checked in", registration },
      { status: 409 }
    );
  }

  const updated = await Registration.findByIdAndUpdate(
    registration._id,
    {
      $set: {
        checkedIn: true,
        checkedInAt: new Date(),
        checkedInBy: checkedInBy || session.user.name || "Door staff",
      },
    },
    { new: true }
  ).lean();

  return NextResponse.json(updated);
}
