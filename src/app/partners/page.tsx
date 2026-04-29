import Link from "next/link";

export const metadata = {
  title: "BlueJays Partner Program — $200/close",
  description:
    "Send local business owners to BlueJays. We pay you $200 cash for every site we close. No quotas. Paid Venmo or Zelle within 7 days.",
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
            BlueJays Partner Program
          </p>
          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-5">
            Send a friend.{" "}
            <span className="text-amber-300">Get $200.</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-xl mx-auto leading-relaxed mb-8">
            You know a small business owner with a bad website. We build
            them a great one. When they pay, we send you{" "}
            <span className="text-white font-semibold">$200 cash</span>{" "}
            via Venmo or Zelle. That&apos;s it.
          </p>
          <Link
            href="/partners/apply"
            className="inline-flex items-center justify-center rounded-md bg-amber-500 hover:bg-amber-400 text-amber-950 px-8 py-4 text-base font-bold shadow-lg transition-colors"
          >
            Apply to be a partner →
          </Link>
          <p className="text-xs text-slate-500 mt-4">
            Approved manually by Ben · Usually within 24 hours
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
              No. Flat $200, paid once, per closed client. No tiers, no
              recruiting. You refer a friend — we pay you. Done.
            </Faq>
            <Faq q="What counts as a 'close'?">
              The prospect clicks your link, fills out the audit form
              (we drop a 90-day cookie), and pays for a BlueJays site
              within those 90 days. Refunds void the payout.
            </Faq>
            <Faq q="Can I promote on Facebook / Instagram / TikTok?">
              Yes. We just ask you don&apos;t spam (no fake DMs,
              comment-spam, or paid ads claiming to be BlueJays). Word
              of mouth, organic posts, your own audience —
              all good.
            </Faq>
            <Faq q="When do I get paid?">
              Within 7 days of the client&apos;s payment clearing. Ben
              sends Venmo or Zelle directly. You&apos;ll get an email
              confirming the payout.
            </Faq>
            <Faq q="Why manual payouts and not automatic?">
              Honest answer: we&apos;re small enough that an automated
              affiliate platform would cost more than it saves. When we
              hit 50+ partners we&apos;ll switch to Stripe Connect.
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
