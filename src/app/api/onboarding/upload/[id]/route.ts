import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getProspect } from "@/lib/store";

/**
 * POST /api/onboarding/upload/[id]
 *
 * Multipart file upload from the post-purchase 3-step onboarding form
 * (logo on step 1, photos on step 2). Persists to Supabase Storage
 * `client-uploads` bucket and returns a stable public URL the form
 * stores in `onboardingData.logoUrl` / `onboardingData.photos[]`.
 *
 * Mirrors the `image-mapper/upload/[id]` pattern but lives under its
 * own bucket so client-supplied content stays separate from operator-
 * curated mapper assets.
 *
 * Storage path layout:
 *   client-uploads/{prospectId}/{type}/{timestamp}-{filename}
 * where `type` is "logo" or "photos".
 *
 * Request: multipart/form-data with:
 *   - file: the actual file
 *   - type: "logo" | "photos" (required — used to scope the storage path)
 *
 * Mock-mode safe: if Supabase Storage isn't configured, returns 503 so
 * the form can fall back to "we'll email you for the file" UX rather
 * than silently dropping the upload.
 */
const UPLOAD_BUCKET = "client-uploads";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
]);

async function ensureClientUploadsBucket() {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.storage.createBucket(UPLOAD_BUCKET, {
    public: true,
    fileSizeLimit: MAX_FILE_SIZE,
    allowedMimeTypes: Array.from(ALLOWED_MIMES),
  });
  // `already exists` is fine on every call after the first
  if (error && !/already exists|duplicate/i.test(error.message)) {
    throw error;
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase storage is not configured on this server." },
      { status: 503 }
    );
  }

  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (err) {
    console.error("[onboarding/upload] failed to parse formData:", err);
    return NextResponse.json(
      { error: "Invalid multipart/form-data body" },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Missing 'file' field in form data" },
      { status: 400 }
    );
  }

  // Type scopes the path. Default to "misc" if missing — better than rejecting.
  const rawType = (formData.get("type") || "misc").toString().toLowerCase();
  const type =
    rawType === "logo" || rawType === "photos" ? rawType : "misc";

  if (!ALLOWED_MIMES.has(file.type)) {
    return NextResponse.json(
      {
        error: `Unsupported file type: ${file.type}. Allowed: JPEG, PNG, WebP, SVG, GIF.`,
      },
      { status: 400 }
    );
  }

  // Logo has a tighter 5MB cap per spec; photos can use the full 10MB.
  const maxSizeForType = type === "logo" ? 5 * 1024 * 1024 : MAX_FILE_SIZE;
  if (file.size > maxSizeForType) {
    return NextResponse.json(
      {
        error: `File too large (${Math.round(
          file.size / 1024 / 1024
        )}MB). Max ${maxSizeForType / 1024 / 1024}MB for ${type}.`,
      },
      { status: 413 }
    );
  }

  try {
    await ensureClientUploadsBucket();
  } catch (err) {
    console.error("[onboarding/upload] bucket ensure failed:", err);
    return NextResponse.json(
      { error: "Could not prepare upload bucket" },
      { status: 500 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = file.name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 80);
  const storagePath = `${id}/${type}/${Date.now()}-${safeName}`;

  const { error: uploadErr } = await supabase.storage
    .from(UPLOAD_BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadErr) {
    console.error("[onboarding/upload] storage upload failed:", uploadErr);
    return NextResponse.json(
      { error: `Upload failed: ${uploadErr.message}` },
      { status: 500 }
    );
  }

  const { data: publicUrlData } = supabase.storage
    .from(UPLOAD_BUCKET)
    .getPublicUrl(storagePath);
  if (!publicUrlData?.publicUrl) {
    return NextResponse.json(
      { error: "Uploaded but could not resolve public URL" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    url: publicUrlData.publicUrl,
    storagePath,
    type,
    originalName: file.name,
    size: file.size,
    mime: file.type,
  });
}
