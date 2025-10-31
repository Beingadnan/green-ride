import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const authUser = await requireAuth();
    const { id } = await params;

    const booking = await Booking.findById(id)
      .populate({
        path: "tripId",
        populate: [
          { path: "busId" },
          { path: "routeId" },
        ],
      });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    // Check if user owns this booking or is admin
    if (booking.userId.toString() !== authUser.userId && authUser.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        booking: {
          id: booking._id,
          bookingId: booking.bookingId,
          passengerName: booking.passengerName,
          passengerEmail: booking.passengerEmail,
          passengerPhone: booking.passengerPhone,
          seats: booking.seats,
          totalFare: booking.totalFare,
          paymentStatus: booking.paymentStatus,
          bookingStatus: booking.bookingStatus,
          qrCode: booking.qrCode,
          createdAt: booking.createdAt,
          trip: (booking.tripId as any) ? {
            id: (booking.tripId as any)._id,
            date: (booking.tripId as any).date,
            startTime: (booking.tripId as any).startTime,
            endTime: (booking.tripId as any).endTime,
            bus: (booking.tripId as any).busId ? {
              busNumber: (booking.tripId as any).busId.busNumber,
              busName: (booking.tripId as any).busId.busName,
              type: (booking.tripId as any).busId.type,
            } : null,
            route: (booking.tripId as any).routeId ? {
              from: (booking.tripId as any).routeId.from,
              to: (booking.tripId as any).routeId.to,
              stops: (booking.tripId as any).routeId.stops,
            } : null,
          } : null,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get booking error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to get booking",
      },
      { status: 500 }
    );
  }
}

