"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { User } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const currentUser = await api.getCurrentUser();
      setUser(currentUser);
    } catch {
      localStorage.removeItem("access_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    await api.login(email, password);
    await checkAuth();
    router.push("/dashboard");
  };

  const register = async (
    email: string,
    password: string,
    fullName?: string
  ) => {
    await api.register({ email, password, full_name: fullName });
    await login(email, password);
  };

  const logout = () => {
    api.logout();
    setUser(null);
    router.push("/login");
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
}
