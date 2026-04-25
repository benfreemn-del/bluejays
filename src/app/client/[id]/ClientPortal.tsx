"use client";

/**
 * Client component for the /client/[id] customer portal.
 *
 * Three tabs: Leads, Reviews, Renewal. Server component above
 * hydrates this with already-fetched data so the entire portal
 * renders instantly with no client-side fetches.
 *
 * Styling matches the public /preview/[id] aesthetic — clean, light
 * theme, mobile-first. Customer must feel like this is THEIR dashboard,
 * not Ben's CRM.
 */

import { useState } from "react";
import type {
  LeadRow,
  MissedCallRow,
  ReviewRow,
  AppointmentRow,
} from "@/lib/customer-metrics";

export interface RecentInvoice {
  id: string;
  amountPaidCents: number;
  status: string;
  paidAtIso: string | null;
  hostedInvoiceUrl: string | null;
}

export interface RenewalInfo {
  nextChargeDate: string | null;
  nextChargeAmount: number | null;
  status: string | null;
  portalUrl: string;
  recentInvoices: RecentInvoice[];
  error: string | null;
}

interface Props {
  businessName: string;
  liveSiteUrl: string;
  contactEmail: string;
  leads: LeadRow[];
  missedCalls: MissedCallRow[];
  reviews: ReviewRow[];
  appointments: AppointmentRow[];
  renewal: RenewalInfo;
  pricingTier: string;
}

type TabId = "leads" | "reviews" | "renewal";

const TABS: { id: TabId; label: string }[] = [
  { id: "leads", label: "Leads" },
  { id: "reviews", label: "Reviews" },
  { id: "renewal", label: "Renewal" },
];

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function formatRelative(iso: string): string {
  try {
    const ms = Date.now() - new Date(iso).getTime();
    const min = Math.floor(ms / 60000);
    if (min < 1) return "just now";
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const d = Math.floor(hr / 24);
    if (d < 30) return `${d}d ago`;
    return formatDate(iso);
  } catch {
    return formatDate(iso);
  }
}

function formatPhone(raw: string | null | undefined): string {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return raw;
}

function truncate(s: string | null | undefined, n: number): string {
  if (!s) return "";
  if (s.length <= n) return s;
  return s.slice(0, n).trimEnd() + "…";
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-500" aria-label={`${rating} stars`}>
      {"★".repeat(rating)}
      <span className="text-slate-300">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export default function ClientPortal({
  businessName,
  liveSiteUrl,
  contactEmail,
  leads,
  missedCalls,
  reviews,
  appointments,
  renewal,
  pricingTier,
}: Props) {
  const [tab, setTab] = useState<TabId>("leads");

  const totalLeads = leads.length + missedCalls.length + appointments.length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-10">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-600">
              Your BlueJays Dashboard
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
              {businessName}
            </h1>
            <a
              href={liveSiteUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm text-slate-600 hover:text-sky-600 underline-offset-2 hover:underline break-all"
            >
              {liveSiteUrl} ↗
            </a>
          </div>
          <a
            href={`mailto:${contactEmail}?subject=Help with my BlueJays site`}
            className="text-sm text-slate-600 hover:text-sky-600 underline-offset-2 hover:underline whitespace-nowrap"
          >
            Need help? Email Ben →
          </a>
        </header>

        {/* Quick stat strip */}
        <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
          <StatCard label="Leads (50 most recent)" value={totalLeads} />
          <StatCard label="Reviews collected" value={reviews.length} />
          <StatCard
            label="5-star reviews"
            value={reviews.filter((r) => r.rating === 5).length}
          />
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-slate-200">
          <nav
            className="flex gap-1 sm:gap-2 -mb-px overflow-x-auto"
            role="tablist"
          >
            {TABS.map((t) => {
              const active = t.id === tab;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(t.id)}
                  className={
                    "px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition " +
                    (active
                      ? "border-sky-600 text-sky-600"
                      : "border-transparent text-slate-500 hover:text-slate-700")
                  }
                >
                  {t.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab content */}
        {tab === "leads" && (
          <LeadsTab
            leads={leads}
            missedCalls={missedCalls}
            appointments={appointments}
          />
        )}
        {tab === "reviews" && <ReviewsTab reviews={reviews} contactEmail={contactEmail} />}
        {tab === "renewal" && (
          <RenewalTab renewal={renewal} contactEmail={contactEmail} pricingTier={pricingTier} />
        )}

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <span>
            Powered by{" "}
            <a
              href="https://bluejayportfolio.com"
              target="_blank"
              rel="noreferrer"
              className="text-sky-600 hover:underline"
            >
              bluejayportfolio.com
            </a>
          </span>
          <a
            href={`mailto:${contactEmail}`}
            className="text-slate-500 hover:text-sky-600 hover:underline"
          >
            {contactEmail}
          </a>
        </footer>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
      <div className="text-xs sm:text-sm text-slate-500">{label}</div>
      <div className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
        {value}
      </div>
    </div>
  );
}

// ─── Tab 1: Leads ─────────────────────────────────────────────────────────

function LeadsTab({
  leads,
  missedCalls,
  appointments,
}: {
  leads: LeadRow[];
  missedCalls: MissedCallRow[];
  appointments: AppointmentRow[];
}) {
  const empty =
    leads.length === 0 && missedCalls.length === 0 && appointments.length === 0;

  if (empty) {
    return (
      <EmptyState
        title="No leads yet"
        body="Once your contact form starts capturing visitors, they'll appear here. If your form isn't wired up to BlueJays yet, reply to your last email from Ben and he'll get it connected."
      />
    );
  }

  return (
    <div className="space-y-8">
      {leads.length > 0 && (
        <Section title="Contact form submissions" count={leads.length}>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <Th>Name</Th>
                  <Th>Phone</Th>
                  <Th>Email</Th>
                  <Th>Message</Th>
                  <Th>When</Th>
                  <Th>Reply</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <Td>{l.customer_name || "—"}</Td>
                    <Td>
                      {l.customer_phone ? (
                        <a
                          href={`tel:${l.customer_phone.replace(/\D/g, "")}`}
                          className="text-sky-600 hover:underline"
                        >
                          {formatPhone(l.customer_phone)}
                        </a>
                      ) : (
                        "—"
                      )}
                    </Td>
                    <Td className="break-all">
                      {l.customer_email ? (
                        <a
                          href={`mailto:${l.customer_email}`}
                          className="text-sky-600 hover:underline"
                        >
                          {l.customer_email}
                        </a>
                      ) : (
                        "—"
                      )}
                    </Td>
                    <Td className="max-w-[20rem]">
                      {l.message ? truncate(l.message, 80) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </Td>
                    <Td className="whitespace-nowrap text-slate-500">
                      {formatRelative(l.submitted_at)}
                    </Td>
                    <Td>
                      {l.customer_email ? (
                        <a
                          href={`mailto:${l.customer_email}?subject=Re: your inquiry`}
                          className="inline-block px-2.5 py-1 rounded-md bg-sky-600 text-white text-xs font-medium hover:bg-sky-700"
                        >
                          Reply
                        </a>
                      ) : l.customer_phone ? (
                        <a
                          href={`sms:${l.customer_phone.replace(/\D/g, "")}`}
                          className="inline-block px-2.5 py-1 rounded-md bg-sky-600 text-white text-xs font-medium hover:bg-sky-700"
                        >
                          Text
                        </a>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {missedCalls.length > 0 && (
        <Section
          title="Missed calls (auto-recovered)"
          count={missedCalls.length}
        >
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <Th>Caller</Th>
                  <Th>Location</Th>
                  <Th>When</Th>
                  <Th>Auto-text</Th>
                  <Th>Reply</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {missedCalls.map((m) => {
                  const phoneDigits = (m.caller_phone || "").replace(/\D/g, "");
                  const location = [m.caller_city, m.caller_state]
                    .filter(Boolean)
                    .join(", ");
                  return (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <Td>
                        {m.caller_phone ? (
                          <a
                            href={`tel:${phoneDigits}`}
                            className="text-sky-600 hover:underline"
                          >
                            {formatPhone(m.caller_phone)}
                          </a>
                        ) : (
                          "—"
                        )}
                      </Td>
                      <Td className="text-slate-600 whitespace-nowrap">
                        {location || (
                          <span className="text-slate-300">—</span>
                        )}
                      </Td>
                      <Td className="text-slate-500 whitespace-nowrap">
                        {formatRelative(m.occurred_at)}
                      </Td>
                      <Td>
                        {m.auto_sms_sent ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                            <span>✓</span> Auto-SMS sent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                            SMS failed
                          </span>
                        )}
                      </Td>
                      <Td>
                        {phoneDigits ? (
                          <a
                            href={`sms:${phoneDigits}`}
                            className="inline-block px-2.5 py-1 rounded-md bg-sky-600 text-white text-xs font-medium hover:bg-sky-700"
                          >
                            Reply via SMS
                          </a>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {appointments.length > 0 && (
        <Section title="Appointments booked" count={appointments.length}>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <Th>Customer</Th>
                  <Th>Phone</Th>
                  <Th>When</Th>
                  <Th>Booked</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <Td>{a.contact_name || "—"}</Td>
                    <Td>
                      {a.phone ? (
                        <a
                          href={`tel:${a.phone.replace(/\D/g, "")}`}
                          className="text-sky-600 hover:underline"
                        >
                          {formatPhone(a.phone)}
                        </a>
                      ) : (
                        "—"
                      )}
                    </Td>
                    <Td className="whitespace-nowrap">{formatDate(a.slot_iso)}</Td>
                    <Td className="whitespace-nowrap text-slate-500">
                      {formatRelative(a.created_at)}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}
    </div>
  );
}

// ─── Tab 2: Reviews ───────────────────────────────────────────────────────

function ReviewsTab({
  reviews,
  contactEmail,
}: {
  reviews: ReviewRow[];
  contactEmail: string;
}) {
  if (reviews.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState
          title="No reviews yet"
          body="Start collecting reviews by texting your past customers a link to your review funnel. Five-star ratings get pushed to Google automatically; lower ratings come straight to your inbox so you can make it right before they go public."
        />
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-5">
          <h3 className="font-semibold text-slate-900">
            Want to request reviews from past customers?
          </h3>
          <p className="mt-1 text-sm text-slate-700">
            Reply to your last email from Ben with a list of phone numbers (or
            paste them here below) and he'll fire off the SMS blast for you.
          </p>
          <a
            href={`mailto:${contactEmail}?subject=Send%20review%20requests%20to%20my%20customers&body=Hi%20Ben%2C%20please%20send%20review%20requests%20to%3A%0A%0A`}
            className="mt-3 inline-block px-4 py-2 rounded-md bg-sky-600 text-white text-sm font-medium hover:bg-sky-700"
          >
            Email Ben to start a review blast
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <div
          key={r.id}
          className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-center gap-3">
            <Stars rating={r.rating} />
            <span className="text-sm font-medium text-slate-700">
              {r.reviewer_name || "Anonymous"}
            </span>
            <span className="text-xs text-slate-400">
              {formatRelative(r.submitted_at)}
            </span>
            {r.rating === 5 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                Sent to Google
              </span>
            )}
            {r.rating < 5 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                Private feedback
              </span>
            )}
          </div>
          {r.feedback && (
            <p className="mt-3 text-sm text-slate-700 whitespace-pre-wrap">
              {r.feedback}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Tab 3: Renewal ───────────────────────────────────────────────────────

function RenewalTab({
  renewal,
  contactEmail,
  pricingTier,
}: {
  renewal: RenewalInfo;
  contactEmail: string;
  pricingTier: string;
}) {
  const tierLabel =
    pricingTier === "custom"
      ? "$100/year (custom site)"
      : pricingTier === "free"
      ? "$100/year (after first year)"
      : "$100/year (after first year)";

  return (
    <div className="space-y-6">
      {/* Renewal date card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Next renewal
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {renewal.nextChargeDate
                ? new Date(renewal.nextChargeDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Not scheduled yet"}
            </div>
            <div className="mt-1 text-sm text-slate-600">
              {renewal.nextChargeAmount
                ? `$${(renewal.nextChargeAmount / 100).toFixed(0)} on the renewal date`
                : tierLabel}
              {renewal.status ? ` — status: ${renewal.status}` : ""}
            </div>
            {renewal.error && (
              <div className="mt-2 text-xs text-amber-700">
                Couldn't reach Stripe just now — refresh in a minute or email Ben for
                exact billing details.
              </div>
            )}
          </div>
          <a
            href={renewal.portalUrl}
            target={renewal.portalUrl.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            className="self-start inline-block px-4 py-2 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 whitespace-nowrap"
          >
            Update card →
          </a>
        </div>
      </div>

      {/* Recent payments */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="px-5 py-3 border-b border-slate-100 text-sm font-semibold text-slate-700">
          Recent payments
        </div>
        {renewal.recentInvoices.length === 0 ? (
          <div className="px-5 py-6 text-sm text-slate-500">
            No payment history yet. Your first $100/year charge happens on the
            renewal date above.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {renewal.recentInvoices.map((inv) => (
              <li
                key={inv.id}
                className="px-5 py-3 flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <div className="text-sm font-medium text-slate-800">
                    ${(inv.amountPaidCents / 100).toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {formatDate(inv.paidAtIso)} ·{" "}
                    <span className="capitalize">{inv.status}</span>
                  </div>
                </div>
                {inv.hostedInvoiceUrl && (
                  <a
                    href={inv.hostedInvoiceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-sky-600 hover:underline"
                  >
                    View receipt →
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pricing breakdown — wording per CLAUDE.md "Pricing Wording Consistency Rule" */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="text-sm font-semibold text-slate-900">
          What your $100/yr covers
        </h3>
        <ul className="mt-2 text-sm text-slate-700 space-y-1.5">
          <li>• Domain renewal</li>
          <li>• Hosting</li>
          <li>• Ongoing maintenance</li>
          <li>• Support — reply to any email from Ben for changes (usually live within 48 hours)</li>
        </ul>
        <p className="mt-3 text-xs text-slate-500">
          Need a hand with billing?{" "}
          <a
            href={`mailto:${contactEmail}?subject=Billing%20question`}
            className="text-sky-600 hover:underline"
          >
            Email Ben directly
          </a>
          .
        </p>
      </div>
    </div>
  );
}

// ─── Shared bits ──────────────────────────────────────────────────────────

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-slate-700">
        {title}
        {typeof count === "number" && (
          <span className="ml-2 text-slate-400 font-normal">({count})</span>
        )}
      </h2>
      {children}
    </section>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">{body}</p>
    </div>
  );
}
