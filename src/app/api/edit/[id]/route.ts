import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

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

function getEdits(prospectId: string): EditRequest[] {
  ensureDir();
  const filePath = path.join(EDITS_DIR, `${prospectId}.json`);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function saveEdits(prospectId: string, edits: EditRequest[]) {
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
  const requests = getEdits(id);
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

  const edits = getEdits(id);
  edits.push(editRequest);
  saveEdits(id, edits);

  console.log(`  ✏️ Edit request for ${id}: "${body.description}"`);

  return NextResponse.json({
    message: "Edit request submitted",
    request: editRequest,
  });
}
