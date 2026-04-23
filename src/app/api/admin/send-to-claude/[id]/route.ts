import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import type { GeneratedSiteData } from "@/lib/generator";
import { runClaudeHandoff } from "@/lib/claude-handoff";
import { getProspect, getScrapedData, saveScrapedData, updateProspect } from "@/lib/store";

interface SendToClaudeRequestBody {
  adminNotes?: string;
  selectedTheme?: "light" | "dark";
}

function normalizeTheme(value: unknown): "light" | "dark" | undefined {
  return value === "light" || value === "dark" ? value : undefined;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const prospect = await getProspect(id);

    if (!prospect) {
      return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
    }

    let body: SendToClaudeRequestBody = {};
    try {
      body = (await request.json()) as SendToClaudeRequestBody;
    } catch {
      body = {};
    }

    const adminNotes =
      typeof body.adminNotes === "string" && body.adminNotes.trim()
        ? body.adminNotes.trim()
        : (prospect.adminNotes || "").trim();
    const selectedTheme =
      normalizeTheme(body.selectedTheme) ||
      prospect.selectedTheme ||
      prospect.aiThemeRecommendation ||
      undefined;

    if (!adminNotes) {
      return NextResponse.json(
        { error: "Add revision notes before sending this site to Claude." },
        { status: 400 }
      );
    }

    const existingSiteData = (await getScrapedData(id)) as GeneratedSiteData | null;
    if (!existingSiteData) {
      return NextResponse.json(
        { error: "No generated site data found. Generate the site before sending it to Claude." },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();
    const persistedProspect =
      (await updateProspect(id, {
        adminNotes,
        adminNotesUpdatedAt: timestamp,
        selectedTheme,
        status: "changes_pending",
        adminNotesSubmittedAt: timestamp,
        lastSubmittedAdminNotes: adminNotes,
        lastSubmittedTheme: selectedTheme,
      })) || {
        ...prospect,
        adminNotes,
        adminNotesUpdatedAt: timestamp,
        selectedTheme,
        status: "changes_pending" as const,
        adminNotesSubmittedAt: timestamp,
        lastSubmittedAdminNotes: adminNotes,
        lastSubmittedTheme: selectedTheme,
      };

    const qcGuide = await readFile(path.join(process.cwd(), "VISUAL_QC_REVIEW_GUIDE.md"), "utf8");

    const handoff = await runClaudeHandoff({
      prospect: persistedProspect,
      siteData: {
        ...existingSiteData,
        themeMode: selectedTheme || existingSiteData.themeMode,
      },
      adminNotes,
      selectedTheme,
      qcGuide,
      currentQcNotes: prospect.qualityNotes,
    });

    await saveScrapedData(id, handoff.siteData);

    await updateProspect(id, {
      selectedTheme: handoff.siteData.themeMode || selectedTheme,
      adminNotes,
      adminNotesUpdatedAt: timestamp,
      status: "changes_pending",
      adminNotesSubmittedAt: timestamp,
      lastSubmittedAdminNotes: adminNotes,
      lastSubmittedTheme: handoff.siteData.themeMode || selectedTheme,
    });

    const qcResponse = await fetch(new URL(`/api/qc/review/${id}`, request.url), {
      method: "POST",
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
      cache: "no-store",
    });
    const qcPayload = await qcResponse.json().catch(() => null);

    if (!qcResponse.ok || !qcPayload || qcPayload.error) {
      throw new Error(
        typeof qcPayload?.error === "string"
          ? qcPayload.error
          : `QC rerun failed with status ${qcResponse.status}`
      );
    }

    const refreshedProspect = await getProspect(id);

    return NextResponse.json({
      success: true,
      message: qcPayload.passed
        ? "Claude applied the requested revisions and the site passed QC."
        : "Claude applied the requested revisions, but the refreshed site still needs manual QC review.",
      handoff: {
        model: handoff.model,
        summary: handoff.summary,
      },
      qc: qcPayload,
      prospect: refreshedProspect,
      limitations: {
        dashboardConversationCreated: false,
        reason:
          "Anthropic's public API supports direct model runs, but it does not expose endpoints for creating Claude dashboard conversations or Projects programmatically.",
      },
    });
  } catch (error) {
    console.error("[send-to-claude] Failed to complete Claude handoff", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to send this site to Claude.",
      },
      { status: 500 }
    );
  }
}
