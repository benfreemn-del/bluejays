import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * SendGrid Event Webhook — receives open, click, delivered, bounce events.
 *
 * Setup: In SendGrid → Settings → Mail Settings → Event Webhook
 * URL: https://bluejayportfolio.com/api/email-tracking
 * Events: Delivered, Opened, Clicked, Bounced, Spam Report, Unsubscribe
 *
 * This endpoint is PUBLIC (no auth) since SendGrid calls it.
 */

interface SendGridEvent {
  email: string;
  timestamp: number;
  event: "delivered" | "open" | "click" | "bounce" | "spamreport" | "unsubscribe" | "dropped" | "deferred";
  sg_message_id?: string;
  url?: string;
  useragent?: string;
  ip?: string;
  category?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const events: SendGridEvent[] = await request.json();

    console.log(`📊 Received ${events.length} email tracking events`);

    // Log each event
    for (const event of events) {
      console.log(`  ${event.event.toUpperCase()} — ${event.email} ${event.url ? "→ " + event.url : ""}`);

      // Store in Supabase if configured
      if (isSupabaseConfigured()) {
        try {
          await supabase.from("email_events").insert({
            email: event.email,
            event_type: event.event,
            timestamp: new Date(event.timestamp * 1000).toISOString(),
            message_id: event.sg_message_id || null,
            url: event.url || null,
            user_agent: event.useragent || null,
            ip: event.ip || null,
          });
        } catch {
          // Table might not exist yet — that's ok
        }
      }
    }

    return NextResponse.json({ received: events.length });
  } catch (error) {
    console.error("Email tracking webhook error:", error);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}

// Also handle GET for webhook validation
export async function GET() {
  return NextResponse.json({ status: "Email tracking webhook active" });
}
