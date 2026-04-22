import { NextResponse } from "next/server";
import { getAllProspects } from "@/lib/store";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getSubjectVariant } from "@/lib/email-templates";

/**
 * GET /api/ab-report
 *
 * Returns open rate and click rate for each A/B subject line variant.
 * Variant assignment is deterministic (hash of prospect ID), so we can
 * compute which variant each prospect received without storing it.
 *
 * Variant A: "Name, I made something for BusinessName"  (curiosity-driven)
 * Variant B: "New website ready for BusinessName — take a look"  (direct/value)
 */

export async function GET() {
  try {
    const prospects = await getAllProspects();

    // Only include prospects that were actually contacted (received the pitch email)
    const contacted = prospects.filter((p) =>
      ["contacted", "email_opened", "link_clicked", "responded", "interested",
       "claimed", "paid", "dismissed", "unsubscribed"].includes(p.status)
    );

    if (contacted.length === 0) {
      return NextResponse.json({
        message: "No contacted prospects yet — run outreach first",
        variantA: null,
        variantB: null,
      });
    }

    // Split by variant
    const byVariant: Record<"A" | "B", { prospects: typeof contacted; emails: string[] }> = {
      A: { prospects: [], emails: [] },
      B: { prospects: [], emails: [] },
    };

    for (const p of contacted) {
      const v = getSubjectVariant(p.id);
      byVariant[v].prospects.push(p);
      if (p.email) byVariant[v].emails.push(p.email);
    }

    // Fetch email events from Supabase if available
    let eventsByEmail: Record<string, { opens: number; clicks: number }> = {};

    if (isSupabaseConfigured()) {
      const allEmails = contacted.map((p) => p.email).filter(Boolean) as string[];
      if (allEmails.length > 0) {
        const { data: events } = await supabase
          .from("email_events")
          .select("email, event_type")
          .in("email", allEmails)
          .in("event_type", ["open", "click"]);

        for (const e of events || []) {
          if (!eventsByEmail[e.email]) eventsByEmail[e.email] = { opens: 0, clicks: 0 };
          if (e.event_type === "open") eventsByEmail[e.email].opens++;
          if (e.event_type === "click") eventsByEmail[e.email].clicks++;
        }
      }
    } else {
      // Fallback: infer from prospect status
      for (const p of contacted) {
        if (!p.email) continue;
        eventsByEmail[p.email] = {
          opens: ["email_opened", "link_clicked", "responded", "interested", "claimed", "paid"].includes(p.status) ? 1 : 0,
          clicks: ["link_clicked", "responded", "interested", "claimed", "paid"].includes(p.status) ? 1 : 0,
        };
      }
    }

    function buildVariantStats(variant: "A" | "B") {
      const { prospects: vProspects, emails } = byVariant[variant];
      const total = vProspects.length;
      if (total === 0) return { variant, total: 0, opens: 0, clicks: 0, openRate: "0%", clickRate: "0%" };

      let opens = 0;
      let clicks = 0;
      for (const email of emails) {
        opens += eventsByEmail[email]?.opens || 0;
        clicks += eventsByEmail[email]?.clicks || 0;
      }

      // Unique openers (prospects that opened at least once)
      const uniqueOpeners = emails.filter((e) => (eventsByEmail[e]?.opens || 0) > 0).length;
      const uniqueClickers = emails.filter((e) => (eventsByEmail[e]?.clicks || 0) > 0).length;

      return {
        variant,
        total,
        opens: uniqueOpeners,
        clicks: uniqueClickers,
        openRate: ((uniqueOpeners / total) * 100).toFixed(1) + "%",
        clickRate: ((uniqueClickers / total) * 100).toFixed(1) + "%",
      };
    }

    const variantA = buildVariantStats("A");
    const variantB = buildVariantStats("B");

    const winner =
      variantA.total < 20 && variantB.total < 20
        ? "Need more data (20+ per variant)"
        : parseFloat(variantA.openRate) > parseFloat(variantB.openRate) ? "A" : "B";

    return NextResponse.json({
      variantA,
      variantB,
      winner,
      subjectLines: {
        A: 'Name, I made something for BusinessName  (curiosity)',
        B: 'New website ready for BusinessName — take a look  (direct)',
      },
      dataSource: isSupabaseConfigured() ? "supabase_email_events" : "prospect_status_inferred",
      totalContacted: contacted.length,
    });
  } catch (err) {
    console.error("[ab-report]", err);
    return NextResponse.json({ error: "Failed to generate A/B report" }, { status: 500 });
  }
}
