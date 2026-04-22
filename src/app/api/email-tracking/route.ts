import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { processBounce, recordEmailSent } from "@/lib/email-deliverability";
import { getProspectByEmail } from "@/lib/store";

/**
 * SendGrid Event Webhook — receives open, click, delivered, bounce events.
 *
 * Setup: In SendGrid → Settings → Mail Settings → Event Webhook
 * URL: https://bluejayportfolio.com/api/email-tracking
 * Events: Delivered, Opened, Clicked, Bounced, Spam Report, Unsubscribe
 *
 * Now integrates with the deliverability engine for:
 * - Automatic bounce handling (hard bounce removal, soft bounce retry)
 * - Warm-up volume tracking
 * - Open rate monitoring
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
  type?: string; // For bounces: "bounce" or "blocked"
  reason?: string; // Bounce reason
  status?: string; // SMTP status code like "550"
}

/**
 * Verify SendGrid's ECDSA webhook signature when the public key is
 * configured. Returns true if signature is valid OR if no public key
 * is set (fail-open during initial wiring, fail-closed once secured).
 *
 * To enable: in SendGrid → Settings → Mail Settings → Event Webhook,
 * toggle "Signed Event Webhook Requests" and copy the Verification Key
 * into the Vercel env var SENDGRID_WEBHOOK_PUBLIC_KEY.
 */
async function verifySendGridSignature(
  rawBody: string,
  signature: string | null,
  timestamp: string | null
): Promise<boolean> {
  const publicKey = process.env.SENDGRID_WEBHOOK_PUBLIC_KEY;
  if (!publicKey) return true; // fail-open until key is configured
  if (!signature || !timestamp) return false;

  try {
    // SendGrid signs (timestamp + rawBody) with ECDSA-SHA256 and publishes
    // the public key in PEM format. Node's webcrypto verifies it natively.
    const payload = new TextEncoder().encode(timestamp + rawBody);
    const signatureBytes = Uint8Array.from(
      Buffer.from(signature, "base64")
    );
    // Strip PEM armor and decode base64 → DER → SubjectPublicKeyInfo
    const pem = publicKey
      .replace(/-----BEGIN PUBLIC KEY-----/, "")
      .replace(/-----END PUBLIC KEY-----/, "")
      .replace(/\s/g, "");
    const keyDer = Uint8Array.from(Buffer.from(pem, "base64"));
    const key = await crypto.subtle.importKey(
      "spki",
      keyDer,
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["verify"]
    );
    return await crypto.subtle.verify(
      { name: "ECDSA", hash: "SHA-256" },
      key,
      signatureBytes,
      payload
    );
  } catch (err) {
    console.error("[Email Tracking] Signature verification error:", err);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Read raw body first — signature verification requires the exact bytes.
    const rawBody = await request.text();
    const signature = request.headers.get("X-Twilio-Email-Event-Webhook-Signature");
    const timestamp = request.headers.get("X-Twilio-Email-Event-Webhook-Timestamp");

    const sigValid = await verifySendGridSignature(rawBody, signature, timestamp);
    if (!sigValid) {
      console.warn("[Email Tracking] Rejected event — signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const events: SendGridEvent[] = JSON.parse(rawBody);

    console.log(`[Email Tracking] Received ${events.length} events${signature ? " (signed)" : " (unsigned)"}`);

    for (const event of events) {
      console.log(`  ${event.event.toUpperCase()} — ${event.email} ${event.url ? "-> " + event.url : ""}`);

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
          // Table might not exist yet
        }
      }

      // Handle bounce events through the deliverability engine
      if (event.event === "bounce" || event.event === "dropped") {
        try {
          const prospect = await getProspectByEmail(event.email);
          if (prospect) {
            // Determine bounce type from SMTP status code
            // 5xx = hard bounce (permanent), 4xx = soft bounce (temporary)
            const isHardBounce =
              event.event === "dropped" ||
              (event.status && event.status.startsWith("5")) ||
              (event.reason && (
                event.reason.includes("does not exist") ||
                event.reason.includes("invalid") ||
                event.reason.includes("unknown user") ||
                event.reason.includes("no such user")
              ));

            await processBounce(
              event.email,
              prospect.id,
              isHardBounce ? "hard" : "soft",
              event.reason || event.event
            );
            console.log(`  [Deliverability] Processed ${isHardBounce ? "hard" : "soft"} bounce for ${event.email}`);
          }
        } catch (err) {
          console.error(`  [Deliverability] Bounce processing failed:`, err);
        }
      }

      // Update prospect status on opens and clicks
      if (event.event === "open" || event.event === "click") {
        try {
          const prospect = await getProspectByEmail(event.email);
          if (prospect) {
            const { updateProspect } = await import("@/lib/store");
            // Only upgrade status, never downgrade
            const statusPriority: Record<string, number> = {
              scouted: 1, scraped: 2, generated: 3, "pending-review": 4,
              "ready_to_review": 5, approved: 6, contacted: 7,
              email_opened: 8, link_clicked: 9, engaged: 10,
              interested: 11, responded: 12, claimed: 13, paid: 14,
            };
            const currentPriority = statusPriority[prospect.status] || 0;
            const newStatus = event.event === "click" ? "link_clicked" : "email_opened";
            const newPriority = statusPriority[newStatus] || 0;

            if (newPriority > currentPriority) {
              await updateProspect(prospect.id, { status: newStatus as never });
              console.log(`  ✅ ${prospect.businessName}: ${prospect.status} → ${newStatus}`);
            }
          }
        } catch { /* don't break webhook */ }
      }

      // Track delivered emails for warm-up monitoring
      if (event.event === "delivered") {
        try {
          const domain = event.email.split("@")[1];
          if (domain) {
            recordEmailSent(domain);
          }
        } catch {
          // Non-critical
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
  return NextResponse.json({ status: "Email tracking webhook active — with deliverability engine" });
}
