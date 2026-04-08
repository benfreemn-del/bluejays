import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe";
import { getProspect, updateProspect } from "@/lib/store";
import { alertProspectPaid } from "@/lib/alerts";
import { logCost, COST_RATES } from "@/lib/cost-logger";

/**
 * POST /api/webhooks/stripe
 *
 * Handles Stripe webhook events. This route MUST be publicly accessible
 * (excluded from middleware auth checks).
 *
 * Handles:
 * - checkout.session.completed — marks prospect as 'paid', notifies Ben via email
 * - customer.subscription.updated — tracks subscription status changes
 * - customer.subscription.deleted — marks subscription as cancelled
 */

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "bluejaycontactme@gmail.com";
const OWNER_EMAIL = "bluejaycontactme@gmail.com";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    let event;
    try {
      event = constructWebhookEvent(body, signature);
    } catch (err) {
      console.error("[Stripe Webhook] Signature verification failed:", err);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    console.log(`[Stripe Webhook] Received event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as {
          id: string;
          metadata?: { prospectId?: string; businessName?: string };
          customer?: string;
          customer_email?: string;
          amount_total?: number;
          subscription?: string;
        };

        const prospectId = session.metadata?.prospectId;
        const businessName = session.metadata?.businessName || "Unknown";

        if (!prospectId) {
          console.error("[Stripe Webhook] No prospectId in session metadata");
          break;
        }

        console.log(`[Stripe Webhook] Payment completed for ${businessName} (${prospectId})`);

        // Update prospect status to 'paid'
        const prospect = await getProspect(prospectId);
        if (prospect) {
          await updateProspect(prospectId, {
            status: "paid",
            stripeCustomerId: (session.customer as string) || undefined,
            paidAt: new Date().toISOString(),
            subscriptionStatus: session.subscription ? "active" : "none",
            funnelPaused: true, // Stop all outreach after payment
          });

          // Alert Ben via SMS
          await alertProspectPaid(prospect);

          // Send payment confirmation email to Ben
          await notifyOwnerPayment(businessName, session.customer_email || prospect.email || "N/A", session.amount_total);
        }

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as {
          id: string;
          status: string;
          metadata?: { prospectId?: string };
        };

        const prospectId = subscription.metadata?.prospectId;
        if (prospectId) {
          const statusMap: Record<string, "active" | "past_due" | "cancelled"> = {
            active: "active",
            past_due: "past_due",
            canceled: "cancelled",
            unpaid: "past_due",
          };
          const subscriptionStatus = statusMap[subscription.status] || "active";
          await updateProspect(prospectId, { subscriptionStatus });
          console.log(`[Stripe Webhook] Subscription ${subscription.id} updated to ${subscription.status}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as {
          id: string;
          metadata?: { prospectId?: string };
        };

        const prospectId = subscription.metadata?.prospectId;
        if (prospectId) {
          await updateProspect(prospectId, { subscriptionStatus: "cancelled" });
          console.log(`[Stripe Webhook] Subscription cancelled for ${prospectId}`);
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Stripe Webhook] Error:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Send a payment notification email to Ben.
 */
async function notifyOwnerPayment(
  businessName: string,
  customerEmail: string,
  amountTotal?: number
) {
  if (!SENDGRID_API_KEY) {
    console.log(`[Stripe Webhook] SendGrid not configured — skipping payment email`);
    return;
  }

  const amount = amountTotal ? `$${(amountTotal / 100).toFixed(2)}` : "$997+";

  try {
    await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: OWNER_EMAIL }] }],
        from: { email: FROM_EMAIL, name: "BlueJays Payments" },
        subject: `PAYMENT RECEIVED: ${businessName} just paid ${amount}!`,
        content: [
          {
            type: "text/html",
            value: `
              <h2>Payment Received!</h2>
              <table style="border-collapse:collapse;font-family:sans-serif;">
                <tr><td style="padding:4px 12px;font-weight:bold;">Business:</td><td style="padding:4px 12px;">${businessName}</td></tr>
                <tr><td style="padding:4px 12px;font-weight:bold;">Email:</td><td style="padding:4px 12px;">${customerEmail}</td></tr>
                <tr><td style="padding:4px 12px;font-weight:bold;">Amount:</td><td style="padding:4px 12px;">${amount}</td></tr>
                <tr><td style="padding:4px 12px;font-weight:bold;">Time:</td><td style="padding:4px 12px;">${new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}</td></tr>
              </table>
              <p style="margin-top:16px;">The prospect has been moved to <strong>paid</strong> status and their automated funnel has been paused.</p>
              <p>Check the dashboard to begin onboarding.</p>
            `,
          },
        ],
      }),
    });
    console.log(`[Stripe Webhook] Payment notification email sent to ${OWNER_EMAIL}`);

    await logCost({
      service: "sendgrid_email",
      action: "owner_payment_notification",
      costUsd: COST_RATES.sendgrid_email,
      metadata: { businessName, customerEmail, type: "payment_notification" },
    });
  } catch (err) {
    console.error("[Stripe Webhook] Failed to send payment notification:", err);
  }
}
