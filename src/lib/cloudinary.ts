import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  publicId: string;
}

/**
 * Upload a receipt file buffer to Cloudinary
 */
export async function uploadReceipt(
  buffer: Buffer,
  filename: string
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "cozy-canvas/receipts",
        public_id: `receipt_${Date.now()}_${filename.replace(/[^a-zA-Z0-9]/g, "_")}`,
        resource_type: "auto",
        transformation: [
          { quality: "auto", fetch_format: "auto" },
          { width: 1200, crop: "limit" },
        ],
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Upload failed"));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Delete a file from Cloudinary by public_id
 */
export async function deleteReceipt(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
