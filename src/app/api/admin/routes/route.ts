import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Route from "@/models/Route";
import { requireAdmin } from "@/lib/auth";

// GET all routes
export async function GET() {
  try {
    await dbConnect();
    await requireAdmin();

    const routes = await Route.find().sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        routes,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get routes error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to get routes",
      },
      { status: 500 }
    );
  }
}

// POST create new route
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    await requireAdmin();

    const body = await request.json();
    const { name, from, to, distance, stops, estimatedDuration, baseFare, status } = body;

    // Validate required fields
    if (!name || !from || !to || !distance || !stops || !estimatedDuration || !baseFare) {
      return NextResponse.json(
        { success: false, message: "Please provide all required fields" },
        { status: 400 }
      );
    }

    // Create route
    const route = await Route.create({
      name,
      from,
      to,
      distance,
      stops,
      estimatedDuration,
      baseFare,
      status: status || "active",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Route created successfully",
        route,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create route error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create route",
      },
      { status: 500 }
    );
  }
}

// PUT update route
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Please provide route ID" },
        { status: 400 }
      );
    }

    const updateData = body;

    const route = await Route.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!route) {
      return NextResponse.json(
        { success: false, message: "Route not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Route updated successfully",
        route,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update route error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update route",
      },
      { status: 500 }
    );
  }
}

// DELETE route
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Please provide route ID" },
        { status: 400 }
      );
    }

    const route = await Route.findByIdAndDelete(id);

    if (!route) {
      return NextResponse.json(
        { success: false, message: "Route not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Route deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete route error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete route",
      },
      { status: 500 }
    );
  }
}

