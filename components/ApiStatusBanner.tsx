"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApiStatusBannerProps {
  className?: string;
}

export function ApiStatusBanner({ className }: ApiStatusBannerProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Check API status
  const checkApiStatus = async () => {
    setIsChecking(true);
    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4021/api";

      const response = await fetch(`${API_BASE_URL}/menus`, {
        method: "HEAD",
        cache: "no-cache",
      });

      // If we get here, API is reachable (even if it returns an error, the server is up)
      setIsOnline(true);
      setIsVisible(false);
    } catch (error) {
      // Network error - API is not reachable
      setIsOnline(false);
      setIsVisible(true);
    } finally {
      setIsChecking(false);
    }
  };

  // Check status on mount and periodically
  useEffect(() => {
    // Initial check
    checkApiStatus();

    // Periodic check every 30 seconds
    const interval = setInterval(() => {
      checkApiStatus();
    }, 30000);

    // Listen for online/offline events
    const handleOnline = () => {
      checkApiStatus();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsVisible(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Handle retry
  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    checkApiStatus();
  };

  // Handle dismiss
  const handleDismiss = () => {
    setIsVisible(false);
  };

  // Don't render if online or not visible
  if (isOnline || !isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground px-4 py-2 flex items-center justify-between",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm font-medium">
          Unable to connect to the server. Some features may not work properly.
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRetry}
          disabled={isChecking}
          className="h-7 text-destructive-foreground hover:bg-destructive/80"
        >
          <RefreshCw
            className={cn("h-3 w-3 mr-1", isChecking && "animate-spin")}
          />
          {isChecking ? "Checking..." : "Retry"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="h-7 text-destructive-foreground hover:bg-destructive/80"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export default ApiStatusBanner;
