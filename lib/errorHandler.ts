import { toast } from "sonner";
import { AxiosError, isAxiosError } from "axios";

/**
 * Error handler utility for API calls
 * Provides consistent error handling with Toast notifications
 */

// HTTP status code messages
const STATUS_MESSAGES: Record<number, string> = {
  400: "Bad Request - The server could not understand the request",
  401: "Unauthorized - Please login to continue",
  403: "Forbidden - You don't have permission to access this resource",
  404: "Not Found - The requested resource was not found",
  405: "Method Not Allowed - The request method is not supported",
  408: "Request Timeout - The server timed out waiting for the request",
  409: "Conflict - The request conflicts with the current state of the server",
  422: "Unprocessable Entity - The request was understood but could not be processed",
  429: "Too Many Requests - Please wait before making another request",
  500: "Internal Server Error - Something went wrong on our end",
  501: "Not Implemented - The server does not support the functionality",
  502: "Bad Gateway - The server received an invalid response",
  503: "Service Unavailable - The server is temporarily unavailable",
  504: "Gateway Timeout - The server took too long to respond",
};

/**
 * Get error message based on status code
 */
export function getStatusMessage(status: number): string {
  return STATUS_MESSAGES[status] || `Error (${status})`;
}

/**
 * Handle axios error and return appropriate message
 */
export function getAxiosErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;

    if (!axiosError.response) {
      // Network error
      return "Network error - Unable to connect to server. Please check your connection.";
    }

    const status = axiosError.response.status;
    const serverMessage = axiosError.response.data?.message;

    // If server provides a message, use it
    if (serverMessage) {
      return serverMessage;
    }

    // Otherwise use status-based message
    return getStatusMessage(status);
  }

  // Generic error
  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
}

/**
 * Show error toast notification
 */
export function showErrorToast(message: string, duration?: number): void {
  toast.error(message, {
    duration: duration || 5000,
    style: {
      backgroundColor: "var(--destructive)",
      color: "var(--destructive-foreground)",
      border: "1px solid var(--destructive)",
    },
  });
}

/**
 * Show success toast notification
 */
export function showSuccessToast(message: string, duration?: number): void {
  toast.success(message, {
    duration: duration || 3000,
  });
}

/**
 * Show warning toast notification
 */
export function showWarningToast(message: string, duration?: number): void {
  toast.warning(message, {
    duration: duration || 4000,
  });
}

/**
 * Show info toast notification
 */
export function showInfoToast(message: string, duration?: number): void {
  toast.info(message, {
    duration: duration || 3000,
  });
}

/**
 * Handle API error and show toast notification
 * Returns the error message for further use if needed
 */
export function handleApiError(error: unknown): string {
  const message = getAxiosErrorMessage(error);
  showErrorToast(message);
  console.error("API Error:", error);
  return message;
}

/**
 * Wrap an async function with try-catch and show toast on error
 * Optionally set loading state in finally block
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  options?: {
    loadingMessage?: string;
    successMessage?: string;
    setLoading?: (loading: boolean) => void;
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
  },
): Promise<T | undefined> {
  const {
    loadingMessage,
    successMessage,
    setLoading,
    showSuccessToast: showSuccess = false,
    showErrorToast: showError = true,
  } = options || {};

  let loadingId: string | number | undefined;

  try {
    // Show loading toast if message provided
    if (loadingMessage) {
      loadingId = toast.loading(loadingMessage);
    }

    // Set loading state if callback provided
    if (setLoading) {
      setLoading(true);
    }

    const result = await fn();

    // Dismiss loading toast
    if (loadingId) {
      toast.dismiss(loadingId);
    }

    // Show success toast if message provided
    if (showSuccess && successMessage) {
      showSuccessToast(successMessage);
    }

    return result;
  } catch (error) {
    // Dismiss loading toast
    if (loadingMessage) {
      toast.dismiss(loadingId);
    }

    // Show error toast
    if (showError) {
      handleApiError(error);
    }

    throw error;
  } finally {
    // Disable loading state
    if (setLoading) {
      setLoading(false);
    }
  }
}

/**
 * Handle fetch response and check for errors
 */
export async function handleFetchResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const status = response.status;
    const message = getStatusMessage(status);

    // Try to parse error response
    try {
      const errorData = await response.json();
      if (errorData.message) {
        showErrorToast(errorData.message);
        throw new Error(errorData.message);
      }
    } catch {
      // Ignore parsing errors
    }

    showErrorToast(message);
    throw new Error(message);
  }

  return response.json();
}

export default {
  getStatusMessage,
  getAxiosErrorMessage,
  showErrorToast,
  showSuccessToast,
  showWarningToast,
  showInfoToast,
  handleApiError,
  withErrorHandling,
  handleFetchResponse,
};
