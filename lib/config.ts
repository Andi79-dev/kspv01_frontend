/**
 * Configuration file for the Next.js frontend application
 * Contains API and other environment-based configuration
 */

/**
 * API Base URL for all backend API calls
 * Uses environment variable NEXT_PUBLIC_API_URL if available,
 * otherwise falls back to the default local development URL
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4021/api";
