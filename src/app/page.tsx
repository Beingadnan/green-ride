"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// Toasts removed for clean UI
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Card, CardContent } from "@/components/ui/Card";
import { Bus, MapPin, Clock, Shield, Leaf, Zap, DollarSign, Users, ArrowRight, Calendar, ArrowLeftRight, Wifi, Battery, Navigation } from "lucide-react";
import { CITIES } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Set today as default date
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = tomorrow.toISOString().split("T")[0];
  
  const [searchData, setSearchData] = useState({
    from: "",
    to: "",
    date: today, // Default to today
  });
  const [searching, setSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: Check if fields are filled
    if (!searchData.from || !searchData.to || !searchData.date) {
      return;
    }

    // Validation: Check if origin and destination are the same
    if (searchData.from.trim().toLowerCase() === searchData.to.trim().toLowerCase()) {
      return;
    }

    // Proceed with search
    setSearching(true);
    
    setTimeout(() => {
      router.push(
        `/search?from=${searchData.from}&to=${searchData.to}&date=${searchData.date}`
      );
      setSearching(false);
    }, 500);
  };

  const cityOptions = CITIES.map((city) => ({
    value: city,
    label: city,
  }));

  // Quick date selection handlers
  const selectToday = () => {
    setSearchData({ ...searchData, date: today });
  };

  const selectTomorrow = () => {
    setSearchData({ ...searchData, date: tomorrowDate });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header user={user} />

      {/* Hero Section - Modern SaaS */}
      <section className="relative bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 text-white pt-20 pb-28 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}></div>
        </div>
        
        <div className="saas-container relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Badge */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-semibold border border-white/30">
                <Zap className="h-4 w-4" />
                Jharkhand's First 100% Electric Intercity Bus
              </div>
            </div>

            {/* Heading */}
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                Clean, Comfortable,
                <br />
                Affordable Travel
              </h1>
              <p className="text-lg md:text-xl text-emerald-50 max-w-2xl mx-auto leading-relaxed">
                Book your seat today and experience India's new way to travel —
                <span className="font-semibold text-white"> zero emissions, zero noise, full comfort.</span>
              </p>
            </div>

            {/* Glass Search Card */}
            <div className="rounded-3xl border border-white/25 bg-white/10 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
              <div className="p-6 md:p-8">
                <form onSubmit={handleSearch}>
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_1.5fr_auto] gap-4 items-end">
                    {/* From City */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        FROM
                      </label>
                      <div className="relative">
                        <Bus className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-600 z-10 pointer-events-none text-red-600" />
                        <select
                          value={searchData.from}
                          onChange={(e) => setSearchData({ ...searchData, from: e.target.value })}
                          className="w-full h-12 pl-11 pr-4 text-base font-medium text-slate-900 rounded-xl border border-white/40 bg-white/90 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          required
                        >
                          <option value="">From</option>
                          {cityOptions.map((city) => (
                            <option key={city.value} value={city.value}>
                              {city.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Swap Button */}
                    <div className="flex justify-center pb-1">
                      <button
                        type="button"
                        className="w-10 h-10 rounded-full bg-slate-100 hover:bg-primary-100 border-2 border-slate-200 flex items-center justify-center transition-all hover:scale-110"
                        onClick={() => setSearchData({ ...searchData, from: searchData.to, to: searchData.from })}
                      >
                        <ArrowLeftRight className="h-4 w-4 text-slate-600" />
                      </button>
                    </div>

                    {/* To City */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        TO
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-600 z-10 pointer-events-none" />
                        <select
                          value={searchData.to}
                          onChange={(e) => setSearchData({ ...searchData, to: e.target.value })}
                          className="w-full h-12 pl-11 pr-4 text-base font-medium text-slate-900 rounded-xl border border-white/40 bg-white/90 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          required
                        >
                          <option value="">To</option>
                          {cityOptions.map((city) => (
                            <option key={city.value} value={city.value}>
                              {city.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Date with Tomorrow Button */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        DATE OF JOURNEY
                      </label>
                      <div className="flex gap-2 items-center">
                        <div className="relative flex-1">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-600 z-10 pointer-events-none text-red-600" />
                          <input
                            type="date"
                            min={today}
                            value={searchData.date}
                            onChange={(e) => setSearchData({ ...searchData, date: e.target.value })}
                            className="w-full h-12 pl-11 pr-4 text-base font-medium text-slate-900 rounded-xl border border-white/40 bg-white/90 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                            required
                          />
                        </div>
                        <button
                          type="button"
                          onClick={selectTomorrow}
                          className={`h-12 px-4 text-sm font-semibold rounded-lg border-2 transition-all whitespace-nowrap ${
                            searchData.date === tomorrowDate
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'bg-white text-slate-700 border-slate-300 hover:border-primary-400 hover:bg-primary-50'
                          }`}
                        >
                          Tomorrow
                        </button>
                      </div>
                    </div>

                    {/* Search Button */}
                    <div>
                      <Button
                        type="submit"
                        size="lg"
                        disabled={searching}
                        loading={searching}
                        className="w-full h-12"
                      >
                        {searching ? "SEARCHING..." : "SEARCH BUSES"}
                      </Button>
                    </div>
                  </div>

                  {/* Women Booking Toggle */}
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      id="women-booking"
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="women-booking" className="text-slate-600">
                      👩‍🦰 Booking for women passengers
                    </label>
                    <a href="#" className="text-primary-600 hover:text-primary-700 font-medium ml-2">
                      Know more
                    </a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-50 border-b border-slate-200/70">
        <div className="saas-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="text-center p-6 bg-white/80 backdrop-blur-sm border border-slate-200 hover:shadow-xl transition-all">
              <Zap className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-slate-900 mb-1">100%</div>
              <div className="text-sm font-semibold text-emerald-700 mb-1">Electric. 0% Pollution.</div>
              <div className="text-xs text-slate-600">Zero emissions travel</div>
            </Card>

            <Card className="text-center p-6 bg-white/80 backdrop-blur-sm border border-slate-200 hover:shadow-xl transition-all">
              <DollarSign className="h-10 w-10 text-orange-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-slate-900 mb-1">70%</div>
              <div className="text-sm font-semibold text-orange-700 mb-1">Lower Costs</div>
              <div className="text-xs text-slate-600">Save more, travel greener</div>
            </Card>

            <Card className="text-center p-6 bg-white/80 backdrop-blur-sm border border-slate-200 hover:shadow-xl transition-all">
              <Clock className="h-10 w-10 text-blue-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-slate-900 mb-1">Every 3h</div>
              <div className="text-sm font-semibold text-blue-700 mb-1">Frequent Trips</div>
              <div className="text-xs text-slate-600">4 daily services</div>
            </Card>

            <Card className="text-center p-6 bg-white/80 backdrop-blur-sm border border-slate-200 hover:shadow-xl transition-all">
              <Leaf className="h-10 w-10 text-green-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-slate-900 mb-1">0 CO₂</div>
              <div className="text-sm font-semibold text-green-700 mb-1">Zero Emissions</div>
              <div className="text-xs text-slate-600">Infinite impact</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 bg-white">
        <div className="saas-container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Why Choose GreenRide Express?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              India's most advanced electric bus service connecting Jharkhand's major cities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-xl transition-all border-2 border-slate-200 hover:border-primary-300">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-100 p-3 rounded-xl flex-shrink-0">
                  <Leaf className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">Zero Emissions</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    100% electric buses for a cleaner tomorrow. Reduce your carbon footprint with every ride.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all border-2 border-slate-200 hover:border-primary-300">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-xl flex-shrink-0">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">Safe & Secure</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    GPS tracking, verified staff, CCTV cameras, and emergency exits for your complete safety.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all border-2 border-slate-200 hover:border-primary-300">
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-3 rounded-xl flex-shrink-0">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">On-Time Service</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Reliable schedules and real-time tracking. Never miss your important meetings again.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all border-2 border-slate-200 hover:border-primary-300">
              <div className="flex items-start gap-4">
                <div className="bg-orange-100 p-3 rounded-xl flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">Affordable Fares</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Save up to 70% compared to diesel buses. Eco-friendly travel shouldn't cost more!
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all border-2 border-slate-200 hover:border-primary-300">
              <div className="flex items-start gap-4">
                <div className="bg-cyan-100 p-3 rounded-xl flex-shrink-0">
                  <Battery className="h-6 w-6 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">Fast Charging</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Full recharge in under 2 hours with our advanced charging infrastructure.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all border-2 border-slate-200 hover:border-primary-300">
              <div className="flex items-start gap-4">
                <div className="bg-pink-100 p-3 rounded-xl flex-shrink-0">
                  <Users className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">Comfortable Seats</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    AC, USB charging ports, WiFi, spacious legroom, and premium seating for 61 passengers.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all border-2 border-slate-200 hover:border-primary-300">
              <div className="flex items-start gap-4">
                <div className="bg-indigo-100 p-3 rounded-xl flex-shrink-0">
                  <Wifi className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">Premium Amenities</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Free WiFi, entertainment system, reading lights, and mobile charging at every seat.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all border-2 border-slate-200 hover:border-primary-300">
              <div className="flex items-start gap-4">
                <div className="bg-teal-100 p-3 rounded-xl flex-shrink-0">
                  <Navigation className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">Multiple Stops</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Convenient boarding points across the route at Barhi, Hazaribagh, and Ramgarh.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all border-2 border-slate-200 hover:border-primary-300">
              <div className="flex items-start gap-4">
                <div className="bg-amber-100 p-3 rounded-xl flex-shrink-0">
                  <Zap className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">Silent Journey</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Experience whisper-quiet travel. Perfect for work, rest, or enjoying the scenic beauty.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Route Timeline */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="saas-container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Route</h2>
            <p className="text-xl text-slate-600">
              Seamless connectivity across Jharkhand's major cities
            </p>
          </div>

          {/* Route Visualization */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="flex items-center justify-between relative">
              {/* Timeline Line */}
              <div className="absolute top-7 left-0 right-0 h-1 bg-gradient-to-r from-primary-600 via-emerald-500 to-teal-600 rounded-full"></div>

              {CITIES.map((city, index) => (
                <div key={city} className="relative z-10 flex flex-col items-center">
                  <div className="bg-white border-4 border-primary-600 w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg text-primary-700 shadow-lg mb-3 hover:scale-110 transition-transform">
                    {index + 1}
                  </div>
                  <p className="font-semibold text-sm text-slate-900 text-center max-w-[80px]">{city}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Route Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <Card className="text-center p-6 border-2 border-primary-200 bg-white hover:shadow-lg transition-shadow">
              <MapPin className="h-8 w-8 text-primary-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-slate-900 mb-1">150 km</p>
              <p className="text-sm font-medium text-slate-600">Total Distance</p>
            </Card>
            <Card className="text-center p-6 border-2 border-blue-200 bg-white hover:shadow-lg transition-shadow">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-slate-900 mb-1">3 hours</p>
              <p className="text-sm font-medium text-slate-600">Travel Time</p>
            </Card>
            <Card className="text-center p-6 border-2 border-emerald-200 bg-white hover:shadow-lg transition-shadow">
              <Bus className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-slate-900 mb-1">4 Trips</p>
              <p className="text-sm font-medium text-slate-600">Daily Service</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-gradient-to-br from-primary-700 via-emerald-600 to-teal-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.6))]" />
        
        <div className="saas-container relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Ready to Go Electric?
            </h2>
            <p className="text-xl text-emerald-50 leading-relaxed max-w-2xl mx-auto">
              Book your ride now and be part of India's electric mobility revolution.
              Experience the future of travel today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="xl"
                variant="secondary"
                className="font-bold shadow-2xl"
                onClick={() => document.querySelector("form")?.scrollIntoView({ behavior: "smooth" })}
              >
                <Bus className="h-5 w-5 mr-2" />
                Book Your Ticket Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button
                size="xl"
                variant="secondary"
                className="font-bold"
                onClick={() => router.push("/search")}
              >
                View All Routes
              </Button>
            </div>
            <p className="text-sm text-emerald-100">
              💚 Join 10,000+ travelers who have switched to clean electric travel
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
