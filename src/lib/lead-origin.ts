/**
 * Lead-origin explainer — tells Madie *where each lead came from* so she
 * has context for her opening line. Pure function, used by:
 *   - LeadPicker row subtitle ("📥 Submitted /audit · May 11")
 *   - LeadDetailDrawer header subtitle
 *   - CallWorkspace prospect card (future)
 *
 * Categories returned:
 *   - inbound_audit   — submitted the /audit form themselves
 *   - inbound_form    — submitted /get-started or similar warm form
 *   - mfg_lookalike   — cold MFG outreach via Apollo lookalike funnel
 *   - cold_scouted    — Google Places auto-scout (default cold)
 *   - manual          — added by Ben/Madie manually
 *   - partner_referral — came through a partner/affiliate
 *   - unknown         — fallback when no signal available
 *
 * The .short string is what renders on each row (10-15 char chip).
 * The .long string is the tooltip / drawer subtitle (full sentence).
 */

import type { Prospect } from "./types";

export type LeadOriginKind =
  | "inbound_audit"
  | "inbound_form"
  | "mfg_lookalike"
  | "cold_scouted"
  | "manual"
  | "partner_referral"
  | "unknown";

export type LeadOrigin = {
  kind: LeadOriginKind;
  /** Compact chip text, e.g. "Audit form" or "MFG scout". */
  short: string;
  /** Full explanation, e.g. "Submitted /audit form on May 11 — theoregonappraisers.com". */
  long: string;
  /** Origin date (createdAt) — for the "X days ago" suffix. ISO string. */
  arrivedIso: string | null;
  /** External URL the prospect submitted, if applicable. */
  submittedUrl: string | null;
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Crude relative-date label (no Intl.RelativeTimeFormat dep). */
function relativeDay(iso: string | null | undefined): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (isNaN(ms)) return "";
  const days = Math.round(ms / (24 * 60 * 60 * 1000));
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 14) return `${days}d ago`;
  if (days < 60) return `${Math.round(days / 7)}w ago`;
  return formatDate(iso);
}

export function getLeadOrigin(prospect: Prospect): LeadOrigin {
  const sd = (prospect.scrapedData || {}) as Record<string, unknown>;
  const submittedUrl =
    (typeof sd.submittedUrl === "string" ? sd.submittedUrl : null) ||
    (typeof sd.submitted_url === "string" ? sd.submitted_url : null);
  const ref =
    (typeof sd.ref === "string" ? sd.ref : null) ||
    (typeof sd.utmSource === "string" ? sd.utmSource : null) ||
    (typeof sd.utm_source === "string" ? sd.utm_source : null);
  const arrivedIso = prospect.createdAt || null;
  const arrivedShort = formatDate(arrivedIso);
  const arrivedRel = relativeDay(arrivedIso);

  // 1. Inbound → audit form (most common) vs other warm forms
  if (prospect.source === "inbound") {
    // audit_lead status or submittedUrl present → audit form
    const isAuditForm =
      prospect.status === "audit_lead" ||
      prospect.status === "audit_preview_requested" ||
      !!submittedUrl;
    if (isAuditForm) {
      const hostHint = submittedUrl
        ? ` — ${submittedUrl.replace(/^https?:\/\//i, "").replace(/\/$/, "")}`
        : "";
      const refHint = ref ? ` (via ${ref})` : "";
      return {
        kind: "inbound_audit",
        short: "Audit form",
        long: `Submitted /audit form ${arrivedRel}${hostHint}${refHint}. Use the audit results as your opener.`,
        arrivedIso,
        submittedUrl,
      };
    }
    // Otherwise generic warm form (get-started, calculator, etc.)
    return {
      kind: "inbound_form",
      short: "Warm form",
      long: `Inbound — filled a BlueJays form ${arrivedRel}${ref ? ` (via ${ref})` : ""}. Treat as warm.`,
      arrivedIso,
      submittedUrl,
    };
  }

  // 2. MFG cold lookalike (Apollo-based manufacturer outreach funnel)
  if (prospect.lookalikeCategory && prospect.lookalikeCategory.startsWith("mfg-")) {
    const niche = prospect.lookalikeCategory.replace("mfg-", "").replace(/-/g, " ");
    return {
      kind: "mfg_lookalike",
      short: `MFG · ${niche}`,
      long: `Cold lookalike from MFG outreach (${niche}). Scouted ${arrivedRel}. Use the manufacturer pitch.`,
      arrivedIso,
      submittedUrl: null,
    };
  }

  // The Prospect.source field is narrowly typed ("inbound" | "scouted")
  // but in practice the DB can hold extra strings (manual, partner-
  // referral, etc.) via sourceChannel or legacy rows. Compare via a
  // string cast so we cover everything.
  const srcStr = (prospect.source as string | undefined) || "";

  // 3. Partner referral
  if (srcStr === "partner-referral" || srcStr === "partner_referral") {
    return {
      kind: "partner_referral",
      short: "Partner ref",
      long: `Referred by a partner${arrivedShort ? ` on ${arrivedShort}` : ""}. Mention who sent you.`,
      arrivedIso,
      submittedUrl: null,
    };
  }

  // 4. Manual add (Ben or Madie typed it in)
  if (srcStr === "manual") {
    return {
      kind: "manual",
      short: "Manual add",
      long: `Added manually${arrivedShort ? ` on ${arrivedShort}` : ""}. Check notes for context before you dial.`,
      arrivedIso,
      submittedUrl: null,
    };
  }

  // 5. Cold scout — Google Places auto-scout (the default cold lead)
  if (srcStr === "scouted" || !srcStr) {
    return {
      kind: "cold_scouted",
      short: "Cold scout",
      long: `Cold scout — found via Google Places auto-scout ${arrivedRel}. This is a true cold call; use the Hormozi opener.`,
      arrivedIso,
      submittedUrl: null,
    };
  }

  return {
    kind: "unknown",
    short: srcStr || "Unknown",
    long: `Origin: ${srcStr || "unknown"}. No further provenance signal on file.`,
    arrivedIso,
    submittedUrl: null,
  };
}

/**
 * Statuses that mean "removed for a reason" — Madie should NEVER see
 * these in her picker even with all filters off. Centralized here so
 * every surface (LeadPicker, drawer, checklist) excludes consistently.
 *
 * Distinct from `nurturing` (hidden by default but toggleable via the
 * Show nurturing chip — those are still actionable, just deprioritized).
 *
 * Pattern: keep this in sync with the negative-status logic in
 * LeadPicker.client.tsx + the API filter chain.
 */
export const DEAD_STATUSES: ReadonlySet<string> = new Set([
  "dismissed", // Ben explicitly killed the lead
  "unsubscribed", // TCPA / unsub — cannot legally contact
  "do_not_call", // explicit DNC request — TCPA
  "audit_marketing", // Ben moved them to email-only sequence (not pitch-fit)
  // NOTE: 'bounced' and 'qc_failed' are NOT here — bounced kills email
  // but the phone may still work, and qc_failed only means the preview
  // wasn't ready; the lead itself is fine to call.
]);
