/**
 * Global outbound-email guard.
 *
 * ───────────────────────────────────────────────────────────────────────
 * WHY THIS EXISTS
 *
 * `BLUEJAYS_EMAILS_PAUSED` used to live inside `sendEmail()` only, so it
 * covered the funnel/lifecycle path and nothing else. Every code path
 * that called SendGrid directly — agency-nurture, the weekly work-log
 * digest, client-funnel touches, winback, campaign blasts — sailed
 * straight past it. Setting the flag looked like "all email stopped"
 * while a multi-step marketing sequence kept going out.
 *
 * This module is now the single source of truth. Every outbound send in
 * the codebase asks it for permission first, classified by category.
 *
 * ───────────────────────────────────────────────────────────────────────
 * CATEGORIES
 *
 *   "marketing"     — anything we send to sell, nurture, survey, report,
 *                     or re-engage. Cold outreach, audit follow-ups,
 *                     agency nurture, NPS, referral asks, win/loss
 *                     surveys, campaign blasts, client-funnel touches,
 *                     weekly digests, monthly reports, winback.
 *
 *   "transactional" — a real person did a thing and someone is waiting
 *                     on the result. Contact-form lead forwards to
 *                     client owners, booking confirmations, inquiry
 *                     acknowledgments, purchase receipts. Blocking
 *                     these breaks live client businesses — this is the
 *                     exact failure CLAUDE.md Rule 68 was written for
 *                     (Hector lost 3 landscape jobs to a silent drop).
 *
 *   "internal"      — alerts to Ben. Owner SMS/email copies, watchdog
 *                     pings, cron failure notices. Never marketing,
 *                     never customer-facing.
 *
 * ───────────────────────────────────────────────────────────────────────
 * MODES  (env var BLUEJAYS_EMAILS_PAUSED)
 *
 *   unset / "marketing" / "true" / "1" / "yes" / "on"
 *        → DEFAULT. Blocks "marketing". Transactional + internal flow.
 *          Nothing markets to anyone; client lead-forwards and booking
 *          confirmations still land.
 *
 *   "all" / "everything"
 *        → Blocks every category including client lead forwards. The
 *          domain goes fully silent. Use only when you accept that
 *          clients stop receiving leads.
 *
 *   "off" / "false" / "0" / "none" / "resume"
 *        → Nothing is paused. Full sending resumed.
 *
 * NOTE THE DEFAULT IS "PAUSED". This fails closed on purpose (set
 * 2026-07-31 at Ben's request to stop all outbound marketing email).
 * An unset env var means marketing email does NOT go out. To resume,
 * you must explicitly set BLUEJAYS_EMAILS_PAUSED=off.
 * ───────────────────────────────────────────────────────────────────────
 */

/**
 * Prospect statuses that mean "never send this person marketing email
 * again", regardless of what a given cron's own filter says.
 *
 * `unsubscribed` — they clicked the unsubscribe link (POST
 *   /api/unsubscribe/[id] sets status + funnelPaused).
 * `bounced` — hard bounce, or 3 soft bounces in 7 days (CLAUDE.md
 *   Rule 42). Also suppressed at the SendGrid group level.
 *
 * Note `sendEmail()` checks the hard-bounce list by address but has no
 * visibility into prospect status, so any cron that assembles its own
 * recipient set must filter on this itself. The win-loss survey cron
 * shipped without that filter and emailed opted-out people for months.
 */
export const SUPPRESSED_PROSPECT_STATUSES: readonly string[] = [
  "unsubscribed",
  "bounced",
];

export type EmailCategory = "marketing" | "transactional" | "internal";

export type EmailPauseMode = "off" | "marketing" | "all";

/**
 * What an unset BLUEJAYS_EMAILS_PAUSED means. Fails closed: no env var
 * configured anywhere = marketing email is off.
 */
export const DEFAULT_PAUSE_MODE: EmailPauseMode = "marketing";

/** Thrown by `assertEmailAllowed`. Callers catch this like any send failure. */
export class EmailPausedError extends Error {
  readonly category: EmailCategory;
  readonly mode: EmailPauseMode;
  constructor(category: EmailCategory, mode: EmailPauseMode, detail: string) {
    super(
      `BlueJays outbound email is paused (BLUEJAYS_EMAILS_PAUSED=${mode}). ` +
        `Suppressed a "${category}" send. ${detail}`,
    );
    this.name = "EmailPausedError";
    this.category = category;
    this.mode = mode;
  }
}

/** Resolve the current pause mode from the environment. */
export function getEmailPauseMode(): EmailPauseMode {
  const raw = (process.env.BLUEJAYS_EMAILS_PAUSED ?? "").trim().toLowerCase();

  if (raw === "") return DEFAULT_PAUSE_MODE;

  if (["off", "false", "0", "no", "none", "resume", "unpaused"].includes(raw)) {
    return "off";
  }
  if (["all", "everything", "hard", "total"].includes(raw)) {
    return "all";
  }
  if (["marketing", "true", "1", "yes", "on", "paused"].includes(raw)) {
    return "marketing";
  }

  // Unrecognised value → fail closed on marketing rather than guessing
  // that someone meant "off". A typo must never resume outreach.
  console.warn(
    `[email-guard] Unrecognised BLUEJAYS_EMAILS_PAUSED value "${raw}" — ` +
      `defaulting to "${DEFAULT_PAUSE_MODE}" (fail closed).`,
  );
  return DEFAULT_PAUSE_MODE;
}

/** Which categories the given mode blocks. */
export function blockedCategories(mode: EmailPauseMode): EmailCategory[] {
  if (mode === "all") return ["marketing", "transactional", "internal"];
  if (mode === "marketing") return ["marketing"];
  return [];
}

/** True when a send of this category is currently permitted. */
export function isEmailAllowed(category: EmailCategory): boolean {
  return !blockedCategories(getEmailPauseMode()).includes(category);
}

/**
 * Throw if this category is currently paused. Use in code paths whose
 * callers already treat a thrown error as "send failed" (so no
 * `*_sent_at` flag gets stamped and the send resumes automatically once
 * the pause lifts).
 */
export function assertEmailAllowed(
  category: EmailCategory,
  ctx: { to?: string; subject?: string } = {},
): void {
  const mode = getEmailPauseMode();
  if (!blockedCategories(mode).includes(category)) return;

  const where = ctx.to ? ` to ${ctx.to}` : "";
  const what = ctx.subject ? ` (subject: "${ctx.subject.slice(0, 60)}")` : "";
  console.log(
    `  [EMAILS_PAUSED:${mode}] Suppressed ${category} send${where}${what}. ` +
      `Set BLUEJAYS_EMAILS_PAUSED=off to resume.`,
  );
  throw new EmailPausedError(
    category,
    mode,
    `Set BLUEJAYS_EMAILS_PAUSED=off to resume.`,
  );
}

/**
 * Non-throwing variant for call sites that return a boolean instead of
 * raising (e.g. `sendEmailTo`). Logs identically. Returns true when the
 * send was blocked.
 */
export function blockEmailIfPaused(
  category: EmailCategory,
  ctx: { to?: string; subject?: string } = {},
): boolean {
  const mode = getEmailPauseMode();
  if (!blockedCategories(mode).includes(category)) return false;

  const where = ctx.to ? ` to ${ctx.to}` : "";
  const what = ctx.subject ? ` (subject: "${ctx.subject.slice(0, 60)}")` : "";
  console.log(
    `  [EMAILS_PAUSED:${mode}] Suppressed ${category} send${where}${what}. ` +
      `Set BLUEJAYS_EMAILS_PAUSED=off to resume.`,
  );
  return true;
}

/** Dashboard-facing summary of the current state. */
export function emailPauseStatus(): {
  mode: EmailPauseMode;
  blocked: EmailCategory[];
  usingDefault: boolean;
  rawValue: string | null;
} {
  const raw = process.env.BLUEJAYS_EMAILS_PAUSED ?? null;
  const mode = getEmailPauseMode();
  return {
    mode,
    blocked: blockedCategories(mode),
    usingDefault: raw === null || raw.trim() === "",
    rawValue: raw,
  };
}
