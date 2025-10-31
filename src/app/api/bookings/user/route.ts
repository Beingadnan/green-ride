import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();

    // Authenticate user
    const authUser = await requireAuth();

    // Get user bookings
    const bookings = await Booking.find({ userId: authUser.userId })
      .populate({
        path: "tripId",
        populate: [
          { path: "busId" },
          { path: "routeId" },
        ],
      })
      .sort({ createdAt: -1 });

    // Format response
    const formattedBookings = bookings.map((booking: any) => ({
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
      trip: booking.tripId ? {
        id: booking.tripId._id,
        date: booking.tripId.date,
        startTime: booking.tripId.startTime,
        endTime: booking.tripId.endTime,
        bus: booking.tripId.busId ? {
          busNumber: booking.tripId.busId.busNumber,
          busName: booking.tripId.busId.busName,
          type: booking.tripId.busId.type,
        } : null,
        route: booking.tripId.routeId ? {
          from: booking.tripId.routeId.from,
          to: booking.tripId.routeId.to,
          stops: booking.tripId.routeId.stops,
        } : null,
      } : null,
    }));

    return NextResponse.json(
      {
        success: true,
        bookings: formattedBookings,
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

