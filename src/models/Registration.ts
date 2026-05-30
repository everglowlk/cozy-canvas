import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRegistrationDoc extends Document {
  eventId: string;
  regId: string;
  name: string;
  email: string;
  phone: string;
  nic: string;
  country: "local" | "foreign";
  guests: number;
  tier: "Painter";
  payMethod: string;
  payRef: string;
  amount: number;
  currency: "LKR" | "USD";
  receiptUrl: string;
  receiptPublicId: string;
  status: "pending" | "approved" | "rejected";
  ticket: string | null;
  notes: string;
  checkedIn: boolean;
  checkedInAt: Date | null;
  checkedInBy: string | null;
  decidedAt: Date | null;
  createdAt: Date;
}

const RegistrationSchema = new Schema<IRegistrationDoc>(
  {
    eventId: { type: String, default: "LEGACY" },
    regId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    nic: { type: String, default: "—" },
    country: { type: String, enum: ["local", "foreign"], required: true },
    guests: { type: Number, required: true, min: 1, max: 10 },
    tier: { type: String, default: "Painter" },
    payMethod: { type: String, required: true },
    payRef: { type: String, default: "—" },
    amount: { type: Number, required: true },
    currency: { type: String, enum: ["LKR", "USD"], required: true },
    receiptUrl: { type: String, default: "" },
    receiptPublicId: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    ticket: { type: String, default: null },
    notes: { type: String, default: "" },
    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date, default: null },
    checkedInBy: { type: String, default: null },
    decidedAt: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
  }
);

const Registration: Model<IRegistrationDoc> =
  mongoose.models.Registration ||
  mongoose.model<IRegistrationDoc>("Registration", RegistrationSchema);

export default Registration;
