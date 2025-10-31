import OtpLog from "@/models/OtpLog";
import { getOtpProvider, mockProvider } from "./provider";
import { maskPhone } from "../phone";

function generateOtp(): string { return String(Math.floor(100000 + Math.random() * 900000)); }

async function checkOtpLimits(phoneE164: string): Promise<{ allowed: boolean; reason?: string; retryAfter?: number }>{
  const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
  const thirtySecsAgo = new Date(Date.now() - 30 * 1000);
  const recentOtps = await OtpLog.countDocuments({ phoneE164, createdAt: { $gte: fifteenMinsAgo } });
  if (recentOtps >= 3) return { allowed: false, reason: "TOO_MANY_REQUESTS", retryAfter: 900 };
  const lastOtp = await OtpLog.findOne({ phoneE164 }).sort({ createdAt: -1 });
  if (lastOtp && lastOtp.createdAt > thirtySecsAgo) {
    const secondsSinceLastOtp = Math.floor((Date.now() - lastOtp.createdAt.getTime()) / 1000);
    return { allowed: false, reason: "RATE_LIMITED", retryAfter: 30 - secondsSinceLastOtp };
  }
  return { allowed: true };
}

export async function issueOtp(phoneE164: string) {
  try {
    const limitCheck = await checkOtpLimits(phoneE164);
    if (!limitCheck.allowed) return { success: false, error: limitCheck.reason, retryAfter: limitCheck.retryAfter } as const;
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const isDev = process.env.NODE_ENV === "development";
    const provider = isDev && !process.env.MSG91_AUTHKEY ? mockProvider : getOtpProvider();
    const { refId, success } = await provider.sendOtp(phoneE164, otp);
    if (!success) return { success: false, error: "SMS_SEND_FAILED" } as const;
    await OtpLog.create({ phoneE164, otp, providerRef: refId, expiresAt, status: "sent", attempts: 0, sends: 1 });
    console.log(`✅ [OTP] Sent to ${maskPhone(phoneE164)}, expires at ${expiresAt.toISOString()}`);
    return { success: true, expiresAt, refId } as const;
  } catch (e) {
    return { success: false, error: "INTERNAL_ERROR" } as const;
  }
}

export async function verifyOtp(phoneE164: string, code: string) {
  try {
    const log = await OtpLog.findOne({ phoneE164, status: { $in: ["sent"] } }).sort({ createdAt: -1 });
    if (!log) return { ok: false, reason: "NO_OTP" } as const;
    if (new Date() > log.expiresAt) { log.status = "expired"; await log.save(); return { ok: false, reason: "EXPIRED" } as const; }
    if (log.status === "blocked") return { ok: false, reason: "BLOCKED" } as const;
    log.attempts += 1;
    if (log.attempts > 5) { log.status = "blocked"; await log.save(); return { ok: false, reason: "TOO_MANY_ATTEMPTS" } as const; }
    const match = code === log.otp;
    if (!match) { await log.save(); return { ok: false, reason: "INVALID", attemptsLeft: Math.max(0, 5 - log.attempts) } as const; }
    log.status = "verified"; await log.save();
    console.log(`✅ [OTP] Verified for ${maskPhone(phoneE164)}`);
    return { ok: true } as const;
  } catch (e) {
    return { ok: false, reason: "INTERNAL_ERROR" } as const;
  }
}

export async function cleanupExpiredOtps(): Promise<number> {
  const result = await OtpLog.deleteMany({ expiresAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } });
  return result.deletedCount || 0;
}


