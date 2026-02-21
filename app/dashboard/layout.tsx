"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, Navbar } from "@/components/layout";
import { MobileSidebar } from "@/components/layout/Sidebar";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, sidebarOpen } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Show nothing while checking auth
  if (!isAuthenticated) {
    return null;
  }

  // Handle mobile menu toggle
  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar */}
      <MobileSidebar open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />

      {/* Main Content */}
      <div
        className={cn(
          "transition-all duration-300",
          sidebarOpen ? "md:ml-64" : "md:ml-16",
        )}
      >
        {/* Navbar */}
        <Navbar onMobileMenuToggle={handleMobileMenuToggle} />

        {/* Page Content */}
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
