import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import Trip from "@/models/Trip";
import { requireAuth } from "@/lib/auth";
import { initiateRefund } from "@/lib/razorpay";
import { sendCancellationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const authUser = await requireAuth();
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

    // Check if user owns this booking
    if (booking.userId.toString() !== authUser.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if booking is already cancelled
    if (booking.bookingStatus === "cancelled") {
      return NextResponse.json(
        { success: false, message: "Booking is already cancelled" },
        { status: 400 }
      );
    }

    // Update booking status
    booking.bookingStatus = "cancelled";
    await booking.save();

    // Update trip - return seats to available seats
    const trip = await Trip.findById(booking.tripId);
    if (trip) {
      trip.availableSeats = [...trip.availableSeats, ...booking.seats].sort();
      trip.bookedSeats = trip.bookedSeats.filter(
        (seat: string): boolean => !booking.seats.includes(seat)
      );
      await trip.save();
    }

    // Initiate refund if payment was successful
    let refundAmount = 0;
    if (booking.paymentStatus === "success" && booking.razorpayPaymentId) {
      try {
        await initiateRefund(booking.razorpayPaymentId, booking.totalFare);
        booking.paymentStatus = "refunded";
        await booking.save();
        refundAmount = booking.totalFare;
      } catch (error) {
        console.error("Refund failed:", error);
      }
    }

    // Send cancellation email
    await sendCancellationEmail(
      booking.passengerEmail,
      booking.bookingId,
      refundAmount
    );

    return NextResponse.json(
      {
        success: true,
        message: "Booking cancelled successfully",
        refundAmount,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Cancel booking error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to cancel booking",
      },
      { status: 500 }
    );
  }
}

