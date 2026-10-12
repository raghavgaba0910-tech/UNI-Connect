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

export async function getAuthenticatedUser(supabase: ServerSupabaseClient) {
  const { data, error } = await supabase.auth.getClaims();
  if (error) {
    if (error.status === 400 || error.status === 401) return null;
    throw error;
  }

  const claims = data?.claims;
  if (typeof claims?.sub !== "string") return null;

  const metadata = claims.app_metadata;
  const role =
    metadata && typeof metadata === "object" && !Array.isArray(metadata) && "role" in metadata &&
    typeof metadata.role === "string"
      ? metadata.role
      : null;

  return { id: claims.sub, role };
}
