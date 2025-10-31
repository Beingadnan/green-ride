import { Schema, model, models } from "mongoose";

export interface IOtpLog { phoneE164: string; otp: string; providerRef?: string; expiresAt: Date; attempts: number; sends: number; status: "sent"|"verified"|"expired"|"blocked"; createdAt: Date; updatedAt: Date; }

const OtpLogSchema = new Schema<IOtpLog>({
  phoneE164: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  providerRef: { type: String },
  expiresAt: { type: Date, required: true, index: true },
  attempts: { type: Number, default: 0 },
  sends: { type: Number, default: 1 },
  status: { type: String, enum: ["sent","verified","expired","blocked"], default: "sent", index: true },
}, { timestamps: true });

OtpLogSchema.index({ phoneE164: 1, createdAt: -1 });
OtpLogSchema.index({ phoneE164: 1, status: 1 });
OtpLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });

export default models.OtpLog || model<IOtpLog>("OtpLog", OtpLogSchema);


