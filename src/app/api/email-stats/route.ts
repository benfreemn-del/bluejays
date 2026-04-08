import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Email tracking statistics — open rates, click rates, bounce rates.
 * GET /api/email-stats
 */
export async function GET() {
  if (!isSupabaseConfigured()) {
    // Return mock data if Supabase isn't configured
    return NextResponse.json({
      totalSent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      openRate: 0,
      clickRate: 0,
      bounceRate: 0,
      recentEvents: [],
    });
  }

  try {
    // Get event counts by type
    const { data: events } = await supabase
      .from("email_events")
      .select("event_type, email, url, timestamp")
      .order("timestamp", { ascending: false })
      .limit(500);

    if (!events || events.length === 0) {
      return NextResponse.json({
        totalSent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        openRate: 0,
        clickRate: 0,
        bounceRate: 0,
        recentEvents: [],
      });
    }

    const delivered = events.filter(e => e.event_type === "delivered").length;
    const opened = new Set(events.filter(e => e.event_type === "open").map(e => e.email)).size;
    const clicked = new Set(events.filter(e => e.event_type === "click").map(e => e.email)).size;
    const bounced = events.filter(e => e.event_type === "bounce").length;

    const openRate = delivered > 0 ? Math.round((opened / delivered) * 100) : 0;
    const clickRate = delivered > 0 ? Math.round((clicked / delivered) * 100) : 0;
    const bounceRate = delivered > 0 ? Math.round((bounced / delivered) * 100) : 0;

    // Recent events (last 20)
    const recentEvents = events.slice(0, 20).map(e => ({
      type: e.event_type,
      email: e.email,
      url: e.url,
      timestamp: e.timestamp,
    }));

    return NextResponse.json({
      totalSent: delivered + bounced,
      delivered,
      opened,
      clicked,
      bounced,
      openRate,
      clickRate,
      bounceRate,
      recentEvents,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
