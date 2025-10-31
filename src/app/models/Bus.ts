import mongoose, { Document, Schema } from "mongoose";

export interface IBus extends Document {
  _id: string;
  busNumber: string;
  busName: string;
  type: "AC" | "Non-AC" | "Sleeper" | "Semi-Sleeper";
  totalSeats: number;
  amenities: string[];
  status: "active" | "inactive" | "maintenance";
  registrationNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const BusSchema = new Schema<IBus>({
  busNumber: { type: String, required: true, unique: true, trim: true },
  busName: { type: String, required: true, trim: true },
  type: { type: String, enum: ["AC", "Non-AC", "Sleeper", "Semi-Sleeper"], default: "AC" },
  totalSeats: { type: Number, required: true, default: 61 },
  amenities: { type: [String], default: ["WiFi", "Charging Port", "Water Bottle", "Emergency Exit"] },
  status: { type: String, enum: ["active", "inactive", "maintenance"], default: "active" },
  registrationNumber: { type: String, required: true, unique: true, trim: true },
}, { timestamps: true });

export default mongoose.models.Bus || mongoose.model<IBus>("Bus", BusSchema);


