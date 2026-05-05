import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * POST /api/webhooks/shopify/orders?slug=laser-lakes
 *
 * Shopify Orders/Create (or Orders/Paid) webhook → auto-imports each
 * line item into client_purchases. Multi-tenant by `?slug=` query param
 * so any client running Shopify can subscribe without code changes.
 *
 * Setup per tenant in Shopify Admin → Settings → Notifications → Webhooks:
 *   · Event:   Order creation (or "Order payment" for paid-only)
 *   · Format:  JSON
 *   · URL:     https://bluejayportfolio.com/api/webhooks/shopify/orders?slug=laser-lakes
 *   · API:     2024-04 or later
 *   · Note the signing secret Shopify shows you on save.
 *
 * Per-tenant signing secret env var (preferred for isolation):
 *   SHOPIFY_WEBHOOK_SECRET_LASER_LAKES = "shpss_…"
 *
 * Falls back to SHOPIFY_WEBHOOK_SECRET if a per-tenant one isn't set.
 *
 * Each Shopify line item becomes one client_purchases row. Idempotent —
 * dedupes on external_id = `shopify:{order_id}:{line_item_id}` so re-runs
 * (Shopify retries failed deliveries) don't double-insert.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ShopifyLineItem = {
  id: number;
  title: string;
  variant_title?: string | null;
  quantity: number;
  price: string; // string with decimal — convert to cents
};

type ShopifyAddress = {
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
};

type ShopifyOrder = {
  id: number;
  order_number?: number;
  email?: string | null;
  phone?: string | null;
  created_at: string;
  customer?: {
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  shipping_address?: ShopifyAddress | null;
  billing_address?: ShopifyAddress | null;
  line_items?: ShopifyLineItem[];
  note_attributes?: { name: string; value: string }[];
};

function verifyHmac(rawBody: string, hmacHeader: string | null, secret: string) {
  if (!hmacHeader) return false;
  const digest = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");
  // Constant-time compare to avoid timing attacks.
  const a = Buffer.from(digest);
  const b = Buffer.from(hmacHeader);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function getSecretForSlug(slug: string): string | null {
  // Per-tenant key first, generic fallback.
  const slugKey = slug.toUpperCase().replace(/-/g, "_");
  const perTenant = process.env[`SHOPIFY_WEBHOOK_SECRET_${slugKey}`];
  if (perTenant) return perTenant;
  const generic = process.env.SHOPIFY_WEBHOOK_SECRET;
  return generic ?? null;
}

function nameFromOrder(order: ShopifyOrder): string | null {
  if (order.customer?.first_name || order.customer?.last_name) {
    return [order.customer.first_name, order.customer.last_name]
      .filter(Boolean)
      .join(" ")
      .trim() || null;
  }
  const addr = order.shipping_address ?? order.billing_address;
  if (addr?.first_name || addr?.last_name) {
    return [addr.first_name, addr.last_name].filter(Boolean).join(" ").trim() || null;
  }
  return null;
}

export async function POST(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json(
      { ok: false, error: "Missing ?slug= query param" },
      { status: 400 },
    );
  }

  // Read raw body for HMAC verification — must NOT use req.json() before
  // the signature check or the body bytes change.
  const rawBody = await req.text();

  const secret = getSecretForSlug(slug);
  if (!secret) {
    console.error(
      `[shopify-webhook] No signing secret configured for slug "${slug}"`,
    );
    return NextResponse.json(
      { ok: false, error: "Webhook secret not configured" },
      { status: 503 },
    );
  }

  const hmacHeader = req.headers.get("x-shopify-hmac-sha256");
  if (!verifyHmac(rawBody, hmacHeader, secret)) {
    console.warn(
      `[shopify-webhook] HMAC verification failed for slug=${slug}`,
    );
    return NextResponse.json(
      { ok: false, error: "Invalid signature" },
      { status: 401 },
    );
  }

  let order: ShopifyOrder;
  try {
    order = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, skipped: "no-db" });
  }

  const sb = getSupabase();
  const customerName = nameFromOrder(order);
  const customerEmail = order.customer?.email ?? order.email ?? null;
  const customerPhone =
    order.customer?.phone ??
    order.phone ??
    order.shipping_address?.phone ??
    order.billing_address?.phone ??
    null;
  const orderedAt = order.created_at ?? new Date().toISOString();
  const lineItems = order.line_items ?? [];

  if (lineItems.length === 0) {
    return NextResponse.json({ ok: true, inserted: 0, note: "no line items" });
  }

  // Dedupe — fetch any existing rows for this Shopify order.
  const externalIds = lineItems.map(
    (li) => `shopify:${order.id}:${li.id}`,
  );
  const { data: existing } = await sb
    .from("client_purchases")
    .select("external_id")
    .eq("client_slug", slug)
    .in("external_id", externalIds);
  const existingSet = new Set(
    (existing ?? []).map((r) => (r as { external_id: string }).external_id),
  );

  const rowsToInsert = lineItems
    .filter((li) => !existingSet.has(`shopify:${order.id}:${li.id}`))
    .map((li) => {
      const priceCents = Math.round(parseFloat(li.price || "0") * 100);
      const productName = li.variant_title
        ? `${li.title} · ${li.variant_title}`
        : li.title;
      return {
        client_slug: slug,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        product_name: productName,
        amount_cents: priceCents,
        quantity: li.quantity || 1,
        channel: "shopify" as const,
        context: order.order_number ? `Shopify order #${order.order_number}` : null,
        external_id: `shopify:${order.id}:${li.id}`,
        ordered_at: orderedAt,
      };
    });

  if (rowsToInsert.length === 0) {
    return NextResponse.json({
      ok: true,
      inserted: 0,
      duplicates: lineItems.length,
    });
  }

  const { error } = await sb.from("client_purchases").insert(rowsToInsert);
  if (error) {
    console.error("[shopify-webhook] insert failed:", error.message);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  // Also seed the customer into client_leads so they appear in the email
  // list even if they only ever bought through Shopify (didn't sign up
  // separately for the newsletter).
  if (customerEmail || customerPhone) {
    try {
      // Check if a lead already exists for this email/phone under this slug.
      const { data: existingLead } = await sb
        .from("client_leads")
        .select("id")
        .eq("client_slug", slug)
        .or(
          `email.eq.${customerEmail ?? "__none__"},phone.eq.${customerPhone ?? "__none__"}`,
        )
        .limit(1)
        .maybeSingle();
      if (!existingLead) {
        await sb.from("client_leads").insert({
          client_slug: slug,
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          source: "shopify-order",
          intent: "First Shopify purchase",
          raw_payload: {
            shopify_order_id: order.id,
            shopify_order_number: order.order_number,
          },
        });
      }
    } catch (err) {
      console.warn(
        "[shopify-webhook] client_leads upsert failed (non-fatal):",
        err instanceof Error ? err.message : err,
      );
    }
  }

  return NextResponse.json({
    ok: true,
    inserted: rowsToInsert.length,
    duplicates: lineItems.length - rowsToInsert.length,
  });
}
