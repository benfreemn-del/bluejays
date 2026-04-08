import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const NOTES_DIR = path.join(process.cwd(), "data", "notes");

function ensureDir() {
  if (!fs.existsSync(NOTES_DIR)) fs.mkdirSync(NOTES_DIR, { recursive: true });
}

interface Note {
  id: string;
  prospectId: string;
  text: string;
  createdAt: string;
}

async function getNotes(prospectId: string): Promise<Note[]> {
  // Read from Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("prospect_id", prospectId)
        .order("created_at", { ascending: true });
      if (!error && data) {
        return data.map((row: Record<string, unknown>) => ({
          id: row.id as string,
          prospectId: row.prospect_id as string,
          text: row.text as string,
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
  const filePath = path.join(NOTES_DIR, `${prospectId}.json`);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

async function saveNotes(prospectId: string, notes: Note[]) {
  // Save to Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const latest = notes[notes.length - 1];
      if (latest) {
        await supabase.from("notes").upsert({
          id: latest.id,
          prospect_id: latest.prospectId,
          text: latest.text,
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
    console.log("[Notes] Skipped file write on Vercel");
    return;
  }

  ensureDir();
  fs.writeFileSync(path.join(NOTES_DIR, `${prospectId}.json`), JSON.stringify(notes, null, 2));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const notes = await getNotes(id);
  return NextResponse.json({ notes });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (!body.text) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  const note: Note = {
    id: uuidv4(),
    prospectId: id,
    text: body.text,
    createdAt: new Date().toISOString(),
  };

  const notes = await getNotes(id);
  notes.push(note);
  await saveNotes(id, notes);

  return NextResponse.json({ note });
}
