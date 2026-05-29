import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import connectDB from "@/lib/mongodb";
import Registration from "@/models/Registration";
import { buildQRPayload } from "@/lib/qr";

export const runtime = "nodejs";

// GET /api/qr/[ticket] — public, returns QR code as PNG image
export async function GET(
  _request: NextRequest,
  { params }: { params: { ticket: string } }
) {
  await connectDB();

  const registration = await Registration.findOne({
    ticket: params.ticket,
    status: "approved",
  }).lean();

  if (!registration) {
    return new NextResponse("Not found", { status: 404 });
  }

  const payload = buildQRPayload(
    registration.ticket!,
    registration.name,
    registration.guests,
    registration.regId
  );

  const buffer = await QRCode.toBuffer(JSON.stringify(payload), {
    errorCorrectionLevel: "M",
    width: 300,
    margin: 2,
    color: {
      dark: "#06100d",
      light: "#f5fff9",
    },
  });

  return new NextResponse(buffer.buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
