import { NextResponse } from "next/server";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { getAuthenticatedUser, getSupabaseServerClient } from "@/lib/supabase/server";

const postInput = z.object({
  type: z.enum(["lost", "found"]),
  itemName: z.string().trim().min(2, "Item name must be at least 2 characters").max(120, "Item name cannot exceed 120 characters"),
  category: z.string().trim().min(2, "Category must be at least 2 characters").max(60, "Category cannot exceed 60 characters"),
  description: z.string().trim().min(5, "Description must be at least 5 characters").max(3000, "Description cannot exceed 3000 characters"),
  location: z.string().trim().min(2, "Location must be at least 2 characters").max(200, "Location cannot exceed 200 characters"),
  incidentDate: z.string().date("Invalid date format").optional(),
});

export async function GET(request: Request) {
  const rateLimitResponse = enforceRateLimit(request, { limit: 60, windowMs: 60 * 1000, prefix: "lost-found-get" });
  if (rateLimitResponse) return rateLimitResponse;

  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Service configuration error." }, { status: 503 });

  const user = await getAuthenticatedUser(supabase);
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { data, error } = await supabase
    .from("lost_found_posts")
    .select("id,type,item_name,category,description,location,incident_date,status,is_claimed,created_at")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Unable to load lost and found posts." }, { status: 400 });

  return NextResponse.json({ posts: data });
}

export async function POST(request: Request) {
  const rateLimitResponse = enforceRateLimit(request, { limit: 10, windowMs: 60 * 1000, prefix: "lost-found-post" });
  if (rateLimitResponse) return rateLimitResponse;

  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Service configuration error." }, { status: 503 });

  const user = await getAuthenticatedUser(supabase);
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = postInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Check the item details and try again.", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const input = parsed.data;

  // Sanitize fields against XSS
  const cleanItemName = sanitizeText(input.itemName);
  const cleanCategory = sanitizeText(input.category);
  const cleanDescription = sanitizeText(input.description);
  const cleanLocation = sanitizeText(input.location);

  const { data, error } = await supabase
    .from("lost_found_posts")
    .insert({
      user_id: user.id,
      type: input.type,
      item_name: cleanItemName,
      category: cleanCategory,
      description: cleanDescription,
      location: cleanLocation,
      incident_date: input.incidentDate,
    })
    .select("id,type,item_name,category,location,incident_date,status,created_at")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "The item could not be posted." }, { status: 400 });
  }

  return NextResponse.json({ post: data }, { status: 201 });
}
