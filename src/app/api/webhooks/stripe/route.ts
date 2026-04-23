import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent, getStripe } from "@/lib/stripe";
import { getProspect, updateProspect } from "@/lib/store";
import { alertProspectPaid, sendOwnerAlert } from "@/lib/alerts";
import { logCost, COST_RATES } from "@/lib/cost-logger";

/**
 * POST /api/webhooks/stripe
 *
 * Handles Stripe webhook events. This route MUST be publicly accessible
 * (excluded from middleware auth checks).
 *
 * Handles:
 * - checkout.session.completed — marks prospect as 'paid', notifies Ben via email,
 *   and creates a deferred $100/year maintenance subscription (1-year trial)
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

          // Send welcome email to the client
          const clientEmail = session.customer_email || prospect.email;
          if (clientEmail) {
            await sendClientWelcomeEmail(clientEmail, prospect.businessName, prospect.id);
          }

          // ─── Referral credit ───
          // If this prospect was referred by an existing client, increment that
          // client's referralCount. Each successful referral earns them $50 off
          // their next $100/yr renewal.
          if (prospect.referredBy) {
            try {
              const { getAllProspects: _getAllProspects } = await import("@/lib/store");
              const allProspects = await _getAllProspects();
              const referrer = allProspects.find(
                (p) => p.referralCode === prospect.referredBy
              );
              if (referrer) {
                await updateProspect(referrer.id, {
                  referralCount: (referrer.referralCount || 0) + 1,
                });
                await sendOwnerAlert(
                  `🎉 Referral credit! ${referrer.businessName} referred ${businessName} — they now have ${(referrer.referralCount || 0) + 1} referral(s). Credit $50 off their next renewal.`
                ).catch(() => {});
                console.log(`[Stripe Webhook] Referral credited to ${referrer.businessName} (${referrer.id})`);
              }
            } catch (refErr) {
              console.error("[Stripe Webhook] Referral credit failed:", refErr);
            }
          }

          // ─── Create deferred $100/year maintenance subscription ───
          // For both standard ($997) and free ($30) one-time setup payments.
          // We create a subscription with a 1-year trial so the first
          // $100 charge happens exactly 1 year after the initial purchase and covers domain renewal, hosting, ongoing maintenance, and support.
          const isValidSetupPayment =
            session.mode === "payment" &&
            session.customer &&
            session.amount_total &&
            (session.amount_total >= SETUP_AMOUNT_CENTS_STANDARD ||
             session.amount_total >= SETUP_AMOUNT_CENTS_FREE);
          if (isValidSetupPayment) {
            try {
              const mgmtSubscription = await createDeferredManagementSubscription(
                session.customer as string,
                prospectId,
                businessName
              );

              // Store the subscription ID in Supabase for tracking
              await updateProspect(prospectId, {
                mgmtSubscriptionId: mgmtSubscription.id,
                subscriptionStatus: "active", // trialing counts as active
              });

              console.log(
                `[Stripe Webhook] Created deferred maintenance subscription ${mgmtSubscription.id} for ${businessName} (${prospectId}). ` +
                `First charge: ${new Date(mgmtSubscription.trial_end! * 1000).toISOString()}`
              );
            } catch (subErr) {
              // Log but don't fail the webhook — the $997 payment already succeeded.
              // Ben can manually create the subscription from the Stripe dashboard.
              console.error(
                `[Stripe Webhook] Failed to create deferred maintenance subscription for ${prospectId}:`,
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

      case "checkout.session.expired": {
        // Prospect started checkout but didn't complete payment
        const session = event.data.object as {
          id: string;
          metadata?: { prospectId?: string; businessName?: string };
          customer_email?: string;
        };

        const prospectId = session.metadata?.prospectId;
        const businessName = session.metadata?.businessName || "Unknown";

        if (!prospectId) break;

        const prospect = await getProspect(prospectId);
        if (!prospect || prospect.status === "paid") break; // already paid, ignore

        console.log(`[Stripe Webhook] Abandoned checkout for ${businessName} (${prospectId})`);

        // Alert Ben — warm lead who was close to buying
        const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com";
        const claimUrl = `${BASE_URL}/claim/${prospectId}`;
        await sendOwnerAlert(
          `🛒 Abandoned checkout: ${businessName}\n` +
          `They opened the payment page but didn't finish.\n` +
          `📞 ${prospect.phone || "No phone"}\n` +
          `📧 ${session.customer_email || prospect.email || "No email"}\n` +
          `🔗 Their checkout: ${claimUrl}\n` +
          `📋 ${BASE_URL}/dashboard`
        ).catch(() => {});

        // Send recovery email to the prospect
        const clientEmail = session.customer_email || prospect.email;
        if (clientEmail && SENDGRID_API_KEY) {
          await sendAbandonedCheckoutEmail(clientEmail, prospect.businessName, prospectId).catch(() => {});
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
// DEFERRED MAINTENANCE SUBSCRIPTION
// ═══════════════════════════════════════════════════════════════

/**
 * Create a $100/year maintenance subscription with a 1-year free trial.
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
              "Annual domain renewal, hosting, ongoing maintenance, and support for the website",
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
              <p>A <strong>$100/year maintenance subscription</strong> has been created with a 1-year free trial (first charge in 12 months). It covers domain renewal, hosting, ongoing maintenance, and support.</p>
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

/**
 * Send a welcome email to the client after successful payment.
 * Sets expectations: 48-hour timeline, what Ben needs, and next steps.
 */
async function sendClientWelcomeEmail(
  clientEmail: string,
  businessName: string,
  prospectId: string
) {
  if (!SENDGRID_API_KEY) return;

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com";
  const previewUrl = `${BASE_URL}/preview/${prospectId}`;
  const onboardingUrl = `${BASE_URL}/onboarding/${prospectId}`;

  try {
    await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: clientEmail }] }],
        from: { email: FROM_EMAIL, name: "Ben @ BlueJays" },
        subject: `Your ${businessName} site is being built — here's what happens next`,
        content: [
          {
            type: "text/plain",
            value: `Payment confirmed — thank you for trusting BlueJays with ${businessName}!

Here's what happens now:

━━━━━━━━━━━━━━━━━━━━
TIMELINE
━━━━━━━━━━━━━━━━━━━━
• Today: I review your purchase and begin customizing your site
• Within 24 hours: I'll reach out via email with any questions about your branding, photos, or content preferences
• Within 48 hours: Your site goes live at your new domain

━━━━━━━━━━━━━━━━━━━━
FILL OUT YOUR ONBOARDING FORM
━━━━━━━━━━━━━━━━━━━━
Takes 3 minutes. Tells me everything I need to make your site perfect:

${onboardingUrl}

You can share your logo, brand colors, photos, taglines, and any specific requests.
If you skip it, no worries — I'll use what I already have from your existing web presence.

━━━━━━━━━━━━━━━━━━━━
YOUR CURRENT PREVIEW
━━━━━━━━━━━━━━━━━━━━
${previewUrl}

This is the starting point. The final version will be customized with your real photos, your exact branding, and your specific services.

━━━━━━━━━━━━━━━━━━━━
WHAT'S INCLUDED
━━━━━━━━━━━━━━━━━━━━
✓ Custom website design and build
✓ Domain registration (your business name .com)
✓ Hosting setup — no monthly fees, ever
✓ Mobile-optimized and fast
✓ One round of revisions included

After the first year, we bill $100/year for domain renewal, hosting, ongoing maintenance, and support. You'll get an email reminder before any charge.

━━━━━━━━━━━━━━━━━━━━
QUESTIONS?
━━━━━━━━━━━━━━━━━━━━
Just reply to this email. I personally handle every site — you're not dealing with a support ticket or a bot.

Talk soon,
Ben @ BlueJays
bluejaycontactme@gmail.com
`,
          },
        ],
      }),
    });
    console.log(`[Stripe Webhook] Welcome email sent to ${clientEmail}`);

    await logCost({
      service: "sendgrid_email",
      action: "client_welcome_email",
      costUsd: COST_RATES.sendgrid_email,
      metadata: { businessName, clientEmail, type: "client_welcome" },
    });
  } catch (err) {
    console.error("[Stripe Webhook] Failed to send client welcome email:", err);
  }
}

/**
 * Send a recovery email when a prospect starts checkout but doesn't complete.
 * Warm lead — they were close. Keep it short and remove friction.
 */
async function sendAbandonedCheckoutEmail(
  clientEmail: string,
  businessName: string,
  prospectId: string
) {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com";
  const claimUrl = `${BASE_URL}/claim/${prospectId}`;

  await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: clientEmail }] }],
      from: { email: FROM_EMAIL, name: "Ben @ BlueJays" },
      subject: `Did something go wrong with your ${businessName} site?`,
      content: [{
        type: "text/plain",
        value: `Hey — I noticed you started the checkout for your ${businessName} website but it looks like something may have interrupted it.

No worries if you changed your mind — zero pressure. But if it was a technical issue or a question popped up, I'm here.

Your site is still reserved and ready to go live:
${claimUrl}

A few things that sometimes cause hiccups:
- Card declined: try a different card or use the 3-payment plan ($349 × 3)
- Questions about what's included: just reply and I'll answer directly
- Timing: the link above stays active — come back whenever works

If you're still in, just click the link above and you'll be taken right back to where you left off.

— Ben @ BlueJays
bluejaycontactme@gmail.com`,
      }],
    }),
  });

  console.log(`[Stripe Webhook] Abandoned checkout recovery email sent to ${clientEmail}`);

  await logCost({
    service: "sendgrid_email",
    action: "abandoned_checkout_recovery",
    costUsd: COST_RATES.sendgrid_email,
    metadata: { businessName, clientEmail, type: "abandoned_checkout" },
  });
}
