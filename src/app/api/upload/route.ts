import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getAuthenticatedUser, getSupabaseServerClient } from "@/lib/supabase/server";

const uploadInput = z.object({
  complaintId: z.string().uuid("Invalid complaint ID"),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp", "application/pdf"], {
    errorMap: () => ({ message: "Only JPEG, PNG, WEBP, and PDF files are permitted" }),
  }),
  size: z.number().int().positive().max(10 * 1024 * 1024, "File size must not exceed 10 MB"),
});

const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export async function POST(request: Request) {
  // Rate limiting for file upload URL generation (max 5 requests / min)
  const rateLimitResponse = enforceRateLimit(request, { limit: 5, windowMs: 60 * 1000, prefix: "evidence-upload" });
  if (rateLimitResponse) return rateLimitResponse;

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Service configuration error." }, { status: 503 });
  }

  const user = await getAuthenticatedUser(supabase);
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = uploadInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Use a supported image or PDF up to 10 MB." }, { status: 400 });
  }

  const { complaintId, contentType } = parsed.data;

  // STRICT IDOR DEFENSE: verify complaint exists AND belongs to the authenticated user
  let complaintQuery = supabase
    .from("complaints")
    .select("id,user_id")
    .eq("id", complaintId);

  if (user.role !== "admin" && user.role !== "moderator") {
    complaintQuery = complaintQuery.eq("user_id", user.id);
  }

  const { data: complaint, error: complaintError } = await complaintQuery.single();

  if (complaintError || !complaint) {
    return NextResponse.json(
      { error: "The complaint was not found for this account." },
      { status: 404 }
    );
  }

  // Create isolated upload path scoped to user and complaint
  const safeExtension = extensions[contentType] || "bin";
  const path = `${user.id}/${complaint.id}/${randomUUID()}.${safeExtension}`;

  const { data, error } = await supabase.storage.from("complaint-evidence").createSignedUploadUrl(path);
  if (error || !data) {
    return NextResponse.json({ error: "A secure upload could not be created." }, { status: 400 });
  }

  return NextResponse.json(
    { path: data.path, token: data.token, signedUrl: data.signedUrl, contentType },
    { status: 201 }
  );
}
