import { RateLimiterMemory } from "rate-limiter-flexible";

export const otpPhoneLimiter = new RateLimiterMemory({ points: 1, duration: 30, keyPrefix: "otp_phone" });
export const otpIpLimiter = new RateLimiterMemory({ points: 3, duration: 60, keyPrefix: "otp_ip" });
export const otpBombingLimiter = new RateLimiterMemory({ points: 3, duration: 15 * 60, keyPrefix: "otp_bombing" });

export async function checkRateLimit(limiter: RateLimiterMemory, key: string): Promise<{ allowed: boolean; retryAfter?: number }>{
  try {
    await limiter.consume(key);
    return { allowed: true };
  } catch (rateLimiterRes: any) {
    const retryAfter = Math.ceil(rateLimiterRes.msBeforeNext / 1000);
    return { allowed: false, retryAfter };
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}


