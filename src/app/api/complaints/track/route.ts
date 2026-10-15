import { NextResponse } from "next/server";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { getAuthenticatedUser, getSupabaseServerClient } from "@/lib/supabase/server";

const trackInput = z.object({
  referenceCode: z.string().trim().regex(/^[a-f0-9]{10}$/i, "Invalid reference code format"),
});

export async function POST(request: Request) {
  // Rate limiting to prevent brute-forcing reference codes (max 10 requests / min)
  const rateLimitResponse = enforceRateLimit(request, { limit: 10, windowMs: 60 * 1000, prefix: "complaints-track" });
  if (rateLimitResponse) return rateLimitResponse;

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Service configuration error." }, { status: 503 });
  }

  const user = await getAuthenticatedUser(supabase);
  if (!user) {
    return NextResponse.json({ error: "Sign in required to view complaint status." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = trackInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid 10-character reference code." }, { status: 400 });
  }

  const cleanReferenceCode = sanitizeText(parsed.data.referenceCode).toUpperCase();

  // Strict Authorization: non-admin students can ONLY access complaints they personally created
  let query = supabase
    .from("complaints")
    .select("reference_code,status,created_at")
    .eq("reference_code", cleanReferenceCode);

  if (user.role !== "admin" && user.role !== "moderator") {
    query = query.eq("user_id", user.id);
  }

  const { data, error } = await query.maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { error: "No matching concern was found for this account." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    complaint: {
      referenceCode: data.reference_code,
      status: data.status,
      createdAt: data.created_at,
    },
  });
}
