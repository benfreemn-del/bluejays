import { NextRequest, NextResponse } from "next/server";
import {
  getDeliverabilityHealth,
  verifyDomainAuth,
  canSendEmail,
  getSendingDomain,
  getBounceStats,
  getSoftBouncesForRetry,
} from "@/lib/email-deliverability";

/**
 * GET /api/email-deliverability
 *
 * Returns the full deliverability health dashboard data including:
 * - Domain authentication status (SPF/DKIM/DMARC)
 * - Warm-up schedule and daily limits
 * - Bounce statistics
 * - Open/click/bounce/spam rates
 * - Health score and grade
 * - Active alerts
 */
export async function GET(request: NextRequest) {
  try {
    const domain = request.nextUrl.searchParams.get("domain") || getSendingDomain();

    const [health, sendStatus, bounceStats, softBounces] = await Promise.all([
      getDeliverabilityHealth(domain),
      Promise.resolve(canSendEmail(domain)),
      Promise.resolve(getBounceStats()),
      Promise.resolve(getSoftBouncesForRetry()),
    ]);

    return NextResponse.json({
      domain,
      health,
      sending: sendStatus,
      bounces: {
        ...bounceStats,
        pendingRetryEmails: softBounces.map((b) => ({
          email: b.email,
          prospectId: b.prospectId,
          retryCount: b.retryCount,
          maxRetries: b.maxRetries,
          lastBounce: b.timestamp,
          reason: b.reason,
        })),
      },
    });
  } catch (error) {
    console.error("[Deliverability API] Error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/email-deliverability
 *
 * Actions:
 * - { action: "verify" }         — Re-run domain auth verification
 * - { action: "check-domain", domain: "..." } — Check a specific domain
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, domain: requestDomain } = body;

    const domain = requestDomain || getSendingDomain();

    switch (action) {
      case "verify": {
        const verification = await verifyDomainAuth(domain);
        return NextResponse.json({ verification });
      }
      case "check-domain": {
        if (!requestDomain) {
          return NextResponse.json({ error: "domain is required" }, { status: 400 });
        }
        const verification = await verifyDomainAuth(requestDomain);
        return NextResponse.json({ verification });
      }
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("[Deliverability API] Error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
