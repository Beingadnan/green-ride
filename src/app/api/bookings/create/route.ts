import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import Trip from "@/models/Trip";
import { requireAuth } from "@/lib/auth";
import { generateBookingId, generateQRCode } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Authenticate user
    const authUser = await requireAuth();

    const body = await request.json();
    const {
      tripId,
      passengerName,
      passengerEmail,
      passengerPhone,
      seats,
    } = body;

    // Validate required fields
    if (!tripId || !passengerName || !passengerEmail || !passengerPhone || !seats || seats.length === 0) {
      return NextResponse.json(
        { success: false, message: "Please provide all required fields" },
        { status: 400 }
      );
    }

    // Find trip
    const trip = await Trip.findById(tripId).populate("busId").populate("routeId");
    if (!trip) {
      return NextResponse.json(
        { success: false, message: "Trip not found" },
        { status: 404 }
      );
    }

    // Check if seats are available
    const unavailableSeats = seats.filter(
      (seat: string): boolean => !trip.availableSeats.includes(seat)
    );
    if (unavailableSeats.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Seats ${unavailableSeats.join(", ")} are not available`,
        },
        { status: 400 }
      );
    }

    // Calculate total fare
    const totalFare = trip.fare * seats.length;

    // Generate booking ID
    const bookingId = generateBookingId();

    // Generate QR code
    const qrData = JSON.stringify({
      bookingId,
      tripId: trip._id,
      seats,
      passengerName,
    });
    const qrCode = await generateQRCode(qrData);

    // Create booking
    const booking = await Booking.create({
      bookingId,
      userId: authUser.userId,
      tripId,
      passengerName,
      passengerEmail,
      passengerPhone,
      seats,
      totalFare,
      paymentStatus: "pending",
      bookingStatus: "confirmed",
      qrCode,
    });

    // Update trip - remove booked seats from available seats
    trip.availableSeats = trip.availableSeats.filter(
      (seat: string): boolean => !seats.includes(seat)
    );
    trip.bookedSeats = [...trip.bookedSeats, ...seats];
    await trip.save();

    return NextResponse.json(
      {
        success: true,
        message: "Booking created successfully",
        booking: {
          id: booking._id,
          bookingId: booking.bookingId,
          tripId: booking.tripId,
          seats: booking.seats,
          totalFare: booking.totalFare,
          paymentStatus: booking.paymentStatus,
          qrCode: booking.qrCode,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create booking error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create booking",
      },
      { status: 500 }
    );
  }
}

