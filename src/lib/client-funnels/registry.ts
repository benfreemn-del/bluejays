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
    sms: {
      // Until Philip provisions a Twilio number (see client_tasks),
      // SMS sends are logged but not attempted. The runner records each
      // skipped send so reporting still shows what *would* have fired.
      from: process.env.ZENITH_TWILIO_NUMBER || null,
    },
    getFunnel: getZenithFunnel,
    listFunnels: listZenithFunnels,
  },
};

export function getClientFunnelConfig(
  clientSlug: string,
): ClientFunnelConfig | null {
  return CLIENT_FUNNELS[clientSlug] ?? null;
}
