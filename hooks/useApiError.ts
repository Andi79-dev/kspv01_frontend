import { useState, useCallback } from "react";
import { AxiosError } from "axios";

export interface ApiError {
  message: string;
  statusCode?: number;
  isNetworkError: boolean;
}

// Hook to handle API errors globally
export function useApiError() {
  const [error, setError] = useState<ApiError | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Check online status
  const checkOnlineStatus = useCallback(() => {
    setIsOnline(navigator.onLine);
  }, []);

  // Setup online/offline listeners
  if (typeof window !== "undefined") {
    window.addEventListener("online", checkOnlineStatus);
    window.addEventListener("offline", checkOnlineStatus);
  }

  const handleError = useCallback((err: unknown): ApiError => {
    let apiError: ApiError;

    if (err instanceof AxiosError) {
      // Handle axios errors
      if (!err.response) {
        // Network error (no response from server)
        apiError = {
          message: err.message || "Network error - unable to connect to server",
          statusCode: undefined,
          isNetworkError: true,
        };
      } else {
        // Server responded with error
        apiError = {
          message:
            err.response.data?.message || err.message || "An error occurred",
          statusCode: err.response.status,
          isNetworkError: false,
        };
      }
    } else if (err instanceof Error) {
      // Handle generic errors
      apiError = {
        message: err.message || "An unexpected error occurred",
        statusCode: undefined,
        isNetworkError: false,
      };
    } else {
      // Handle unknown errors
      apiError = {
        message: "An unexpected error occurred",
        statusCode: undefined,
        isNetworkError: false,
      };
    }

    setError(apiError);
    return apiError;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    isOnline,
    handleError,
    clearError,
  };
}

export default useApiError;
