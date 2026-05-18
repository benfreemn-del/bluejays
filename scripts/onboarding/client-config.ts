/**
 * Schema for AI System client onboarding configs.
 *
 * Each $10k AI System client gets a JSON file at
 * `scripts/onboarding/clients/<slug>.json` matching this shape. The
 * Python PDF generator reads the JSON and stamps it into ReportLab
 * templates to produce the 4 onboarding PDFs (handoff / brand-voice
 * / SLA / value-proof) at `public/clients/<slug>/pdfs/`.
 *
 * Status quo (2026-05-18): only Tekky / Zenith Sports has been
 * generated. Tekky's PDFs are produced by the hand-written script
 * at `scripts/generate-zenith-onboarding-pdfs.py` — 2320 lines,
 * Zenith-specific. This schema is the migration target: the next
 * AI System client (ITC) should ship from `clients/itc-quick-
 * attach.json` driving a generic generator, not another 2320-line
 * copy/paste.
 *
 * Migration plan lives in README.md beside this file.
 */

export interface ClientOnboardingConfig {
  /** URL slug — matches /clients/[slug] + Stripe env var convention */
  slug: string;
  /** Brand / business name as it appears on the PDF covers */
  businessName: string;
  /** Internal codename (e.g. "Tekky" for Zenith Sports) — used in
   *  Ben-facing prep docs. Falls back to businessName when omitted. */
  internalName?: string;

  contact: {
    primaryName: string;
    primaryEmail: string;
    primaryRole: string;
    secondaryName?: string;
    secondaryEmail?: string;
    secondaryRole?: string;
  };

  pricing: {
    /** Total contract value in dollars — usually 9700 (pay-in-full) or 10000 (installment) */
    totalUsd: number;
    /** "pay-in-full" | "4-quarter" | "custom" */
    planLabel: string;
    /** Per-installment amount when applicable. Omit for pay-in-full. */
    installmentUsd?: number;
    /** ISO date strings (YYYY-MM-DD) when each installment is due */
    installmentDueDates?: string[];
  };

  brand: {
    /** Hex strings — picked up by ReportLab as cover accent + body highlights */
    primaryHex: string;
    accentHex: string;
    /** Optional second accent for tables / dividers. Falls back to a slate. */
    secondaryHex?: string;
    /** One-sentence positioning line for the handoff cover page */
    positioning: string;
  };

  /** Public site URL for the handoff packet "your site is live at..." section */
  liveSiteUrl: string;
  /** Stripe Payment Link URL conventions — env vars per CLAUDE.md.
   *  Stored here for reference + included verbatim in the PDF body. */
  paymentLinks: {
    primary: { label: string; envVar: string };
    /** Additional installment / full-pay links if the client has multiple */
    secondary?: { label: string; envVar: string }[];
  };

  /** AI System feature toggles relevant to the client's vertical.
   *  Surfaces in the value-proof PDF as the "what's included" matrix. */
  featureFlags: {
    aiOperator: boolean;
    hyperloopWeekly: boolean;
    affiliatePipeline: boolean;
    weeklyReports: boolean;
    /** Per-category extras (e.g. soccer drill-of-week for Tekky) */
    verticalExtras?: string[];
  };

  /** Launch metadata — ISO date strings */
  schedule: {
    /** When the offer was signed */
    signedAt: string;
    /** When Phase 0 onboarding starts (typically signedAt + 1 day) */
    onboardingStartsAt: string;
    /** Target go-live date for the site */
    goLiveAt: string;
  };

  /** Manual sign-off URL fragments — sign pages at /sign/[slug]/<doc> */
  signDocs: {
    handoff: boolean;
    brandVoice: boolean;
    sla: boolean;
    valueProof: boolean;
  };
}

export const ONBOARDING_DOC_NAMES = [
  "handoff",
  "brand-voice",
  "sla",
  "value-proof",
] as const;

export type OnboardingDocName = (typeof ONBOARDING_DOC_NAMES)[number];
