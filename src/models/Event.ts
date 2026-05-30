import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEventDoc extends Document {
  eventId: string;
  title: string;
  date: Date;
  time: string;
  venue: string;
  capacity: number;
  priceLKR: number;
  priceUSD: number;
  status: "draft" | "open" | "closed" | "past";
  createdAt: Date;
}

const EventSchema = new Schema<IEventDoc>(
  {
    eventId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true, default: "6:30 PM" },
    venue: { type: String, required: true, default: "Coffee Station Café" },
    capacity: { type: Number, required: true, default: 20 },
    priceLKR: { type: Number, required: true },
    priceUSD: { type: Number, required: true },
    status: {
      type: String,
      enum: ["draft", "open", "closed", "past"],
      default: "draft",
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

const Event: Model<IEventDoc> =
  mongoose.models.Event || mongoose.model<IEventDoc>("Event", EventSchema);

export default Event;
