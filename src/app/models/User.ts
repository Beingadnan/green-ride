import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  _id: string;
  phoneE164: string;
  phone?: string;
  country: string;
  name?: string;
  email?: string;
  role: "user" | "admin";
  otp?: string;
  otpExpiry?: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    phoneE164: {
      type: String,
      required: [true, "Please provide a phone number"],
      unique: true,
      trim: true,
      match: [/^\+91[6-9]\d{9}$/, "Please provide a valid Indian phone number in E.164 format"],
    },
    phone: { type: String, trim: true },
    country: { type: String, default: "IN" },
    name: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"] },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isVerified: { type: Boolean, default: false },
    otp: { type: String, trim: true },
    otpExpiry: { type: Date },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1 });

UserSchema.virtual("displayPhone").get(function () {
  return (this as any).phoneE164 || (this as any).phone;
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export async function ensureUserIndexes(): Promise<void> {
  try {
    const model = (mongoose.models.User || mongoose.model<IUser>("User", UserSchema)) as any;
    const indexes = await model.collection.indexes();
    const phoneIndex = indexes.find((idx: any) => idx.key && idx.key.phone === 1);
    if (phoneIndex) await model.collection.dropIndex(phoneIndex.name).catch(() => {});
    await model.createIndexes().catch(() => {});
  } catch (err) {
    console.warn("User index check failed:", (err as any)?.message || err);
  }
}


