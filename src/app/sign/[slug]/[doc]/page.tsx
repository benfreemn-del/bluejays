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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
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
          <p className="text-sm text-slate-400 mb-6">
            Fill in below to acknowledge. Ben gets notified via text + email the
            moment you submit.
          </p>
          <SignForm
            slug={slug}
            doc={doc}
            extraQuestions={config.extraQuestions ?? []}
          />
        </section>

        {/* Footer */}
        <footer className="mt-10 pt-6 border-t border-slate-800/60 text-xs text-slate-500 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <BluejayLogo size={22} className="text-sky-400" />
            <p className="font-semibold text-slate-300">BlueJays</p>
            <span className="text-slate-600">·</span>
            <p>bluejaycontactme@gmail.com</p>
          </div>
          <p>Confidential — do not share this link publicly.</p>
        </footer>
      </div>
    </div>
  );
}
