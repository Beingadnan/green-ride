import mongoose, { Document, Schema } from "mongoose";

export interface ITrip extends Document { _id: string; routeId: mongoose.Types.ObjectId; busId: mongoose.Types.ObjectId; date: Date; startTime: string; endTime: string; fare: number; availableSeats: string[]; bookedSeats: string[]; status: "scheduled"|"in-progress"|"completed"|"cancelled"; createdAt: Date; updatedAt: Date; }

const TripSchema = new Schema<ITrip>({
  routeId: { type: Schema.Types.ObjectId, ref: "Route", required: true },
  busId: { type: Schema.Types.ObjectId, ref: "Bus", required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  fare: { type: Number, required: true },
  availableSeats: { type: [String], default: [] },
  bookedSeats: { type: [String], default: [] },
  status: { type: String, enum: ["scheduled","in-progress","completed","cancelled"], default: "scheduled" },
}, { timestamps: true });

TripSchema.index({ date: 1, routeId: 1 });
TripSchema.index({ busId: 1, date: 1 });

export default mongoose.models.Trip || mongoose.model<ITrip>("Trip", TripSchema);


