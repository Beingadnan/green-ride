"use client";

import { useState, useEffect } from "react";
import axios from "@/lib/axios";

interface User {
  id: string;
  phoneE164: string;
  phone?: string;
  name?: string;
  email?: string;
  role: string;
  isVerified: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get("/api/auth/me");
      if (response.data.success && response.data.user) setUser(response.data.user);
      else setUser(null);
    } catch (err: any) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
      setUser(null);
    } catch (err) {}
  };

  return { user, loading, error, logout, refreshUser: fetchUser, isAuthenticated: !!user, isAdmin: user?.role === "admin" };
}


