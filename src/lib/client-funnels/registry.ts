/**
 * Per-client funnel registry. Maps client_slug → funnel module + sender
 * config (from address, reply-to, sms number).
 *
 * Adding a new client:
 *   1. Create src/lib/client-funnels/{slug}.ts with a getFunnel(audience)
 *      and listFunnels() export, mirroring zenith-sports.ts.
 *   2. Add an entry to CLIENT_FUNNELS below with sender + sms config.
 *
 * Sender notes:
 *   - `from.email` MUST be on a domain that's DKIM-aligned in SendGrid.
 *     Until a client's own domain is set up, route through bluejayportfolio.com
 *     and override `from.name` so the inbox display reads as the client.
 *   - `replyTo` lets us send from a deliverable address while routing
 *     replies back to the client's actual inbox.
 *   - `sms.from` is the Twilio number to send from. If unset, SMS sends are
 *     marked 'skipped' and logged but not actually attempted (used while we
 *     wait for Philip to provision Zenith's Twilio number).
 */

import type { AudienceFunnel } from "./zenith-sports";
import { getZenithFunnel, listZenithFunnels } from "./zenith-sports";
import { getOITFunnel, listOITFunnels } from "./olympic-inspections";
import type { ClientLeadAudience } from "../client-leads";

export type ClientFunnelConfig = {
  /** Display name used by the dashboard. */
  label: string;
  sender: {
    /** From address — must be DKIM-aligned with the SendGrid auth domain. */
    email: string;
    /** Inbox display name. e.g. "Philip @ Zenith Sports / TEKKY®" */
    name: string;
    /** Where replies route. */
    replyTo: string;
  };
  sms: {
    /** E.164 Twilio number. Null = SMS sends skipped (logged, not attempted). */
    from: string | null;
  };
  /** Missed-call → text-back behavior. */
  missedCall?: {
    /**
     * "always" = auto-text every missed caller
     * "after-hours" = only text if outside the after-hours window
     * "off" = log the call but never auto-text
     */
    mode: "always" | "after-hours" | "off";
    /**
     * Outbound text body. {{firstName}} not available (we don't know
     * the caller yet); keep it warm and self-introducing.
     */
    text: string;
    /** For "after-hours" mode — local hour the auto-text turns on. */
    afterHoursStart?: number;
    /** For "after-hours" mode — local hour the auto-text turns off. */
    afterHoursEnd?: number;
    /** Local timezone for the after-hours calc. */
    timezone?: string;
  };
  /** Look up the funnel for a given audience. */
  getFunnel: (audience: ClientLeadAudience | null) => AudienceFunnel | null;
  /** All defined audience funnels for this client. */
  listFunnels: () => AudienceFunnel[];
};

/* ─────────────────────────── REGISTRY ─────────────────────────── */

export const CLIENT_FUNNELS: Record<string, ClientFunnelConfig> = {
  "zenith-sports": {
    label: "Zenith Sports / TEKKY®",
    sender: {
      // Until DKIM is wired on zenithsports.org, send From a verified
      // BlueJay-managed address with a Zenith display name. Replies route
      // to info@zenithsports.org. Once their DNS is set up, flip
      // `email` to "info@zenithsports.org".
      // See client_tasks: "Confirm whether to authenticate sending domain"
      email: "ben@bluejayportfolio.com",
      name: "Philip @ Zenith Sports / TEKKY®",
      replyTo: "info@zenithsports.org",
    },
    // Missed-call → text-back behavior. Decision logged 2026-05-04 by
    // Ben: ALWAYS-ON. Auto-fires once ZENITH_TWILIO_NUMBER is set.
    missedCall: {
      mode: "always",
      text:
        "Hi, this is Philip @ TEKKY® — sorry I missed your call. Quickest reply is text. What's the best way to help — info on the ball, club demo, or training?",
    },
    sms: {
      // Until Philip provisions a Twilio number (see client_tasks),
      // SMS sends are logged but not attempted. The runner records each
      // skipped send so reporting still shows what *would* have fired.
      from: process.env.ZENITH_TWILIO_NUMBER || null,
    },
    getFunnel: getZenithFunnel,
    listFunnels: listZenithFunnels,
  },

  "olympic-inspections": {
    label: "Olympic Inspections & Testing",
    sender: {
      // Until DKIM is wired on olympicinspect.com (post domain
      // transfer), send from a verified BlueJay-managed address with
      // an OIT display name. Replies route to the actual OIT inbox.
      email: "ben@bluejayportfolio.com",
      name: "Olympic Inspections & Testing",
      replyTo: "info@olympicinspect.com",
    },
    missedCall: {
      mode: "always",
      text:
        "Hi, this is Olympic Inspections — sorry I missed your call. Quickest reply is text. Looking for mold inspection, real-estate report, or insurance claim help?",
    },
    sms: {
      // Until OIT provisions a Twilio number, SMS sends are logged
      // but not attempted. The runner records each skipped send so
      // reporting still shows what *would* have fired.
      from: process.env.OIT_TWILIO_NUMBER || null,
    },
    getFunnel: getOITFunnel,
    listFunnels: listOITFunnels,
  },
};

export function getClientFunnelConfig(
  clientSlug: string,
): ClientFunnelConfig | null {
  return CLIENT_FUNNELS[clientSlug] ?? null;
}
