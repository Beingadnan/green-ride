import mongoose, { Document, Schema } from "mongoose";

export interface IRoute extends Document {
  _id: string; name: string; from: string; to: string; distance: number; stops: string[]; estimatedDuration: number; baseFare: number; status: "active"|"inactive"; createdAt: Date; updatedAt: Date;
}

const RouteSchema = new Schema<IRoute>({
  name: { type: String, required: true, trim: true },
  from: { type: String, required: true, trim: true },
  to: { type: String, required: true, trim: true },
  distance: { type: Number, required: true },
  stops: { type: [String], required: true },
  estimatedDuration: { type: Number, required: true },
  baseFare: { type: Number, required: true },
  status: { type: String, enum: ["active","inactive"], default: "active" }
}, { timestamps: true });

export default mongoose.models.Route || mongoose.model<IRoute>("Route", RouteSchema);


