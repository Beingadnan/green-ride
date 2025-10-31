import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json(
      {
        success: true,
        message: "Logout successful",
      },
      { status: 200 }
    );

    // Clear both cookies (x-api-key and legacy x-auth-token)
    response.cookies.set("x-api-key", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    response.cookies.set("x-auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    console.log("👋 [AUTH] User logged out");

    return response;
  } catch (error: any) {
    console.error("❌ [API] Logout error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Logout failed",
      },
      { status: 500 }
    );
  }
}
