import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Bus from "@/models/Bus";
import { requireAdmin } from "@/lib/auth";

// GET all buses
export async function GET() {
  try {
    await dbConnect();
    await requireAdmin();

    const buses = await Bus.find().sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        buses,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get buses error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to get buses",
      },
      { status: 500 }
    );
  }
}

// POST create new bus
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    await requireAdmin();

    const body = await request.json();
    const {
      busNumber,
      busName,
      type,
      totalSeats,
      amenities,
      registrationNumber,
      status,
    } = body;

    // Validate required fields
    if (!busNumber || !busName || !registrationNumber) {
      return NextResponse.json(
        { success: false, message: "Please provide all required fields" },
        { status: 400 }
      );
    }

    // Create bus
    const bus = await Bus.create({
      busNumber,
      busName,
      type: type || "AC",
      totalSeats: totalSeats || 61,
      amenities: amenities || [],
      registrationNumber,
      status: status || "active",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Bus created successfully",
        bus,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create bus error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create bus",
      },
      { status: 500 }
    );
  }
}

// PUT update bus
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Please provide bus ID" },
        { status: 400 }
      );
    }

    const updateData = body;

    const bus = await Bus.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!bus) {
      return NextResponse.json(
        { success: false, message: "Bus not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Bus updated successfully",
        bus,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update bus error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update bus",
      },
      { status: 500 }
    );
  }
}

// DELETE bus
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Please provide bus ID" },
        { status: 400 }
      );
    }

    const bus = await Bus.findByIdAndDelete(id);

    if (!bus) {
      return NextResponse.json(
        { success: false, message: "Bus not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Bus deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete bus error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete bus",
      },
      { status: 500 }
    );
  }
}

