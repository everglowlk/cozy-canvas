import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Registration from "@/models/Registration";

export const runtime = "nodejs";

// GET /api/registrations/[id] — admin only
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const registration = await Registration.findOne({ regId: params.id }).lean();
  if (!registration) {
    return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  }

  return NextResponse.json(registration);
}

// PATCH /api/registrations/[id] — admin only (update notes)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const body = await request.json();

  // Allow updating notes and checkedIn (for undo check-in)
  const updateData: Record<string, unknown> = {};
  if (typeof body.notes !== "undefined") updateData.notes = body.notes;
  if (typeof body.checkedIn !== "undefined") updateData.checkedIn = body.checkedIn;
  if (typeof body.checkedInAt !== "undefined") updateData.checkedInAt = body.checkedInAt;
  if (typeof body.checkedInBy !== "undefined") updateData.checkedInBy = body.checkedInBy;

  const registration = await Registration.findOneAndUpdate(
    { regId: params.id },
    { $set: updateData },
    { new: true }
  ).lean();

  if (!registration) {
    return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  }

  return NextResponse.json(registration);
}
