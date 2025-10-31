import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import Payment from "@/models/Payment";
import { requireAuth } from "@/lib/auth";
import { createRazorpayOrder } from "@/lib/razorpay";
import { generateTransactionId } from "@/lib/utils";

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
    const booking = await Booking.findById(bookingId);
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

    // Check if payment already exists and is successful
    if (booking.paymentStatus === "success") {
      return NextResponse.json(
        { success: false, message: "Payment already completed" },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder(
      booking.totalFare,
      booking.bookingId
    );

    // Create payment record
    const payment = await Payment.create({
      bookingId: booking._id,
      userId: authUser.userId,
      orderId: generateTransactionId(),
      amount: booking.totalFare,
      currency: "INR",
      status: "pending",
      razorpayOrderId: razorpayOrder.id,
    });

    // Update booking with razorpay order ID
    booking.razorpayOrderId = razorpayOrder.id;
    await booking.save();

    return NextResponse.json(
      {
        success: true,
        order: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          bookingId: booking.bookingId,
        },
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create payment order",
      },
      { status: 500 }
    );
  }
}

