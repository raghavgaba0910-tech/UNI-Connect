import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const helpInput = z.object({
  type: z.enum(["help", "collaboration"]),
  title: z.string().trim().min(4).max(140),
  description: z.string().trim().min(10).max(5000),
  category: z.string().trim().min(2).max(60),
  skillsNeeded: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
  teamSize: z.number().int().min(1).max(30).optional(),
  techStack: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
});

export async function GET() {
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { data, error } = await supabase.from("help_requests").select("id,anonymous_alias,type,title,description,category,skills_needed,team_size,tech_stack,status,created_at").eq("status", "open").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Unable to load community posts." }, { status: 400 });
  return NextResponse.json({ requests: data });
}

export async function POST(request: Request) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const parsed = helpInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the post fields and try again.", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  const input = parsed.data;
  const { data, error } = await supabase.from("help_requests").insert({
    user_id: user.id,
    anonymous_alias: `CampusUser_${randomInt(100, 1000)}`,
    type: input.type,
    title: input.title,
    description: input.description,
    category: input.category,
    skills_needed: input.skillsNeeded,
    team_size: input.teamSize,
    tech_stack: input.techStack,
    is_anonymous: true,
  }).select("id,anonymous_alias,title,type,created_at").single();
  if (error) return NextResponse.json({ error: "The post could not be created." }, { status: 400 });
  return NextResponse.json({ request: data }, { status: 201 });
}
