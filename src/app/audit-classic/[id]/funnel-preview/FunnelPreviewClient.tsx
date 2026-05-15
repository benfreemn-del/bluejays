"use client";

import Link from "next/link";

/**
 * FunnelPreviewClient — renders the 3-audience AI funnel mock for a
 * specific business. Heuristic per-category templates (no LLM call)
 * personalize subject lines, SMS, and ad headlines using the
 * prospect's business name + city.
 *
 * v1 ships with a generic 3-audience pattern that fits every category:
 *   1. New prospects — never heard of you
 *   2. Warm leads — visited site, didn't buy
 *   3. Past customers — bought once, hasn't returned
 *
 * v2 upgrade: replace the generic 3 with category-specific audiences
 * (e.g. ITC: hobbyist / forester / TYM owner / hunter / dealer / community).
 * The card shape stays the same; only the audience labels + copy change.
 */

type AudienceCard = {
  emoji: string;
  label: string;
  who: string;
  emailSubject: string;
  emailFirstLine: string;
  sms: string;
  adHeadline: string;
};

function buildAudiences(business: string, category: string, city: string): AudienceCard[] {
  return [
    {
      emoji: "🆕",
      label: "New prospects",
      who: `${city}-area ${category} customers who've never heard of ${business}`,
      emailSubject: `${city} ${category} — quick question`,
      emailFirstLine: `I noticed you're searching for ${category} in ${city}. ${business} just rebuilt how we work — wanted to make sure you saw the new offer before deciding.`,
      sms: `Hi! Saw you were looking at ${category} options in ${city}. We just opened up new spots for next month — interested?`,
      adHeadline: `${business} is now booking new ${category} customers in ${city}`,
    },
    {
      emoji: "🔥",
      label: "Warm leads",
      who: `Visited your site or contact form, didn't book yet`,
      emailSubject: `Following up on ${business}`,
      emailFirstLine: `You looked at ${business} a couple days ago and didn't book — totally understand if the timing was off. Just wanted to check if there's anything you wanted to know before you decide.`,
      sms: `Hey — you reached out about ${category} but we didn't connect. Still want to chat? I have time tomorrow.`,
      adHeadline: `Still thinking about ${business}? Book in 60 seconds`,
    },
    {
      emoji: "🤝",
      label: "Past customers",
      who: `Bought once, hasn't been back in 60+ days`,
      emailSubject: `Quick check-in from ${business}`,
      emailFirstLine: `Wanted to circle back — it's been a while since we worked together on ${category}. Anything come up since? Most clients hit a 'next phase' moment around now and we'd rather hear from you first than have you go elsewhere.`,
      sms: `Hi! It's been a bit. Want to do a quick refresh / next phase on ${category}? Reply with a time.`,
      adHeadline: `${business} repeat-customer offer — ${city}`,
    },
  ];
}

export default function FunnelPreviewClient({
  auditId,
  businessName,
  category,
  city,
}: {
  auditId: string;
  businessName: string;
  category: string;
  city: string;
}) {
  const audiences = buildAudiences(businessName, category, city);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 pb-32">
      {/* Hero */}
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-[0.22em] text-violet-300 font-bold mb-3">
          See it before you pay
        </p>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3 leading-tight">
          Here&apos;s the AI Marketing System we&apos;d build for{" "}
          <span className="text-violet-300">{businessName}</span>
        </h1>
        <p className="text-base md:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
          Three customer types. Three full sales tracks. Real copy, real
          channel mix — the same system 12+ businesses are running today.
          This is the mock. The polished version comes after the call.
        </p>
      </div>

      {/* The 3 audience cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {audiences.map((a, i) => (
          <article
            key={i}
            className="rounded-2xl border border-white/10 bg-slate-900/50 overflow-hidden"
          >
            <header className="px-5 py-4 border-b border-white/10 bg-violet-950/30">
              <div className="text-3xl mb-1">{a.emoji}</div>
              <h2 className="text-base font-black text-white tracking-tight">
                Track {i + 1} · {a.label}
              </h2>
              <p className="text-[11px] text-violet-200/80 mt-1 leading-relaxed">
                {a.who}
              </p>
            </header>
            <div className="p-5 space-y-4 text-sm">
              <Channel label="📧 Email subject" body={a.emailSubject} />
              <Channel label="✏️ Email opener" body={a.emailFirstLine} long />
              <Channel label="📲 SMS follow-up" body={a.sms} />
              <Channel label="🎯 Ad headline" body={a.adHeadline} />
            </div>
          </article>
        ))}
      </div>

      {/* What's actually included */}
      <div className="rounded-2xl border border-violet-500/30 bg-violet-950/20 p-6 mb-10">
        <h3 className="text-lg font-bold text-violet-100 mb-3">
          Everything the full build includes
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-300">
          {[
            "Custom website (rebuilt from scratch for your business)",
            "Google Ads — auto-optimizing campaigns, your account",
            "Facebook + Instagram Ads — same auto-optimization",
            "Per-audience email + SMS + voicemail sequences (3 tracks)",
            "AI auto-replies on every inbound email in your voice",
            "Missed-call text-back inside 60 seconds",
            "Custom lead-magnet quiz built for your industry",
            "Long-term SEO content engine",
            "Owner dashboard with leads · budget · campaigns · reports",
            "Logo refresh if your current one needs polish",
            "Weekly performance reports auto-emailed every Monday",
            "100 qualified leads in 90 days — or we work free until you hit it",
          ].map((line) => (
            <div key={line} className="flex items-start gap-2">
              <span className="text-violet-400 mt-0.5">✓</span>
              <span>{line}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing + CTA */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-slate-900/40 p-6 text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-amber-300 font-bold mb-2">
          Real pricing, no surprises
        </p>
        <h3 className="text-2xl md:text-3xl font-black text-white mb-2">
          $9,700 build · $500-1,000/mo for the AI tools
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed max-w-xl mx-auto mb-5">
          The recurring goes to Twilio + SendGrid + Claude + your ad
          accounts — not a retainer to us. Versus a $3-8K/mo agency,
          you&apos;re paying about a third for the same outcome AND you
          own the system forever.
        </p>
        <Link
          href={`/schedule/${auditId}?type=fullsystem&from=funnel-preview`}
          className="inline-flex items-center justify-center rounded-md bg-amber-500 hover:bg-amber-400 px-6 py-3.5 text-base font-black text-amber-950 transition-colors shadow-[0_0_30px_rgba(251,191,36,0.35)]"
        >
          Book the 15-min walkthrough →
        </Link>
        <p className="text-[11px] text-slate-400 mt-3">
          Real scarcity · Ben caps at 10 backend builds per month
        </p>
      </div>
    </div>
  );
}

function Channel({
  label,
  body,
  long,
}: {
  label: string;
  body: string;
  long?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-bold mb-1">
        {label}
      </p>
      <p
        className={`text-slate-200 leading-snug ${
          long ? "text-[13px]" : "text-sm font-semibold"
        }`}
      >
        {body}
      </p>
    </div>
  );
}
