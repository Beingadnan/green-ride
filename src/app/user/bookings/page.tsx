"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { useBooking } from "@/hooks/useBooking";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";
import { Ticket, MapPin, Calendar, Clock, X } from "lucide-react";

export default function UserBookingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { getUserBookings, cancelBooking } = useBooking();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }
    if (user) {
      fetchBookings();
    }
  }, [user, authLoading]);

  const fetchBookings = async () => {
    const result = await getUserBookings();
    if (result && result.success) {
      setBookings(result.bookings || []);
    }
    setLoading(false);
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (
      !confirm(
        "Are you sure you want to cancel this booking? Refund will be processed if applicable."
      )
    ) {
      return;
    }

    const result = await cancelBooking(bookingId);
    if (result && result.success) {
      alert("Booking cancelled successfully");
      fetchBookings();
    } else {
      alert(result?.message || "Failed to cancel booking");
    }
  };

  if (!user || authLoading) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header user={user} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bookings...</p>
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
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              My Bookings
            </h1>

            {bookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Ticket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    No bookings yet
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Start your journey by booking your first bus ticket
                  </p>
                  <Button onClick={() => router.push("/")}>
                    Search Buses
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking: any) => (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">
                                Booking ID: {booking.bookingId}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Booked on{" "}
                                {formatDate(booking.createdAt, "PPP")}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  booking.bookingStatus === "confirmed"
                                    ? "bg-green-100 text-green-700"
                                    : booking.bookingStatus === "cancelled"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {booking.bookingStatus}
                              </span>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  booking.paymentStatus === "success"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {booking.paymentStatus}
                              </span>
                            </div>
                          </div>

                          {/* Trip Details */}
                          {booking.trip && (
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span>
                                  {booking.trip.route?.from} →{" "}
                                  {booking.trip.route?.to}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>
                                  {formatDate(booking.trip.date, "PPP")}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span>
                                  {formatTime(booking.trip.startTime)} -{" "}
                                  {formatTime(booking.trip.endTime)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Ticket className="h-4 w-4 text-gray-400" />
                                <span>
                                  Seats: {booking.seats.join(", ")}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Passenger Details */}
                          <div className="bg-gray-50 rounded p-3 mb-4">
                            <p className="text-sm">
                              <span className="font-medium">Passenger:</span>{" "}
                              {booking.passengerName}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Contact:</span>{" "}
                              {booking.passengerPhone}
                            </p>
                          </div>

                          {/* Total Fare */}
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900">
                              Total Fare:
                            </span>
                            <span className="text-xl font-bold text-green-600">
                              {formatCurrency(booking.totalFare)}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 md:w-48">
                          <Button
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/booking/success/${booking.id}`
                              )
                            }
                          >
                            View Details
                          </Button>
                          {booking.bookingStatus === "confirmed" &&
                            new Date(booking.trip?.date) > new Date() && (
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleCancelBooking(booking.id)}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                              </Button>
                            )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

