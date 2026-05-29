import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Registration from "@/models/Registration";
import { generateTicketCode } from "@/lib/utils";
import { buildQRPayload, generateQRDataUrl } from "@/lib/qr";
import { sendConfirmEmail } from "@/lib/email";

export const runtime = "nodejs";

// POST /api/registrations/[id]/approve — admin only (Organizer)
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only Organizer role can approve
  if (session.user.role !== "Organizer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const existing = await Registration.findOne({ regId: params.id });
  if (!existing) {
    return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  }

  // Generate ticket code if not already issued
  let ticket = existing.ticket;
  if (!ticket) {
    let attempts = 0;
    do {
      ticket = generateTicketCode();
      attempts++;
      if (attempts > 20) throw new Error("Could not generate unique ticket code");
    } while (await Registration.findOne({ ticket }));
  }

  const updated = await Registration.findOneAndUpdate(
    { regId: params.id },
    {
      $set: {
        status: "approved",
        ticket,
        decidedAt: new Date(),
      },
    },
    { new: true }
  ).lean();

  if (!updated) {
    return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  }

  // Generate QR and send confirmation email
  try {
    const payload = buildQRPayload(
      ticket,
      updated.name,
      updated.guests,
      updated.regId
    );
    const qrDataUrl = await generateQRDataUrl(payload);
    await sendConfirmEmail(updated, qrDataUrl);
  } catch (err) {
    console.error("[QR/Email] Failed:", err);
  }

  return NextResponse.json(updated);
}
