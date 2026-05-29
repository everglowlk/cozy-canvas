import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Registration from "@/models/Registration";
import { generateRegId } from "@/lib/utils";
import { sendReviewEmail } from "@/lib/email";

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

  const filter: Record<string, unknown> = {};
  if (status && status !== "all") {
    filter.status = status;
  }

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

  // Calculate stats
  const all = await Registration.find({}).lean();
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
    seatCap: 20,
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

    // Validate NIC for locals
    if (body.country === "local" && !body.nic?.trim()) {
      return NextResponse.json(
        { error: "NIC is required for local registrations" },
        { status: 400 }
      );
    }

    await connectDB();

    // Generate unique regId
    let regId: string;
    let attempts = 0;
    do {
      regId = generateRegId();
      attempts++;
      if (attempts > 10) throw new Error("Could not generate unique regId");
    } while (await Registration.findOne({ regId }));

    const registration = await Registration.create({
      regId,
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone.trim(),
      nic: body.country === "local" ? (body.nic || "").trim() : "—",
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

    // Send review email
    try {
      await sendReviewEmail(registration);
    } catch (err) {
      console.error("[Email] Failed to send review email:", err);
    }

    return NextResponse.json({ regId: registration.regId }, { status: 201 });
  } catch (error) {
    console.error("[Registrations POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to create registration" },
      { status: 500 }
    );
  }
}
