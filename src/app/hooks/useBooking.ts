"use client";

import { useState } from "react";
import axios from "@/lib/axios";

interface BookingData {
  tripId: string;
  passengerName: string;
  passengerEmail: string;
  passengerPhone: string;
  seats: string[];
}

export function useBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = async (data: BookingData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post("/api/bookings/create", data);
      if (response.data.success) return { success: true, booking: response.data.booking };
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to create booking";
      setError(message);
      return { success: false, message };
    } finally { setLoading(false); }
  };

  const createPaymentOrder = async (bookingId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post("/api/payments/create-order", { bookingId });
      if (response.data.success) return { success: true, order: response.data.order, razorpayKeyId: response.data.razorpayKeyId };
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to create payment order";
      setError(message);
      return { success: false, message };
    } finally { setLoading(false); }
  };

  const verifyPayment = async (razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string, bookingId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post("/api/payments/verify", { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId });
      if (response.data.success) return { success: true, booking: response.data.booking };
    } catch (err: any) {
      const message = err.response?.data?.message || "Payment verification failed";
      setError(message);
      return { success: false, message };
    } finally { setLoading(false); }
  };

  const getUserBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("/api/bookings/user");
      if (response.data.success) return { success: true, bookings: response.data.bookings };
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to fetch bookings";
      setError(message);
      return { success: false, message, bookings: [] };
    } finally { setLoading(false); }
  };

  const getBookingById = async (bookingId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/bookings/${bookingId}`);
      if (response.data.success) return { success: true, booking: response.data.booking };
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to fetch booking";
      setError(message);
      return { success: false, message };
    } finally { setLoading(false); }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post("/api/bookings/cancel", { bookingId });
      if (response.data.success) return { success: true, refundAmount: response.data.refundAmount };
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to cancel booking";
      setError(message);
      return { success: false, message };
    } finally { setLoading(false); }
  };

  return { loading, error, createBooking, createPaymentOrder, verifyPayment, getUserBookings, getBookingById, cancelBooking };
}


