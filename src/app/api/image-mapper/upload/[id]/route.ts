import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getProspect } from "@/lib/store";

/**
 * POST /api/image-mapper/upload/[id]
 *
 * Accepts a multipart/form-data file upload from the image-mapper UI
 * and persists it to Supabase Storage. Returns a stable public URL
 * the operator can then drag onto any image slot.
 *
 * This replaces the old FileReader+data-URI flow that was stuffing
 * 2-5MB base64 blobs into Supabase `scraped_data.photos` JSONB —
 * violating QC rule 25 ("never store data: URIs in photos") and
 * hitting row-size limits that showed up as generic 409 "conflict"
 * errors in the UI.
 *
 * Storage layout: bucket `mapper-uploads`, path
 *   `prospects/{prospectId}/{timestamp}-{filename}`
 */
const UPLOAD_BUCKET = "mapper-uploads";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

async function ensureUploadBucket() {
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
    console.error("[image-mapper/upload] failed to parse formData:", err);
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

  if (!ALLOWED_MIMES.has(file.type)) {
    return NextResponse.json(
      {
        error: `Unsupported file type: ${file.type}. Allowed: ${Array.from(
          ALLOWED_MIMES
        ).join(", ")}`,
      },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      {
        error: `File too large (${Math.round(
          file.size / 1024 / 1024
        )}MB). Max ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
      },
      { status: 413 }
    );
  }

  try {
    await ensureUploadBucket();
  } catch (err) {
    console.error("[image-mapper/upload] bucket ensure failed:", err);
    return NextResponse.json(
      { error: "Could not prepare upload bucket" },
      { status: 500 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = file.name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 80);
  const storagePath = `prospects/${id}/${Date.now()}-${safeName}`;

  const { error: uploadErr } = await supabase.storage
    .from(UPLOAD_BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadErr) {
    console.error("[image-mapper/upload] storage upload failed:", uploadErr);
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
    originalName: file.name,
    size: file.size,
    mime: file.type,
  });
}
