/**
 * Domain Registrar Abstraction
 * ----------------------------
 * Provider-agnostic interface for registering / renewing domains so we can
 * swap Namecheap → Porkbun → Cloudflare later without touching the API
 * routes or store helpers.
 *
 * Two implementations ship today:
 *   - namecheapClient — REST API integration (sandbox-aware via NAMECHEAP_SANDBOX)
 *   - mockClient      — deterministic responses for dev / testing without
 *                        burning real registrations
 *
 * Factory: getRegistrar(name?) returns the right client. Defaults to
 * "namecheap" when NAMECHEAP_API_KEY is set, otherwise "mock".
 *
 * Required env vars to flip from mock → live:
 *   NAMECHEAP_API_USER     — your Namecheap account username
 *   NAMECHEAP_API_KEY      — your API key from namecheap.com/myaccount/apiaccess
 *   NAMECHEAP_USERNAME     — usually same as API_USER
 *   NAMECHEAP_CLIENT_IP    — the static IP you whitelisted in your Namecheap account
 *   NAMECHEAP_SANDBOX      — set to "true" while testing against the sandbox API
 *
 * API docs: https://www.namecheap.com/support/api/methods/
 *
 * Cost logging: every method invokes logCost() with service "domain_registrar"
 * and the dollar amount (initial cost on register, $0 for non-billable calls
 * like checkAvailability). Errors are wrapped in RegistrarError with a typed
 * code and the raw registrar response in `details` for debugging.
 */

import { logCost } from "./cost-logger";

export type RegistrarName = "namecheap" | "porkbun" | "mock";

export interface AvailabilityResult {
  available: boolean;
  /** USD price the registrar quoted for a 1-year .com (or category default). */
  price?: number;
}

export interface RegisterOpts {
  /** Registration term in years (default 1). */
  years?: number;
  /** Contact info — falls back to env-configured defaults if omitted. */
  contact?: {
    firstName?: string;
    lastName?: string;
    address1?: string;
    city?: string;
    stateProvince?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
    emailAddress?: string;
  };
  /** Optional name servers to set immediately on register. */
  nameservers?: string[];
}

export interface RegisterResult {
  /** The registrar's opaque order/domain ID, persisted in domains.registrar_order_id. */
  orderId: string;
  /** Confirmed domain name (echo of the input, normalized). */
  domain: string;
  /** When the domain was registered (registrar's clock). */
  registeredAt: Date;
  /** Renewal expiration date returned by the registrar. */
  expiresAt: Date;
  /** Actual USD amount charged for this registration. */
  costUsd: number;
  /** Raw registrar response for the metadata column. */
  raw?: unknown;
}

export interface RenewResult {
  orderId: string;
  domain: string;
  newExpiresAt: Date;
  costUsd: number;
  raw?: unknown;
}

export interface RegistrarClient {
  name: RegistrarName;
  checkAvailability(domain: string): Promise<AvailabilityResult>;
  register(domain: string, opts: RegisterOpts): Promise<RegisterResult>;
  setNameservers(domain: string, nameservers: string[]): Promise<void>;
  getExpiry(domain: string): Promise<Date | null>;
  renew(domain: string, years: number): Promise<RenewResult>;
}

/** Typed error class — every registrar call throws this on failure. */
export class RegistrarError extends Error {
  code: string;
  details?: unknown;
  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = "RegistrarError";
    this.code = code;
    this.details = details;
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Mock client — deterministic, no network. Default in dev.
// ──────────────────────────────────────────────────────────────────────────

function deterministicHash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export const mockClient: RegistrarClient = {
  name: "mock",

  async checkAvailability(domain: string) {
    const normalized = normalizeDomain(domain);
    // Domains starting with "taken" or with hash % 7 === 0 are pretend-taken.
    const hash = deterministicHash(normalized);
    const available =
      !normalized.startsWith("taken") && hash % 7 !== 0;
    const result: AvailabilityResult = {
      available,
      price: available ? 11.0 : undefined,
    };
    await logCost({
      service: "domain_registrar",
      action: `mock.checkAvailability:${normalized}`,
      costUsd: 0,
      metadata: { available, registrar: "mock" },
    });
    return result;
  },

  async register(domain: string, opts: RegisterOpts) {
    const normalized = normalizeDomain(domain);
    const years = Math.max(1, opts.years ?? 1);
    const costUsd = 11.0 * years;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + years * 365 * 24 * 60 * 60 * 1000);
    const result: RegisterResult = {
      orderId: `mock_${deterministicHash(normalized).toString(36)}`,
      domain: normalized,
      registeredAt: now,
      expiresAt,
      costUsd,
      raw: { mock: true, years, opts },
    };
    await logCost({
      service: "domain_registrar",
      action: `mock.register:${normalized}`,
      costUsd,
      metadata: { years, registrar: "mock", orderId: result.orderId },
    });
    return result;
  },

  async setNameservers(domain: string, nameservers: string[]) {
    const normalized = normalizeDomain(domain);
    await logCost({
      service: "domain_registrar",
      action: `mock.setNameservers:${normalized}`,
      costUsd: 0,
      metadata: { nameservers, registrar: "mock" },
    });
  },

  async getExpiry(domain: string) {
    const normalized = normalizeDomain(domain);
    // Mock: 1 year from now.
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    await logCost({
      service: "domain_registrar",
      action: `mock.getExpiry:${normalized}`,
      costUsd: 0,
      metadata: { registrar: "mock" },
    });
    return expiresAt;
  },

  async renew(domain: string, years: number) {
    const normalized = normalizeDomain(domain);
    const costUsd = 11.0 * years;
    const newExpiresAt = new Date(Date.now() + years * 365 * 24 * 60 * 60 * 1000);
    const result: RenewResult = {
      orderId: `mock_${deterministicHash(normalized).toString(36)}`,
      domain: normalized,
      newExpiresAt,
      costUsd,
      raw: { mock: true, years },
    };
    await logCost({
      service: "domain_registrar",
      action: `mock.renew:${normalized}`,
      costUsd,
      metadata: { years, registrar: "mock" },
    });
    return result;
  },
};

// ──────────────────────────────────────────────────────────────────────────
// Namecheap client — REST API. Sandbox via NAMECHEAP_SANDBOX=true.
// ──────────────────────────────────────────────────────────────────────────

const NAMECHEAP_BASE = (sandbox: boolean) =>
  sandbox
    ? "https://api.sandbox.namecheap.com/xml.response"
    : "https://api.namecheap.com/xml.response";

interface NamecheapEnv {
  apiUser: string;
  apiKey: string;
  username: string;
  clientIp: string;
  sandbox: boolean;
}

function readNamecheapEnv(): NamecheapEnv | null {
  const apiUser = process.env.NAMECHEAP_API_USER;
  const apiKey = process.env.NAMECHEAP_API_KEY;
  const username = process.env.NAMECHEAP_USERNAME || apiUser;
  const clientIp = process.env.NAMECHEAP_CLIENT_IP;
  if (!apiUser || !apiKey || !username || !clientIp) return null;
  return {
    apiUser,
    apiKey,
    username,
    clientIp,
    sandbox: (process.env.NAMECHEAP_SANDBOX || "").toLowerCase() === "true",
  };
}

function buildNamecheapUrl(env: NamecheapEnv, command: string, params: Record<string, string>): string {
  const usp = new URLSearchParams({
    ApiUser: env.apiUser,
    ApiKey: env.apiKey,
    UserName: env.username,
    ClientIp: env.clientIp,
    Command: command,
    ...params,
  });
  return `${NAMECHEAP_BASE(env.sandbox)}?${usp.toString()}`;
}

/**
 * Tiny tag-extraction helper. Namecheap returns XML, not JSON. To avoid an
 * xml-parser dependency for a backend-foundation task that won't actually
 * run live in this session, we use targeted regex over known tags.
 * Replace with a real XML parser (`fast-xml-parser`) before flipping to live.
 */
function extractAttribute(xml: string, tag: string, attr: string): string | null {
  const re = new RegExp(`<${tag}[^>]*\\b${attr}\\s*=\\s*"([^"]*)"`, "i");
  const m = xml.match(re);
  return m ? m[1] : null;
}

function extractStatus(xml: string): { ok: boolean; errorMessage?: string } {
  const status = extractAttribute(xml, "ApiResponse", "Status");
  if (status && status.toLowerCase() === "ok") return { ok: true };
  const errMatch = xml.match(/<Error[^>]*>([^<]*)<\/Error>/i);
  return { ok: false, errorMessage: errMatch ? errMatch[1] : "Unknown registrar error" };
}

async function namecheapFetch(env: NamecheapEnv, command: string, params: Record<string, string>): Promise<string> {
  const url = buildNamecheapUrl(env, command, params);
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) {
    throw new RegistrarError(
      "namecheap_http_error",
      `Namecheap HTTP ${res.status}`,
      { status: res.status, command }
    );
  }
  const text = await res.text();
  const status = extractStatus(text);
  if (!status.ok) {
    throw new RegistrarError(
      "namecheap_api_error",
      status.errorMessage || "Registrar returned non-OK status",
      { command, body: text.slice(0, 1000) }
    );
  }
  return text;
}

export const namecheapClient: RegistrarClient = {
  name: "namecheap",

  async checkAvailability(domain: string) {
    const env = readNamecheapEnv();
    if (!env) throw new RegistrarError("not_configured", "Namecheap env vars missing");
    const normalized = normalizeDomain(domain);
    try {
      const xml = await namecheapFetch(env, "namecheap.domains.check", { DomainList: normalized });
      const available = extractAttribute(xml, "DomainCheckResult", "Available");
      const priceStr = extractAttribute(xml, "DomainCheckResult", "PremiumRegistrationPrice");
      const price = priceStr ? parseFloat(priceStr) : 11.0;
      const result: AvailabilityResult = {
        available: (available || "").toLowerCase() === "true",
        price,
      };
      await logCost({
        service: "domain_registrar",
        action: `namecheap.checkAvailability:${normalized}`,
        costUsd: 0,
        metadata: { available: result.available, registrar: "namecheap" },
      });
      return result;
    } catch (err) {
      if (err instanceof RegistrarError) throw err;
      throw new RegistrarError("namecheap_unknown", (err as Error).message, err);
    }
  },

  async register(domain: string, opts: RegisterOpts) {
    const env = readNamecheapEnv();
    if (!env) throw new RegistrarError("not_configured", "Namecheap env vars missing");
    const normalized = normalizeDomain(domain);
    const years = Math.max(1, opts.years ?? 1);

    // Idempotency: pre-check availability so a busy domain returns a clean
    // error rather than a registrar-cryptic one.
    const avail = await this.checkAvailability(normalized);
    if (!avail.available) {
      throw new RegistrarError("domain_unavailable", `${normalized} is not available`);
    }

    const c = opts.contact || {};
    const params: Record<string, string> = {
      DomainName: normalized,
      Years: String(years),
      // Registrant + Tech + Admin + AuxBilling all populated from the same
      // contact block. Namecheap requires every contact role to be present.
      RegistrantFirstName: c.firstName || "Ben",
      RegistrantLastName: c.lastName || "Frohman",
      RegistrantAddress1: c.address1 || "123 Main St",
      RegistrantCity: c.city || "Sequim",
      RegistrantStateProvince: c.stateProvince || "WA",
      RegistrantPostalCode: c.postalCode || "98382",
      RegistrantCountry: c.country || "US",
      RegistrantPhone: c.phone || "+1.2538863753",
      RegistrantEmailAddress: c.emailAddress || "bluejaycontactme@gmail.com",
    };
    // Mirror to Tech / Admin / AuxBilling roles.
    for (const role of ["Tech", "Admin", "AuxBilling"]) {
      for (const [k, v] of Object.entries(params)) {
        if (k.startsWith("Registrant")) params[`${role}${k.slice("Registrant".length)}`] = v;
      }
    }
    if (opts.nameservers && opts.nameservers.length > 0) {
      params.Nameservers = opts.nameservers.join(",");
    }

    try {
      const xml = await namecheapFetch(env, "namecheap.domains.create", params);
      const orderId =
        extractAttribute(xml, "DomainCreateResult", "DomainID") ||
        extractAttribute(xml, "DomainCreateResult", "OrderID") ||
        "";
      const chargedStr = extractAttribute(xml, "DomainCreateResult", "ChargedAmount");
      const costUsd = chargedStr ? parseFloat(chargedStr) : (avail.price || 11.0) * years;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + years * 365 * 24 * 60 * 60 * 1000);
      const result: RegisterResult = {
        orderId: orderId || `namecheap_${normalized}`,
        domain: normalized,
        registeredAt: now,
        expiresAt,
        costUsd,
        raw: xml.slice(0, 2000),
      };
      await logCost({
        service: "domain_registrar",
        action: `namecheap.register:${normalized}`,
        costUsd,
        metadata: { years, registrar: "namecheap", orderId: result.orderId },
      });
      return result;
    } catch (err) {
      if (err instanceof RegistrarError) throw err;
      throw new RegistrarError("namecheap_unknown", (err as Error).message, err);
    }
  },

  async setNameservers(domain: string, nameservers: string[]) {
    const env = readNamecheapEnv();
    if (!env) throw new RegistrarError("not_configured", "Namecheap env vars missing");
    const normalized = normalizeDomain(domain);
    const [sld, ...tldParts] = normalized.split(".");
    const tld = tldParts.join(".");
    try {
      // namecheap.domains.dns.setHosts requires SLD + TLD + host record
      // entries. For "set the auth NS instead", use namecheap.domains.dns.setCustom.
      // We'll use setCustom for nameserver changes (typical Vercel hand-off use case).
      await namecheapFetch(env, "namecheap.domains.dns.setCustom", {
        SLD: sld,
        TLD: tld,
        Nameservers: nameservers.join(","),
      });
      await logCost({
        service: "domain_registrar",
        action: `namecheap.setNameservers:${normalized}`,
        costUsd: 0,
        metadata: { nameservers, registrar: "namecheap" },
      });
    } catch (err) {
      if (err instanceof RegistrarError) throw err;
      throw new RegistrarError("namecheap_unknown", (err as Error).message, err);
    }
  },

  async getExpiry(domain: string) {
    const env = readNamecheapEnv();
    if (!env) throw new RegistrarError("not_configured", "Namecheap env vars missing");
    const normalized = normalizeDomain(domain);
    try {
      const xml = await namecheapFetch(env, "namecheap.domains.getInfo", { DomainName: normalized });
      const expires = extractAttribute(xml, "DomainDetails", "ExpiredDate") ||
        (xml.match(/<ExpiredDate>([^<]+)<\/ExpiredDate>/) || [])[1];
      await logCost({
        service: "domain_registrar",
        action: `namecheap.getExpiry:${normalized}`,
        costUsd: 0,
        metadata: { registrar: "namecheap" },
      });
      return expires ? new Date(expires) : null;
    } catch (err) {
      if (err instanceof RegistrarError) throw err;
      throw new RegistrarError("namecheap_unknown", (err as Error).message, err);
    }
  },

  async renew(domain: string, years: number) {
    const env = readNamecheapEnv();
    if (!env) throw new RegistrarError("not_configured", "Namecheap env vars missing");
    const normalized = normalizeDomain(domain);
    const yrs = Math.max(1, years);
    try {
      const xml = await namecheapFetch(env, "namecheap.domains.renew", {
        DomainName: normalized,
        Years: String(yrs),
      });
      const orderId =
        extractAttribute(xml, "DomainRenewResult", "DomainID") ||
        extractAttribute(xml, "DomainRenewResult", "OrderID") ||
        "";
      const chargedStr = extractAttribute(xml, "DomainRenewResult", "ChargedAmount");
      const costUsd = chargedStr ? parseFloat(chargedStr) : 11.0 * yrs;
      const newExpiresAt = new Date(Date.now() + yrs * 365 * 24 * 60 * 60 * 1000);
      const result: RenewResult = {
        orderId: orderId || `namecheap_${normalized}`,
        domain: normalized,
        newExpiresAt,
        costUsd,
        raw: xml.slice(0, 2000),
      };
      await logCost({
        service: "domain_registrar",
        action: `namecheap.renew:${normalized}`,
        costUsd,
        metadata: { years: yrs, registrar: "namecheap", orderId: result.orderId },
      });
      return result;
    } catch (err) {
      if (err instanceof RegistrarError) throw err;
      throw new RegistrarError("namecheap_unknown", (err as Error).message, err);
    }
  },
};

// ──────────────────────────────────────────────────────────────────────────
// Factory + helpers
// ──────────────────────────────────────────────────────────────────────────

export function getRegistrar(name?: RegistrarName): RegistrarClient {
  const explicit = name;
  if (explicit === "mock") return mockClient;
  if (explicit === "namecheap") return namecheapClient;
  // Auto-pick: namecheap if env configured, otherwise mock.
  const env = readNamecheapEnv();
  if (env) return namecheapClient;
  return mockClient;
}

/** Lowercase + trim a domain string. Strips a leading "www." for storage. */
export function normalizeDomain(domain: string): string {
  let d = (domain || "").trim().toLowerCase();
  if (d.startsWith("http://")) d = d.slice(7);
  if (d.startsWith("https://")) d = d.slice(8);
  if (d.startsWith("www.")) d = d.slice(4);
  d = d.replace(/\/.*$/, "");
  return d;
}

/** Compute the next-renewal target — typically expires_at minus 30 days. */
export function computeNextRenewal(expiresAt: Date, daysBeforeExpiry: number = 30): Date {
  return new Date(expiresAt.getTime() - daysBeforeExpiry * 24 * 60 * 60 * 1000);
}
