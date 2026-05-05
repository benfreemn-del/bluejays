import { NextRequest, NextResponse } from "next/server";
import { CLIENT_PORTAL_COOKIE, ownerFromCookie } from "@/lib/client-auth";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/client-portal/customers
 *
 * Aggregates client_leads + client_purchases into a unified customer list
 * for the owner portal Customers tab. Joins are done in JS by lowercased
 * email + last-7-of-phone so a Shopify order auto-imported with no email
 * still lines up with a craft-fair phone-only entry.
 *
 * Returns one row per UNIQUE customer with rolled-up stats:
 *   · channels used        (set of "shopify" | "event" | "wholesale" | etc.)
 *   · purchase count       (number of recorded sales)
 *   · total spent (cents)  (sum across all channels)
 *   · first seen / last purchase
 *
 * Query params:
 *   ?format=csv  → return as CSV download (for Mailchimp/Klaviyo upload)
 *
 * Scoped by cookie-authed owner's client_slug.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LeadRow = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  intent: string | null;
  audience_segment: string | null;
  created_at: string;
};

type PurchaseRow = {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  product_name: string;
  amount_cents: number;
  quantity: number;
  channel: string;
  context: string | null;
  ordered_at: string;
};

export type CustomerSummary = {
  id: string; // synthetic — first lead/purchase id we matched
  name: string | null;
  email: string | null;
  phone: string | null;
  channels: string[];
  source: string | null;
  totalSpentCents: number;
  purchaseCount: number;
  firstSeen: string;
  lastPurchase: string | null;
  audienceTag: string | null;
};

const norm = (s: string | null | undefined) =>
  (s ?? "").trim().toLowerCase();
const phoneTail = (s: string | null | undefined) =>
  (s ?? "").replace(/\D/g, "").slice(-7);

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, customers: [] });
  }
  const cookie = req.cookies.get(CLIENT_PORTAL_COOKIE)?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner) {
    return NextResponse.json(
      { ok: false, error: "Not signed in" },
      { status: 401 },
    );
  }
  const slug = owner.client_slug;
  const sb = getSupabase();

  const [leadsRes, purchasesRes] = await Promise.all([
    sb
      .from("client_leads")
      .select(
        "id, name, email, phone, source, intent, audience_segment, created_at",
      )
      .eq("client_slug", slug)
      .order("created_at", { ascending: false })
      .limit(2000),
    sb
      .from("client_purchases")
      .select(
        "id, customer_name, customer_email, customer_phone, product_name, amount_cents, quantity, channel, context, ordered_at",
      )
      .eq("client_slug", slug)
      .order("ordered_at", { ascending: false })
      .limit(2000),
  ]);

  const leads = (leadsRes.data ?? []) as LeadRow[];
  const purchases = (purchasesRes.data ?? []) as PurchaseRow[];

  // Build a stable customer key: prefer email, fall back to last-7-of-phone,
  // fall back to lowercased name. Customers without any identifier get
  // their own row keyed by row id so they don't collapse into one another.
  const keyFor = (
    name: string | null,
    email: string | null,
    phone: string | null,
    fallbackId: string,
  ): string => {
    const e = norm(email);
    if (e) return `e:${e}`;
    const p = phoneTail(phone);
    if (p) return `p:${p}`;
    const n = norm(name);
    if (n) return `n:${n}`;
    return `i:${fallbackId}`;
  };

  const map = new Map<string, CustomerSummary>();

  // Seed with leads first so newsletter signups + inquiries appear even
  // without any purchase yet.
  for (const l of leads) {
    const k = keyFor(l.name, l.email, l.phone, l.id);
    const existing = map.get(k);
    if (existing) {
      existing.name = existing.name ?? l.name ?? null;
      existing.email = existing.email ?? l.email ?? null;
      existing.phone = existing.phone ?? l.phone ?? null;
      existing.source = existing.source ?? l.source ?? null;
      existing.audienceTag = existing.audienceTag ?? l.audience_segment ?? null;
      if (l.created_at < existing.firstSeen) existing.firstSeen = l.created_at;
    } else {
      map.set(k, {
        id: l.id,
        name: l.name ?? null,
        email: l.email ?? null,
        phone: l.phone ?? null,
        channels: [],
        source: l.source ?? null,
        totalSpentCents: 0,
        purchaseCount: 0,
        firstSeen: l.created_at,
        lastPurchase: null,
        audienceTag: l.audience_segment ?? null,
      });
    }
  }

  // Layer purchases on top — counts, dollars, and channel set.
  for (const p of purchases) {
    const k = keyFor(p.customer_name, p.customer_email, p.customer_phone, p.id);
    const existing = map.get(k);
    if (existing) {
      existing.name = existing.name ?? p.customer_name ?? null;
      existing.email = existing.email ?? p.customer_email ?? null;
      existing.phone = existing.phone ?? p.customer_phone ?? null;
      existing.totalSpentCents += p.amount_cents * p.quantity;
      existing.purchaseCount += 1;
      if (!existing.channels.includes(p.channel))
        existing.channels.push(p.channel);
      if (!existing.lastPurchase || p.ordered_at > existing.lastPurchase)
        existing.lastPurchase = p.ordered_at;
      if (p.ordered_at < existing.firstSeen) existing.firstSeen = p.ordered_at;
    } else {
      map.set(k, {
        id: p.id,
        name: p.customer_name ?? null,
        email: p.customer_email ?? null,
        phone: p.customer_phone ?? null,
        channels: [p.channel],
        source: null,
        totalSpentCents: p.amount_cents * p.quantity,
        purchaseCount: 1,
        firstSeen: p.ordered_at,
        lastPurchase: p.ordered_at,
        audienceTag: null,
      });
    }
  }

  // Sort by total spent desc, then by last purchase desc.
  const customers = Array.from(map.values()).sort((a, b) => {
    if (b.totalSpentCents !== a.totalSpentCents)
      return b.totalSpentCents - a.totalSpentCents;
    const al = a.lastPurchase ?? a.firstSeen;
    const bl = b.lastPurchase ?? b.firstSeen;
    return bl < al ? -1 : 1;
  });

  // CSV export branch — Mailchimp/Klaviyo-friendly header row.
  if (req.nextUrl.searchParams.get("format") === "csv") {
    const header = [
      "name",
      "email",
      "phone",
      "total_spent_usd",
      "purchase_count",
      "channels",
      "first_seen",
      "last_purchase",
      "source",
    ];
    const escape = (v: string | number | null) => {
      if (v === null || v === undefined) return "";
      const s = String(v).replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    };
    const lines = [header.join(",")];
    for (const c of customers) {
      lines.push(
        [
          escape(c.name),
          escape(c.email),
          escape(c.phone),
          escape((c.totalSpentCents / 100).toFixed(2)),
          escape(c.purchaseCount),
          escape(c.channels.join("|")),
          escape(c.firstSeen),
          escape(c.lastPurchase),
          escape(c.source),
        ].join(","),
      );
    }
    const csv = lines.join("\n");
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="${slug}-customers-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return NextResponse.json({ ok: true, customers });
}

/**
 * POST /api/client-portal/customers — manually add a sale.
 *
 * Body:
 *   { customer_name?, customer_email?, customer_phone?,
 *     product_name, amount_cents, quantity?, channel?, context?, ordered_at? }
 *
 * Used for craft fairs, wholesale, in-person, anything Shopify doesn't
 * already auto-import.
 */
export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Database not configured" },
      { status: 503 },
    );
  }
  const cookie = req.cookies.get(CLIENT_PORTAL_COOKIE)?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner) {
    return NextResponse.json(
      { ok: false, error: "Not signed in" },
      { status: 401 },
    );
  }

  let body: {
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
    product_name?: string;
    amount_cents?: number;
    quantity?: number;
    channel?: string;
    context?: string;
    ordered_at?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 },
    );
  }

  if (!body.product_name || typeof body.amount_cents !== "number") {
    return NextResponse.json(
      { ok: false, error: "product_name + amount_cents required" },
      { status: 400 },
    );
  }
  if (
    !body.customer_email &&
    !body.customer_phone &&
    !body.customer_name
  ) {
    return NextResponse.json(
      { ok: false, error: "At least one of customer_name / email / phone is required" },
      { status: 400 },
    );
  }

  const sb = getSupabase();
  const { data, error } = await sb
    .from("client_purchases")
    .insert({
      client_slug: owner.client_slug,
      customer_name: body.customer_name ?? null,
      customer_email: body.customer_email ?? null,
      customer_phone: body.customer_phone ?? null,
      product_name: body.product_name,
      amount_cents: body.amount_cents,
      quantity: body.quantity ?? 1,
      channel: body.channel ?? "manual",
      context: body.context ?? null,
      ordered_at: body.ordered_at ?? new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true, id: (data as { id: string }).id });
}
