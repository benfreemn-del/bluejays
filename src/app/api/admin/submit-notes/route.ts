import { NextRequest, NextResponse } from "next/server";
import { hasPendingAdminUpdates } from "@/lib/admin-notes";
import { getAllProspects, updateProspect } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      prospectIds?: string[];
    };

    const requestedIds = new Set((body.prospectIds || []).filter(Boolean));
    const allProspects = await getAllProspects();
    const candidates = allProspects.filter((prospect) =>
      requestedIds.size > 0 ? requestedIds.has(prospect.id) : true
    );

    const prospectsToSubmit = candidates.filter((prospect) =>
      hasPendingAdminUpdates(prospect)
    );

    if (prospectsToSubmit.length === 0) {
      return NextResponse.json({ success: true, updatedCount: 0, prospectIds: [] });
    }

    const submittedAt = new Date().toISOString();
    const updatedProspects = await Promise.all(
      prospectsToSubmit.map((prospect) =>
        updateProspect(prospect.id, {
          status: "changes_pending",
          adminNotesSubmittedAt: submittedAt,
          lastSubmittedAdminNotes: prospect.adminNotes || "",
          lastSubmittedTheme: prospect.selectedTheme,
        })
      )
    );

    const successfulIds = updatedProspects
      .filter((prospect): prospect is NonNullable<typeof prospect> => Boolean(prospect))
      .map((prospect) => prospect.id);

    return NextResponse.json({
      success: true,
      updatedCount: successfulIds.length,
      prospectIds: successfulIds,
    });
  } catch (error) {
    console.error("[Admin Submit Notes] Failed:", error);
    return NextResponse.json(
      { error: "Unable to submit admin notes right now" },
      { status: 500 }
    );
  }
}
