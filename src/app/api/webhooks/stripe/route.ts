import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent, getStripe } from "@/lib/stripe";
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
 * - checkout.session.completed — marks prospect as 'paid', notifies Ben via email,
 *   and creates a deferred $100/year management subscription (1-year trial)
 * - customer.subscription.updated — tracks subscription status changes
 * - customer.subscription.deleted — marks subscription as cancelled
 */

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "bluejaycontactme@gmail.com";
const OWNER_EMAIL = "bluejaycontactme@gmail.com";

/** Amount (in cents) that identifies a $997 one-time setup payment */
const SETUP_AMOUNT_CENTS_STANDARD = 99700;
/** Amount (in cents) that identifies a $30 free-tier setup payment */
const SETUP_AMOUNT_CENTS_FREE = 3000;

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
          metadata?: { prospectId?: string; businessName?: string; pricingTier?: string };
          customer?: string;
          customer_email?: string;
          amount_total?: number;
          subscription?: string;
          mode?: string;
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

          // ─── Create deferred $100/year management subscription ───
          // For both standard ($997) and free ($30) one-time setup payments.
          // We create a subscription with a 1-year trial so the first
          // $100 charge happens exactly 1 year after the initial purchase.
          const isValidSetupPayment =
            session.mode === "payment" &&
            session.customer &&
            session.amount_total &&
            (session.amount_total >= SETUP_AMOUNT_CENTS_STANDARD ||
             session.amount_total >= SETUP_AMOUNT_CENTS_FREE);
          if (isValidSetupPayment) {
            try {
              const mgmtSubscription = await createDeferredManagementSubscription(
                session.customer,
                prospectId,
                businessName
              );

              // Store the subscription ID in Supabase for tracking
              await updateProspect(prospectId, {
                mgmtSubscriptionId: mgmtSubscription.id,
                subscriptionStatus: "active", // trialing counts as active
              });

              console.log(
                `[Stripe Webhook] Created deferred management subscription ${mgmtSubscription.id} for ${businessName} (${prospectId}). ` +
                `First charge: ${new Date(mgmtSubscription.trial_end! * 1000).toISOString()}`
              );
            } catch (subErr) {
              // Log but don't fail the webhook — the $997 payment already succeeded.
              // Ben can manually create the subscription from the Stripe dashboard.
              console.error(
                `[Stripe Webhook] Failed to create deferred management subscription for ${prospectId}:`,
                subErr
              );
            }
          }
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
            trialing: "active",
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

// ═══════════════════════════════════════════════════════════════
// DEFERRED MANAGEMENT SUBSCRIPTION
// ═══════════════════════════════════════════════════════════════

/**
 * Create a $100/year management subscription with a 1-year free trial.
 *
 * This means the customer pays nothing extra at checkout, and the first
 * $100 charge happens automatically 1 year after their initial purchase.
 *
 * Uses STRIPE_PRICE_MGMT_ID if configured; otherwise creates an inline
 * recurring price via price_data.
 */
async function createDeferredManagementSubscription(
  customerId: string,
  prospectId: string,
  businessName: string
) {
  const stripe = getStripe();

  // Calculate trial_end: exactly 1 year from now (Unix timestamp)
  const oneYearFromNow = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;

  const mgmtPriceId = process.env.STRIPE_PRICE_MGMT_ID;

  // Build subscription params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscriptionParams: any = {
    customer: customerId,
    trial_end: oneYearFromNow,
    metadata: {
      prospectId,
      businessName,
      type: "management_fee",
    },
    // Don't send an invoice email for the $0 trial start
    payment_settings: {
      save_default_payment_method: "on_subscription",
    },
  };

  if (mgmtPriceId) {
    // Use the pre-created price from Stripe Dashboard
    subscriptionParams.items = [{ price: mgmtPriceId }];
  } else {
    // Create inline recurring price — $100/year
    subscriptionParams.items = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Website Management — ${businessName}`,
            description:
              "Annual website hosting, domain management, security updates, and site maintenance",
          },
          unit_amount: 10000, // $100.00
          recurring: {
            interval: "year",
          },
        },
      },
    ];
  }

  const subscription = await stripe.subscriptions.create(subscriptionParams);
  return subscription;
}

// ═══════════════════════════════════════════════════════════════
// NOTIFICATION HELPERS
// ═══════════════════════════════════════════════════════════════

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
              <p>A <strong>$100/year management subscription</strong> has been created with a 1-year free trial (first charge in 12 months).</p>
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
