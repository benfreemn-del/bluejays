import { NextRequest, NextResponse } from "next/server";
import { getProspect, updateProspect } from "@/lib/store";
import { maybeAutoDiagnose } from "@/lib/auto-diagnose";

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

  // Snapshot the previous stage so we can detect the transition into
  // stage "2" (Meeting scheduled / Mockup done) — that fires the
  // background auto-diagnose helper. Per the chat-7 audit follow-up:
  // when a prospect hits stage 2, queue a Hormozi diagnosis so Madie
  // walks into the meeting with one already on file.
  const before = await getProspect(id);
  const beforeStage = (before?.pipelineStage ?? "").trim();

  const updated = await updateProspect(id, body);
  if (!updated) {
    return NextResponse.json(
      { error: "Prospect not found" },
      { status: 404 }
    );
  }

  const afterStage = (updated.pipelineStage ?? "").trim();
  if (afterStage.startsWith("2") && !beforeStage.startsWith("2")) {
    // Fire and forget — never block the PATCH response on this.
    maybeAutoDiagnose(updated).catch((e) =>
      console.error("[auto-diagnose] background run failed:", (e as Error).message),
    );
  }

  return NextResponse.json(updated);
}
