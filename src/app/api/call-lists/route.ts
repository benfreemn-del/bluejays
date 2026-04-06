import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getAllProspects } from "@/lib/store";

const DATA_DIR = path.join(process.cwd(), "data");
const PRIORITY_LIST_FILE = path.join(DATA_DIR, "priority-call-list.json");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getPriorityList(): string[] {
  ensureDir();
  if (!fs.existsSync(PRIORITY_LIST_FILE)) return [];
  return JSON.parse(fs.readFileSync(PRIORITY_LIST_FILE, "utf-8"));
}

function savePriorityList(ids: string[]) {
  ensureDir();
  fs.writeFileSync(PRIORITY_LIST_FILE, JSON.stringify(ids, null, 2));
}

export async function GET(request: NextRequest) {
  const listType = request.nextUrl.searchParams.get("type") || "all";
  const format = request.nextUrl.searchParams.get("format") || "json";
  const prospects = await getAllProspects();
  const priorityIds = getPriorityList();

  let filtered;
  if (listType === "priority") {
    filtered = prospects.filter((p) => priorityIds.includes(p.id) && p.phone);
  } else {
    // "all" = every scraped prospect with a phone number
    filtered = prospects.filter((p) => p.phone);
  }

  const list = filtered.map((p) => ({
    id: p.id,
    businessName: p.businessName,
    phone: p.phone!,
    ownerName: p.ownerName || "",
    category: p.category,
    city: p.city,
    state: p.state,
    status: p.status,
    isPriority: priorityIds.includes(p.id),
  }));

  if (format === "csv") {
    const csv = [
      "Business Name,Phone,Owner,Category,City,State,Status,Priority",
      ...list.map((p) =>
        `"${p.businessName}","${p.phone}","${p.ownerName}","${p.category}","${p.city}","${p.state}","${p.status}","${p.isPriority ? "YES" : ""}"`
      ),
    ].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=bluejays-${listType}-call-list.csv`,
      },
    });
  }

  return NextResponse.json({
    list,
    total: list.length,
    type: listType,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { prospectId, action } = body;

  if (!prospectId) {
    return NextResponse.json({ error: "prospectId required" }, { status: 400 });
  }

  const ids = getPriorityList();

  if (action === "add") {
    if (!ids.includes(prospectId)) {
      ids.push(prospectId);
      savePriorityList(ids);
    }
    return NextResponse.json({ message: "Added to priority call list", total: ids.length });
  } else if (action === "remove") {
    const filtered = ids.filter((id) => id !== prospectId);
    savePriorityList(filtered);
    return NextResponse.json({ message: "Removed from priority call list", total: filtered.length });
  }

  return NextResponse.json({ error: "action must be 'add' or 'remove'" }, { status: 400 });
}
