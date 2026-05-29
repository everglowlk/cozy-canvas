import { NextRequest, NextResponse } from "next/server";
import { uploadReceipt } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload an image or PDF." },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      // Return a placeholder URL for development
      console.log("[Upload] Cloudinary not configured — returning placeholder");
      return NextResponse.json({
        url: "/placeholder-receipt.jpg",
        publicId: "placeholder",
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadReceipt(buffer, file.name);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Upload] Error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
