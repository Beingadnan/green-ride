"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "@/lib/axios";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";
import { MapPin, Edit, Trash2, Plus, Search, Filter, ArrowRight } from "lucide-react";

interface Route {
  _id: string;
  name: string;
  from: string;
  to: string;
  distance: number;
  stops: string[];
  estimatedDuration: number;
  baseFare: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export default function AdminRoutesPage() {
  const router = useRouter();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    from: "",
    to: "",
    distance: 0,
    stops: "",
    estimatedDuration: 0,
    baseFare: 0,
    status: "active" as Route["status"],
  });

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/routes");
      if (response.data.success) {
        setRoutes(response.data.routes);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch routes");
      if (error.response?.status === 401 || error.response?.status === 403) {
        router.push("/auth/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/admin/routes", {
        ...formData,
        stops: formData.stops.split(",").map((s) => s.trim()),
      });
      if (response.data.success) {
        toast.success("Route added successfully!");
        setShowAddModal(false);
        resetForm();
        fetchRoutes();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add route");
    }
  };

  const handleEditRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoute) return;
    
    try {
      const response = await axios.put(`/api/admin/routes?id=${selectedRoute._id}`, {
        ...formData,
        stops: formData.stops.split(",").map((s) => s.trim()),
      });
      if (response.data.success) {
        toast.success("Route updated successfully!");
        setShowEditModal(false);
        setSelectedRoute(null);
        resetForm();
        fetchRoutes();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update route");
    }
  };

  const handleDeleteRoute = async () => {
    if (!selectedRoute) return;
    
    try {
      const response = await axios.delete(`/api/admin/routes?id=${selectedRoute._id}`);
      if (response.data.success) {
        toast.success("Route deleted successfully!");
        setShowDeleteModal(false);
        setSelectedRoute(null);
        fetchRoutes();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete route");
    }
  };

  const openEditModal = (route: Route) => {
    setSelectedRoute(route);
    setFormData({
      name: route.name,
      from: route.from,
      to: route.to,
      distance: route.distance,
      stops: route.stops.join(", "),
      estimatedDuration: route.estimatedDuration,
      baseFare: route.baseFare,
      status: route.status,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (route: Route) => {
    setSelectedRoute(route);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      from: "",
      to: "",
      distance: 0,
      stops: "",
      estimatedDuration: 0,
      baseFare: 0,
      status: "active",
    });
  };

  // Filter routes
  const filteredRoutes = routes.filter((route) => {
    const matchesSearch =
      route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.to.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || route.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-red-100 text-red-800 border-red-200";
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
                <MapPin className="h-8 w-8 text-primary-600" />
                Route Management
              </h1>
              <p className="text-slate-600 mt-2">Manage your bus routes and stops</p>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add New Route
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Search by route name, from, or to..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Routes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoutes.map((route) => (
            <Card key={route._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{route.name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="font-semibold">{route.from}</span>
                      <ArrowRight className="h-4 w-4" />
                      <span className="font-semibold">{route.to}</span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getStatusColor(
                      route.status
                    )}`}
                  >
                    {route.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-600">Distance</p>
                    <p className="font-semibold text-slate-900">{route.distance} km</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Duration</p>
                    <p className="font-semibold text-slate-900">{route.estimatedDuration} hrs</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Base Fare</p>
                    <p className="font-semibold text-slate-900">₹{route.baseFare}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Stops</p>
                    <p className="font-semibold text-slate-900">{route.stops.length}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-2">Route Stops</p>
                  <div className="flex flex-wrap gap-1">
                    {route.stops.map((stop, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs font-medium"
                      >
                        {stop}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(route)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteModal(route)}
                    className="flex-1 text-red-600 hover:bg-red-50 hover:border-red-300"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRoutes.length === 0 && (
          <Card className="p-12 text-center">
            <MapPin className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No routes found
            </h3>
            <p className="text-slate-600 mb-4">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by adding your first route"}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Route
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Add Route Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New Route"
      >
        <form onSubmit={handleAddRoute} className="space-y-4">
          <div>
            <Label htmlFor="name">Route Name*</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Jhumri Telaiya to Ranchi"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="from">From*</Label>
              <Input
                id="from"
                value={formData.from}
                onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                placeholder="Jhumri Telaiya"
                required
              />
            </div>
            <div>
              <Label htmlFor="to">To*</Label>
              <Input
                id="to"
                value={formData.to}
                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                placeholder="Ranchi"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="stops">Stops (comma-separated)*</Label>
            <Input
              id="stops"
              value={formData.stops}
              onChange={(e) => setFormData({ ...formData, stops: e.target.value })}
              placeholder="Barhi, Hazaribagh, Ramgarh"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="distance">Distance (km)*</Label>
              <Input
                id="distance"
                type="number"
                value={formData.distance}
                onChange={(e) =>
                  setFormData({ ...formData, distance: parseFloat(e.target.value) })
                }
                min="0"
                step="0.1"
                required
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (hrs)*</Label>
              <Input
                id="duration"
                type="number"
                value={formData.estimatedDuration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimatedDuration: parseFloat(e.target.value),
                  })
                }
                min="0"
                step="0.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="fare">Base Fare (₹)*</Label>
              <Input
                id="fare"
                type="number"
                value={formData.baseFare}
                onChange={(e) =>
                  setFormData({ ...formData, baseFare: parseFloat(e.target.value) })
                }
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status*</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as Route["status"],
                })
              }
              className="w-full h-10 px-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Route
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Route Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedRoute(null);
          resetForm();
        }}
        title="Edit Route"
      >
        <form onSubmit={handleEditRoute} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Route Name*</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-from">From*</Label>
              <Input
                id="edit-from"
                value={formData.from}
                onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-to">To*</Label>
              <Input
                id="edit-to"
                value={formData.to}
                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="edit-stops">Stops (comma-separated)*</Label>
            <Input
              id="edit-stops"
              value={formData.stops}
              onChange={(e) => setFormData({ ...formData, stops: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="edit-distance">Distance (km)*</Label>
              <Input
                id="edit-distance"
                type="number"
                value={formData.distance}
                onChange={(e) =>
                  setFormData({ ...formData, distance: parseFloat(e.target.value) })
                }
                min="0"
                step="0.1"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-duration">Duration (hrs)*</Label>
              <Input
                id="edit-duration"
                type="number"
                value={formData.estimatedDuration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimatedDuration: parseFloat(e.target.value),
                  })
                }
                min="0"
                step="0.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-fare">Base Fare (₹)*</Label>
              <Input
                id="edit-fare"
                type="number"
                value={formData.baseFare}
                onChange={(e) =>
                  setFormData({ ...formData, baseFare: parseFloat(e.target.value) })
                }
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="edit-status">Status*</Label>
            <select
              id="edit-status"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as Route["status"],
                })
              }
              className="w-full h-10 px-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setSelectedRoute(null);
                resetForm();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Update Route
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedRoute(null);
        }}
        title="Delete Route"
      >
        <div className="space-y-4">
          <p className="text-slate-700">
            Are you sure you want to delete the route <strong>{selectedRoute?.name}</strong>?
          </p>
          <p className="text-sm text-red-600">
            This action cannot be undone. All associated trips will also be affected.
          </p>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedRoute(null);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteRoute}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

