"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
// Toasts removed for clean UI
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { useSearch } from "@/hooks/useSearch";
import { Bus, Clock, MapPin, Users, Calendar, ArrowRight, Search, Zap, Wifi, Shield } from "lucide-react";
import { format } from "date-fns";


function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { trips, loading, searchTrips } = useSearch();
  const [sortBy, setSortBy] = useState<string>("recommended");

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const date = searchParams.get("date");

  useEffect(() => {
    // Validate search parameters
    if (!from || !to || !date) {
      router.push("/");
      return;
    }

    // Check if origin and destination are the same
    if (from.trim().toLowerCase() === to.trim().toLowerCase()) {
      router.push("/");
      return;
    }

    // Search for trips
    searchTrips({ from, to, date });
  }, [from, to, date]);

  // No demo fallback; show only real results
  useEffect(() => {
    // Optionally, we could show inline empty state UI here
  }, [trips, loading]);

  const handleBookNow = (tripId: string) => {
    if (!user) {
      const next = `/booking/${tripId}`;
      router.push(`/auth/login?next=${encodeURIComponent(next)}`);
      return;
    }
    router.push(`/booking/${tripId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header user={user} />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto"></div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-slate-900">Searching for buses...</p>
              <p className="text-sm text-slate-600">Finding the best options for you</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header user={user} />

      <div className="flex-1 py-8">
        <div className="saas-container">
          {/* Search Summary */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Search className="h-4 w-4 text-primary-600" />
                    <span>Search Results</span>
                  </div>
                  <div className="flex items-center gap-3 text-2xl font-bold text-slate-900">
                    <span>{from}</span>
                    <ArrowRight className="h-6 w-6 text-slate-400" />
                    <span>{to}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="h-4 w-4 text-primary-600" />
                    <span className="text-sm">
                      {date && format(new Date(date), "EEEE, MMMM d, yyyy")}
                    </span>
                  </div>
                </div>

                <Button variant="secondary" onClick={() => router.push("/")}>Modify Search</Button>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {trips.length} {trips.length === 1 ? "Bus" : "Buses"} Available
                </h2>
                <p className="text-slate-600 mt-1">Choose your preferred timing and book instantly</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-600">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price">Price (Low to High)</option>
                  <option value="departure">Departure Time</option>
                  <option value="seats">Available Seats</option>
                </select>
              </div>
            </div>
          </div>

          {/* Trip Cards (each card represents a trip) */}
          <div className="grid grid-cols-1 gap-6">
            {[...trips].sort((a: any, b: any) => {
              if (sortBy === "price") return a.fare - b.fare;
              if (sortBy === "departure") return (a.startTime || "").localeCompare(b.startTime || "");
              if (sortBy === "seats") return (b.availableSeats || 0) - (a.availableSeats || 0);
              return 0;
            }).map((trip: any) => (
              <Card
                key={trip.id}
                className="overflow-hidden border hover:border-slate-300 hover:shadow-lg transition-all bg-white"
              >
                <div className="flex flex-col">
                  {/* Header Section */}
                  <CardHeader className="bg-slate-50 border-b border-slate-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 flex items-center gap-2">
                          <Bus className="h-5 w-5 text-primary-600" />
                          {trip.bus?.busName || "GreenRide Express"}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Zap className="h-4 w-4 text-primary-600" />
                            <span className="font-medium">{trip.bus?.type || "Electric AC"}</span>
                          </div>
                          <span className="text-slate-300">•</span>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{trip.bus?.busNumber || "Bus Number"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Fare Badge */}
                      <div className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-md">
                        <p className="text-xs font-medium">Starting from</p>
                        <p className="text-2xl font-bold">₹{trip.fare}</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    {/* Route & Time */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
                      <div className="flex items-center gap-2 text-slate-700">
                        <MapPin className="h-4 w-4" />
                        <span className="font-semibold">{trip.route?.from}</span>
                        <ArrowRight className="h-3 w-3" />
                        <span className="font-semibold">{trip.route?.to}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Clock className="h-4 w-4" />
                        <span className="font-semibold">{trip.startTime} - {trip.endTime}</span>
                      </div>
                      <div className="text-slate-700">
                        <span className="font-semibold">Available Seats: </span>
                        {trip.availableSeats}
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="mb-6">
                      <p className="text-sm font-semibold text-slate-700 mb-3">Amenities</p>
                      <div className="flex flex-wrap gap-2">
                        {(trip.bus?.amenities || ["AC", "WiFi", "Charging Port", "GPS Tracking", "CCTV"]).map((amenity: string) => (
                          <span
                            key={amenity}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-medium text-slate-700 border border-slate-200"
                          >
                            {amenity === "WiFi" && <Wifi className="h-3 w-3" />}
                            {amenity === "GPS Tracking" && <Shield className="h-3 w-3" />}
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                    {/* Select Seats */}
                    <div className="mt-2">
                      <Button size="lg" className="w-full md:w-auto" onClick={() => handleBookNow(trip.id)}>
                        Select Seats <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">Travel Information</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Arrive at the boarding point 15 minutes before departure</li>
                  <li>• Carry a valid ID proof for verification</li>
                  <li>• Your booking confirmation will be sent via SMS and email</li>
                  <li>• Free cancellation available up to 2 hours before departure</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto"></div>
          <p className="text-lg font-medium text-slate-900">Loading...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
