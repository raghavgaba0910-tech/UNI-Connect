import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const path = request.nextUrl.pathname;
  const protectedRoute = path.startsWith("/admin") || path.startsWith("/profile");

  if (!url || !anonKey || !protectedRoute) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const destination = request.nextUrl.clone();
    destination.pathname = "/login";
    destination.searchParams.set("next", path);
    return NextResponse.redirect(destination);
  }
  if (path.startsWith("/admin") && user.app_metadata?.role !== "admin") {
    const destination = request.nextUrl.clone();
    destination.pathname = "/";
    destination.search = "";
    return NextResponse.redirect(destination);
  }
  return response;
}

export const config = { matcher: ["/admin/:path*", "/profile/:path*"] };
