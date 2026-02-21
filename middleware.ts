import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define which routes need protection
const protectedRoutes = ["/dashboard", "/profile"];
const publicRoutes = ["/login", "/", "/api/auth"];

export function middleware(request: NextRequest) {
  // Get tokens from cookies
  const token = request.cookies.get("token")?.value;
  const roleId = request.cookies.get("roleId")?.value;

  const { pathname } = request.nextUrl;

  // Check if the user is authenticated
  const isAuthenticated = !!token && !!roleId;

  // Check if trying to access a protected route without auth
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Redirect authenticated users away from login page
  if (isAuthenticated && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users to login when trying to access protected routes
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    // Preserve the original URL to redirect back after login
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     * - api routes (except auth related)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
