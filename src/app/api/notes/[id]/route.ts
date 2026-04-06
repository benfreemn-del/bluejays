import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

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

function getNotes(prospectId: string): Note[] {
  ensureDir();
  const filePath = path.join(NOTES_DIR, `${prospectId}.json`);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function saveNotes(prospectId: string, notes: Note[]) {
  ensureDir();
  fs.writeFileSync(path.join(NOTES_DIR, `${prospectId}.json`), JSON.stringify(notes, null, 2));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const notes = getNotes(id);
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

  const notes = getNotes(id);
  notes.push(note);
  saveNotes(id, notes);

  return NextResponse.json({ note });
}
