import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Trip from "@/models/Trip";
import Route from "@/models/Route";
import "@/models/Bus";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const date = searchParams.get("date");

    if (!from || !to || !date) {
      return NextResponse.json(
        { success: false, message: "Please provide from, to, and date" },
        { status: 400 }
      );
    }

    // Find route
    const route = await Route.findOne({ from, to, status: "active" });
    if (!route) {
      return NextResponse.json(
        {
          success: true,
          message: "No routes found for this journey",
          trips: [],
        },
        { status: 200 }
      );
    }

    // Parse date and find trips
    const searchDate = new Date(date);
    const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

    const trips = await Trip.find({
      routeId: route._id,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["scheduled", "in-progress"] },
    })
      .populate("busId")
      .populate("routeId")
      .sort({ startTime: 1 });

    // Format response
    const formattedTrips = trips.map((trip: any) => ({
      id: trip._id,
      date: trip.date,
      startTime: trip.startTime,
      endTime: trip.endTime,
      fare: trip.fare,
      availableSeats: trip.availableSeats.length,
      totalSeats: trip.busId.totalSeats,
      bus: {
        id: trip.busId._id,
        busNumber: trip.busId.busNumber,
        busName: trip.busId.busName,
        type: trip.busId.type,
        amenities: trip.busId.amenities,
      },
      route: {
        id: trip.routeId._id,
        from: trip.routeId.from,
        to: trip.routeId.to,
        distance: trip.routeId.distance,
        stops: trip.routeId.stops,
      },
    }));

    return NextResponse.json(
      {
        success: true,
        trips: formattedTrips,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Search trips error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to search trips",
      },
      { status: 500 }
    );
  }
}

