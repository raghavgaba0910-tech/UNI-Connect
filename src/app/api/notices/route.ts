import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { data, error } = await supabase.from("notices").select("id,category_id,title,description,department,priority,published_at,expires_at,target_batch").eq("is_published", true).order("published_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Unable to load notices." }, { status: 400 });
  return NextResponse.json({ notices: data });
}
