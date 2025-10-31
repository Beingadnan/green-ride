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
import { Bus, Edit, Trash2, Plus, Search, Filter } from "lucide-react";

interface Bus {
  _id: string;
  busNumber: string;
  busName: string;
  type: "AC" | "Non-AC" | "Sleeper" | "Semi-Sleeper";
  totalSeats: number;
  amenities: string[];
  status: "active" | "inactive" | "maintenance";
  registrationNumber: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminBusesPage() {
  const router = useRouter();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    busNumber: "",
    busName: "",
    type: "AC" as Bus["type"],
    totalSeats: 61,
    amenities: "WiFi,Charging Port,Water Bottle,Emergency Exit",
    status: "active" as Bus["status"],
    registrationNumber: "",
  });

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/buses");
      if (response.data.success) {
        setBuses(response.data.buses);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch buses");
      if (error.response?.status === 401 || error.response?.status === 403) {
        router.push("/auth/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddBus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/admin/buses", {
        ...formData,
        amenities: formData.amenities.split(",").map((a) => a.trim()),
      });
      if (response.data.success) {
        toast.success("Bus added successfully!");
        setShowAddModal(false);
        resetForm();
        fetchBuses();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add bus");
    }
  };

  const handleEditBus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBus) return;
    
    try {
      const response = await axios.put(`/api/admin/buses?id=${selectedBus._id}`, {
        ...formData,
        amenities: formData.amenities.split(",").map((a) => a.trim()),
      });
      if (response.data.success) {
        toast.success("Bus updated successfully!");
        setShowEditModal(false);
        setSelectedBus(null);
        resetForm();
        fetchBuses();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update bus");
    }
  };

  const handleDeleteBus = async () => {
    if (!selectedBus) return;
    
    try {
      const response = await axios.delete(`/api/admin/buses?id=${selectedBus._id}`);
      if (response.data.success) {
        toast.success("Bus deleted successfully!");
        setShowDeleteModal(false);
        setSelectedBus(null);
        fetchBuses();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete bus");
    }
  };

  const openEditModal = (bus: Bus) => {
    setSelectedBus(bus);
    setFormData({
      busNumber: bus.busNumber,
      busName: bus.busName,
      type: bus.type,
      totalSeats: bus.totalSeats,
      amenities: bus.amenities.join(", "),
      status: bus.status,
      registrationNumber: bus.registrationNumber,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (bus: Bus) => {
    setSelectedBus(bus);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      busNumber: "",
      busName: "",
      type: "AC",
      totalSeats: 61,
      amenities: "WiFi,Charging Port,Water Bottle,Emergency Exit",
      status: "active",
      registrationNumber: "",
    });
  };

  // Filter buses
  const filteredBuses = buses.filter((bus) => {
    const matchesSearch =
      bus.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.busName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || bus.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 border-red-200";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Bus className="h-8 w-8 text-primary-600" />
                Bus Management
              </h1>
              <p className="text-slate-600 mt-2">Manage your bus fleet</p>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add New Bus
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
                  placeholder="Search by bus number, name, or registration..."
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
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuses.map((bus) => (
            <Card key={bus._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 flex items-center gap-2">
                      <Bus className="h-5 w-5 text-primary-600" />
                      {bus.busName}
                    </CardTitle>
                    <p className="text-sm text-slate-600 font-mono">
                      {bus.busNumber}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getStatusColor(
                      bus.status
                    )}`}
                  >
                    {bus.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-600">Type</p>
                    <p className="font-semibold text-slate-900">{bus.type}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Seats</p>
                    <p className="font-semibold text-slate-900">{bus.totalSeats}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Registration</p>
                  <p className="text-sm font-semibold text-slate-900 font-mono">
                    {bus.registrationNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-1">
                    {bus.amenities.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs font-medium"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(bus)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteModal(bus)}
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

        {filteredBuses.length === 0 && (
          <Card className="p-12 text-center">
            <Bus className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No buses found
            </h3>
            <p className="text-slate-600 mb-4">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by adding your first bus"}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Bus
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Add Bus Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New Bus"
      >
        <form onSubmit={handleAddBus} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="busNumber">Bus Number*</Label>
              <Input
                id="busNumber"
                value={formData.busNumber}
                onChange={(e) =>
                  setFormData({ ...formData, busNumber: e.target.value })
                }
                placeholder="BUS001"
                required
              />
            </div>
            <div>
              <Label htmlFor="busName">Bus Name*</Label>
              <Input
                id="busName"
                value={formData.busName}
                onChange={(e) =>
                  setFormData({ ...formData, busName: e.target.value })
                }
                placeholder="GreenRide Express"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Bus Type*</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as Bus["type"],
                  })
                }
                className="w-full h-10 px-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="AC">AC</option>
                <option value="Non-AC">Non-AC</option>
                <option value="Sleeper">Sleeper</option>
                <option value="Semi-Sleeper">Semi-Sleeper</option>
              </select>
            </div>
            <div>
              <Label htmlFor="totalSeats">Total Seats*</Label>
              <Input
                id="totalSeats"
                type="number"
                value={formData.totalSeats}
                onChange={(e) =>
                  setFormData({ ...formData, totalSeats: parseInt(e.target.value) })
                }
                min="1"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="registrationNumber">Registration Number*</Label>
            <Input
              id="registrationNumber"
              value={formData.registrationNumber}
              onChange={(e) =>
                setFormData({ ...formData, registrationNumber: e.target.value })
              }
              placeholder="JH-01-EV-1234"
              required
            />
          </div>

          <div>
            <Label htmlFor="amenities">Amenities (comma-separated)*</Label>
            <Input
              id="amenities"
              value={formData.amenities}
              onChange={(e) =>
                setFormData({ ...formData, amenities: e.target.value })
              }
              placeholder="WiFi, Charging Port, Water Bottle"
              required
            />
          </div>

          <div>
            <Label htmlFor="status">Status*</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as Bus["status"],
                })
              }
              className="w-full h-10 px-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
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
              Add Bus
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Bus Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedBus(null);
          resetForm();
        }}
        title="Edit Bus"
      >
        <form onSubmit={handleEditBus} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-busNumber">Bus Number*</Label>
              <Input
                id="edit-busNumber"
                value={formData.busNumber}
                onChange={(e) =>
                  setFormData({ ...formData, busNumber: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-busName">Bus Name*</Label>
              <Input
                id="edit-busName"
                value={formData.busName}
                onChange={(e) =>
                  setFormData({ ...formData, busName: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-type">Bus Type*</Label>
              <select
                id="edit-type"
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as Bus["type"],
                  })
                }
                className="w-full h-10 px-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="AC">AC</option>
                <option value="Non-AC">Non-AC</option>
                <option value="Sleeper">Sleeper</option>
                <option value="Semi-Sleeper">Semi-Sleeper</option>
              </select>
            </div>
            <div>
              <Label htmlFor="edit-totalSeats">Total Seats*</Label>
              <Input
                id="edit-totalSeats"
                type="number"
                value={formData.totalSeats}
                onChange={(e) =>
                  setFormData({ ...formData, totalSeats: parseInt(e.target.value) })
                }
                min="1"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="edit-registrationNumber">Registration Number*</Label>
            <Input
              id="edit-registrationNumber"
              value={formData.registrationNumber}
              onChange={(e) =>
                setFormData({ ...formData, registrationNumber: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-amenities">Amenities (comma-separated)*</Label>
            <Input
              id="edit-amenities"
              value={formData.amenities}
              onChange={(e) =>
                setFormData({ ...formData, amenities: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-status">Status*</Label>
            <select
              id="edit-status"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as Bus["status"],
                })
              }
              className="w-full h-10 px-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setSelectedBus(null);
                resetForm();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Update Bus
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedBus(null);
        }}
        title="Delete Bus"
      >
        <div className="space-y-4">
          <p className="text-slate-700">
            Are you sure you want to delete <strong>{selectedBus?.busName}</strong> (
            {selectedBus?.busNumber})?
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
                setSelectedBus(null);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteBus}
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

