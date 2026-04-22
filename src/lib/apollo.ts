/**
 * Apollo.io integration — LinkedIn discovery for scouted prospects.
 *
 * WHAT: Given a business name + website, Apollo's People Search API
 * returns the likely business-owner or decision-maker contact including
 * their LinkedIn profile URL. That LinkedIn URL becomes a new outreach
 * channel (manual connection requests at 15-20/day on free tier, or
 * via LinkedIn Sales Navigator / Phantombuster later if we automate).
 *
 * WHY: A LinkedIn message is:
 *   - 100% TCR-free (no A2P 10DLC, no CAN-SPAM, no DNC list overlap)
 *   - Higher-trust (profile photo + work history visible)
 *   - Complements cold email by providing a second visible touchpoint
 *     before the prospect receives their postcard or voicemail
 *
 * REQUIRED ENV VARS:
 *   APOLLO_API_KEY  — set on Vercel when Ben signs up for Apollo
 *                     (Basic plan $30/mo includes 1,200 credits; each
 *                     person-search = 1 credit; 1,000 discoveries/mo
 *                     at current scout volume is plenty of headroom).
 *
 * WHEN TO CALL:
 *   Ideally during scout/scrape pipeline, right after Google Places
 *   data comes back. Don't re-call for the same prospect — Apollo
 *   results go in scrapedData.apolloContact so they're cached.
 *   Skip the call entirely if the env var isn't set (safe no-op
 *   during dev / pre-provisioning).
 *
 * COST NOTE:
 *   Each successful search = 1 Apollo credit (~$0.025 on Basic plan).
 *   At 100 scouted leads/day that's $2.50/day or $75/mo for LinkedIn
 *   coverage across the whole funnel — very cheap for the signal.
 */

export interface ApolloContact {
  fullName: string;
  firstName: string;
  lastName: string;
  title: string;
  linkedinUrl: string | null;
  emailStatus: "verified" | "guessed" | "unavailable";
  seniority: string | null;
  discoveredAt: string;
}

/**
 * Look up the top business-owner / executive contact at the given
 * company via Apollo's People Search API. Returns null if no strong
 * match is found, if the API key isn't configured, or if the call fails.
 *
 * `domain` should be the business website without protocol:
 *   discoverBusinessOwner("Ridgewood Plumbing", "ridgewoodplumbing.com")
 */
export async function discoverBusinessOwner(
  businessName: string,
  domain: string | undefined
): Promise<ApolloContact | null> {
  const apiKey = process.env.APOLLO_API_KEY;
  if (!apiKey) {
    // No key = safe no-op. This is NORMAL during dev / pre-provisioning;
    // do not warn unless explicitly debugging.
    return null;
  }
  if (!businessName && !domain) return null;

  // Apollo's People Search API. The "q_keywords" param is a general
  // search; we combine company name + a seniority filter to bias toward
  // owners / executives. Domain is a strong signal when present.
  const payload: Record<string, unknown> = {
    q_keywords: businessName,
    per_page: 5,
    page: 1,
    // Prefer owner-level / founder / C-suite / VP roles. Apollo indexes
    // these under the `seniority` enum.
    person_seniorities: ["owner", "founder", "c_suite", "vp"],
  };
  if (domain) {
    // organization_names isn't always a reliable filter (domain typos
    // etc.), but when the domain matches Apollo's indexed org it's
    // the strongest signal. Use q_organization_domains as the primary
    // filter when we have a domain.
    payload.q_organization_domains = [domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "")];
  }

  try {
    const res = await fetch("https://api.apollo.io/v1/mixed_people/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const bodyText = await res.text().catch(() => "");
      console.warn(
        `[apollo] Search failed ${res.status}: ${bodyText.slice(0, 200)}`
      );
      return null;
    }

    const data = (await res.json()) as {
      people?: Array<{
        name?: string;
        first_name?: string;
        last_name?: string;
        title?: string;
        linkedin_url?: string | null;
        email_status?: string;
        seniority?: string;
      }>;
    };

    const best = (data.people || []).find((p) => p.linkedin_url) || data.people?.[0];
    if (!best) return null;

    return {
      fullName: best.name || `${best.first_name || ""} ${best.last_name || ""}`.trim(),
      firstName: best.first_name || "",
      lastName: best.last_name || "",
      title: best.title || "",
      linkedinUrl: best.linkedin_url || null,
      emailStatus:
        best.email_status === "verified"
          ? "verified"
          : best.email_status === "guessed"
          ? "guessed"
          : "unavailable",
      seniority: best.seniority || null,
      discoveredAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error("[apollo] Search error:", err);
    return null;
  }
}

/**
 * Suggested LinkedIn connection-request note for a discovered contact.
 *
 * LinkedIn caps connection notes at 300 chars on free tier. Template
 * mirrors the cold-email psychology stack: discovery + validation +
 * effort + humility + soft CTA, but trimmed to fit.
 *
 * Ben uses this manually (copy/paste into LinkedIn) since automated
 * connection requests violate LinkedIn's User Agreement and will get
 * the account restricted fast. A 15-20/day manual cadence is sustainable.
 */
export function suggestLinkedInNote(
  contact: ApolloContact,
  businessName: string,
  city: string | undefined,
  previewShortUrl: string
): string {
  const firstName = contact.firstName || contact.fullName.split(" ")[0] || "there";
  const locationFragment = city ? ` in ${city}` : "";

  // 290-char target so we have safe headroom under LinkedIn's 300-char
  // limit. Preview URL is ~40 chars; the rest is the pitch.
  return `Hey ${firstName} — came across ${businessName}${locationFragment} and spent some time building a website concept for you: ${previewShortUrl} No pressure, curious what you'd change. — Ben`;
}
