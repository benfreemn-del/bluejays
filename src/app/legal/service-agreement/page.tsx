import type { Metadata } from "next";
import Link from "next/link";
import {
  buildServiceAgreement,
  SERVICE_AGREEMENT_VERSION,
  SERVICE_AGREEMENT_EFFECTIVE_DATE,
  type ServiceAgreementPlan,
} from "@/lib/service-agreement";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Service Agreement — BlueJays",
  description:
    "BlueJays website-design service agreement. Plain-English contract terms for our $997 one-time and installment plans.",
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://bluejayportfolio.com/legal/service-agreement",
  },
};

const VALID_PLANS: ServiceAgreementPlan[] = ["standard", "installment", "custom", "agency"];

const PLAN_LABEL: Record<ServiceAgreementPlan, string> = {
  standard: "Standard ($997 one-time)",
  installment: "Installment ($349 × 3)",
  custom: "Custom (per quote)",
  agency: "AI Marketing System ($10,000 base / $9,700 pay-in-full)",
};

export default async function ServiceAgreementPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const params = await searchParams;
  const planParam = (params.plan || "standard").toLowerCase() as ServiceAgreementPlan;
  const plan: ServiceAgreementPlan = VALID_PLANS.includes(planParam)
    ? planParam
    : "standard";

  const sections = buildServiceAgreement(plan);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← BlueJays
          </Link>
          <span className="text-xs text-slate-500 font-mono">
            v{SERVICE_AGREEMENT_VERSION}
          </span>
        </div>
      </header>

      <section className="border-b border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <p className="text-xs uppercase tracking-widest text-amber-300 font-semibold mb-3">
            Legal · Service Agreement
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-3">
            BlueJays Service Agreement
          </h1>
          <p className="text-base text-slate-400 leading-relaxed mb-5">
            The contract between BlueJay Business Solutions LLC and the
            client (you) for the website we build for your business.
            Plain English where possible. Binding once you accept it on
            the onboarding form.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="rounded-full border border-white/10 bg-slate-900/40 px-3 py-1">
              <span className="text-slate-500">Plan: </span>
              <span className="text-amber-300 font-semibold">
                {PLAN_LABEL[plan]}
              </span>
            </span>
            <span className="rounded-full border border-white/10 bg-slate-900/40 px-3 py-1">
              <span className="text-slate-500">Version: </span>
              <span className="text-white font-semibold">
                {SERVICE_AGREEMENT_VERSION}
              </span>
            </span>
            <span className="rounded-full border border-white/10 bg-slate-900/40 px-3 py-1">
              <span className="text-slate-500">Effective: </span>
              <span className="text-white font-semibold">
                {SERVICE_AGREEMENT_EFFECTIVE_DATE}
              </span>
            </span>
          </div>

          {/* Plan switcher — useful for clients who want to compare */}
          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500">View other plans:</span>
            {VALID_PLANS.filter((p) => p !== plan).map((p) => (
              <Link
                key={p}
                href={`/legal/service-agreement?plan=${p}`}
                className="rounded-md border border-white/10 hover:border-sky-500/40 bg-slate-900/40 hover:bg-sky-500/10 px-3 py-1 text-slate-400 hover:text-sky-200 transition-colors"
              >
                {PLAN_LABEL[p]}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-6 py-12 space-y-10">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 leading-tight">
              {section.heading}
            </h2>
            <div className="space-y-4">
              {section.paragraphs.map((para, i) => (
                <p
                  key={i}
                  className="text-sm md:text-base text-slate-300 leading-relaxed whitespace-pre-line"
                >
                  {para}
                </p>
              ))}
            </div>
          </section>
        ))}

        <section className="pt-8 border-t border-white/5">
          <p className="text-xs text-slate-500 leading-relaxed">
            Questions about anything in this Agreement? Email{" "}
            <a
              href="mailto:ben@bluejayportfolio.com"
              className="text-sky-400 hover:underline"
            >
              ben@bluejayportfolio.com
            </a>{" "}
            before accepting on the onboarding form.
          </p>
        </section>
      </article>

      <footer className="pb-16">
        <div className="mx-auto max-w-3xl px-6 py-8 text-center text-xs text-slate-500">
          BlueJay Business Solutions LLC · Quilcene, WA · ben@bluejayportfolio.com
        </div>
      </footer>
    </main>
  );
}
