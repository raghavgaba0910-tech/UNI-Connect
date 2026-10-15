import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  const cookieStore = cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot write cookies; route handlers and middleware can.
        }
      },
    },
  });
}

type ServerSupabaseClient = NonNullable<ReturnType<typeof getSupabaseServerClient>>;

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role: string;
}

export async function getAuthenticatedUser(supabase: ServerSupabaseClient): Promise<AuthenticatedUser | null> {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    const metadata = user.app_metadata;
    const role =
      metadata && typeof metadata === "object" && "role" in metadata && typeof metadata.role === "string"
        ? metadata.role
        : "student";

    return {
      id: user.id,
      email: user.email,
      role,
    };
  } catch {
    return null;
  }
}
