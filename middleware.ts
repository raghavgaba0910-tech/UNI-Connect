import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const path = request.nextUrl.pathname;

  const isAdminRoute = path.startsWith("/admin");
  const isProfileRoute = path.startsWith("/profile");
  const isProtectedRoute = isAdminRoute || isProfileRoute;

  // Clone headers for response to append security headers
  let response = NextResponse.next({ request });

  if (!url || !anonKey) {
    if (isProtectedRoute) {
      const destination = request.nextUrl.clone();
      destination.pathname = "/login";
      return NextResponse.redirect(destination);
    }
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Verify auth session against Supabase Auth API
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // If on protected route and authentication fails
  if (isProtectedRoute) {
    if (error || !user) {
      const destination = request.nextUrl.clone();
      destination.pathname = "/login";
      // Prevent open-redirect vulnerabilities: only set local relative path
      const safeNext = path.startsWith("/") && !path.startsWith("//") ? path : "/";
      destination.searchParams.set("next", safeNext);
      return NextResponse.redirect(destination);
    }

    // Role-based authorization for admin routes
    if (isAdminRoute) {
      const metadata = user.app_metadata;
      const role =
        metadata && typeof metadata === "object" && "role" in metadata && typeof metadata.role === "string"
          ? metadata.role
          : null;

      if (role !== "admin") {
        // Forbidden: redirect non-admin users safely away to home
        const destination = request.nextUrl.clone();
        destination.pathname = "/";
        destination.search = "";
        return NextResponse.redirect(destination);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/profile/:path*",
  ],
};
