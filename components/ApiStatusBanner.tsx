"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { healthApi } from "@/lib/api";

interface ApiStatusBannerProps {
  className?: string;
}

export function ApiStatusBanner({ className }: ApiStatusBannerProps) {
  // State for tracking API connectivity status
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  /**
   * Checks API server connectivity using the dedicated health check endpoint.
   * Updates online status based on the health check result.
   */
  const checkApiStatus = async (): Promise<void> => {
    setIsChecking(true);

    try {
      // Use dedicated health check API to avoid duplicate /menus calls
      const isHealthy: boolean = await healthApi.check();

      if (isHealthy) {
        setIsOnline(true);
        setIsVisible(false);
      } else {
        setIsOnline(false);
        setIsVisible(true);
      }
    } catch (error) {
      // Network error - API is not reachable
      console.error("API Status Check Error:", error);
      setIsOnline(false);
      setIsVisible(true);
    } finally {
      setIsChecking(false);
    }
  };

  // Check status on mount and set up periodic polling
  useEffect(() => {
    // Initial check on component mount
    checkApiStatus();

    // Periodic health check every 30 seconds
    const intervalId: ReturnType<typeof setInterval> = setInterval(() => {
      checkApiStatus();
    }, 30000);

    // Listen for browser online/offline events
    const handleOnline = (): void => {
      checkApiStatus();
    };

    const handleOffline = (): void => {
      setIsOnline(false);
      setIsVisible(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup: clear interval and remove event listeners
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  /** Retry connection on button click */
  const handleRetry = (): void => {
    checkApiStatus();
  };

  /** Dismiss the banner */
  const handleDismiss = (): void => {
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
