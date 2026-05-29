import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Registration from "@/models/Registration";

export const runtime = "nodejs";

// GET /api/verify/[ticket] — public endpoint for QR scanner
export async function GET(
  _request: NextRequest,
  { params }: { params: { ticket: string } }
) {
  await connectDB();

  const normalizedTicket = params.ticket.trim().toUpperCase();

  const registration = await Registration.findOne({
    ticket: normalizedTicket,
  })
    .select("-receiptPublicId -__v")
    .lean();

  if (!registration) {
    return NextResponse.json(
      { valid: false, error: "Ticket not found" },
      { status: 404 }
    );
  }

  if (registration.status !== "approved") {
    return NextResponse.json(
      {
        valid: false,
        error: "Ticket is not approved",
        status: registration.status,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    valid: true,
    ticket: registration.ticket,
    name: registration.name,
    guests: registration.guests,
    tier: registration.tier,
    country: registration.country,
    nic: registration.country === "local" ? registration.nic : "—",
    checkedIn: registration.checkedIn,
    checkedInAt: registration.checkedInAt,
    regId: registration.regId,
  });
}
