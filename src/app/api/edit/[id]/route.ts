import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const EDITS_DIR = path.join(process.cwd(), "data", "edits");

function ensureDir() {
  if (!fs.existsSync(EDITS_DIR)) {
    fs.mkdirSync(EDITS_DIR, { recursive: true });
  }
}

interface EditRequest {
  id: string;
  prospectId: string;
  description: string;
  status: "pending" | "applied" | "rejected";
  createdAt: string;
}

async function getEdits(prospectId: string): Promise<EditRequest[]> {
  // Read from Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("edit_requests")
        .select("*")
        .eq("prospect_id", prospectId)
        .order("created_at", { ascending: true });
      if (!error && data) {
        return data.map((row: Record<string, unknown>) => ({
          id: row.id as string,
          prospectId: row.prospect_id as string,
          description: row.description as string,
          status: row.status as "pending" | "applied" | "rejected",
          createdAt: row.created_at as string,
        }));
      }
    } catch {
      // Table might not exist yet
    }
  }

  // Skip file reads on Vercel if no Supabase
  if (process.env.VERCEL) return [];

  ensureDir();
  const filePath = path.join(EDITS_DIR, `${prospectId}.json`);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

async function saveEdits(prospectId: string, edits: EditRequest[]) {
  // Save to Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const latest = edits[edits.length - 1];
      if (latest) {
        await supabase.from("edit_requests").upsert({
          id: latest.id,
          prospect_id: latest.prospectId,
          description: latest.description,
          status: latest.status,
          created_at: latest.createdAt,
        });
      }
    } catch {
      // Table might not exist yet
    }
    return;
  }

  // Skip file writes on Vercel (read-only filesystem)
  if (process.env.VERCEL) {
    console.log("[Edits] Skipped file write on Vercel");
    return;
  }

  ensureDir();
  fs.writeFileSync(
    path.join(EDITS_DIR, `${prospectId}.json`),
    JSON.stringify(edits, null, 2)
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const requests = await getEdits(id);
  return NextResponse.json({ requests });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (!body.description) {
    return NextResponse.json(
      { error: "description is required" },
      { status: 400 }
    );
  }

  const editRequest: EditRequest = {
    id: uuidv4(),
    prospectId: id,
    description: body.description,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const edits = await getEdits(id);
  edits.push(editRequest);
  await saveEdits(id, edits);

  console.log(`  ✏️ Edit request for ${id}: "${body.description}"`);

  return NextResponse.json({
    message: "Edit request submitted",
    request: editRequest,
  });
}
