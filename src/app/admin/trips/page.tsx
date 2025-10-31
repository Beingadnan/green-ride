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
import { Calendar, Clock, Bus, MapPin, Edit, Trash2, Plus, Search, Filter, IndianRupee } from "lucide-react";

interface BusDoc { _id: string; busName: string; busNumber: string; totalSeats: number; }
interface RouteDoc { _id: string; name: string; from: string; to: string; }
interface TripDoc {
  _id: string;
  routeId: RouteDoc;
  busId: BusDoc;
  date: string;
  startTime: string;
  endTime: string;
  fare: number;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
}

export default function AdminTripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<TripDoc[]>([]);
  const [routes, setRoutes] = useState<RouteDoc[]>([]);
  const [buses, setBuses] = useState<BusDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchDate, setSearchDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TripDoc | null>(null);

  const [formData, setFormData] = useState({
    routeId: "",
    busId: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "07:00",
    endTime: "10:00",
    fare: 200,
  });

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [routesRes, busesRes] = await Promise.all([
          axios.get("/api/admin/routes"),
          axios.get("/api/admin/buses"),
        ]);
        if (routesRes.data.success) setRoutes(routesRes.data.routes);
        if (busesRes.data.success) setBuses(busesRes.data.buses);
        await fetchTrips();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to load data");
        if (error.response?.status === 401 || error.response?.status === 403) {
          router.push("/auth/login");
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await axios.get(`/api/admin/trips?date=${searchDate}`);
      if (response.data.success) setTrips(response.data.trips);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch trips");
    }
  };

  const filteredTrips = trips.filter((t) => filterStatus === "all" || t.status === filterStatus);

  const handleAddTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/admin/trips", {
        ...formData,
      });
      if (response.data.success) {
        toast.success("Trip created successfully!");
        setShowAddModal(false);
        resetForm();
        fetchTrips();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create trip");
    }
  };

  const handleEditTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrip) return;
    try {
      const response = await axios.put(`/api/admin/trips`, {
        id: selectedTrip._id,
        ...formData,
      });
      if (response.data.success) {
        toast.success("Trip updated successfully!");
        setShowEditModal(false);
        setSelectedTrip(null);
        resetForm();
        fetchTrips();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update trip");
    }
  };

  const handleDeleteTrip = async () => {
    if (!selectedTrip) return;
    try {
      const response = await axios.delete(`/api/admin/trips?id=${selectedTrip._id}`);
      if (response.data.success) {
        toast.success("Trip deleted successfully!");
        setShowDeleteModal(false);
        setSelectedTrip(null);
        fetchTrips();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete trip");
    }
  };

  const openEditModal = (trip: TripDoc) => {
    setSelectedTrip(trip);
    setFormData({
      routeId: trip.routeId?._id || "",
      busId: trip.busId?._id || "",
      date: new Date(trip.date).toISOString().split("T")[0],
      startTime: trip.startTime,
      endTime: trip.endTime,
      fare: trip.fare,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      routeId: "",
      busId: "",
      date: new Date().toISOString().split("T")[0],
      startTime: "07:00",
      endTime: "10:00",
      fare: 200,
    });
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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Clock className="h-8 w-8 text-primary-600" />
                Trip Management
              </h1>
              <p className="text-slate-600 mt-2">Create and manage daily trips</p>
            </div>
            <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Trip
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full h-10 pl-10 pr-4 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={fetchTrips} className="flex-1">
                <Search className="h-4 w-4 mr-1" />
                Search
              </Button>
              <Button variant="outline" onClick={() => setSearchDate(new Date().toISOString().split("T")[0])}>
                Today
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Trips List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <Card key={trip._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary-600" />
                      {trip.routeId?.name}
                    </CardTitle>
                    <div className="text-sm text-slate-600 flex items-center gap-2">
                      <Bus className="h-4 w-4" />
                      {trip.busId?.busName} ({trip.busId?.busNumber})
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${
                    trip.status === "scheduled" ? "bg-green-100 text-green-800 border-green-200" :
                    trip.status === "in-progress" ? "bg-blue-100 text-blue-800 border-blue-200" :
                    trip.status === "completed" ? "bg-slate-100 text-slate-800 border-slate-200" :
                    "bg-red-100 text-red-800 border-red-200"
                  }`}>
                    {trip.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-600">Date</p>
                    <p className="font-semibold text-slate-900">{new Date(trip.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Time</p>
                    <p className="font-semibold text-slate-900">{trip.startTime} - {trip.endTime}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-slate-600">Fare</p>
                    <p className="font-semibold text-slate-900 flex items-center gap-1"><IndianRupee className="h-4 w-4" /> {trip.fare}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-3 border-t">
                  <Button variant="outline" size="sm" onClick={() => openEditModal(trip)} className="flex-1">
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => { setSelectedTrip(trip); setShowDeleteModal(true); }} className="flex-1">
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTrips.length === 0 && (
          <Card className="p-12 text-center">
            <Clock className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No trips found</h3>
            <p className="text-slate-600">Try adjusting date or create a new trip</p>
            <div className="mt-4">
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-5 w-5 mr-2" /> Create Trip
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Add Trip Modal */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); resetForm(); }} title="Add New Trip">
        <form onSubmit={handleAddTrip} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Route*</Label>
              <select
                value={formData.routeId}
                onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                className="w-full h-10 px-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Select Route</option>
                {routes.map((r) => (
                  <option key={r._id} value={r._id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Bus*</Label>
              <select
                value={formData.busId}
                onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
                className="w-full h-10 px-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Select Bus</option>
                {buses.map((b) => (
                  <option key={b._id} value={b._id}>{b.busName} ({b.busNumber})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Date*</Label>
              <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
            </div>
            <div>
              <Label>Start Time*</Label>
              <Input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} required />
            </div>
            <div>
              <Label>End Time*</Label>
              <Input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} required />
            </div>
          </div>

          <div>
            <Label>Fare (₹)*</Label>
            <Input type="number" value={formData.fare} onChange={(e) => setFormData({ ...formData, fare: parseFloat(e.target.value) })} min="0" required />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); resetForm(); }} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1">Create Trip</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Trip Modal */}
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedTrip(null); resetForm(); }} title="Edit Trip">
        <form onSubmit={handleEditTrip} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Route*</Label>
              <select value={formData.routeId} onChange={(e) => setFormData({ ...formData, routeId: e.target.value })} className="w-full h-10 px-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" required>
                <option value="">Select Route</option>
                {routes.map((r) => (<option key={r._id} value={r._id}>{r.name}</option>))}
              </select>
            </div>
            <div>
              <Label>Bus*</Label>
              <select value={formData.busId} onChange={(e) => setFormData({ ...formData, busId: e.target.value })} className="w-full h-10 px-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" required>
                <option value="">Select Bus</option>
                {buses.map((b) => (<option key={b._id} value={b._id}>{b.busName} ({b.busNumber})</option>))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Date*</Label>
              <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
            </div>
            <div>
              <Label>Start Time*</Label>
              <Input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} required />
            </div>
            <div>
              <Label>End Time*</Label>
              <Input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} required />
            </div>
          </div>

          <div>
            <Label>Fare (₹)*</Label>
            <Input type="number" value={formData.fare} onChange={(e) => setFormData({ ...formData, fare: parseFloat(e.target.value) })} min="0" required />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setShowEditModal(false); setSelectedTrip(null); resetForm(); }} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1">Update Trip</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setSelectedTrip(null); }} title="Delete Trip">
        <div className="space-y-4">
          <p className="text-slate-700">Are you sure you want to delete this trip?</p>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setShowDeleteModal(false); setSelectedTrip(null); }} className="flex-1">Cancel</Button>
            <Button type="button" variant="danger" onClick={handleDeleteTrip} className="flex-1">Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


