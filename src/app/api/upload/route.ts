import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser, getSupabaseServerClient } from "@/lib/supabase/server";

const uploadInput = z.object({
  complaintId: z.string().uuid(),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp", "application/pdf"]),
  size: z.number().int().positive().max(10 * 1024 * 1024),
});
const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export async function POST(request: Request) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const user = await getAuthenticatedUser(supabase);
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const parsed = uploadInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Use a supported image or PDF up to 10 MB." }, { status: 400 });

  const { complaintId, contentType } = parsed.data;
  const { data: complaint, error: complaintError } = await supabase
    .from("complaints")
    .select("id")
    .eq("id", complaintId)
    .single();
  if (complaintError || !complaint) return NextResponse.json({ error: "The complaint was not found for this account." }, { status: 404 });

  const path = `${user.id}/${complaint.id}/${randomUUID()}.${extensions[contentType]}`;
  const { data, error } = await supabase.storage.from("complaint-evidence").createSignedUploadUrl(path);
  if (error) return NextResponse.json({ error: "A secure upload could not be created." }, { status: 400 });
  return NextResponse.json({ path: data.path, token: data.token, signedUrl: data.signedUrl, contentType }, { status: 201 });
}
