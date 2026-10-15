import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { getAuthenticatedUser, getSupabaseServerClient } from "@/lib/supabase/server";

const helpInput = z.object({
  type: z.enum(["help", "collaboration"]),
  title: z.string().trim().min(4, "Title must be at least 4 characters").max(140, "Title cannot exceed 140 characters"),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(5000, "Description cannot exceed 5000 characters"),
  category: z.string().trim().min(2, "Category must be at least 2 characters").max(60, "Category cannot exceed 60 characters"),
  skillsNeeded: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
  teamSize: z.number().int().min(1).max(30).optional(),
  techStack: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
});

export async function GET(request: Request) {
  const rateLimitResponse = enforceRateLimit(request, { limit: 60, windowMs: 60 * 1000, prefix: "help-get" });
  if (rateLimitResponse) return rateLimitResponse;

  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Service configuration error." }, { status: 503 });

  const user = await getAuthenticatedUser(supabase);
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { data, error } = await supabase
    .from("help_requests")
    .select("id,anonymous_alias,type,title,description,category,skills_needed,team_size,tech_stack,status,created_at")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Unable to load community posts." }, { status: 400 });

  return NextResponse.json({ requests: data });
}

export async function POST(request: Request) {
  const rateLimitResponse = enforceRateLimit(request, { limit: 10, windowMs: 60 * 1000, prefix: "help-post" });
  if (rateLimitResponse) return rateLimitResponse;

  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Service configuration error." }, { status: 503 });

  const user = await getAuthenticatedUser(supabase);
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = helpInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Check the post fields and try again.", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const input = parsed.data;

  // Sanitize all inputs to protect against stored XSS
  const cleanTitle = sanitizeText(input.title);
  const cleanDescription = sanitizeText(input.description);
  const cleanCategory = sanitizeText(input.category);
  const cleanSkills = input.skillsNeeded.map((skill) => sanitizeText(skill)).filter(Boolean);
  const cleanTechStack = input.techStack.map((tech) => sanitizeText(tech)).filter(Boolean);

  const { data, error } = await supabase
    .from("help_requests")
    .insert({
      user_id: user.id,
      anonymous_alias: `CampusUser_${randomInt(100, 1000)}`,
      type: input.type,
      title: cleanTitle,
      description: cleanDescription,
      category: cleanCategory,
      skills_needed: cleanSkills,
      team_size: input.teamSize,
      tech_stack: cleanTechStack,
      is_anonymous: true,
    })
    .select("id,anonymous_alias,title,type,created_at")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "The post could not be created." }, { status: 400 });
  }

  return NextResponse.json({ request: data }, { status: 201 });
}
