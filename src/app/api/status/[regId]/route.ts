import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Registration from "@/models/Registration";

export const runtime = "nodejs";

// GET /api/status/[regId] — public, returns limited status info only
export async function GET(
  _request: NextRequest,
  { params }: { params: { regId: string } }
) {
  await connectDB();

  const reg = await Registration.findOne({
    regId: params.regId.toUpperCase(),
  }).lean();

  if (!reg) {
    return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  }

  // Only return safe public fields — no NIC, receipt, notes, payment ref
  return NextResponse.json({
    regId: reg.regId,
    name: reg.name,
    status: reg.status,
    tier: reg.tier,
    guests: reg.guests,
    ticket: reg.status === "approved" ? reg.ticket : null,
    checkedIn: reg.checkedIn,
    createdAt: reg.createdAt,
  });
}
