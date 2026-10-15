import { NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getAuthenticatedUser, getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const rateLimitResponse = enforceRateLimit(request, { limit: 60, windowMs: 60 * 1000, prefix: "notices-get" });
  if (rateLimitResponse) return rateLimitResponse;

  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Service configuration error." }, { status: 503 });

  const user = await getAuthenticatedUser(supabase);
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { data, error } = await supabase
    .from("notices")
    .select("id,category_id,title,description,department,priority,published_at,expires_at,target_batch")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Unable to load notices." }, { status: 400 });

  return NextResponse.json({ notices: data });
}
