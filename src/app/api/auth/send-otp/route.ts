import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import { toE164Indian, isValidIndianMobile, maskPhone } from "@/lib/phone";
import { sendOtp as persistOtp } from "@/services/authService";
import { checkRateLimit, otpPhoneLimiter, otpIpLimiter, getClientIp } from "@/lib/rateLimit";

// Request validation schema
const sendOtpSchema = z.object({
  phone: z.string().min(10).max(15),
});

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Parse and validate request body
    const body = await request.json();
    const validation = sendOtpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_INPUT",
          message: "Please provide a valid phone number",
        },
        { status: 400 }
      );
    }

    const { phone } = validation.data;

    // Normalize to E.164 Indian format
    const phoneE164 = toE164Indian(phone);

    if (!phoneE164 || !isValidIndianMobile(phone)) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_PHONE",
          message: "Please provide a valid Indian mobile number (10 digits starting with 6-9)",
        },
        { status: 400 }
      );
    }

    // Rate limiting - per IP
    const clientIp = getClientIp(request);
    const ipLimit = await checkRateLimit(otpIpLimiter, clientIp);

    if (!ipLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "RATE_LIMITED_IP",
          message: `Too many requests from your IP. Please try again in ${ipLimit.retryAfter} seconds.`,
          retryAfter: ipLimit.retryAfter,
        },
        { status: 429 }
      );
    }

    // Rate limiting - per phone
    const phoneLimit = await checkRateLimit(otpPhoneLimiter, phoneE164);

    if (!phoneLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "RATE_LIMITED_PHONE",
          message: `Please wait ${phoneLimit.retryAfter} seconds before requesting another OTP.`,
          retryAfter: phoneLimit.retryAfter,
        },
        { status: 429 }
      );
    }

    // Persist OTP on User and send via provider/mock inside service layer
    const result = await persistOtp(phoneE164);

    console.log(`📤 [API] OTP initiated for ${maskPhone(phoneE164)}`);

    return NextResponse.json(
      {
        success: true,
        message: "OTP sent successfully",
        phone: phoneE164,
        maskedPhone: maskPhone(phoneE164),
        expiresAt: result.expiresAt,
        expiresIn: 300, // 5 minutes in seconds
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ [API] Send OTP error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_ERROR",
        message: "An error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}
