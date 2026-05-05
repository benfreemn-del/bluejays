"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * CustomersTab — owner-portal panel for slug=laser-lakes (and any
 * future client running a Shopify + multi-channel sales operation).
 *
 * Reads /api/client-portal/customers which aggregates client_leads +
 * client_purchases into one customer-per-row roll-up: name · email ·
 * phone · channels · total spent · purchase count · first seen · last
 * purchase. Lets the owner:
 *   · Filter / search the list
 *   · Add a manual sale (for craft fairs, wholesale, in-person)
 *   · Download a CSV for Mailchimp/Klaviyo upload
 */

type Customer = {
  id: string;
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

const CHANNEL_BADGE: Record<string, { label: string; emoji: string; color: string }> = {
  shopify: { label: "Shopify", emoji: "🛒", color: "text-emerald-300" },
  event: { label: "Event", emoji: "🎪", color: "text-amber-300" },
  wholesale: { label: "Wholesale", emoji: "🤝", color: "text-blue-300" },
  "in-person": { label: "In-person", emoji: "🧾", color: "text-violet-300" },
  referral: { label: "Referral", emoji: "✨", color: "text-pink-300" },
  manual: { label: "Manual", emoji: "📋", color: "text-slate-300" },
};

type Filter = "all" | "top-spenders" | "repeat" | "newsletter-only";

export default function CustomersTab({ slug }: { slug: string }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [addOpen, setAddOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/client-portal/customers");
      const j = (await r.json()) as { ok?: boolean; customers?: Customer[] };
      setCustomers(j.customers ?? []);
    } catch {
      // empty state will show
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers.filter((c) => {
      if (filter === "top-spenders" && c.totalSpentCents < 10000) return false;
      if (filter === "repeat" && c.purchaseCount < 2) return false;
      if (filter === "newsletter-only" && c.purchaseCount > 0) return false;
      if (!q) return true;
      return (
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.channels.some((ch) => ch.toLowerCase().includes(q)) ||
        false
      );
    });
  }, [customers, search, filter]);

  const stats = useMemo(() => {
    const totalRevenueCents = customers.reduce(
      (sum, c) => sum + c.totalSpentCents,
      0,
    );
    const buyers = customers.filter((c) => c.purchaseCount > 0);
    const newsletter = customers.filter((c) => c.purchaseCount === 0);
    const repeat = customers.filter((c) => c.purchaseCount >= 2);
    return {
      total: customers.length,
      buyers: buyers.length,
      newsletter: newsletter.length,
      repeat: repeat.length,
      revenueUsd: (totalRevenueCents / 100).toFixed(2),
    };
  }, [customers]);

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="rounded-2xl bg-slate-900/60 border border-white/[0.06] p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h2 className="text-lg font-bold tracking-tight">Customers</h2>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed max-w-xl">
              One row per unique person — Shopify orders + manual sales + email
              signups all rolled up. Track who&apos;s bought what, from where,
              and how much.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="/api/client-portal/customers?format=csv"
              className="text-[11px] uppercase tracking-wider font-bold rounded-md border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200 px-3 py-2 transition-colors"
            >
              Download CSV ↓
            </a>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="text-[11px] uppercase tracking-wider font-bold rounded-md bg-amber-500 hover:bg-amber-400 text-black px-3 py-2 transition-colors"
            >
              + Add a sale
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
          <Stat label="Customers" value={String(stats.total)} tone="white" />
          <Stat label="Buyers" value={String(stats.buyers)} tone="emerald" />
          <Stat label="Repeat" value={String(stats.repeat)} tone="amber" />
          <Stat
            label="Revenue (all-time)"
            value={`$${stats.revenueUsd}`}
            tone="violet"
          />
        </div>
      </div>

      {/* FILTERS */}
      <div className="rounded-xl bg-slate-900/40 border border-white/[0.05] p-3 flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name / email / phone / channel…"
          className="flex-1 min-w-[240px] h-9 px-3 rounded-lg bg-black/40 border border-white/10 text-sm placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
        />
        <div className="flex gap-1 flex-wrap">
          {(
            [
              { id: "all", label: "All" },
              { id: "top-spenders", label: "Top spenders" },
              { id: "repeat", label: "Repeat" },
              { id: "newsletter-only", label: "Newsletter only" },
            ] as { id: Filter; label: string }[]
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`text-[11px] font-bold uppercase tracking-wider rounded-md px-2.5 py-1.5 border transition-colors ${
                filter === f.id
                  ? "border-amber-400 bg-amber-500/15 text-amber-200"
                  : "border-white/10 bg-black/30 text-slate-400 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-sm">
          Loading customers…
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-slate-900/40 p-10 text-center">
          <p className="text-sm font-bold">No customers match</p>
          <p className="text-xs text-slate-500 mt-1">
            Adjust filters or add your first manual sale.
          </p>
        </div>
      ) : (
        <ul className="space-y-1.5">
          {visible.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-white/[0.06] bg-slate-900/40 hover:border-amber-500/30 transition-colors px-3 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <p className="text-sm font-bold truncate">
                      {c.name ?? "(no name)"}
                    </p>
                    {c.audienceTag && (
                      <span className="text-[10px] uppercase tracking-wider text-slate-500">
                        · {c.audienceTag}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {[c.email, c.phone].filter(Boolean).join(" · ") ||
                      "no contact info"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {c.channels.length === 0 ? (
                      <span className="text-[10px] uppercase tracking-wider text-slate-600 italic">
                        No purchases · newsletter signup
                      </span>
                    ) : (
                      c.channels.map((ch) => {
                        const meta = CHANNEL_BADGE[ch] ?? CHANNEL_BADGE.manual;
                        return (
                          <span
                            key={ch}
                            className={`text-[10px] font-bold uppercase tracking-wider rounded-full bg-black/40 px-2 py-0.5 ${meta.color}`}
                          >
                            {meta.emoji} {meta.label}
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-base font-black tabular-nums text-emerald-300">
                    ${(c.totalSpentCents / 100).toFixed(2)}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    {c.purchaseCount} order{c.purchaseCount === 1 ? "" : "s"}
                  </p>
                  {c.lastPurchase && (
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      Last · {new Date(c.lastPurchase).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {addOpen && <AddSaleModal slug={slug} onClose={() => setAddOpen(false)} onSaved={load} />}
    </div>
  );
}

function AddSaleModal({
  onClose,
  onSaved,
}: {
  slug: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [product, setProduct] = useState("");
  const [amount, setAmount] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [channel, setChannel] = useState<
    "shopify" | "event" | "wholesale" | "in-person" | "referral" | "manual"
  >("event");
  const [context, setContext] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    const cents = Math.round(parseFloat(amount || "0") * 100);
    if (!product || !cents) {
      setErr("Need a product name + amount");
      setSubmitting(false);
      return;
    }
    try {
      const r = await fetch("/api/client-portal/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: name || null,
          customer_email: email || null,
          customer_phone: phone || null,
          product_name: product,
          amount_cents: cents,
          quantity: parseInt(quantity, 10) || 1,
          channel,
          context: context || null,
        }),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? "Save failed");
      }
      onSaved();
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="relative my-6 mx-4 w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 shadow-2xl p-6 space-y-4"
      >
        <div className="flex items-baseline justify-between mb-1">
          <h3 className="text-lg font-bold">Add a sale</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm"
          >
            ✕
          </button>
        </div>
        <p className="text-xs text-slate-400">
          For craft fairs, wholesale, in-person, or anything Shopify hasn&apos;t
          imported.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Customer name" value={name} onChange={setName} placeholder="Sarah Tomas" />
          <Input label="Email" value={email} onChange={setEmail} placeholder="sarah@…" type="email" />
        </div>
        <Input label="Phone" value={phone} onChange={setPhone} placeholder="(optional)" />

        <div className="border-t border-white/10 pt-3">
          <Input label="Product name *" value={product} onChange={setProduct} placeholder="Custom Lake Map · Burntside" />
          <div className="grid grid-cols-3 gap-3 mt-3">
            <Input label="Amount (USD) *" value={amount} onChange={setAmount} placeholder="475.00" />
            <Input label="Qty" value={quantity} onChange={setQuantity} placeholder="1" />
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold mb-1 text-slate-400">
                Channel
              </label>
              <select
                value={channel}
                onChange={(e) =>
                  setChannel(
                    e.target.value as
                      | "shopify"
                      | "event"
                      | "wholesale"
                      | "in-person"
                      | "referral"
                      | "manual",
                  )
                }
                className="w-full h-9 rounded-md bg-black/40 border border-white/10 text-sm px-2 focus:outline-none focus:border-amber-500/50"
              >
                <option value="event">🎪 Event</option>
                <option value="in-person">🧾 In-person</option>
                <option value="wholesale">🤝 Wholesale</option>
                <option value="shopify">🛒 Shopify</option>
                <option value="referral">✨ Referral</option>
                <option value="manual">📋 Manual</option>
              </select>
            </div>
          </div>
          <Input
            label="Context (event name, etc.)"
            value={context}
            onChange={setContext}
            placeholder="Brainerd Lakes Festival 2026"
          />
        </div>

        {err && (
          <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-md px-3 py-2">
            {err}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-10 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold disabled:opacity-50 transition-colors"
        >
          {submitting ? "Saving…" : "Save sale"}
        </button>
      </form>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-widest font-bold mb-1 text-slate-400">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 rounded-md bg-black/40 border border-white/10 text-sm px-2 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50"
      />
    </label>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "white" | "emerald" | "amber" | "violet";
}) {
  const toneCls: Record<typeof tone, string> = {
    white: "text-white",
    emerald: "text-emerald-300",
    amber: "text-amber-300",
    violet: "text-violet-300",
  };
  return (
    <div className="rounded-md bg-black/30 border border-white/5 px-3 py-2 text-center">
      <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">
        {label}
      </div>
      <div className={`text-lg font-black tabular-nums ${toneCls[tone]}`}>
        {value}
      </div>
    </div>
  );
}
