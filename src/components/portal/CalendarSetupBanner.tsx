"use client";

import { useEffect, useState } from "react";

/**
 * CalendarSetupBanner — onboarding nag for owners whose tenant has
 * `calendarEnabled = true` but who haven't either:
 *   · Added 3+ future-available slots to client_booking_slots, OR
 *   · Connected a Google Calendar / Calendly / Cal.com account.
 *
 * Auto-hides once either threshold is crossed. Renders at the TOP
 * of the OIT admin (and any future calendar-enabled tenant's portal
 * Overview tab). Polite, dismissible for 7 days, but reappears so
 * the prompt doesn't get lost.
 *
 * Per Ben spec 2026-05-09: "we should have it built out... prompts
 * backend users when they signup to complete their schedule or
 * connect their calendar app so the system can use that to help it
 * operate and schedule bookings."
 */

type OnboardingState = {
  needsSetup: boolean;
  hasManualSlots: boolean;
  hasConnectedCalendar: boolean;
  manualSlotCount: number;
  connectedProviders: string[];
};

const DISMISS_KEY_PREFIX = "bj.calendar-banner-dismissed-until.";
const DISMISS_DAYS = 7;

export default function CalendarSetupBanner({
  slug,
}: {
  slug: string;
}) {
  const [state, setState] = useState<OnboardingState | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  // Hydrate dismissal state from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`${DISMISS_KEY_PREFIX}${slug}`);
      if (raw) {
        const until = parseInt(raw, 10);
        if (Number.isFinite(until) && until > Date.now()) {
          setDismissed(true);
        }
      }
    } catch {
      // ignore
    }
  }, [slug]);

  // Load onboarding state
  useEffect(() => {
    if (dismissed) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(
          `/api/clients/${slug}/calendar/onboarding-state`,
          { credentials: "include" },
        );
        if (!r.ok) return;
        const j = (await r.json()) as { ok: boolean; state?: OnboardingState };
        if (!cancelled && j.ok && j.state) setState(j.state);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, dismissed]);

  if (loading || dismissed) return null;
  if (!state || !state.needsSetup) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(
        `${DISMISS_KEY_PREFIX}${slug}`,
        String(Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000),
      );
    } catch {
      // ignore
    }
    setDismissed(true);
  };

  const connect = async (provider: string) => {
    if (busy) return;
    setBusy(provider);
    try {
      const r = await fetch(`/api/oauth/${provider}/start`, {
        method: "GET",
        credentials: "include",
        redirect: "manual",
      });
      if (
        r.type === "opaqueredirect" ||
        r.status === 302 ||
        r.status === 303
      ) {
        window.location.href = `/api/oauth/${provider}/start`;
        return;
      }
      if (r.status === 422) {
        // Env vars missing — Ben hasn't provisioned the OAuth app yet.
        alert(
          "Calendar connect not yet provisioned by your operator. Use 'Add slots manually' for now — your bookings still work.",
        );
      } else if (r.status === 401) {
        alert("Sign in first.");
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <section
      className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-950/30 via-slate-900/50 to-slate-900/40 p-5 sm:p-6"
      role="region"
      aria-label="Calendar setup"
    >
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📅</span>
          <div>
            <h3 className="text-base font-black tracking-tight text-amber-100">
              Set up your booking calendar
            </h3>
            <p className="text-[11px] text-amber-200/70 mt-0.5">
              Customers can&apos;t book until you tell us when you&apos;re available.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="text-[10px] uppercase tracking-wider font-bold text-amber-300/70 hover:text-amber-200"
          title="Hide for 7 days"
        >
          Remind me later
        </button>
      </div>

      <p className="text-[13px] text-slate-300 leading-relaxed mb-4">
        Two ways to do this — pick whichever you already use day-to-day:
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        {/* Path A — connect existing calendar */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
          <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-300 mb-1">
            Recommended
          </p>
          <h4 className="text-sm font-bold text-white mb-1">
            Connect your existing calendar
          </h4>
          <p className="text-[12px] text-slate-300 leading-relaxed mb-3">
            We read your free/busy and auto-build available slots. New
            bookings drop into your calendar instantly — no double
            entry.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => connect("google_calendar")}
              disabled={busy !== null}
              className="text-[11px] uppercase tracking-wider font-bold border border-emerald-500/50 text-emerald-200 hover:bg-emerald-500/10 px-3 py-1.5 rounded disabled:opacity-50"
            >
              {busy === "google_calendar" ? "…" : "Google Calendar"}
            </button>
            <button
              type="button"
              onClick={() => connect("calendly")}
              disabled={busy !== null}
              className="text-[11px] uppercase tracking-wider font-bold border border-emerald-500/50 text-emerald-200 hover:bg-emerald-500/10 px-3 py-1.5 rounded disabled:opacity-50"
            >
              {busy === "calendly" ? "…" : "Calendly"}
            </button>
            <button
              type="button"
              onClick={() => connect("cal_com")}
              disabled={busy !== null}
              className="text-[11px] uppercase tracking-wider font-bold border border-emerald-500/50 text-emerald-200 hover:bg-emerald-500/10 px-3 py-1.5 rounded disabled:opacity-50"
            >
              {busy === "cal_com" ? "…" : "Cal.com"}
            </button>
          </div>
        </div>

        {/* Path B — manual slot management */}
        <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4">
          <p className="text-[10px] uppercase tracking-wider font-bold text-violet-300 mb-1">
            Manual control
          </p>
          <h4 className="text-sm font-bold text-white mb-1">
            Add slots manually
          </h4>
          <p className="text-[12px] text-slate-300 leading-relaxed mb-3">
            Pick the days + times you&apos;re open. There&apos;s a
            &quot;Pre-fill 30 days&quot; preset that drops 66 slots in one
            click.
          </p>
          <a
            href={
              slug === "olympic-inspections"
                ? "/clients/olympic-inspections/admin?tab=calendar"
                : `/clients/${slug}/portal?tab=calendar`
            }
            className="inline-block text-[11px] uppercase tracking-wider font-bold border border-violet-500/50 text-violet-200 hover:bg-violet-500/10 px-3 py-1.5 rounded"
          >
            Open calendar tab →
          </a>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
        {state.manualSlotCount > 0
          ? `Currently ${state.manualSlotCount} slot${state.manualSlotCount === 1 ? "" : "s"} on the books — add ${Math.max(3 - state.manualSlotCount, 0)} more or connect a calendar to dismiss this prompt.`
          : "Once you have 3+ slots OR a connected calendar, this banner hides automatically."}
      </p>
    </section>
  );
}
