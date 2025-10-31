import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Trip from "@/models/Trip";
import "@/models/Bus";
import "@/models/Route";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

    const trip = await Trip.findById(id)
      .populate("busId")
      .populate("routeId");

    if (!trip) {
      return NextResponse.json(
        { success: false, message: "Trip not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        trip: {
          id: trip._id,
          date: trip.date,
          startTime: trip.startTime,
          endTime: trip.endTime,
          fare: trip.fare,
          availableSeats: trip.availableSeats,
          bookedSeats: trip.bookedSeats,
          totalSeats: (trip.busId as any).totalSeats,
          status: trip.status,
          bus: {
            id: (trip.busId as any)._id,
            busNumber: (trip.busId as any).busNumber,
            busName: (trip.busId as any).busName,
            type: (trip.busId as any).type,
            amenities: (trip.busId as any).amenities,
          },
          route: {
            id: (trip.routeId as any)._id,
            from: (trip.routeId as any).from,
            to: (trip.routeId as any).to,
            distance: (trip.routeId as any).distance,
            stops: (trip.routeId as any).stops,
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get trip error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to get trip",
      },
      { status: 500 }
    );
  }
}

