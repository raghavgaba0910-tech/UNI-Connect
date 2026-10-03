import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const complaintInput = z.object({
  category: z.enum(["safety", "harassment", "facilities", "academic", "other"]),
  title: z.string().trim().min(4).max(140),
  description: z.string().trim().min(10).max(10000),
  location: z.string().trim().max(200).optional(),
  incidentDate: z.string().date().optional(),
});

export async function GET() {
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { data, error } = await supabase.from("complaints").select("id,reference_code,category,title,status,created_at").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Unable to load complaint status." }, { status: 400 });
  return NextResponse.json({ complaints: data });
}

export async function POST(request: Request) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const parsed = complaintInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the complaint fields and try again.", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  const { category, title, description, location, incidentDate } = parsed.data;
  const { data, error } = await supabase.from("complaints").insert({
    user_id: user.id, category, title, description, location, incident_date: incidentDate, is_anonymous: true,
  }).select("reference_code").single();
  if (error) return NextResponse.json({ error: "The complaint could not be submitted." }, { status: 400 });
  return NextResponse.json({ referenceCode: data.reference_code }, { status: 201 });
}
