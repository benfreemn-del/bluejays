import Link from "next/link";

export const metadata = {
  title: "ITC Quick Attach Partner Program — sell the gear, get paid fast",
  description:
    "Sales partners + dealers wanted. $50 flat per first-time customer · $250 per signed dealer · paid Venmo/Zelle within 7 days. We provide the leads, the script, and a six-audience playbook.",
};

/**
 * /clients/itc-quick-attach/partners — recruitment landing for ITC's
 * commission sales program. Mirrors the BlueJays partners page, retooled
 * for tractor accessories: ITC-amber palette, six audience types
 * (dealer/tym/forester/hunter/hobbyist/community), and a script viewer
 * picker linked at the bottom so any rep can drop into the right
 * playbook by audience.
 */
export default function ItcPartnersPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-amber-500/10">
        <div className="mx-auto max-w-4xl px-6 py-5 flex items-center justify-between">
          <Link
            href="/clients/itc-quick-attach/portal"
            className="text-sm text-amber-300/70 hover:text-amber-200 transition-colors"
          >
            ← ITC Portal
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/clients/itc-quick-attach/partners/script"
              className="text-sm text-amber-300/80 hover:text-amber-200 transition-colors"
            >
              View script library
            </Link>
            <a
              href="mailto:partners@itcquickattach.com?subject=ITC Sales Partner Application"
              className="text-sm font-semibold rounded-md bg-amber-500 hover:bg-amber-400 text-amber-950 px-3 py-1.5 transition-colors"
            >
              Apply →
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-amber-500/10 bg-gradient-to-b from-amber-950/40 via-amber-950/10 to-transparent">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <p className="text-xs uppercase tracking-widest text-amber-300 font-semibold mb-3">
            ITC Quick Attach · Sales Partner Program
          </p>
          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-5">
            Sell tractor gear made in America.{" "}
            <span className="text-amber-300">Get paid in 7 days.</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-7">
            Two ways in. <span className="text-white font-semibold">$50 flat per first-time customer you close</span> · <span className="text-white font-semibold">$250 flat per dealer or shop you sign</span>. We hand you the leads, a six-audience script library, and a workspace built around the call. Paid Venmo or Zelle within 7 days.
          </p>

          {/* Cap callout */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-2 mb-7 text-sm text-amber-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
            </span>
            12 active partners max · Manually approved
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="mailto:partners@itcquickattach.com?subject=ITC Sales Partner Application"
              className="inline-flex items-center justify-center rounded-md bg-amber-500 hover:bg-amber-400 text-amber-950 px-8 py-4 text-base font-bold shadow-lg transition-colors"
            >
              Apply to be a partner →
            </a>
            <Link
              href="/clients/itc-quick-attach/partners/script"
              className="inline-flex items-center justify-center rounded-md border border-amber-500/30 hover:border-amber-500/60 bg-[#1a1a1a] hover:bg-[#222] px-6 py-4 text-sm text-amber-200 hover:text-white transition-colors"
            >
              See the 6-audience script →
            </Link>
          </div>
          <p className="text-xs text-slate-500 mt-5">
            Same-day approval · No upfront cost · 1099 contractor · US-based
          </p>
        </div>
      </section>

      {/* What you get */}
      <section className="border-b border-amber-500/10 bg-[#101010]">
        <div className="mx-auto max-w-4xl px-6 py-14">
          <p className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-3 text-center">
            For sales pros joining the team
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-center leading-tight mb-3">
            We built the system. You just dial.
          </h2>
          <p className="text-slate-400 text-center max-w-2xl mx-auto mb-10 leading-relaxed">
            Approved partners get a sales workspace with real prospects,
            audience-tagged so the right script is one click away. No CRM
            to manage. No leads to scrub. No territory wars.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <PerkCard
              emoji="📋"
              title="Audience-tagged prospect list"
              body="Every prospect comes pre-classified: Dealer, TYM owner, Forester, Hunter, Hobbyist, or existing Community customer. You see the tag before you dial — and the right script auto-loads."
            />
            <PerkCard
              emoji="📝"
              title="Six branched call scripts"
              body="A script per audience — dealer pitch (margin + MAP), TYM pitch (28-review brush guard), forester pitch (SawBoss + Chainbox), hunter pitch (firearm-mount combo), hobbyist pitch (first-year setup kit), community ask (referral + testimonial)."
            />
            <PerkCard
              emoji="📲"
              title="Click-to-dial + click-to-text"
              body="Tap the prospect's phone in the workspace = it dials. Tap the configurator link = pre-filled SMS opens with their personalized 'Build Your Dream Tractor' URL."
            />
            <PerkCard
              emoji="🏆"
              title="Outcome tracking + objection cheat sheet"
              body="Mark outcomes one tap (booked, voicemail, not interested, DNC). Per-audience objection handlers pinned next to the dial button — 'too expensive', 'we already carry brand X', 'I just throw the saw in the back'."
            />
            <PerkCard
              emoji="⏰"
              title="Work whenever, wherever"
              body="No quotas. No territories. No required hours. Use your own phone from anywhere in the US. We don't track time — we track closes."
            />
            <PerkCard
              emoji="💸"
              title="Paid in 7 days"
              body="When the customer's order ships and clears, you get paid via Venmo or Zelle within 7 days. No invoices. No chargebacks. No surprises."
            />
          </div>
        </div>
      </section>

      {/* Six audiences */}
      <section className="border-b border-amber-500/10">
        <div className="mx-auto max-w-4xl px-6 py-14">
          <p className="text-xs uppercase tracking-widest text-emerald-300 font-semibold mb-3 text-center">
            Six customer types · Six different sales conversations
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-center leading-tight mb-10">
            Who you&apos;re calling
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <AudienceCard
              emoji="🏪"
              title="Dealer / wholesale"
              body="Tractor supply shops + ag-equipment dealers. Highest LTV per close. $250 commission. Pitch leads with margin (35-40%), MAP policy, ship speed."
            />
            <AudienceCard
              emoji="🚜"
              title="TYM owner"
              body="Existing TYM tractor owners. Biggest verified review base — 28+ reviews on the T474 brush guard. Pitch leads with TYM-specific fit + the configurator."
            />
            <AudienceCard
              emoji="🌲"
              title="Professional forester"
              body="Land-management pros + logging contractors. SawBoss + Chainbox combo. 30-day trial offer. Pitch leads with time-saved-per-job math."
            />
            <AudienceCard
              emoji="🎯"
              title="Hunter / outdoorsman"
              body="Hunters on private land using a tractor or UTV. Firearm-mount + brush-guard combo. Highest-volume window: October–December scouting + season."
            />
            <AudienceCard
              emoji="🏡"
              title="Hobbyist · first-year owner"
              body="Just bought a sub-compact tractor. Overwhelmed. Pitch the 'first-year setup kit' (toolbox + SawBoss + brush guard) — and send them to the configurator."
            />
            <AudienceCard
              emoji="🤝"
              title="Existing customer · referral"
              body="Already owns one of our products. Goal isn't a sale — it's a 30-second testimonial video OR a referral. Free toolbox kit as the thank-you incentive."
            />
          </div>
          <div className="text-center mt-10">
            <Link
              href="/clients/itc-quick-attach/partners/script"
              className="inline-flex items-center justify-center rounded-md bg-amber-500 hover:bg-amber-400 text-amber-950 px-6 py-3 text-sm font-bold transition-colors"
            >
              View the full script library →
            </Link>
          </div>
        </div>
      </section>

      {/* Income math */}
      <section id="how-it-pays" className="border-b border-amber-500/10 scroll-mt-20 bg-[#101010]">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <p className="text-xs uppercase tracking-widest text-emerald-300 font-semibold mb-3 text-center">
            Real numbers, not promises
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-center leading-tight mb-10">
            What you can realistically earn
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 mb-7">
            <div className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-6">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
                Casual · 5 calls/day
              </p>
              <p className="text-4xl font-extrabold text-white tabular-nums mb-3">
                $200–500<span className="text-base text-slate-400 font-normal">/wk</span>
              </p>
              <ul className="space-y-1.5 text-sm text-slate-400">
                <li>• ~25 calls/wk</li>
                <li>• ~3–6 booked dealer demos</li>
                <li>• ~4–10 retail closes/wk</li>
                <li>• 1–2 hours/day</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
              <p className="text-xs uppercase tracking-wider text-amber-300 font-semibold mb-2">
                Active · 15 calls/day
              </p>
              <p className="text-4xl font-extrabold text-white tabular-nums mb-3">
                $750–1,500<span className="text-base text-slate-400 font-normal">/wk</span>
              </p>
              <ul className="space-y-1.5 text-sm text-slate-300">
                <li>• ~75 calls/wk</li>
                <li>• ~1–2 dealers signed/mo ($250 ea)</li>
                <li>• ~12–25 retail closes/wk ($50 ea)</li>
                <li>• 3–4 hours/day</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl mx-auto text-center leading-relaxed">
            Math assumes ~12% pickup rate, ~30% retail close rate on warm
            audience-tagged leads, and ~5% close rate on cold dealer outreach.
            Your mileage will vary based on tone, time of day, and audience mix.
            No earnings guarantee.
          </p>
        </div>
      </section>

      {/* What you're selling */}
      <section className="border-b border-amber-500/10">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            What you&apos;re actually selling
          </h2>
          <div className="space-y-4 text-slate-300 leading-relaxed">
            <p>
              ITC Quick Attach builds tractor accessories in upstate New York —
              <span className="text-white font-semibold"> American-made, in-house manufacturing</span>.
              SawBoss chainsaw carriers ($180), brush guards ($249) for TYM/Kioti/Mahindra/Branson,
              toolbox kits ($35–$125), firearm mounts, tractor steps, and lights.
            </p>
            <p>
              Cascade Tractor Supply in Spokane is already moving inventory.
              The TYM brush guard has{" "}
              <span className="text-white font-semibold">28+ verified reviews</span>{" "}
              from real owners. The product line works — the bottleneck is reach.
            </p>
            <p>
              You&apos;re not selling a brush guard. You&apos;re telling a tractor owner:{" "}
              <span className="text-white font-semibold">
                &quot;ITC builds these in upstate NY, the brush guard bolts directly to your TYM with no drilling, and the SawBoss saves your chainsaw bar every transit. Here&apos;s the configurator — pick your tractor, see what fits.&quot;
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-amber-500/10 bg-[#101010]">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">
            Quick questions
          </h2>
          <div className="space-y-6">
            <Faq q="Is this an MLM?">
              No. Flat $50 per retail close, $250 per dealer signed. Paid once, when the customer pays. No tiers, no downlines, no recruiting other partners.
            </Faq>
            <Faq q="Do I need sales experience?">
              Helpful but not required. Each audience has its own script with branching objection handling — written for first-time callers. If you can read aloud and follow a flow, you can do this.
            </Faq>
            <Faq q="What's the difference between a retail close and a dealer close?">
              Retail close = a single end-customer who buys at least one ITC product directly ($50 to you). Dealer close = a tractor supply shop, ag-equipment dealer, or rural hardware store that signs as a wholesale account and places a starter order ($250 to you).
            </Faq>
            <Faq q="How are leads assigned?">
              Audience-tagged in your workspace. You see the tag before you dial — TYM owner, Forester, Hunter, etc. — and the matching script auto-loads. Same-day refresh, no stale lists.
            </Faq>
            <Faq q="What counts as a 'close'?">
              Retail: a prospect on your list places an order within 30 days of your last call. Dealer: a buyer or owner books and completes the wholesale-rep call, then places a starter order. Refunds/returns void the payout.
            </Faq>
            <Faq q="Hours, location, time commitment?">
              Fully remote, work whenever. We don&apos;t track hours. Casual partners average 1–2 hrs/day. Active partners 3–4 hrs/day. US-based, English-fluent.
            </Faq>
            <Faq q="Can I sell on Facebook / Instagram / TikTok?">
              Yes for warm-referrer partners — your network, your audience, organic posts only. No spam, no fake DMs, no paid ads claiming to be ITC. Team partners use the workspace, not social channels.
            </Faq>
            <Faq q="When do I get paid?">
              Within 7 days of the customer&apos;s payment clearing (or the dealer&apos;s starter order shipping). Venmo or Zelle direct. 1099-NEC if you cross $600/yr.
            </Faq>
            <Faq q="Why is the program capped at 12 partners?">
              We manually approve every payout, and that doesn&apos;t scale past a dozen yet. We expand the cap once the audience-tagged lead pool is sustainably full.
            </Faq>
          </div>
        </div>
      </section>

      <section className="border-b border-amber-500/10">
        <div className="mx-auto max-w-2xl px-6 py-14 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready?
          </h2>
          <p className="text-slate-400 mb-8">
            Email a one-paragraph application — name, where you&apos;re based, sales background, why ITC. Manual approval, usually same day.
          </p>
          <a
            href="mailto:partners@itcquickattach.com?subject=ITC Sales Partner Application"
            className="inline-flex items-center justify-center rounded-md bg-amber-500 hover:bg-amber-400 text-amber-950 px-8 py-4 text-base font-bold shadow-lg transition-colors"
          >
            Apply now →
          </a>
        </div>
      </section>

      <footer className="pb-16">
        <div className="mx-auto max-w-4xl px-6 py-8 text-center text-xs text-slate-500">
          Questions? Email{" "}
          <a
            href="mailto:partners@itcquickattach.com"
            className="text-amber-400 hover:underline"
          >
            partners@itcquickattach.com
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
    <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5 hover:border-amber-500/40 transition-colors">
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
}: {
  emoji: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-amber-500/15 bg-gradient-to-b from-amber-950/20 to-transparent p-5 hover:border-amber-500/40 transition-colors">
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0 leading-none mt-0.5">{emoji}</span>
        <div className="min-w-0">
          <p className="font-bold text-amber-100 text-base leading-tight mb-1.5">
            {title}
          </p>
          <p className="text-sm text-slate-400 leading-relaxed">{body}</p>
        </div>
      </div>
    </div>
  );
}
