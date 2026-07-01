/**
 * RDAP expiry lookup — free, no API key, works for domains on ANY registrar
 * (not just our Namecheap account). Used by the Command center to fill expiry
 * dates for client-owned / Wix / other-registrar domains so they still get
 * color-coded and swept into the renewal-reminder digest.
 *
 * rdap.org is the IANA bootstrap resolver: it 302-redirects to the
 * authoritative RDAP server for the domain's TLD, and fetch follows the
 * redirect. RDAP is the modern JSON replacement for WHOIS. Coverage is good
 * for .com/.net/.org and most gTLDs; some ccTLDs don't publish RDAP (returns
 * null → the domain just stays "unknown" until entered manually).
 */

export interface RdapExpiryResult {
  expiresAt: string | null;   // ISO string
  registeredAt: string | null;
  registrar: string | null;
  ok: boolean;
  error?: string;
}

function normalize(domain: string): string {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
}

export async function lookupExpiryViaRdap(domain: string): Promise<RdapExpiryResult> {
  const d = normalize(domain);
  if (!d || !d.includes(".")) {
    return { expiresAt: null, registeredAt: null, registrar: null, ok: false, error: "invalid domain" };
  }
  try {
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(d)}`, {
      headers: { Accept: "application/rdap+json" },
      // rdap.org 302-redirects to the TLD's authoritative server; the whole
      // chain can be slow, so allow generous headroom (Vercel functions can
      // afford it — this only runs on manual refresh + the weekly cron).
      signal: AbortSignal.timeout(20_000),
      redirect: "follow",
    });
    if (!res.ok) {
      return { expiresAt: null, registeredAt: null, registrar: null, ok: false, error: `RDAP HTTP ${res.status}` };
    }
    const json = (await res.json()) as {
      events?: Array<{ eventAction?: string; eventDate?: string }>;
      entities?: Array<{ roles?: string[]; vcardArray?: unknown }>;
    };
    const events = Array.isArray(json.events) ? json.events : [];
    const findEvent = (action: string) =>
      events.find((e) => (e?.eventAction || "").toLowerCase() === action)?.eventDate ?? null;

    const expRaw = findEvent("expiration");
    const regRaw = findEvent("registration");

    // Registrar name lives in the entity with role "registrar" — dig the fn
    // out of its jCard (vcardArray). Best-effort; null if not present.
    let registrar: string | null = null;
    const registrarEntity = (json.entities || []).find((e) => (e.roles || []).includes("registrar"));
    if (registrarEntity && Array.isArray(registrarEntity.vcardArray)) {
      const vcard = registrarEntity.vcardArray[1];
      if (Array.isArray(vcard)) {
        const fn = vcard.find((f: unknown) => Array.isArray(f) && f[0] === "fn");
        if (Array.isArray(fn) && typeof fn[3] === "string") registrar = fn[3];
      }
    }

    return {
      expiresAt: expRaw ? new Date(expRaw).toISOString() : null,
      registeredAt: regRaw ? new Date(regRaw).toISOString() : null,
      registrar,
      ok: true,
    };
  } catch (err) {
    return {
      expiresAt: null,
      registeredAt: null,
      registrar: null,
      ok: false,
      error: (err as Error).message,
    };
  }
}
