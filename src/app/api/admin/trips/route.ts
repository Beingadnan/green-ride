import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Trip from "@/models/Trip";
import Bus from "@/models/Bus";
import { requireAdmin } from "@/lib/auth";
import { generateSeatNumbers } from "@/lib/utils";

// GET all trips
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    const filter: any = {};
    if (date) {
      const searchDate = new Date(date);
      const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const trips = await Trip.find(filter)
      .populate("busId")
      .populate("routeId")
      .sort({ date: -1, startTime: 1 });

    return NextResponse.json(
      {
        success: true,
        trips,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get trips error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to get trips",
      },
      { status: 500 }
    );
  }
}

// POST create new trip
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    await requireAdmin();

    const body = await request.json();
    const { routeId, busId, date, startTime, endTime, fare } = body;

    // Validate required fields
    if (!routeId || !busId || !date || !startTime || !endTime || !fare) {
      return NextResponse.json(
        { success: false, message: "Please provide all required fields" },
        { status: 400 }
      );
    }

    // Get bus to get total seats
    const bus = await Bus.findById(busId);
    if (!bus) {
      return NextResponse.json(
        { success: false, message: "Bus not found" },
        { status: 404 }
      );
    }

    // Generate available seats
    const availableSeats = generateSeatNumbers(bus.totalSeats);

    // Create trip
    const trip = await Trip.create({
      routeId,
      busId,
      date: new Date(date),
      startTime,
      endTime,
      fare,
      availableSeats,
      bookedSeats: [],
      status: "scheduled",
    });

    const populatedTrip = await Trip.findById(trip._id)
      .populate("busId")
      .populate("routeId");

    return NextResponse.json(
      {
        success: true,
        message: "Trip created successfully",
        trip: populatedTrip,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create trip error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create trip",
      },
      { status: 500 }
    );
  }
}

// PUT update trip
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    await requireAdmin();

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Please provide trip ID" },
        { status: 400 }
      );
    }

    const trip = await Trip.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
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
        message: "Trip updated successfully",
        trip,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update trip error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update trip",
      },
      { status: 500 }
    );
  }
}

// DELETE trip
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Please provide trip ID" },
        { status: 400 }
      );
    }

    const trip = await Trip.findByIdAndDelete(id);

    if (!trip) {
      return NextResponse.json(
        { success: false, message: "Trip not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Trip deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete trip error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete trip",
      },
      { status: 500 }
    );
  }
}

