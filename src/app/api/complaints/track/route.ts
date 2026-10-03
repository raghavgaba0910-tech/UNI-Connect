import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const trackInput = z.object({ referenceCode: z.string().trim().regex(/^[a-f0-9]{10}$/i) });

export async function POST(request: Request) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const parsed = trackInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid 10-character reference code." }, { status: 400 });
  const { data, error } = await supabase.from("complaints").select("reference_code,status,created_at").eq("reference_code", parsed.data.referenceCode.toUpperCase()).maybeSingle();
  if (error || !data) return NextResponse.json({ error: "No matching concern was found for this account." }, { status: 404 });
  return NextResponse.json({ complaint: { referenceCode: data.reference_code, status: data.status, createdAt: data.created_at } });
}
