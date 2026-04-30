import Link from "next/link";

export const metadata = {
  title: "BlueJays Partner Program — $200/close, commission only",
  description:
    "Hiring 5-10 commission-only sales partners. $200 flat per closed B2B web design sale. We provide the leads, script, and workspace. Paid Venmo/Zelle within 7 days.",
};

/**
 * /partners — recruitment landing for the affiliate program.
 *
 * Targets the "I know other small business owners who need a real
 * website" audience: contractors, accountants, real-estate agents,
 * existing BlueJays clients who can refer their network.
 *
 * The pitch is intentionally simple — flat fee, fast payout, no quota,
 * no agreement to sign. Hormozi: minimize Time × Effort. Anything that
 * looks like an MLM (recurring %, tiers, leaderboards) gets people to
 * close the tab.
 */
export default function PartnersPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/5">
        <div className="mx-auto max-w-4xl px-6 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← BlueJays
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/partners/login"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/partners/apply"
              className="text-sm font-semibold rounded-md bg-amber-500 hover:bg-amber-400 text-amber-950 px-3 py-1.5 transition-colors"
            >
              Apply →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-white/5 bg-gradient-to-b from-amber-950/30 to-transparent">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <p className="text-xs uppercase tracking-widest text-amber-300 font-semibold mb-3">
            BlueJays Partner Program · Now Hiring
          </p>
          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-5">
            $200 per close.{" "}
            <span className="text-amber-300">No quotas. No caps.</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-7">
            Two ways in. Refer a friend who needs a website and we send
            you $200. <span className="text-white font-semibold">Or join
            our team and call from our pre-loaded prospect list using
            our script + workspace</span> — same $200 per close, paid
            Venmo or Zelle within 7 days.
          </p>

          {/* Cap callout — Hormozi: scarcity earns the apply click */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-2 mb-7 text-sm text-amber-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
            </span>
            Capped at 20 active partners · Manually approved by Ben
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/partners/apply"
              className="inline-flex items-center justify-center rounded-md bg-amber-500 hover:bg-amber-400 text-amber-950 px-8 py-4 text-base font-bold shadow-lg transition-colors"
            >
              Apply to be a partner →
            </Link>
            <Link
              href="#how-it-pays"
              className="inline-flex items-center justify-center rounded-md border border-white/10 hover:border-white/30 bg-slate-900 hover:bg-slate-800 px-6 py-4 text-sm text-slate-300 hover:text-white transition-colors"
            >
              See the realistic income math ↓
            </Link>
          </div>
          <p className="text-xs text-slate-500 mt-5">
            Same-day approval · No upfront cost · 1099 contractor · US-based
          </p>
        </div>
      </section>

      {/* What you get if you join the team — speaks to recruited
          B2B salespeople. The warm-referrer audience can skip this
          section, but the cold-recruited applicant needs proof we
          built real infrastructure. */}
      <section className="border-b border-white/5 bg-slate-900/50">
        <div className="mx-auto max-w-4xl px-6 py-14">
          <p className="text-xs uppercase tracking-widest text-sky-400 font-semibold mb-3 text-center">
            For sales pros joining the team
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-center leading-tight mb-3">
            We built the system. You just dial.
          </h2>
          <p className="text-slate-400 text-center max-w-2xl mx-auto mb-10 leading-relaxed">
            Approved partners log in to a full sales workspace with
            real prospects, real script, real outcome tracking. No CRM
            to manage. No leads to scrub. No script to write. Just call
            and get paid.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <PerkCard
              emoji="📋"
              title="Pre-loaded prospect list"
              body="Our CRM pulls a fresh prospect for you on every call — phone number, business name, owner if known, website, email. You don't manage lists; we do."
            />
            <PerkCard
              emoji="📝"
              title="Hormozi-grade script"
              body="3-step flow (Open → Qualify → Pitch → Book Ben) with branching objection handling. Color-coded line by line. Tested by Ben himself."
            />
            <PerkCard
              emoji="📲"
              title="Click-to-dial + click-to-text"
              body="Tap the prospect's phone in the workspace = it dials from your phone. Tap the booking link = pre-filled SMS opens with their personalized URL."
            />
            <PerkCard
              emoji="🏆"
              title="Outcome tracking + cheat sheet"
              body="One-tap mark outcomes (booked, voicemail, not interested, DNC). Hormozi tips pinned next to the dial button. Daily X/100 counter."
            />
            <PerkCard
              emoji="⏰"
              title="Work whenever, wherever"
              body="No quotas. No territories. No required hours. Use your own phone from anywhere in the US. We don't track time — only outcomes."
            />
            <PerkCard
              emoji="💸"
              title="Paid in 7 days"
              body="When the client's $997 payment clears, you get $200 via Venmo or Zelle within 7 days. No invoices. No chargebacks. No surprises."
            />
          </div>
        </div>
      </section>

      {/* Realistic income math — Hormozi rule: never overpromise. Show
          the conservative + active scenarios separately. */}
      <section id="how-it-pays" className="border-b border-white/5 scroll-mt-20">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <p className="text-xs uppercase tracking-widest text-emerald-300 font-semibold mb-3 text-center">
            Real numbers, not promises
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-center leading-tight mb-10">
            What you can realistically earn
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 mb-7">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
                Casual · 5 calls/day
              </p>
              <p className="text-4xl font-extrabold text-white tabular-nums mb-3">
                $200–400<span className="text-base text-slate-400 font-normal">/wk</span>
              </p>
              <ul className="space-y-1.5 text-sm text-slate-400">
                <li>• ~25 calls/wk</li>
                <li>• ~3–6 booked walkthroughs</li>
                <li>• ~1–2 closes/wk</li>
                <li>• 1–2 hours/day</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
              <p className="text-xs uppercase tracking-wider text-amber-300 font-semibold mb-2">
                Active · 15 calls/day
              </p>
              <p className="text-4xl font-extrabold text-white tabular-nums mb-3">
                $600–1,200<span className="text-base text-slate-400 font-normal">/wk</span>
              </p>
              <ul className="space-y-1.5 text-sm text-slate-300">
                <li>• ~75 calls/wk</li>
                <li>• ~9–18 booked walkthroughs</li>
                <li>• ~3–6 closes/wk</li>
                <li>• 3–4 hours/day</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl mx-auto text-center leading-relaxed">
            Math assumes ~12% pickup → book rate and ~33% book → close rate
            (industry-typical for B2B cold-call funnels selling a
            risk-reversal offer like ours). Your mileage will vary based
            on tone, time of day, and time-zone targeting. No earnings
            guarantee.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            How it works
          </h2>
          <ol className="space-y-6">
            <Step n={1} title="Apply (60 seconds)">
              Fill out a short form — name, email, how you&apos;ll
              promote, and your Venmo or Zelle. Ben approves you
              personally, usually same day.
            </Step>
            <Step n={2} title="Get your link">
              You get a personalized URL like{" "}
              <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 text-sm">
                bluejayportfolio.com/audit?ref=yourname
              </code>
              . Share it with anyone — a text, a Facebook post, a
              business card.
            </Step>
            <Step n={3} title="They get a free audit + a real site">
              Anyone who clicks your link gets a free audit. If they pay
              for a BlueJays site rebuild ($997), you&apos;re credited
              for the close. Cookie tracks them for 90 days — they
              don&apos;t have to buy on the first visit.
            </Step>
            <Step n={4} title="You get $200 — fast">
              When the client&apos;s payment clears, Ben sends you $200
              via Venmo or Zelle within 7 days. No invoices to file. No
              tax forms unless you cross $600/yr (then 1099-NEC).
            </Step>
          </ol>
        </div>
      </section>

      {/* The pitch */}
      <section className="border-b border-white/5 bg-slate-900/40">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            What you&apos;re actually selling
          </h2>
          <div className="space-y-4 text-slate-300 leading-relaxed">
            <p>
              BlueJays builds custom websites for local service
              businesses — landscapers, electricians, plumbers, salons,
              dentists. Sites go live in 48 hours. They cost{" "}
              <span className="text-white font-semibold">$997</span>{" "}
              one-time + $100/yr for hosting and support.
            </p>
            <p>
              Comparable sites elsewhere run{" "}
              <span className="text-white font-semibold">
                $3,000–8,000
              </span>{" "}
              and take 6–12 weeks. Our prospects regularly tell us
              they&apos;ve been quoted that for years and never pulled
              the trigger.
            </p>
            <p>
              You&apos;re not selling a website. You&apos;re telling
              someone you trust:{" "}
              <span className="text-white font-semibold">
                &quot;Ben builds these in 48 hours, he&apos;s a Trooper,
                he doesn&apos;t ghost. Get the free audit.&quot;
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">
            Quick questions
          </h2>
          <div className="space-y-6">
            <Faq q="Is this an MLM / pyramid thing?">
              No. Flat $200, paid once, per closed client. No tiers,
              no downlines, no recruiting other partners. You bring us
              a sale, we pay you. That&apos;s it.
            </Faq>
            <Faq q="Do I need sales experience?">
              Helpful but not required. Our script is designed so a
              first-time caller can read it and book meetings — we wrote
              it specifically to remove the &quot;you have to be a closer&quot;
              barrier. If you can read aloud and follow a flow, you can do this.
            </Faq>
            <Faq q="What's the realistic close rate?">
              ~12% of dials connect with a decision-maker. ~30–40% of those
              book a walkthrough with Ben. ~30–40% of booked walkthroughs
              close. Round numbers: 100 dials ≈ 1–2 closes ≈ $200–400.
              Dialing volume + tone are the two biggest variables.
            </Faq>
            <Faq q="What counts as a 'close'?">
              For team partners: a prospect you called who books and
              completes Ben&apos;s 15-min walkthrough call, then pays
              for a BlueJays site. For warm-referrer partners: anyone
              who clicks your <code className="text-amber-300">?ref=</code>
              {" "}link, fills out the audit form (90-day cookie), and
              pays within those 90 days. Refunds void the payout.
            </Faq>
            <Faq q="Hours, location, time commitment?">
              Fully remote, work whenever. We don&apos;t track hours.
              Casual partners average 1–2 hrs/day. Active partners
              average 3–4 hrs/day. Must be US-based + English-fluent
              (TCPA + accent-trust reasons). No quotas, but we will
              remove partners who haven&apos;t made calls in 30+ days
              to free up the cap.
            </Faq>
            <Faq q="What's the application process?">
              60-second form (name, email, phone, payout handle, where
              you&apos;ll promote). Ben reads every application personally
              and approves same-day for clear fits. Borderline applications
              get a 5-min vetting call. Once approved you get a login
              email + your <code className="text-amber-300">?ref=</code>
              {" "}code immediately.
            </Faq>
            <Faq q="Can I promote on Facebook / Instagram / TikTok?">
              Yes for warm-referrer partners — your network, your audience,
              organic posts. No spam (fake DMs, comment-spam, paid ads
              claiming to be BlueJays). Team partners use the workspace,
              not social channels.
            </Faq>
            <Faq q="When do I get paid?">
              Within 7 days of the client&apos;s payment clearing. Ben
              sends Venmo or Zelle directly. You&apos;ll get an email
              confirming each payout. Tax forms (1099-NEC) only kick in
              if you cross $600/yr — we&apos;ll send one if you do.
            </Faq>
            <Faq q="Why is the program capped at 20 partners?">
              Two reasons. (1) We manually approve every payout, and
              that doesn&apos;t scale past 20 yet. (2) We protect the
              prospect pool — 20 active partners with quality outcomes
              beats 200 partners spamming our brand. We expand the cap
              after we hit 25+ closes through the system.
            </Faq>
            <Faq q="Why manual payouts and not automatic?">
              Honest answer: we&apos;re small enough that an automated
              affiliate platform would cost more than it saves. When
              we hit 50+ closes/month we&apos;ll switch to Stripe Connect.
            </Faq>
          </div>
        </div>
      </section>

      <section className="border-b border-white/5">
        <div className="mx-auto max-w-2xl px-6 py-14 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready?
          </h2>
          <p className="text-slate-400 mb-8">
            Apply takes 60 seconds. Ben approves you personally.
          </p>
          <Link
            href="/partners/apply"
            className="inline-flex items-center justify-center rounded-md bg-amber-500 hover:bg-amber-400 text-amber-950 px-8 py-4 text-base font-bold shadow-lg transition-colors"
          >
            Apply now →
          </Link>
        </div>
      </section>

      <footer className="pb-16">
        <div className="mx-auto max-w-4xl px-6 py-8 text-center text-xs text-slate-500">
          Questions? Email{" "}
          <a
            href="mailto:ben@bluejayportfolio.com"
            className="text-sky-400 hover:underline"
          >
            ben@bluejayportfolio.com
          </a>
        </div>
      </footer>
    </main>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-4">
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold">
        {n}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-white text-lg mb-1">{title}</h3>
        <p className="text-slate-300 leading-relaxed">{children}</p>
      </div>
    </li>
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
    <div className="rounded-xl border border-white/10 bg-slate-950/40 p-5 hover:border-sky-500/30 transition-colors">
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
