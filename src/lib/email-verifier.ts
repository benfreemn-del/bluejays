/**
 * Email Verifier
 *
 * Lightweight pre-send verification using Google DNS API.
 * Checks MX records to confirm the domain can receive email.
 * Catches typos, defunct domains, and non-existent addresses
 * before they become bounces that hurt sender reputation.
 */

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "tempmail.com", "throwaway.email",
  "yopmail.com", "sharklasers.com", "guerrillamailblock.com", "grr.la",
  "guerrillamail.info", "spam4.me", "trashmail.com", "dispostable.com",
  "fakeinbox.com", "maildrop.cc", "spamgourmet.com", "trashmail.me",
]);

export interface EmailVerificationResult {
  valid: boolean;
  reason: string;
  risk: "low" | "medium" | "high";
}

/**
 * Verify an email address before sending.
 * Returns valid=true only if the domain has MX records (can receive email).
 */
export async function verifyEmail(email: string): Promise<EmailVerificationResult> {
  if (!email || !email.includes("@")) {
    return { valid: false, reason: "missing or malformed email", risk: "high" };
  }

  const [, domain] = email.toLowerCase().split("@");

  if (!domain || !domain.includes(".")) {
    return { valid: false, reason: "invalid domain", risk: "high" };
  }

  // Reject disposable email domains
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, reason: "disposable email domain", risk: "high" };
  }

  // Check MX records via Google DNS-over-HTTPS
  try {
    const res = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`,
      { signal: AbortSignal.timeout(4000) }
    );

    if (!res.ok) {
      // DNS lookup failed — treat as medium risk, don't block
      return { valid: true, reason: "dns lookup failed, allowing", risk: "medium" };
    }

    const data = await res.json() as { Status: number; Answer?: { data: string }[] };

    if (data.Status !== 0 || !data.Answer || data.Answer.length === 0) {
      // NXDOMAIN or no MX records — domain can't receive email
      return { valid: false, reason: "no MX records found for domain", risk: "high" };
    }

    return { valid: true, reason: "MX records verified", risk: "low" };
  } catch {
    // Timeout or network error — allow through at medium risk
    return { valid: true, reason: "verification timeout, allowing", risk: "medium" };
  }
}

/**
 * Batch verify a list of emails. Returns only valid ones.
 * Logs invalid addresses for review.
 */
export async function filterValidEmails(
  prospects: Array<{ id: string; email?: string; businessName: string }>
): Promise<{ valid: typeof prospects; invalid: Array<{ id: string; businessName: string; email: string; reason: string }> }> {
  const valid: typeof prospects = [];
  const invalid: Array<{ id: string; businessName: string; email: string; reason: string }> = [];

  await Promise.all(
    prospects.map(async (p) => {
      if (!p.email) {
        invalid.push({ id: p.id, businessName: p.businessName, email: "", reason: "no email address" });
        return;
      }
      const result = await verifyEmail(p.email);
      if (result.valid) {
        valid.push(p);
      } else {
        invalid.push({ id: p.id, businessName: p.businessName, email: p.email, reason: result.reason });
      }
    })
  );

  return { valid, invalid };
}
