import dbConnect from "@/lib/dbConnect";
import User, { ensureUserIndexes } from "@/models/User";

export async function sendOtp(phoneE164: string) {
  await dbConnect();
  await ensureUserIndexes();

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expiry = new Date(Date.now() + 5 * 60 * 1000);

  let user = await User.findOne({ phoneE164 });
  if (!user) {
    user = await User.create({ phoneE164, country: "IN", otp, otpExpiry: expiry, isVerified: false, role: "user" });
  } else {
    user.otp = otp;
    user.otpExpiry = expiry;
    user.isVerified = false;
    await user.save();
  }

  if (process.env.NODE_ENV !== "production") {
    console.log(`🔐 [OTP] Generated OTP for ${phoneE164}: ${otp}`);
  }

  return { success: true, expiresAt: expiry };
}

export async function verifyOtp(phoneE164: string, otp: string) {
  await dbConnect();

  const user = await User.findOne({ phoneE164 });
  if (!user) return { success: false, message: "User not found" } as const;
  if (!user.otp || !user.otpExpiry) return { success: false, message: "No OTP issued. Please request again." } as const;
  if (user.otp !== otp || new Date() > user.otpExpiry) return { success: false, message: "Invalid or expired OTP" } as const;

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();
  return { success: true, user } as const;
}


