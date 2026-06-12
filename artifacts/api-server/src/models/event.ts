import mongoose, { Schema, type Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  location: string;
  capacity: number;
  spotsLeft: number;
  category: string;
  organizer: string;
  imageUrl?: string | null;
  createdAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    capacity: { type: Number, required: true, min: 1 },
    spotsLeft: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    organizer: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: null },
  },
  { timestamps: true }
);

export const Event = mongoose.model<IEvent>("Event", eventSchema);
