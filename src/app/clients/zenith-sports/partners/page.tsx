import Link from "next/link";

export const metadata = {
  title: "Zenith Sports / TEKKY Partner Program — coaches, clubs, camps",
  description:
    "Soccer coaches, clubs, and camps: refer parents to TEKKY, get paid Venmo or Zelle within 7 days. Coaches earn $25/ball + $100/coaching package signup. Clubs get wholesale margin. Camps get co-branded boxes.",
};

/**
 * /clients/zenith-sports/partners — recruitment landing for Zenith / TEKKY's
 * sales-affiliate program. Mirrors the ITC partners page shape, retooled
 * for soccer audiences: coach affiliates, club wholesale, parent
 * referrers, camp directors. Uses Zenith's lime/charcoal/sky palette.
 */
export default function ZenithPartnersPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-lime-500/10">
        <div className="mx-auto max-w-4xl px-6 py-5 flex items-center justify-between">
          <Link
            href="/clients/zenith-sports/portal"
            className="text-sm text-lime-300/70 hover:text-lime-200 transition-colors"
          >
            ← Zenith Portal
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/clients/zenith-sports/partners/script"
              className="text-sm text-lime-300/80 hover:text-lime-200 transition-colors"
            >
              View script library
            </Link>
            <a
              href="mailto:partners@zenithsports.org?subject=Zenith Partner Application"
              className="text-sm font-semibold rounded-md bg-lime-400 hover:bg-lime-300 text-slate-950 px-3 py-1.5 transition-colors"
            >
              Apply →
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-lime-500/10 bg-gradient-to-b from-lime-950/40 via-lime-950/10 to-transparent">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <p className="text-xs uppercase tracking-widest text-lime-300 font-semibold mb-3">
            Zenith Sports · Partner Program
          </p>
          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-5">
            Coaches, clubs, and camps:{" "}
            <span className="text-lime-300">parents trust you. Get paid for it.</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-7">
            Four ways in. <span className="text-white font-semibold">Coaches earn $25/ball + $100 per Zenith coaching-package signup</span>. Clubs get wholesale margin built in. Camps add a co-branded ball to the camp registration fee. Parents get $20/referral. Paid Venmo or Zelle within 7 days.
          </p>

          <div className="inline-flex items-center gap-2 rounded-full border border-lime-500/40 bg-lime-500/10 px-4 py-2 mb-7 text-sm text-lime-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-500" />
            </span>
            Designed by Philip + Paul · Both former pros · Vetted by college DOCs
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="mailto:partners@zenithsports.org?subject=Zenith Partner Application"
              className="inline-flex items-center justify-center rounded-md bg-lime-400 hover:bg-lime-300 text-slate-950 px-8 py-4 text-base font-bold shadow-lg transition-colors"
            >
              Apply to be a partner →
            </a>
            <Link
              href="/clients/zenith-sports/partners/script"
              className="inline-flex items-center justify-center rounded-md border border-lime-500/30 hover:border-lime-500/60 bg-slate-900/50 hover:bg-slate-800 px-6 py-4 text-sm text-lime-200 hover:text-white transition-colors"
            >
              See the 4-audience script →
            </Link>
          </div>
          <p className="text-xs text-slate-500 mt-5">
            Same-day approval · No upfront cost · 1099 contractor · US-based
          </p>
        </div>
      </section>

      {/* What you get */}
      <section className="border-b border-lime-500/10 bg-slate-900/50">
        <div className="mx-auto max-w-4xl px-6 py-14">
          <p className="text-xs uppercase tracking-widest text-sky-400 font-semibold mb-3 text-center">
            For approved partners
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-center leading-tight mb-3">
            We built the system. You just send the link.
          </h2>
          <p className="text-slate-400 text-center max-w-2xl mx-auto mb-10 leading-relaxed">
            Most partners do a single Facebook post or team-chat message at the
            start of a season and never touch it again. Cookie tracks 90 days
            from click. You get paid every time.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <PerkCard
              emoji="🔗"
              title="Personal referral link"
              body="bluejayportfolio.com/clients/zenith-sports?ref=YOUR-CODE — share in your team chat, on Instagram, in a parent email. Cookie tracks 90 days."
            />
            <PerkCard
              emoji="📝"
              title="Audience-tuned scripts"
              body="If you'd rather call than post: a script per audience — coach pitch, club wholesale pitch, parent referral pitch, camp curriculum pitch. Branched objection handlers."
            />
            <PerkCard
              emoji="📲"
              title="One-tap parent message"
              body="Pre-written one-line message you can copy/paste into a team chat or text. Skip the awkwardness of writing your own pitch."
            />
            <PerkCard
              emoji="🏆"
              title="Real-time dashboard"
              body="Watch your referrals come in — click count, signup count, sales count, $ owed. Updates live."
            />
            <PerkCard
              emoji="⏰"
              title="Work whenever, wherever"
              body="No quotas. No territories. No required hours. One post in the team Facebook group is fine. So is recommending us at every parent meeting."
            />
            <PerkCard
              emoji="💸"
              title="Paid in 7 days"
              body="Monthly payouts via Venmo or Zelle. No invoices. No chargebacks. 1099-NEC if you cross $600/yr."
            />
          </div>
        </div>
      </section>

      {/* Four audiences */}
      <section className="border-b border-lime-500/10">
        <div className="mx-auto max-w-4xl px-6 py-14">
          <p className="text-xs uppercase tracking-widest text-emerald-300 font-semibold mb-3 text-center">
            Four customer types · Four different conversations
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-center leading-tight mb-10">
            Who you&apos;re calling
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <AudienceCard
              emoji="🥅"
              title="Coach affiliate"
              body="Youth or club coach (U10–U19) with buying influence. Parents listen to them more than any ad we run. $25/ball + $100/coaching-package signup."
              accent="text-lime-300"
            />
            <AudienceCard
              emoji="🏟️"
              title="Club / academy partnership"
              body="Academy directors + club ops. Wholesale tiers ($30-40/ball) on volume, co-branded boxes on 50+. Parents see real take-home value at registration."
              accent="text-sky-300"
            />
            <AudienceCard
              emoji="👨‍👩‍👧"
              title="Parent referrer"
              body="Existing TEKKY-ball customer parent. Cookie-tracked link, $20 per referred parent who buys. Most parents pick up a few hundred bucks per season."
              accent="text-amber-300"
            />
            <AudienceCard
              emoji="🏕️"
              title="Camp / academy director"
              body="Summer camps + multi-day programs. Bake TEKKY into the registration fee → players take a ball home → parent reviews lift → repeat enrollment grows."
              accent="text-violet-300"
            />
          </div>
          <div className="text-center mt-10">
            <Link
              href="/clients/zenith-sports/partners/script"
              className="inline-flex items-center justify-center rounded-md bg-lime-400 hover:bg-lime-300 text-slate-950 px-6 py-3 text-sm font-bold transition-colors"
            >
              View the full script library →
            </Link>
          </div>
        </div>
      </section>

      {/* Income math */}
      <section
        id="how-it-pays"
        className="border-b border-lime-500/10 scroll-mt-20 bg-slate-900/40"
      >
        <div className="mx-auto max-w-3xl px-6 py-14">
          <p className="text-xs uppercase tracking-widest text-emerald-300 font-semibold mb-3 text-center">
            Realistic numbers
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-center leading-tight mb-10">
            What a coach realistically earns
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 mb-7">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
                One U12 team · 12 players
              </p>
              <p className="text-4xl font-extrabold text-white tabular-nums mb-3">
                $200–600<span className="text-base text-slate-400 font-normal">/season</span>
              </p>
              <ul className="space-y-1.5 text-sm text-slate-400">
                <li>• 8–24 ball sales (~67-100% buy-rate)</li>
                <li>• 2–6 coaching package signups @ $100</li>
                <li>• One Facebook post + one parent email</li>
                <li>• 5 minutes of work all season</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-lime-500/30 bg-lime-500/5 p-6">
              <p className="text-xs uppercase tracking-wider text-lime-300 font-semibold mb-2">
                Club / academy · 200+ players
              </p>
              <p className="text-4xl font-extrabold text-white tabular-nums mb-3">
                $4,000–10,000<span className="text-base text-slate-400 font-normal">/season</span>
              </p>
              <ul className="space-y-1.5 text-sm text-slate-300">
                <li>• Wholesale margin captured at registration</li>
                <li>• Co-branded boxes free at 50+ orders</li>
                <li>• Parent perception of value lifts retention</li>
                <li>• Curriculum integration drives repeat signup</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl mx-auto text-center leading-relaxed">
            Numbers assume 67% buy-rate from a coach&apos;s personal recommendation
            and 25% additional package upgrade rate. Your mileage will vary. No
            earnings guarantee.
          </p>
        </div>
      </section>

      {/* What they're selling */}
      <section className="border-b border-lime-500/10">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            What you&apos;re actually recommending
          </h2>
          <div className="space-y-4 text-slate-300 leading-relaxed">
            <p>
              The TEKKY training ball — engineered with raised bumps on the
              surface so players have to dial in their first touch every
              single time. After 15-20 minutes a session with a TEKKY, smooth-ball
              touches feel automatic.
            </p>
            <p>
              Designed by{" "}
              <span className="text-white font-semibold">
                Philip Lund and Paul Hanson
              </span>{" "}
              — former pros, current coaches. Tested with 11+ college DOCs and
              U10-U19 club teams across the US.
            </p>
            <p>
              You&apos;re not selling a ball. You&apos;re telling a soccer parent:{" "}
              <span className="text-white font-semibold">
                &quot;The ball I use at trainings, if anyone&apos;s looking. My
                kid wanted to practice on his own after we got it.&quot;
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-lime-500/10 bg-slate-900/40">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Quick questions</h2>
          <div className="space-y-6">
            <Faq q="Is this an MLM / pyramid thing?">
              No. Flat $25/ball for coaches, $100/package, $20/parent referral. Paid once per sale. No tiers, no downlines, no recruiting other partners.
            </Faq>
            <Faq q="Do I need a sales background?">
              Helpful but not required. Each audience has its own script with branched objection handling — written for first-time callers. The simplest workflow is a single team-chat post with your link.
            </Faq>
            <Faq q="What's the difference between a coach and a club partner?">
              Coach = solo affiliate, $25/ball commission on sales through your link. Club = wholesale buyer, captures margin at registration. Larger orgs (200+ players) typically combine both — wholesale to the club, plus a per-coach affiliate link for in-team sales.
            </Faq>
            <Faq q="What counts as a 'sale'?">
              For coach + parent referrers: a parent on your link who completes a TEKKY purchase within 90 days of click. For coaching-package upgrades: when they sign up for a Zenith program, $100 to you. Refunds void the payout.
            </Faq>
            <Faq q="Hours, location, time commitment?">
              Fully remote, zero quotas. Most coaches do one post per season — 5 minutes of work for $200-600 in season-long earnings. Camp directors are seasonal — pre-camp setup is the active window.
            </Faq>
            <Faq q="Can I run this through Instagram / TikTok?">
              Yes for coaches and parent referrers — your audience, organic posts only. No paid ads claiming to be Zenith. Club partners use direct sales and registration flows, not social.
            </Faq>
            <Faq q="When do I get paid?">
              Within 7 days of a verified sale clearing. Venmo or Zelle direct. Tax forms (1099-NEC) only if you cross $600/yr.
            </Faq>
          </div>
        </div>
      </section>

      <section className="border-b border-lime-500/10">
        <div className="mx-auto max-w-2xl px-6 py-14 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready?</h2>
          <p className="text-slate-400 mb-8">
            Email a one-paragraph application — name, role (coach / club / camp / parent),
            org name, why Zenith.
          </p>
          <a
            href="mailto:partners@zenithsports.org?subject=Zenith Partner Application"
            className="inline-flex items-center justify-center rounded-md bg-lime-400 hover:bg-lime-300 text-slate-950 px-8 py-4 text-base font-bold shadow-lg transition-colors"
          >
            Apply now →
          </a>
        </div>
      </section>

      <footer className="pb-16">
        <div className="mx-auto max-w-4xl px-6 py-8 text-center text-xs text-slate-500">
          Questions? Email{" "}
          <a
            href="mailto:partners@zenithsports.org"
            className="text-lime-400 hover:underline"
          >
            partners@zenithsports.org
          </a>
        </div>
      </footer>
    </main>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-semibold text-white mb-1">{q}</p>
      <p className="text-slate-400 leading-relaxed">{children}</p>
    </div>
  );
}

function PerkCard({
  emoji,
  title,
  body,
}: {
  emoji: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/40 p-5 hover:border-lime-500/30 transition-colors">
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0 leading-none mt-0.5">{emoji}</span>
        <div className="min-w-0">
          <p className="font-bold text-white text-base leading-tight mb-1.5">
            {title}
          </p>
          <p className="text-sm text-slate-400 leading-relaxed">{body}</p>
        </div>
      </div>
    </div>
  );
}

function AudienceCard({
  emoji,
  title,
  body,
  accent,
}: {
  emoji: string;
  title: string;
  body: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-lime-500/15 bg-gradient-to-b from-lime-950/15 to-transparent p-5 hover:border-lime-500/40 transition-colors">
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0 leading-none mt-0.5">{emoji}</span>
        <div className="min-w-0">
          <p className={`font-bold text-base leading-tight mb-1.5 ${accent}`}>
            {title}
          </p>
          <p className="text-sm text-slate-400 leading-relaxed">{body}</p>
        </div>
      </div>
    </div>
  );
}
