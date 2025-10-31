"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Bus,
  Users,
  Ticket,
  TrendingUp,
  Calendar,
  DollarSign,
} from "lucide-react";
import axios from "@/lib/axios";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/");
      return;
    }
    if (user && user.role === "admin") {
      fetchStats();
    }
  }, [user, authLoading]);

  const fetchStats = async () => {
    try {
      const response = await axios.get("/api/admin/stats");
      if (response.data.success) {
        setStats(response.data.stats);
        setRecentBookings(response.data.recentBookings || []);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "admin" || authLoading) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header user={user} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />

      <div className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your GreenRide Express operations</p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Bookings</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.totalBookings}
                      </p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Ticket className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Today: {stats.todayBookings}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {formatCurrency(stats.totalRevenue)}
                      </p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Today: {formatCurrency(stats.todayRevenue)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Buses</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.activeBuses}
                      </p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Bus className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Total: {stats.totalBuses}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Users</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.totalUsers}
                      </p>
                    </div>
                    <div className="bg-orange-100 p-3 rounded-full">
                      <Users className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Upcoming Trips: {stats.upcomingTrips}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Link href="/admin/buses">
              <Card className="cursor-pointer hover:shadow-lg transition">
                <CardContent className="p-6 text-center">
                  <Bus className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Manage Buses</h3>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/routes">
              <Card className="cursor-pointer hover:shadow-lg transition">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Manage Routes</h3>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/trips">
              <Card className="cursor-pointer hover:shadow-lg transition">
                <CardContent className="p-6 text-center">
                  <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Manage Trips</h3>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/bookings">
              <Card className="cursor-pointer hover:shadow-lg transition">
                <CardContent className="p-6 text-center">
                  <Ticket className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">All Bookings</h3>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {recentBookings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No recent bookings
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                          Booking ID
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                          Passenger
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                          Route
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                          Amount
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBookings.map((booking: any) => (
                        <tr key={booking._id} className="border-b">
                          <td className="py-3 px-4 text-sm">
                            {booking.bookingId}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {booking.passengerName}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {booking.tripId?.routeId?.from} →{" "}
                            {booking.tripId?.routeId?.to}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {booking.createdAt &&
                              formatDate(booking.createdAt, "PP")}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium">
                            {formatCurrency(booking.totalFare)}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                booking.paymentStatus === "success"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {booking.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}

