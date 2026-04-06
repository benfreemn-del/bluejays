import { NextRequest, NextResponse } from "next/server";
import { getProspect, updateProspect } from "@/lib/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json(
      { error: "Prospect not found" },
      { status: 404 }
    );
  }
  return NextResponse.json(prospect);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const updated = await updateProspect(id, body);
  if (!updated) {
    return NextResponse.json(
      { error: "Prospect not found" },
      { status: 404 }
    );
  }
  return NextResponse.json(updated);
}
