"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export default function AuthInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, roleId } = useAuthStore();

  useEffect(() => {
    // Check if we have auth data in localStorage via zustand persist
    // and sync it to cookies for middleware to access
    if (typeof window !== "undefined" && token && roleId) {
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);

      // Set cookies if they don't exist
      document.cookie = `token=${token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
      document.cookie = `roleId=${roleId}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
    }
  }, [token, roleId]);

  return <>{children}</>;
}
