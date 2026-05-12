"use client";

import { useEffect, useState, useMemo, use } from "react";
import { useRouter } from "next/navigation";

/**
 * /clients/[slug]/onboarding — post-deal client wizard.
 *
 * Six steps, saved per-step to the server. Status:
 *   not_started → in_progress → ready_to_launch → launched
 *
 * On launch, Ben gets a per-tenant TODO list auto-seeded into
 * /dashboard/all-tasks (Buy Twilio number, Connect GMB, etc.).
 *
 * Auth is enforced by the API routes (client-portal-session cookie);
 * unauthenticated GET returns 401 → we bounce to the login page.
 */

type Step = "business" | "phone" | "brand" | "accounts" | "payment" | "compliance";
type Status = "not_started" | "in_progress" | "ready_to_launch" | "launched";

interface OnboardingRow {
  status: Status;
  step_business: Record<string, unknown> | null;
  step_phone: Record<string, unknown> | null;
  step_brand: Record<string, unknown> | null;
  step_accounts: Record<string, unknown> | null;
  step_payment: Record<string, unknown> | null;
  step_compliance: Record<string, unknown> | null;
  business_completed_at: string | null;
  phone_completed_at: string | null;
  brand_completed_at: string | null;
  accounts_completed_at: string | null;
  payment_completed_at: string | null;
  compliance_completed_at: string | null;
  launched_at: string | null;
}

const STEPS: Step[] = ["business", "phone", "brand", "accounts", "payment", "compliance"];
const LABELS: Record<Step, string> = {
  business: "Business basics",
  phone: "Phone & area code",
  brand: "Brand assets",
  accounts: "Existing accounts",
  payment: "Card on file",
  compliance: "SMS compliance",
};

export default function OnboardingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [row, setRow] = useState<OnboardingRow | null>(null);
  const [active, setActive] = useState<Step>("business");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch(`/api/clients/${slug}/onboarding`);
      if (r.status === 401) {
        router.push(`/clients/${slug}/login?next=/clients/${slug}/onboarding`);
        return;
      }
      const j = await r.json();
      if (j.ok) {
        setRow(j.row);
        // Land on the first incomplete step
        for (const s of STEPS) {
          const k = `${s}_completed_at` as keyof OnboardingRow;
          if (!j.row[k]) {
            setActive(s);
            break;
          }
        }
      } else setError(j.error);
      setLoading(false);
    })();
  }, [slug, router]);

  async function saveStep(step: Step, data: Record<string, unknown>) {
    setSaving(true);
    setError(null);
    try {
      const r = await fetch(`/api/clients/${slug}/onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step, data }),
      });
      const j = await r.json();
      if (!j.ok) setError(j.error);
      else {
        setRow(j.row);
        // Auto-advance to next unfinished step
        const idx = STEPS.indexOf(step);
        for (let i = idx + 1; i < STEPS.length; i++) {
          const s = STEPS[i];
          const k = `${s}_completed_at` as keyof OnboardingRow;
          if (!j.row[k]) {
            setActive(s);
            break;
          }
        }
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function launch() {
    setSaving(true);
    setError(null);
    try {
      const r = await fetch(`/api/clients/${slug}/onboarding/launch`, { method: "POST" });
      const j = await r.json();
      if (!j.ok) setError(j.error);
      else setRow(j.row);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const stepDone = useMemo(() => {
    if (!row) return {} as Record<Step, boolean>;
    return Object.fromEntries(
      STEPS.map((s) => [s, !!row[`${s}_completed_at` as keyof OnboardingRow]]),
    ) as Record<Step, boolean>;
  }, [row]);

  const doneCount = useMemo(
    () => Object.values(stepDone).filter(Boolean).length,
    [stepDone],
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">
        <p className="text-sm text-slate-500">Loading onboarding…</p>
      </main>
    );
  }

  if (!row) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-200 p-8">
        <p className="text-rose-400">{error || "Couldn't load onboarding"}</p>
      </main>
    );
  }

  if (row.status === "launched") {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-200">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h1 className="text-3xl font-bold mb-2">You&apos;re launched.</h1>
          <p className="text-slate-400 max-w-lg mx-auto mb-8">
            BlueJays has everything we need. Ben&apos;s team is standing up your
            Twilio number, Google Business, ads, and direct-mail accounts
            now. You&apos;ll get a launch confirmation email in the next few hours.
          </p>
          <a
            href={`/clients/${slug}/portal`}
            className="inline-block rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold px-6 py-3 text-sm"
          >
            Go to your portal →
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-wider text-sky-400 font-semibold mb-2">
            {slug} · client onboarding
          </p>
          <h1 className="text-3xl font-bold mb-2">Let&apos;s stand up your system.</h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            Six steps. Saved as you go. Once you finish, Ben gets your TODO
            list automatically and starts wiring everything up.
          </p>
          <div className="mt-5">
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${(doneCount / STEPS.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {doneCount} of {STEPS.length} complete
            </p>
          </div>
        </header>

        <div className="grid lg:grid-cols-[220px_1fr] gap-6">
          <nav className="space-y-1">
            {STEPS.map((s, i) => {
              const isActive = active === s;
              const done = stepDone[s];
              return (
                <button
                  key={s}
                  onClick={() => setActive(s)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                    isActive
                      ? "bg-sky-500/15 border border-sky-500/40 text-white"
                      : "border border-transparent hover:bg-slate-900/60 text-slate-400"
                  }`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                      done
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  {LABELS[s]}
                </button>
              );
            })}
          </nav>

          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            {error && (
              <p className="mb-4 text-sm text-rose-400 whitespace-pre-wrap">{error}</p>
            )}
            {active === "business" && (
              <BusinessForm
                initial={row.step_business as Partial<BusinessData> | null}
                onSubmit={(d) => saveStep("business", d)}
                saving={saving}
              />
            )}
            {active === "phone" && (
              <PhoneForm
                initial={row.step_phone as Partial<PhoneData> | null}
                onSubmit={(d) => saveStep("phone", d)}
                saving={saving}
              />
            )}
            {active === "brand" && (
              <BrandForm
                initial={row.step_brand as Partial<BrandData> | null}
                onSubmit={(d) => saveStep("brand", d)}
                saving={saving}
              />
            )}
            {active === "accounts" && (
              <AccountsForm
                initial={row.step_accounts as Partial<AccountsData> | null}
                onSubmit={(d) => saveStep("accounts", d)}
                saving={saving}
              />
            )}
            {active === "payment" && (
              <PaymentForm
                initial={row.step_payment as Partial<PaymentData> | null}
                onSubmit={(d) => saveStep("payment", d)}
                saving={saving}
              />
            )}
            {active === "compliance" && (
              <ComplianceForm
                initial={row.step_compliance as Partial<ComplianceData> | null}
                onSubmit={(d) => saveStep("compliance", d)}
                saving={saving}
              />
            )}

            {row.status === "ready_to_launch" && (
              <div className="mt-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
                <p className="text-sm text-emerald-200 mb-3">
                  All six steps complete. You&apos;re ready to hand it over to BlueJays.
                </p>
                <button
                  onClick={launch}
                  disabled={saving}
                  className="rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-slate-950 font-semibold px-6 py-3 text-sm"
                >
                  {saving ? "Launching…" : "Launch my system →"}
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

/* ──────────────────────── STEP FORMS ──────────────────────── */

interface BusinessData {
  legal_name: string;
  doing_business_as: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  hours: string;
  service_areas: string;
  primary_contact_name: string;
  primary_contact_phone: string;
  primary_contact_email: string;
}

function BusinessForm({
  initial,
  onSubmit,
  saving,
}: {
  initial: Partial<BusinessData> | null;
  onSubmit: (d: Record<string, unknown>) => void;
  saving: boolean;
}) {
  const [d, setD] = useState<BusinessData>({
    legal_name: initial?.legal_name ?? "",
    doing_business_as: initial?.doing_business_as ?? "",
    address_line1: initial?.address_line1 ?? "",
    address_line2: initial?.address_line2 ?? "",
    city: initial?.city ?? "",
    state: initial?.state ?? "",
    postal_code: initial?.postal_code ?? "",
    hours: initial?.hours ?? "",
    service_areas: typeof initial?.service_areas === "string"
      ? (initial.service_areas as string)
      : Array.isArray(initial?.service_areas)
        ? (initial.service_areas as string[]).join(", ")
        : "",
    primary_contact_name: initial?.primary_contact_name ?? "",
    primary_contact_phone: initial?.primary_contact_phone ?? "",
    primary_contact_email: initial?.primary_contact_email ?? "",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      ...d,
      service_areas: d.service_areas
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <H2>Business basics</H2>
      <p className="text-sm text-slate-400">Address goes on your Google Business profile, direct-mail returns, and tax invoices.</p>
      <Two>
        <Input label="Legal name" value={d.legal_name} onChange={(v) => setD({ ...d, legal_name: v })} required />
        <Input label="Doing-business-as (optional)" value={d.doing_business_as} onChange={(v) => setD({ ...d, doing_business_as: v })} />
      </Two>
      <Input label="Street address" value={d.address_line1} onChange={(v) => setD({ ...d, address_line1: v })} required />
      <Input label="Unit / suite (optional)" value={d.address_line2} onChange={(v) => setD({ ...d, address_line2: v })} />
      <Two>
        <Input label="City" value={d.city} onChange={(v) => setD({ ...d, city: v })} required />
        <Two>
          <Input label="State" value={d.state} onChange={(v) => setD({ ...d, state: v })} required />
          <Input label="ZIP" value={d.postal_code} onChange={(v) => setD({ ...d, postal_code: v })} required />
        </Two>
      </Two>
      <Textarea
        label="Hours of operation"
        value={d.hours}
        onChange={(v) => setD({ ...d, hours: v })}
        placeholder="Mon-Fri 8a-5p; Sat by appt; Sun closed"
        required
      />
      <Textarea
        label="Service areas (comma-separated cities or ZIPs)"
        value={d.service_areas}
        onChange={(v) => setD({ ...d, service_areas: v })}
        placeholder="Sequim WA, Port Angeles WA, 98382, 98363"
        required
      />
      <H3>Primary contact</H3>
      <Two>
        <Input label="Name" value={d.primary_contact_name} onChange={(v) => setD({ ...d, primary_contact_name: v })} required />
        <Input label="Phone" value={d.primary_contact_phone} onChange={(v) => setD({ ...d, primary_contact_phone: v })} required />
      </Two>
      <Input label="Email" type="email" value={d.primary_contact_email} onChange={(v) => setD({ ...d, primary_contact_email: v })} required />
      <SubmitButton saving={saving}>Save & continue</SubmitButton>
    </form>
  );
}

interface PhoneData {
  preferred_area_code: string;
  forward_to_number: string;
  voicemail_greeting: string;
  notes: string;
}

function PhoneForm({
  initial,
  onSubmit,
  saving,
}: {
  initial: Partial<PhoneData> | null;
  onSubmit: (d: Record<string, unknown>) => void;
  saving: boolean;
}) {
  const [d, setD] = useState<PhoneData>({
    preferred_area_code: initial?.preferred_area_code ?? "",
    forward_to_number: initial?.forward_to_number ?? "",
    voicemail_greeting: initial?.voicemail_greeting ?? "",
    notes: initial?.notes ?? "",
  });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(d as unknown as Record<string, unknown>); }} className="space-y-4">
      <H2>Phone & area code</H2>
      <p className="text-sm text-slate-400">
        BlueJays buys you a tracking number that forwards to your real phone.
        Every call gets logged, missed calls auto-text back, and texts route
        into your portal.
      </p>
      <Two>
        <Input label="Preferred area code" value={d.preferred_area_code} onChange={(v) => setD({ ...d, preferred_area_code: v })} placeholder="360" required />
        <Input label="Forward calls to this number" value={d.forward_to_number} onChange={(v) => setD({ ...d, forward_to_number: v })} placeholder="(360) 555-0123" required />
      </Two>
      <Textarea
        label="Voicemail greeting (optional)"
        value={d.voicemail_greeting}
        onChange={(v) => setD({ ...d, voicemail_greeting: v })}
        placeholder={`"You've reached Meyer Electric. Leave a message and we'll text you right back."`}
      />
      <Textarea
        label="Anything else we should know?"
        value={d.notes}
        onChange={(v) => setD({ ...d, notes: v })}
      />
      <SubmitButton saving={saving}>Save & continue</SubmitButton>
    </form>
  );
}

interface BrandData {
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  hero_photo_urls: string;
  tagline: string;
  brand_voice: string;
}

function BrandForm({ initial, onSubmit, saving }: { initial: Partial<BrandData> | null; onSubmit: (d: Record<string, unknown>) => void; saving: boolean }) {
  const [d, setD] = useState<BrandData>({
    logo_url: initial?.logo_url ?? "",
    primary_color: initial?.primary_color ?? "",
    secondary_color: initial?.secondary_color ?? "",
    hero_photo_urls: typeof initial?.hero_photo_urls === "string"
      ? (initial.hero_photo_urls as string)
      : Array.isArray(initial?.hero_photo_urls)
        ? (initial.hero_photo_urls as string[]).join("\n")
        : "",
    tagline: initial?.tagline ?? "",
    brand_voice: initial?.brand_voice ?? "",
  });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...d, hero_photo_urls: d.hero_photo_urls.split("\n").map((s) => s.trim()).filter(Boolean) }); }} className="space-y-4">
      <H2>Brand assets</H2>
      <p className="text-sm text-slate-400">Drop links to your assets (Dropbox, Drive, anywhere). We&apos;ll pull them down on our end.</p>
      <Input label="Logo URL" value={d.logo_url} onChange={(v) => setD({ ...d, logo_url: v })} placeholder="https://…" />
      <Two>
        <Input label="Primary color (hex)" value={d.primary_color} onChange={(v) => setD({ ...d, primary_color: v })} placeholder="#facc15" />
        <Input label="Secondary color (hex)" value={d.secondary_color} onChange={(v) => setD({ ...d, secondary_color: v })} placeholder="#0a0a0a" />
      </Two>
      <Textarea
        label="Hero photo URLs (one per line)"
        value={d.hero_photo_urls}
        onChange={(v) => setD({ ...d, hero_photo_urls: v })}
        placeholder="https://drive.google.com/…&#10;https://dropbox.com/…"
      />
      <Input label="Tagline (optional)" value={d.tagline} onChange={(v) => setD({ ...d, tagline: v })} />
      <Textarea
        label="Brand voice (how you talk)"
        value={d.brand_voice}
        onChange={(v) => setD({ ...d, brand_voice: v })}
        placeholder="Friendly, direct, no jargon. We're not corporate."
      />
      <SubmitButton saving={saving}>Save & continue</SubmitButton>
    </form>
  );
}

interface AccountsData {
  has_google_business: boolean;
  has_google_ads: boolean;
  has_meta_ads: boolean;
  has_lob_account: boolean;
  has_domain_already: boolean;
  domain_name: string;
  domain_registrar: string;
  notes: string;
}

function AccountsForm({ initial, onSubmit, saving }: { initial: Partial<AccountsData> | null; onSubmit: (d: Record<string, unknown>) => void; saving: boolean }) {
  const [d, setD] = useState<AccountsData>({
    has_google_business: !!initial?.has_google_business,
    has_google_ads: !!initial?.has_google_ads,
    has_meta_ads: !!initial?.has_meta_ads,
    has_lob_account: !!initial?.has_lob_account,
    has_domain_already: !!initial?.has_domain_already,
    domain_name: initial?.domain_name ?? "",
    domain_registrar: initial?.domain_registrar ?? "",
    notes: initial?.notes ?? "",
  });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(d as unknown as Record<string, unknown>); }} className="space-y-4">
      <H2>Existing accounts</H2>
      <p className="text-sm text-slate-400">
        Don&apos;t worry if the answer is no — we&apos;ll create what&apos;s missing.
        Just need to know what we&apos;re working with.
      </p>
      <Check label="I have a Google Business Profile" value={d.has_google_business} onChange={(v) => setD({ ...d, has_google_business: v })} />
      <Check label="I have a Google Ads account" value={d.has_google_ads} onChange={(v) => setD({ ...d, has_google_ads: v })} />
      <Check label="I have a Facebook / Instagram (Meta) business page" value={d.has_meta_ads} onChange={(v) => setD({ ...d, has_meta_ads: v })} />
      <Check label="I have a Lob direct-mail account" value={d.has_lob_account} onChange={(v) => setD({ ...d, has_lob_account: v })} />
      <Check label="I already own my domain" value={d.has_domain_already} onChange={(v) => setD({ ...d, has_domain_already: v })} />
      {d.has_domain_already && (
        <Two>
          <Input label="Domain name" value={d.domain_name} onChange={(v) => setD({ ...d, domain_name: v })} placeholder="meyerelectric.com" />
          <Input label="Registrar" value={d.domain_registrar} onChange={(v) => setD({ ...d, domain_registrar: v })} placeholder="GoDaddy, Namecheap, etc." />
        </Two>
      )}
      <Textarea label="Anything else?" value={d.notes} onChange={(v) => setD({ ...d, notes: v })} />
      <SubmitButton saving={saving}>Save & continue</SubmitButton>
    </form>
  );
}

interface PaymentData {
  card_last4: string;
  card_brand: string;
  pending_manual_capture: boolean;
  notes: string;
}

function PaymentForm({ initial, onSubmit, saving }: { initial: Partial<PaymentData> | null; onSubmit: (d: Record<string, unknown>) => void; saving: boolean }) {
  const [d, setD] = useState<PaymentData>({
    card_last4: initial?.card_last4 ?? "",
    card_brand: initial?.card_brand ?? "",
    pending_manual_capture: initial?.pending_manual_capture ?? true,
    notes: initial?.notes ?? "",
  });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(d as unknown as Record<string, unknown>); }} className="space-y-4">
      <H2>Card on file</H2>
      <p className="text-sm text-slate-400">
        We pass through your real costs at cost (Twilio ~$1.15/mo per number,
        Lob postage, ad spend). For security, you&apos;ll get a Stripe secure
        link by email — we never see your card number on this screen.
      </p>
      <div className="rounded-lg border border-sky-500/30 bg-sky-500/5 p-4 text-sm text-sky-200">
        <p className="font-semibold mb-1">What happens next</p>
        <p>
          When you submit this step, BlueJays emails you a one-time Stripe
          payment link. The card you enter there gets saved against your
          BlueJays customer ID and is only charged for pass-through costs
          you&apos;ve approved.
        </p>
      </div>
      <Check
        label="I understand BlueJays will email me a Stripe link to capture my card"
        value={d.pending_manual_capture}
        onChange={(v) => setD({ ...d, pending_manual_capture: v })}
      />
      <Textarea
        label="Anything we should know? (preferred billing email, accounting contact, etc.)"
        value={d.notes}
        onChange={(v) => setD({ ...d, notes: v })}
      />
      <SubmitButton saving={saving} disabled={!d.pending_manual_capture}>
        Save & continue
      </SubmitButton>
    </form>
  );
}

interface ComplianceData {
  sms_disclosure_approved: boolean;
  data_use_approved: boolean;
  signature_typed_name: string;
  signature_timestamp: string;
}

const SMS_DISCLOSURE = `By texting [BUSINESS] you agree to receive automated and recurring text messages from us and our service providers (including BlueJays). Message frequency varies. Message and data rates may apply. Reply STOP to opt out, HELP for help. Consent is not a condition of any purchase. See our Privacy Policy for details.`;

function ComplianceForm({ initial, onSubmit, saving }: { initial: Partial<ComplianceData> | null; onSubmit: (d: Record<string, unknown>) => void; saving: boolean }) {
  const [d, setD] = useState<ComplianceData>({
    sms_disclosure_approved: !!initial?.sms_disclosure_approved,
    data_use_approved: !!initial?.data_use_approved,
    signature_typed_name: initial?.signature_typed_name ?? "",
    signature_timestamp: initial?.signature_timestamp ?? "",
  });
  const ready = d.sms_disclosure_approved && d.data_use_approved && d.signature_typed_name.trim().length >= 3;
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...d, signature_timestamp: new Date().toISOString() }); }} className="space-y-4">
      <H2>SMS compliance</H2>
      <p className="text-sm text-slate-400">
        Carriers require this disclosure on any web form that captures phone
        numbers. We&apos;ll add it to your contact forms automatically.
      </p>
      <div className="rounded-lg border border-white/10 bg-slate-950 p-4 text-xs text-slate-300 leading-relaxed">
        {SMS_DISCLOSURE}
      </div>
      <Check
        label="I approve this SMS disclosure language for use on my forms."
        value={d.sms_disclosure_approved}
        onChange={(v) => setD({ ...d, sms_disclosure_approved: v })}
      />
      <Check
        label="I authorize BlueJays to store + process lead data on my behalf and to act as my marketing service provider under TCPA / CAN-SPAM."
        value={d.data_use_approved}
        onChange={(v) => setD({ ...d, data_use_approved: v })}
      />
      <Input
        label="Type your full legal name as signature"
        value={d.signature_typed_name}
        onChange={(v) => setD({ ...d, signature_typed_name: v })}
        required
      />
      <SubmitButton saving={saving} disabled={!ready}>
        Save & finish
      </SubmitButton>
    </form>
  );
}

/* ──────────────────────── PRIMITIVES ──────────────────────── */

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-semibold text-white">{children}</h2>;
}
function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-slate-300 mt-2">{children}</h3>;
}
function Two({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-slate-400 mb-1">
        {label}{required && <span className="text-rose-400 ml-1">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm placeholder-slate-600"
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-slate-400 mb-1">
        {label}{required && <span className="text-rose-400 ml-1">*</span>}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        rows={3}
        className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm placeholder-slate-600"
      />
    </label>
  );
}

function Check({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer text-sm text-slate-200">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 rounded border-white/20 bg-slate-950 text-sky-500"
      />
      <span>{label}</span>
    </label>
  );
}

function SubmitButton({
  children,
  saving,
  disabled,
}: {
  children: React.ReactNode;
  saving: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={saving || disabled}
      className="rounded-lg bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-slate-950 font-semibold px-5 py-2.5 text-sm mt-2"
    >
      {saving ? "Saving…" : children}
    </button>
  );
}
