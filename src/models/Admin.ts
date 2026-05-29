import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAdminDoc extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: "Organizer" | "Door staff";
  addedAt: Date;
}

const AdminSchema = new Schema<IAdminDoc>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["Organizer", "Door staff"], required: true },
  addedAt: { type: Date, default: Date.now },
});

const Admin: Model<IAdminDoc> =
  mongoose.models.Admin || mongoose.model<IAdminDoc>("Admin", AdminSchema);

export default Admin;
