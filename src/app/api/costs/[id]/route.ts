import { NextResponse } from "next/server";
import { getProspect } from "@/lib/store";
import { getLeadCost } from "@/lib/cost-tracker";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const prospect = await getProspect(id);
  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  const cost = await getLeadCost(prospect.id, prospect.businessName);
  return NextResponse.json(cost);
}
