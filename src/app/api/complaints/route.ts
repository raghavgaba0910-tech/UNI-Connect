import { NextResponse } from "next/server";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { getAuthenticatedUser, getSupabaseServerClient } from "@/lib/supabase/server";

const complaintInput = z.object({
  category: z.enum(["safety", "harassment", "facilities", "academic", "other"]),
  title: z.string().trim().min(4, "Title must be at least 4 characters").max(140, "Title cannot exceed 140 characters"),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(10000, "Description cannot exceed 10000 characters"),
  location: z.string().trim().max(200, "Location cannot exceed 200 characters").optional(),
  incidentDate: z.string().date("Invalid date format").optional(),
});

export async function GET(request: Request) {
  const rateLimitResponse = enforceRateLimit(request, { limit: 30, windowMs: 60 * 1000, prefix: "complaints-get" });
  if (rateLimitResponse) return rateLimitResponse;

  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Service configuration error." }, { status: 503 });

  const user = await getAuthenticatedUser(supabase);
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  // Defense-in-depth: regular users only retrieve their own complaints; admins can see all
  let query = supabase
    .from("complaints")
    .select("id,reference_code,category,title,status,created_at")
    .order("created_at", { ascending: false });

  if (user.role !== "admin" && user.role !== "moderator") {
    query = query.eq("user_id", user.id);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Unable to load complaint status." }, { status: 400 });

  return NextResponse.json({ complaints: data });
}

export async function POST(request: Request) {
  const rateLimitResponse = enforceRateLimit(request, { limit: 5, windowMs: 60 * 1000, prefix: "complaints-post" });
  if (rateLimitResponse) return rateLimitResponse;

  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Service configuration error." }, { status: 503 });

  const user = await getAuthenticatedUser(supabase);
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = complaintInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Check the complaint fields and try again.", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // XSS protection: sanitize all user input before storing in database
  const cleanCategory = parsed.data.category;
  const cleanTitle = sanitizeText(parsed.data.title);
  const cleanDescription = sanitizeText(parsed.data.description);
  const cleanLocation = parsed.data.location ? sanitizeText(parsed.data.location) : undefined;
  const incidentDate = parsed.data.incidentDate;

  const { data, error } = await supabase
    .from("complaints")
    .insert({
      user_id: user.id,
      category: cleanCategory,
      title: cleanTitle,
      description: cleanDescription,
      location: cleanLocation,
      incident_date: incidentDate,
      is_anonymous: true,
    })
    .select("reference_code")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "The complaint could not be submitted." }, { status: 400 });
  }

  return NextResponse.json({ referenceCode: data.reference_code }, { status: 201 });
}
