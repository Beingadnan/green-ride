"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
// Toasts removed for clean UI
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { SeatMap } from "@/components/booking/SeatMap";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { PaymentForm, PassengerDetails } from "@/components/booking/PaymentForm";
import { useAuth } from "@/hooks/useAuth";
import { useSearch } from "@/hooks/useSearch";
import { useBooking } from "@/hooks/useBooking";
import { ArrowLeft, ArrowRight, CheckCircle2, User, CreditCard } from "lucide-react";
import Script from "next/script";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.tripId as string;

  const { user, loading: authLoading } = useAuth();
  const { getTripById } = useSearch();
  const { createBooking, createPaymentOrder, verifyPayment } = useBooking();

  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [step, setStep] = useState<"seats" | "details" | "payment">("seats");
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      const next = `/booking/${tripId}`;
      router.push(`/auth/login?next=${encodeURIComponent(next)}`);
      return;
    }
    fetchTrip();
  }, [tripId, user, authLoading]);

  const fetchTrip = async () => {
    const result = await getTripById(tripId);
    if (result && result.success) {
      setTrip(result.trip);
    }
    setLoading(false);
  };

  const handleSeatSelect = (seatNumber: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((s) => s !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const handleProceedToDetails = () => {
    if (selectedSeats.length === 0) {
      return;
    }
    setStep("details");
  };

  const handlePayment = async (passengerDetails: PassengerDetails) => {
    try {
      setProcessingPayment(true);

      // Create booking
      const bookingResult = await createBooking({
        tripId,
        passengerName: passengerDetails.name,
        passengerEmail: passengerDetails.email,
        passengerPhone: passengerDetails.phone,
        seats: selectedSeats,
      });

      if (!bookingResult || !bookingResult.success) {
        return;
      }

      const booking = bookingResult.booking;

      // Create payment order
      const orderResult = await createPaymentOrder(booking.id);

      if (!orderResult || !orderResult.success) {
        return;
      }

      // Initialize Razorpay
      const options = {
        key: orderResult.razorpayKeyId!,
        amount: orderResult.order!.amount,
        currency: orderResult.order!.currency,
        name: "GreenRide Express",
        description: `Booking for ${selectedSeats.length} seat(s)`,
        order_id: orderResult.order!.id,
        handler: async (response: any) => {
          // Verify payment
          const verifyResult = await verifyPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            booking.id
          );

          if (verifyResult && verifyResult.success) {
            router.push(`/booking/success/${booking.id}`);
          }
        },
        prefill: {
          name: passengerDetails.name,
          email: passengerDetails.email,
          contact: passengerDetails.phone,
        },
        theme: {
          color: "#16a34a",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setProcessingPayment(false);
    }
  };

  if (authLoading) {
    return null;
  }

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header user={user} />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto"></div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-slate-900">Loading trip details...</p>
              <p className="text-sm text-slate-600">Preparing your booking experience</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header user={user} />
        <div className="flex-1 flex items-center justify-center py-20">
          <Card className="max-w-md p-8 text-center">
            <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Trip Not Found
            </h3>
            <p className="text-slate-600 mb-6">
              The trip you're looking for doesn't exist or is no longer available.
            </p>
            <Button onClick={() => router.push("/")}>
              Back to Home
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header user={user} />

        <div className="flex-1 py-8">
          <div className="saas-container">
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
                {/* Step 1: Select Seats */}
                <div className="flex items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm transition-all ${
                      step === "seats"
                        ? "bg-primary-600 text-black shadow-md"
                        : selectedSeats.length > 0
                        ? "bg-primary-100 text-primary-700 border-2 border-primary-600"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {selectedSeats.length > 0 && step !== "seats" ? <CheckCircle2 className="h-5 w-5" /> : "1"}
                  </div>
                  <span className={`text-sm font-medium hidden sm:block ${step === "seats" ? "text-slate-900" : "text-slate-600"}`}>
                    Select Seats
                  </span>
                </div>

                <div className="w-12 h-0.5 bg-slate-300"></div>

                {/* Step 2: Passenger Details */}
                <div className="flex items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm transition-all ${
                      step === "details"
                        ? "bg-primary-600 text-white shadow-md"
                        : step === "payment"
                        ? "bg-primary-100 text-primary-700 border-2 border-primary-600"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {step === "payment" ? <CheckCircle2 className="h-5 w-5" /> : <User className="h-5 w-5" />}
                  </div>
                  <span className={`text-sm font-medium hidden sm:block ${step === "details" ? "text-slate-900" : "text-slate-600"}`}>
                    Details
                  </span>
                </div>

                <div className="w-12 h-0.5 bg-slate-300"></div>

                {/* Step 3: Payment */}
                <div className="flex items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm transition-all ${
                      step === "payment"
                        ? "bg-primary-600 text-white shadow-md"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <span className={`text-sm font-medium hidden sm:block ${step === "payment" ? "text-slate-900" : "text-slate-600"}`}>
                    Payment
                  </span>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Section - Main Content */}
              <div className="lg:col-span-2">
                {step === "seats" && (
                  <Card className="animate-slide-up">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="bg-primary-100 p-2 rounded-xl">
                          <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        Select Your Seats
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SeatMap
                        availableSeats={trip.availableSeats || []}
                        bookedSeats={trip.bookedSeats || []}
                        selectedSeats={selectedSeats}
                        onSeatSelect={handleSeatSelect}
                        maxSeats={6}
                      />
                      <div className="mt-6 flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => router.back()}
                          className="flex-1"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back
                        </Button>
                        <Button
                          onClick={handleProceedToDetails}
                          disabled={selectedSeats.length === 0}
                          className="flex-1"
                          size="lg"
                        >
                          Continue to Details
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {(step === "details" || step === "payment") && (
                  <Card className="animate-slide-up">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="bg-blue-100 p-2 rounded-xl">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        Passenger Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PaymentForm
                        onSubmit={handlePayment}
                        processing={processingPayment}
                        onBack={() => setStep("seats")}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Section - Booking Summary (Sticky) */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <BookingSummary
                    trip={trip}
                    selectedSeats={selectedSeats}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
