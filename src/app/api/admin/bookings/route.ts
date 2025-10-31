import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    const filter: any = {};
    if (status) {
      filter.bookingStatus = status;
    }

    const bookings = await Booking.find(filter)
      .populate("userId", "name email")
      .populate({
        path: "tripId",
        populate: [
          { path: "busId" },
          { path: "routeId" },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json(
      {
        success: true,
        bookings,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get bookings error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to get bookings",
      },
      { status: 500 }
    );
  }
}

