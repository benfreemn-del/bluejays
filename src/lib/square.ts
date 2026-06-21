/**
 * square — minimal Square (squareup.com) REST client for online checkout.
 *
 * No Square SDK dependency — we call the REST API directly with native fetch.
 * Money is integer cents everywhere (Square's `amount` is also integer cents).
 *
 * Used by KR Ranches online checkout (a meat ranch that already takes Square
 * payments in person). The website builds a server-priced order, mints a
 * Square hosted payment link, and a webhook flips the order to paid.
 *
 * Env vars:
 *   SQUARE_ACCESS_TOKEN          — Square access token (Bearer)
 *   SQUARE_LOCATION_ID           — Square location the order is attributed to
 *   SQUARE_ENV                   — "sandbox" | "production" (default production)
 *   SQUARE_WEBHOOK_SIGNATURE_KEY — HMAC key for webhook signature verification
 */

import crypto from "crypto";

const SQUARE_VERSION = "2025-01-23";

/** True when the minimum env vars to mint a payment link are present. */
export function isSquareConfigured(): boolean {
  return !!(process.env.SQUARE_ACCESS_TOKEN && process.env.SQUARE_LOCATION_ID);
}

/** Base URL for the Square Connect API, switched by SQUARE_ENV. */
export function squareBaseUrl(): string {
  return process.env.SQUARE_ENV === "sandbox"
    ? "https://connect.squareupsandbox.com"
    : "https://connect.squareup.com";
}

export type SquareLineItem = {
  name: string;
  quantity: number;
  priceCents: number;
};

export type CreatePaymentLinkOpts = {
  lineItems: SquareLineItem[];
  referenceId: string;
  redirectUrl: string;
  note?: string;
  buyerEmail?: string;
};

export type CreatePaymentLinkResult = {
  url: string;
  paymentLinkId: string;
  orderId: string;
};

/**
 * Create a Square hosted payment link for an order.
 * POST /v2/online-checkout/payment-links
 */
export async function createPaymentLink(
  opts: CreatePaymentLinkOpts,
): Promise<CreatePaymentLinkResult> {
  const base = squareBaseUrl();
  const token = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID;

  const body = {
    idempotency_key: `${opts.referenceId}-${Date.now()}`,
    order: {
      location_id: locationId,
      reference_id: opts.referenceId,
      line_items: opts.lineItems.map((li) => ({
        name: li.name,
        quantity: String(li.quantity),
        base_price_money: { amount: li.priceCents, currency: "USD" },
      })),
    },
    checkout_options: {
      redirect_url: opts.redirectUrl,
      ask_for_shipping_address: false,
    },
    pre_populated_data: opts.buyerEmail
      ? { buyer_email: opts.buyerEmail }
      : undefined,
  };

  const res = await fetch(`${base}/v2/online-checkout/payment-links`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Square-Version": SQUARE_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[square] payment-link failed:", res.status, text);
    throw new Error("square_payment_link_failed");
  }

  const json = (await res.json()) as {
    payment_link?: { url?: string; id?: string; order_id?: string };
  };

  const link = json.payment_link;
  if (!link?.url || !link.id || !link.order_id) {
    console.error("[square] payment-link missing fields:", JSON.stringify(json));
    throw new Error("square_payment_link_failed");
  }

  return { url: link.url, paymentLinkId: link.id, orderId: link.order_id };
}

/**
 * Verify a Square webhook signature.
 *
 * Square's scheme: HMAC-SHA256 over (notificationUrl + rawBody) using the
 * webhook signature key, base64-encoded, compared timing-safe against the
 * `x-square-hmacsha256-signature` header.
 *
 * Returns false if the signature key isn't configured, the header is missing,
 * or the digests don't match.
 */
export function verifyWebhookSignature(
  signatureHeader: string | null,
  rawBody: string,
  notificationUrl: string,
): boolean {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (!key) return false;
  if (!signatureHeader) return false;

  const expected = crypto
    .createHmac("sha256", key)
    .update(notificationUrl + rawBody)
    .digest("base64");

  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHeader);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
