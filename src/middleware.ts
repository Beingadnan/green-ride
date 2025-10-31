import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Try x-api-key first, fallback to x-auth-token (backward compatibility)
  let token = request.cookies.get("x-api-key")?.value;
  if (!token) {
    token = request.cookies.get("x-auth-token")?.value;
  }

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/auth/login", "/search", "/api/"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Redirect old auth routes to new phone-based login
  if (pathname === "/login" || pathname === "/register") {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // API routes are handled by their own auth logic
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Protected user routes (booking is public; login required only at payment)
  const protectedPrefixes = ["/user", "/checkout", "/timing"];
  const isProtectedRoute = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtectedRoute) {
    if (!token) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protected admin routes
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)",
  ],
};
