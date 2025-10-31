"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { useBooking } from "@/hooks/useBooking";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";
import { CheckCircle, Download, Home } from "lucide-react";

export default function BookingSuccessPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.bookingId as string;

  const { user } = useAuth();
  const { getBookingById } = useBooking();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    fetchBooking();
  }, [bookingId, user]);

  const fetchBooking = async () => {
    const result = await getBookingById(bookingId);
    if (result && result.success) {
      setBooking(result.booking);
    }
    setLoading(false);
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header user={user} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading booking details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header user={user} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Booking not found</p>
            <Button onClick={() => router.push("/")}>Go to Home</Button>
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
          <div className="max-w-3xl mx-auto">
            {/* Success Message */}
            <div className="text-center mb-8">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Booking Confirmed!
              </h1>
              <p className="text-gray-600">
                Your ticket has been sent to {booking.passengerEmail}
              </p>
            </div>

            {/* Booking Details */}
            <Card>
              <CardContent className="p-6">
                <div className="border-b pb-4 mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-600">Booking ID</p>
                      <p className="text-xl font-bold text-gray-900">
                        {booking.bookingId}
                      </p>
                    </div>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      {booking.paymentStatus === "success"
                        ? "Paid"
                        : "Pending"}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Passenger Details */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Passenger Details
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-gray-600">Name:</span>{" "}
                        {booking.passengerName}
                      </p>
                      <p>
                        <span className="text-gray-600">Email:</span>{" "}
                        {booking.passengerEmail}
                      </p>
                      <p>
                        <span className="text-gray-600">Phone:</span>{" "}
                        {booking.passengerPhone}
                      </p>
                    </div>
                  </div>

                  {/* Trip Details */}
                  {booking.trip && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Journey Details
                      </h3>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="text-gray-600">Route:</span>{" "}
                          {booking.trip.route?.from} →{" "}
                          {booking.trip.route?.to}
                        </p>
                        <p>
                          <span className="text-gray-600">Date:</span>{" "}
                          {formatDate(booking.trip.date, "PPP")}
                        </p>
                        <p>
                          <span className="text-gray-600">Time:</span>{" "}
                          {formatTime(booking.trip.startTime)} -{" "}
                          {formatTime(booking.trip.endTime)}
                        </p>
                        <p>
                          <span className="text-gray-600">Bus:</span>{" "}
                          {booking.trip.bus?.busName} (
                          {booking.trip.bus?.busNumber})
                        </p>
                        <p>
                          <span className="text-gray-600">Seats:</span>{" "}
                          {booking.seats.join(", ")}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Payment Details */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Payment Details
                    </h3>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900 font-medium">
                          Total Amount Paid
                        </span>
                        <span className="text-2xl font-bold text-green-600">
                          {formatCurrency(booking.totalFare)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* QR Code */}
                  {booking.qrCode && (
                    <div className="text-center pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-3">
                        Show this QR code at boarding
                      </p>
                      <img
                        src={booking.qrCode}
                        alt="Booking QR Code"
                        className="w-48 h-48 mx-auto border rounded"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/user/bookings">
                <Button variant="outline" className="w-full">
                  View All Bookings
                </Button>
              </Link>
              <Link href="/">
                <Button className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

