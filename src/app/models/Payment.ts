import mongoose, { Document, Schema } from "mongoose";

export interface IPayment extends Document { _id: string; bookingId: mongoose.Types.ObjectId; userId: mongoose.Types.ObjectId; orderId: string; paymentId?: string; amount: number; currency: string; status: "pending"|"success"|"failed"|"refunded"; method?: string; signature?: string; razorpayOrderId?: string; razorpayPaymentId?: string; razorpaySignature?: string; failureReason?: string; refundId?: string; refundAmount?: number; createdAt: Date; updatedAt: Date; }

const PaymentSchema = new Schema<IPayment>({
  bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  orderId: { type: String, required: true, unique: true },
  paymentId: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  status: { type: String, enum: ["pending","success","failed","refunded"], default: "pending" },
  method: { type: String },
  signature: { type: String },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  failureReason: { type: String },
  refundId: { type: String },
  refundAmount: { type: Number },
}, { timestamps: true });

PaymentSchema.index({ bookingId: 1 });
PaymentSchema.index({ userId: 1 });

export default mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);


