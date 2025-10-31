import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/Booking";
import Trip from "@/models/Trip";
import Bus from "@/models/Bus";
import User from "@/models/User";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    await requireAdmin();

    // Get various statistics
    const totalBookings = await Booking.countDocuments();
    const totalRevenue = await Booking.aggregate([
      { $match: { paymentStatus: "success" } },
      { $group: { _id: null, total: { $sum: "$totalFare" } } },
    ]);

    const totalBuses = await Bus.countDocuments();
    const activeBuses = await Bus.countDocuments({ status: "active" });
    const totalUsers = await User.countDocuments();

    // Today's bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayBookings = await Booking.countDocuments({
      createdAt: { $gte: today },
    });

    // Today's revenue
    const todayRevenue = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
          paymentStatus: "success",
        },
      },
      { $group: { _id: null, total: { $sum: "$totalFare" } } },
    ]);

    // Upcoming trips
    const upcomingTrips = await Trip.countDocuments({
      date: { $gte: new Date() },
      status: { $in: ["scheduled", "in-progress"] },
    });

    // Recent bookings
    const recentBookings = await Booking.find()
      .populate("userId", "name email")
      .populate({
        path: "tripId",
        populate: [
          { path: "busId", select: "busNumber busName" },
          { path: "routeId", select: "from to" },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalBookings,
          totalRevenue: totalRevenue[0]?.total || 0,
          totalBuses,
          activeBuses,
          totalUsers,
          todayBookings,
          todayRevenue: todayRevenue[0]?.total || 0,
          upcomingTrips,
        },
        recentBookings,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get stats error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to get stats",
      },
      { status: 500 }
    );
  }
}

