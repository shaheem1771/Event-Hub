import mongoose, { Schema, type Document } from "mongoose";

export interface IRegistration extends Document {
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  registeredAt: Date;
}

const registrationSchema = new Schema<IRegistration>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

registrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export const Registration = mongoose.model<IRegistration>("Registration", registrationSchema);
