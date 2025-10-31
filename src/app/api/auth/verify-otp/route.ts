import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import { toE164Indian, isValidIndianMobile, maskPhone } from "@/lib/phone";
import { verifyOtp as verifyUserOtp } from "@/services/authService";
import User from "@/models/User";
import { signAuth } from "@/lib/jwt";

// Request validation schema
const verifyOtpSchema = z.object({
  phone: z.string().min(10).max(15),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Parse and validate request body
    const body = await request.json();
    const validation = verifyOtpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_INPUT",
          message: validation.error.issues[0]?.message || "Invalid input",
        },
        { status: 400 }
      );
    }

    const { phone, otp, name } = validation.data;

    // Normalize to E.164 Indian format
    const phoneE164 = toE164Indian(phone);

    if (!phoneE164 || !isValidIndianMobile(phone)) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_PHONE",
          message: "Please provide a valid Indian mobile number",
        },
        { status: 400 }
      );
    }

    // Verify OTP and get user
    const { success, user, message } = await verifyUserOtp(phoneE164, otp);
    if (!success || !user) {
      return NextResponse.json(
        { success: false, message: message || "Invalid or expired OTP" },
        { status: 401 }
      );
    }

    // Optionally update name on first login
    let isNewUser = false;
    if (!user.name && name && name.trim()) {
      user.name = name.trim();
      await user.save();
    }

    // Generate JWT token
    const token = signAuth({
      userId: user._id.toString(),
      phoneE164: user.phoneE164,
      role: user.role,
    });

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: isNewUser ? "Account created successfully" : "Login successful",
        isNewUser,
        user: {
          id: user._id.toString(),
          phoneE164: user.phoneE164,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      },
      { status: 200 }
    );

    // Set HTTP-only cookie (x-api-key)
    response.cookies.set("x-api-key", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    console.log(`🔑 [AUTH] JWT token set for ${maskPhone(phoneE164)}`);

    return response;
  } catch (error: any) {
    console.error("❌ [API] Verify OTP error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_ERROR",
        message: "An error occurred during verification. Please try again.",
      },
      { status: 500 }
    );
  }
}
