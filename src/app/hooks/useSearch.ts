"use client";

import { useState } from "react";
import axios from "@/lib/axios";

interface SearchParams {
  from: string;
  to: string;
  date: string;
}

export function useSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trips, setTrips] = useState<any[]>([]);

  const searchTrips = async (params: SearchParams) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get("/api/trips/search", { params });

      if (response.data.success) {
        setTrips(response.data.trips);
        return { success: true, trips: response.data.trips };
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to search trips";
      setError(message);
      setTrips([]);
      return { success: false, message, trips: [] };
    } finally {
      setLoading(false);
    }
  };

  const getTripById = async (tripId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/api/trips/${tripId}`);

      if (response.data.success) {
        return { success: true, trip: response.data.trip };
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to fetch trip";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, trips, searchTrips, getTripById };
}


