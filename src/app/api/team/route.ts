import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

// GET /api/team — admin (Organizer only)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "Organizer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const admins = await Admin.find({})
    .select("-passwordHash")
    .sort({ addedAt: 1 })
    .lean();

  return NextResponse.json(admins);
}

// POST /api/team — admin (Organizer only)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "Organizer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const body = await request.json();
  const { name, email, password, role } = body;

  if (!name || !email || !password || !role) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  if (!["Organizer", "Door staff"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const existing = await Admin.findOne({
    email: email.toLowerCase().trim(),
  });

  if (existing) {
    return NextResponse.json(
      { error: "That email is already on the team" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await Admin.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    role,
    addedAt: new Date(),
  });

  return NextResponse.json(
    {
      _id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      role: admin.role,
      addedAt: admin.addedAt,
    },
    { status: 201 }
  );
}
