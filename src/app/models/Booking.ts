import mongoose, { Document, Schema } from "mongoose";

export interface IBooking extends Document { _id: string; bookingId: string; userId: mongoose.Types.ObjectId; tripId: mongoose.Types.ObjectId; passengerName: string; passengerEmail: string; passengerPhone: string; seats: string[]; totalFare: number; paymentStatus: "pending"|"success"|"failed"|"refunded"; bookingStatus: "confirmed"|"cancelled"|"completed"; transactionId?: string; razorpayOrderId?: string; razorpayPaymentId?: string; qrCode?: string; createdAt: Date; updatedAt: Date; }

const BookingSchema = new Schema<IBooking>({
  bookingId: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  tripId: { type: Schema.Types.ObjectId, ref: "Trip", required: true },
  passengerName: { type: String, required: true, trim: true },
  passengerEmail: { type: String, required: true, lowercase: true, trim: true },
  passengerPhone: { type: String, required: true },
  seats: { type: [String], required: true },
  totalFare: { type: Number, required: true },
  paymentStatus: { type: String, enum: ["pending","success","failed","refunded"], default: "pending" },
  bookingStatus: { type: String, enum: ["confirmed","cancelled","completed"], default: "confirmed" },
  transactionId: { type: String },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  qrCode: { type: String },
}, { timestamps: true });

BookingSchema.index({ userId: 1, createdAt: -1 });
BookingSchema.index({ tripId: 1 });

export default mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);


