import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const postInput = z.object({
  type: z.enum(["lost", "found"]),
  itemName: z.string().trim().min(2).max(120),
  category: z.string().trim().min(2).max(60),
  description: z.string().trim().min(5).max(3000),
  location: z.string().trim().min(2).max(200),
  incidentDate: z.string().date().optional(),
});

export async function GET() {
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { data, error } = await supabase.from("lost_found_posts").select("id,type,item_name,category,description,location,incident_date,status,is_claimed,created_at").eq("status", "active").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Unable to load lost and found posts." }, { status: 400 });
  return NextResponse.json({ posts: data });
}

export async function POST(request: Request) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const parsed = postInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the item details and try again.", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  const input = parsed.data;
  const { data, error } = await supabase.from("lost_found_posts").insert({
    user_id: user.id, type: input.type, item_name: input.itemName, category: input.category,
    description: input.description, location: input.location, incident_date: input.incidentDate,
  }).select("id,type,item_name,category,location,incident_date,status,created_at").single();
  if (error) return NextResponse.json({ error: "The item could not be posted." }, { status: 400 });
  return NextResponse.json({ post: data }, { status: 201 });
}
