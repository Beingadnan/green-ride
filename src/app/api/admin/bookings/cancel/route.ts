import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import Trip from "@/models/Trip";
import { requireAdmin } from "@/lib/auth";
import { initiateRefund } from "@/lib/razorpay";
import { sendCancellationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    await requireAdmin();

    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: "Please provide booking ID" },
        { status: 400 }
      );
    }

    // Find booking
    const booking = await Booking.findById(bookingId).populate("tripId");
    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    // Check if already cancelled
    if (booking.bookingStatus === "cancelled") {
      return NextResponse.json(
        { success: false, message: "Booking is already cancelled" },
        { status: 400 }
      );
    }

    // Update booking status
    booking.bookingStatus = "cancelled";
    await booking.save();

    // Update trip seats
    const trip = await Trip.findById(booking.tripId);
    if (trip) {
      trip.availableSeats = [...trip.availableSeats, ...booking.seats].sort();
      trip.bookedSeats = trip.bookedSeats.filter(
        (seat: string): boolean => !booking.seats.includes(seat)
      );
      await trip.save();
    }

    // Optional refund
    let refundAmount = 0;
    if (booking.paymentStatus === "success" && booking.razorpayPaymentId) {
      try {
        await initiateRefund(booking.razorpayPaymentId, booking.totalFare);
        booking.paymentStatus = "refunded";
        await booking.save();
        refundAmount = booking.totalFare;
      } catch (error) {
        console.error("Admin refund failed:", error);
      }
    }

    // Notify
    try {
      await sendCancellationEmail(
        booking.passengerEmail,
        booking.bookingId,
        refundAmount
      );
    } catch (e) {
      console.warn("Admin cancellation email failed:", (e as any)?.message);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Booking cancelled successfully",
        refundAmount,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Admin cancel booking error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to cancel booking",
      },
      { status: 500 }
    );
  }
}


