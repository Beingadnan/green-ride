"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "@/lib/axios";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";
import { Ticket, Search, Filter, IndianRupee, Mail, Phone, User, Bus, MapPin, Calendar } from "lucide-react";

interface BookingDoc {
  _id: string;
  bookingId: string;
  userId: { name?: string; email?: string } | null;
  tripId: {
    date: string;
    startTime: string;
    endTime: string;
    busId: { busName: string; busNumber: string };
    routeId: { name: string; from: string; to: string };
  } | null;
  passengerName: string;
  passengerEmail: string;
  passengerPhone: string;
  seats: string[];
  totalFare: number;
  paymentStatus: string;
  bookingStatus: string;
  createdAt: string;
}

export default function AdminBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("all");
  const [query, setQuery] = useState<string>("");
  const [selected, setSelected] = useState<BookingDoc | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [status]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const q = status === "all" ? "" : `?status=${status}`;
      const res = await axios.get(`/api/admin/bookings${q}`);
      if (res.data.success) setBookings(res.data.bookings);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to fetch bookings");
      if (e.response?.status === 401 || e.response?.status === 403) router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  const filtered = bookings.filter((b) =>
    [b.bookingId, b.passengerPhone, b.passengerEmail, b.passengerName]
      .filter(Boolean)
      .some((f) => String(f).toLowerCase().includes(query.toLowerCase()))
  );

  const handleCancel = async () => {
    if (!selected) return;
    try {
      const res = await axios.post("/api/admin/bookings/cancel", { bookingId: selected._id });
      if (res.data.success) {
        toast.success("Booking cancelled");
        setShowCancelModal(false);
        setSelected(null);
        fetchBookings();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to cancel booking");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Ticket className="h-8 w-8 text-primary-600" />
              Booking Management
            </h1>
            <p className="text-slate-600 mt-2">View, filter and cancel bookings</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input placeholder="Search by booking id, phone, email or name" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full h-10 pl-10 pr-4 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={fetchBookings} className="flex-1">Refresh</Button>
              <Button variant="outline" onClick={() => { setQuery(""); setStatus("all"); }}>Clear</Button>
            </div>
          </CardContent>
        </Card>

        {/* List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((b) => (
            <Card key={b._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-primary-600" />
                    {b.bookingId}
                  </CardTitle>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${
                    b.bookingStatus === "confirmed" ? "bg-green-100 text-green-800 border-green-200" :
                    b.bookingStatus === "completed" ? "bg-slate-100 text-slate-800 border-slate-200" :
                    "bg-red-100 text-red-800 border-red-200"
                  }`}>
                    {b.bookingStatus}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2"><User className="h-4 w-4" /> <span className="font-semibold">{b.passengerName}</span></div>
                  <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> {b.passengerPhone}</div>
                  <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> {b.passengerEmail}</div>
                  <div className="flex items-center gap-2"><IndianRupee className="h-4 w-4" /> ₹{b.totalFare}</div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm border-t pt-3">
                  <div className="flex items-center gap-2"><Bus className="h-4 w-4" /> {b.tripId?.busId?.busName} ({b.tripId?.busId?.busNumber})</div>
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {b.tripId?.routeId?.name}</div>
                  <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {b.tripId && new Date(b.tripId.date).toLocaleDateString()} {b.tripId?.startTime}-{b.tripId?.endTime}</div>
                  <div className="text-sm"><span className="text-slate-600">Seats:</span> <span className="font-semibold">{b.seats.join(", ")}</span></div>
                </div>
                <div className="flex gap-2 pt-3 border-t">
                  <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(b.bookingId); toast.success("Booking ID copied"); }}>Copy ID</Button>
                  {b.bookingStatus !== "cancelled" && (
                    <Button variant="danger" size="sm" onClick={() => { setSelected(b); setShowCancelModal(true); }}>Cancel</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal isOpen={showCancelModal} onClose={() => { setShowCancelModal(false); setSelected(null); }} title="Cancel Booking">
        <div className="space-y-4">
          <p className="text-slate-700">Are you sure you want to cancel booking <strong>{selected?.bookingId}</strong>?</p>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setShowCancelModal(false); setSelected(null); }} className="flex-1">No</Button>
            <Button type="button" variant="danger" onClick={handleCancel} className="flex-1">Yes, Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


