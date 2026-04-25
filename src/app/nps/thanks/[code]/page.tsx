import { Metadata } from "next";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import NpsThanksClient from "./NpsThanksClient";

/**
 * NPS thanks page — `/nps/thanks/[code]?promoter=true|detractor=true&score=N`
 *
 * Three branches selected by querystring (set by the
 * `/r/[code]/[score]` redirect):
 *
 *   - `?promoter=true` → "Awesome! Want to send your business friends our
 *     way?" + personalized referral URL + email-a-friend mailto +
 *     LinkedIn / Facebook share buttons. The promoter referral email
 *     has already been auto-fired by the /r/ click handler so this
 *     page is just a celebration + amplifier — every additional click
 *     here is amplification, not the primary conversion path.
 *
 *   - `?detractor=true` → "Thank you — what went wrong? I want to fix
 *     it." textarea. Submit POSTs to /api/nps/feedback/[code] which
 *     SMSes Ben within seconds (the at-risk-customer save) and emails
 *     the BlueJays inbox. Includes the explicit promise: "I'll
 *     personally reach out within 24 hours."
 *
 *   - (neither flag) → passive treatment. "Thanks — what would have
 *     made it a 9 or 10?" textarea, optional. Same POST endpoint;
 *     less urgent on Ben's end.
 *
 * Server component shell — auth-free per CLAUDE.md "URL-as-secret"
 * pattern (UUID short_code IS the credential, like a magic link).
 * The interactive textarea/buttons are in `NpsThanksClient.tsx`. The
 * shell does the prospect lookup so we can show the business name +
 * personalized referral link without a client-side fetch round-trip.
 *
 * Light theme matches `/preview/[id]` and `/welcome/[id]` so the
 * customer's whole post-purchase journey feels visually coherent.
 */

export const metadata: Metadata = {
  title: "Thanks for the feedback — BlueJays",
  // Same robots posture as `/client/[id]` — UUID-as-secret pages
  // never end up in search indexes.
  robots: { index: false, follow: false },
};

interface ProspectLite {
  id: string;
  businessName: string;
  ownerName: string | null;
  email: string | null;
  referralCode: string | null;
}

async function lookupByCode(code: string): Promise<ProspectLite | null> {
  if (!/^[a-f0-9]{8}$/i.test(code)) return null;
  if (!isSupabaseConfigured()) return null;

  try {
    const { data } = await supabase
      .from("prospects")
      .select("id, business_name, owner_name, email, referral_code")
      .eq("short_code", code.toLowerCase())
      .limit(1)
      .single();

    if (!data) return null;
    return {
      id: data.id as string,
      businessName: (data.business_name as string) || "your business",
      ownerName: (data.owner_name as string | null) || null,
      email: (data.email as string | null) || null,
      referralCode: (data.referral_code as string | null) || null,
    };
  } catch {
    return null;
  }
}

/**
 * Same deterministic referral code shape used by /api/referral/send
 * and /r/[code]/[score]. Used as a fallback when the prospect
 * doesn't have a persisted referral_code yet (race condition
 * between the /r/ insert and this page render).
 */
function deriveReferralCode(prospectId: string): string {
  let hash = 5381;
  for (let i = 0; i < prospectId.length; i++) {
    hash = ((hash << 5) + hash + prospectId.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36).toUpperCase().padStart(8, "0").slice(0, 8);
}

export default async function NpsThanksPage(props: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{
    promoter?: string;
    detractor?: string;
    score?: string;
  }>;
}) {
  const { code } = await props.params;
  const sp = await props.searchParams;

  const isPromoter = sp.promoter === "true";
  const isDetractor = sp.detractor === "true";
  const variant: "promoter" | "passive" | "detractor" = isPromoter
    ? "promoter"
    : isDetractor
      ? "detractor"
      : "passive";

  const score = sp.score ? Number.parseInt(sp.score, 10) : undefined;

  const prospect = await lookupByCode(code);

  // Generic fallback — code unrecognized. Don't reveal it didn't
  // resolve; just show a soft thanks page so people who manually
  // fiddle with the URL don't get an error stack.
  if (!prospect) {
    return (
      <main className="min-h-screen bg-[#faf9f6] text-slate-900 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4">Thanks for the feedback</h1>
          <p className="text-slate-600">
            I appreciate you taking the time. — Ben
          </p>
        </div>
      </main>
    );
  }

  const referralCode =
    prospect.referralCode || deriveReferralCode(prospect.id);
  const referralUrl = `https://bluejayportfolio.com?ref=${referralCode}`;
  const firstName =
    prospect.ownerName?.split(" ")[0] || prospect.businessName;

  return (
    <NpsThanksClient
      code={code}
      variant={variant}
      score={Number.isInteger(score) ? score : undefined}
      firstName={firstName}
      businessName={prospect.businessName}
      referralUrl={referralUrl}
    />
  );
}
