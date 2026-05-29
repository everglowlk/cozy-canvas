import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Admin from "@/models/Admin";

export const runtime = "nodejs";

// DELETE /api/team/[id] — admin (Organizer only)
export async function DELETE(
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

  // Prevent self-deletion
  if (params.id === session.user.id) {
    return NextResponse.json(
      { error: "You cannot remove yourself from the team" },
      { status: 400 }
    );
  }

  await connectDB();

  const admin = await Admin.findByIdAndDelete(params.id);

  if (!admin) {
    return NextResponse.json({ error: "Team member not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Team member removed" });
}
