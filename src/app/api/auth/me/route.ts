import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();

    // Get authenticated user from cookie
    const authUser = await getAuthUser();
    
    if (!authUser) {
      return NextResponse.json(
        { 
          success: false, 
          user: null,
          message: "Not authenticated" 
        },
        { status: 401 }
      );
    }

    // Get full user details from database
    const user = await User.findById(authUser.userId);
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          user: null,
          message: "User not found" 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id.toString(),
          phoneE164: user.phoneE164,
          phone: user.phone, // Legacy field
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ [API] Get user error:", error);
    return NextResponse.json(
      {
        success: false,
        user: null,
        message: "Failed to get user",
      },
      { status: 500 }
    );
  }
}
