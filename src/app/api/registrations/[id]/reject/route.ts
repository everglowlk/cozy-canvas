import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Registration from "@/models/Registration";
import { sendRejectEmail } from "@/lib/email";

export const runtime = "nodejs";

// POST /api/registrations/[id]/reject — admin only (Organizer)
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "Organizer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const updated = await Registration.findOneAndUpdate(
    { regId: params.id },
    {
      $set: {
        status: "rejected",
        decidedAt: new Date(),
      },
    },
    { new: true }
  ).lean();

  if (!updated) {
    return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  }

  // Send rejection email
  try {
    await sendRejectEmail(updated);
  } catch (err) {
    console.error("[Email] Failed to send reject email:", err);
  }

  return NextResponse.json(updated);
}
