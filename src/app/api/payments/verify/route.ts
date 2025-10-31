import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import Payment from "@/models/Payment";
import Trip from "@/models/Trip";
import { requireAuth } from "@/lib/auth";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { sendBookingConfirmation } from "@/lib/email";
import { formatDate } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const authUser = await requireAuth();
    const body = await request.json();
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      bookingId,
    } = body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !bookingId) {
      return NextResponse.json(
        { success: false, message: "Missing payment details" },
        { status: 400 }
      );
    }

    // Verify signature
    const isValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Find booking
    const booking = await Booking.findById(bookingId).populate({
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

    // Update booking
    booking.paymentStatus = "success";
    booking.razorpayPaymentId = razorpayPaymentId;
    await booking.save();

    // Update payment record
    await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        status: "success",
        razorpayPaymentId,
        razorpaySignature,
      }
    );

    // Send confirmation email
    const trip: any = booking.tripId;
    if (trip && trip.busId && trip.routeId) {
      await sendBookingConfirmation({
        bookingId: booking.bookingId,
        passengerName: booking.passengerName,
        passengerEmail: booking.passengerEmail,
        tripDate: formatDate(trip.date, "PPP"),
        startTime: trip.startTime,
        endTime: trip.endTime,
        from: trip.routeId.from,
        to: trip.routeId.to,
        seats: booking.seats,
        totalFare: booking.totalFare,
        busNumber: trip.busId.busNumber,
        qrCodeUrl: booking.qrCode,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Payment verified successfully",
        booking: {
          id: booking._id,
          bookingId: booking.bookingId,
          paymentStatus: booking.paymentStatus,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Payment verification failed",
      },
      { status: 500 }
    );
  }
}

