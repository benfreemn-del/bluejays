import { notFound } from "next/navigation";
import type { Metadata } from "next";

import BluejayLogo from "@/components/BluejayLogo";
import { getOnboardDoc } from "@/lib/onboard-docs";
import SignForm from "./SignForm";

/**
 * Public shareable acknowledgment page.
 *
 * URL pattern: /sign/[slug]/[doc]
 * Shows the PDF embedded inline + a sign-off form below. On submit,
 * sendOwnerAlert() fires SMS + email to Ben in real time.
 *
 * URL-as-secret auth — anyone with the link can sign. The doc shouldn't
 * contain anything sensitive (passwords, PII) since it's link-shareable.
 *
 * Pattern: see CLAUDE.md "Shareable Client Doc Pattern".
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; doc: string }>;
}): Promise<Metadata> {
  const { slug, doc } = await params;
  const config = getOnboardDoc(slug, doc);
  if (!config) {
    return { title: "Document not found" };
  }
  return {
    title: `${config.title} · ${config.brand}`,
    description: config.description ?? config.title,
    robots: { index: false, follow: false },
  };
}

export default async function SignPage({
  params,
}: {
  params: Promise<{ slug: string; doc: string }>;
}) {
  const { slug, doc } = await params;
  const config = getOnboardDoc(slug, doc);
  if (!config) notFound();

  const primaryPayment = config.paymentLinks?.find((p) => p.primary);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 sm:pb-20">
      {/* Top brand bar */}
      <div className="h-1 bg-lime-500" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <header className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-400 mb-2">
            {config.brand}
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {config.title}
          </h1>
          {config.description && (
            <p className="mt-3 text-slate-300 max-w-2xl leading-relaxed">
              {config.description}
            </p>
          )}
        </header>

        {/* Value-proof strip — first impression must be VALUE, not paperwork */}
        {config.valueProof && (
          <section className="mb-8 rounded-2xl border border-lime-500/30 bg-gradient-to-br from-lime-500/[0.08] via-slate-900/40 to-sky-500/[0.06] p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-400 mb-2">
              Already running for you
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {config.valueProof.headline}
            </h2>
            {config.valueProof.subhead && (
              <p className="mt-2 text-slate-300 leading-relaxed max-w-3xl">
                {config.valueProof.subhead}
              </p>
            )}
            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              {config.valueProof.bullets.map((b) => (
                <li
                  key={b.title}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                >
                  <p className="text-sm font-bold text-lime-300 mb-1.5 flex items-start gap-2">
                    <span aria-hidden className="text-lime-400">✓</span>
                    <span>{b.title}</span>
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {b.detail}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-slate-400">
              The packet below documents everything in writing. Read it,
              acknowledge at the bottom, and we're off.
            </p>
          </section>
        )}

        {/* PDF embed */}
        <section className="mb-8">
          <div className="rounded-2xl overflow-hidden border border-slate-800 bg-black shadow-2xl">
            <object
              data={config.pdfPath}
              type="application/pdf"
              className="w-full h-[80vh] min-h-[600px]"
              aria-label={config.title}
            >
              <div className="p-8 text-center text-slate-300">
                <p className="mb-3">Your browser can&apos;t embed PDFs inline.</p>
                <a
                  href={config.pdfPath}
                  className="inline-flex items-center justify-center h-11 px-5 rounded-full bg-lime-500 text-slate-950 font-bold hover:bg-lime-400 transition-colors"
                >
                  Open the PDF
                </a>
              </div>
            </object>
          </div>
          <div className="mt-3 flex items-center gap-4 text-sm">
            <a
              href={config.pdfPath}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lime-400 hover:text-lime-300 underline underline-offset-4"
            >
              Open / download PDF →
            </a>
            <a
              href={config.pdfPath}
              download
              className="text-slate-400 hover:text-slate-200 underline underline-offset-4"
            >
              Save a copy
            </a>
          </div>
        </section>

        {/* Sign-off form */}
        <section
          id="sign"
          className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8"
        >
          <h2 className="text-xl font-bold text-white mb-2">
            Confirm receipt
          </h2>
          <p className="text-sm text-slate-200 mb-6">
            Fill in below to acknowledge. Ben gets notified via text + email the
            moment you submit.
          </p>
          <SignForm
            slug={slug}
            doc={doc}
            extraQuestions={config.extraQuestions ?? []}
            paymentLinks={config.paymentLinks ?? []}
          />
        </section>

        {/* Finalize payment CTAs — pricing mirrors the PDF table */}
        {config.paymentLinks && config.paymentLinks.length > 0 && (
          <section
            id="pay"
            className="mt-8 rounded-2xl border border-sky-500/30 bg-gradient-to-br from-sky-500/[0.08] via-slate-900/40 to-lime-500/[0.06] p-6 sm:p-8"
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-400 mb-2">
              Finalize payment
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              One last step — secure your launch.
            </h2>
            <p className="mt-2 text-slate-300 max-w-3xl">
              Clearing payment unlocks Phase A build work (begins the business
              day funds clear). All amounts mirror the pricing table in the
              packet above.
            </p>
            <div className="mt-6 space-y-3">
              {config.paymentLinks.map((link) => {
                const hasUrl = !!link.url;
                const baseBtn =
                  "block w-full rounded-2xl border p-5 transition-colors";
                const primary = link.primary
                  ? "border-lime-500/60 bg-lime-500/[0.10] hover:bg-lime-500/[0.18]"
                  : "border-slate-700 bg-slate-950/60 hover:border-sky-400/60";
                const disabled =
                  "border-slate-800 bg-slate-950/40 opacity-70 cursor-not-allowed";
                const cls = `${baseBtn} ${hasUrl ? primary : disabled}`;
                const inner = (
                  <>
                    {link.badge && (
                      <p
                        className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                          link.primary ? "text-lime-400" : "text-sky-400"
                        }`}
                      >
                        {link.badge}
                      </p>
                    )}
                    <p
                      className={`font-extrabold ${
                        link.primary
                          ? "text-2xl text-white"
                          : "text-lg text-slate-100"
                      }`}
                    >
                      {link.label}
                      {hasUrl ? (
                        <span className="ml-2 text-lime-300">→</span>
                      ) : null}
                    </p>
                    {link.description && (
                      <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">
                        {link.description}
                      </p>
                    )}
                    {!hasUrl && (
                      <p className="mt-3 text-xs font-semibold text-amber-300">
                        Stripe Payment Link not yet wired — Ben will text you
                        the link directly during the call.
                      </p>
                    )}
                  </>
                );
                return hasUrl ? (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cls}
                  >
                    {inner}
                  </a>
                ) : (
                  <div key={link.label} className={cls}>
                    {inner}
                  </div>
                );
              })}
            </div>
            <p className="mt-5 text-xs text-slate-500">
              Payment opens in a new tab on Stripe's secure checkout. Card data
              never touches our servers.
            </p>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-10 pt-6 border-t border-slate-800/60 text-xs text-slate-400 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <BluejayLogo size={22} className="text-sky-400" />
            <p className="font-semibold text-slate-200">BlueJays</p>
            <span className="text-slate-500">·</span>
            <p>bluejaycontactme@gmail.com</p>
          </div>
          <p>Confidential — do not share this link publicly.</p>
        </footer>
      </div>

      {/* Sticky bottom action bar — always-visible submit + payment access */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <a
            href="#sign"
            className="flex-1 h-11 px-5 inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-sm font-semibold text-slate-100 hover:border-lime-500/60 hover:text-white transition-colors"
          >
            ↓ Acknowledge form
          </a>
          {primaryPayment &&
            (primaryPayment.url ? (
              <a
                href={primaryPayment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-11 px-5 inline-flex items-center justify-center rounded-full bg-lime-500 text-slate-950 text-sm font-extrabold hover:bg-lime-400 transition-colors"
              >
                {primaryPayment.label} →
              </a>
            ) : (
              <a
                href="#pay"
                className="flex-1 h-11 px-5 inline-flex items-center justify-center rounded-full border border-amber-500/60 bg-amber-500/[0.10] text-sm font-bold text-amber-200 hover:bg-amber-500/[0.18] transition-colors"
              >
                {primaryPayment.label} (link via text)
              </a>
            ))}
        </div>
      </div>
    </div>
  );
}
