/**
 * Seed the two default admin accounts.
 * Run: npm run seed
 * (uses tsx to execute TypeScript directly)
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load .env.local
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌  MONGODB_URI is not set in .env.local");
  process.exit(1);
}

const AdminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  passwordHash: String,
  role: String,
  addedAt: { type: Date, default: Date.now },
});

const Admin =
  mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

const SEED_ADMINS = [
  {
    name: "Sadew",
    email: "sadew@everglowlk.com",
    password: "EG@Sadew2026",
    role: "Organizer",
  },
  {
    name: "Vishmitha",
    email: "vishmitha@everglowlk.com",
    password: "EG@Vish2026",
    role: "Organizer",
  },
];

async function seed() {
  console.log("🌱  Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI!);
  console.log("✅  Connected");

  for (const a of SEED_ADMINS) {
    const existing = await Admin.findOne({ email: a.email });
    if (existing) {
      console.log(`⏭   ${a.email} already exists — skipping`);
      continue;
    }
    const passwordHash = await bcrypt.hash(a.password, 12);
    await Admin.create({ name: a.name, email: a.email, passwordHash, role: a.role });
    console.log(`✅  Created ${a.role}: ${a.email} (password: ${a.password})`);
  }

  await mongoose.disconnect();
  console.log("\n🎉  Seed complete!");
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
