import { notFound } from "next/navigation";
import { CATEGORY_CONFIG, PRICING } from "@/lib/types";
import { getProspect } from "@/lib/store";
import {
  generatePersonalizedProposal,
  getStoredProposal,
} from "@/lib/proposal-generator";

export default async function ProposalPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prospect = await getProspect(id);

  if (!prospect) {
    notFound();
  }

  const proposal = (await getStoredProposal(id)) || (await generatePersonalizedProposal(id));
  const config = CATEGORY_CONFIG[prospect.category];
  const previewUrl = prospect.generatedSiteUrl || `/preview/${prospect.id}`;
  const claimUrl = `/claim/${prospect.id}`;
  const bookUrl = `/book/${prospect.id}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-blue-electric/15 via-background to-background border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-xs text-muted mb-6">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: config?.accentColor || "#0ea5e9" }}
            />
            Personalized proposal for {prospect.businessName}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            A custom website plan built around {prospect.businessName}
          </h1>
          <p className="text-lg text-muted max-w-3xl leading-relaxed">
            {proposal.summary}
          </p>

          <div className="grid md:grid-cols-4 gap-4 mt-10">
            <InfoCard label="Business" value={prospect.businessName} />
            <InfoCard label="Category" value={config?.label || prospect.category} />
            <InfoCard label="Location" value={`${prospect.city}, ${prospect.state}`} />
            <InfoCard label="Generated" value={new Date(proposal.updatedAt).toLocaleDateString()} />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 grid lg:grid-cols-[1.3fr_0.7fr] gap-8">
        <div className="space-y-8">
          <section className="rounded-3xl border border-border bg-surface p-8">
            <h2 className="text-2xl font-bold mb-4">Executive summary</h2>
            <p className="text-muted leading-7 whitespace-pre-wrap">{proposal.summary}</p>
          </section>

          <section className="rounded-3xl border border-border bg-surface p-8">
            <h2 className="text-2xl font-bold mb-5">Visible pain points and opportunities</h2>
            <div className="space-y-3">
              {proposal.painPoints.length > 0 ? proposal.painPoints.map((point) => (
                <div key={point} className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm leading-6 text-muted">
                  {point}
                </div>
              )) : (
                <p className="text-muted">No specific pain points were captured yet, but the proposal below still reflects the available prospect context.</p>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-surface p-8">
            <h2 className="text-2xl font-bold mb-5">Full proposal</h2>
            <article className="prose prose-invert max-w-none whitespace-pre-wrap text-sm leading-7 text-slate-200">
              {proposal.content}
            </article>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-border bg-surface p-6 sticky top-6">
            <h2 className="text-xl font-bold mb-2">Next step</h2>
            <p className="text-sm text-muted leading-6 mb-6">
              If this looks like the right fit, you can either claim the website now or book a quick walkthrough call first.
            </p>

            <div className="space-y-3">
              <a
                href={claimUrl}
                className="w-full h-12 rounded-xl bg-green-600 text-white text-sm font-semibold inline-flex items-center justify-center hover:bg-green-700 transition-colors"
              >
                Claim & Pay
              </a>
              <a
                href={bookUrl}
                className="w-full h-12 rounded-xl bg-blue-electric text-white text-sm font-semibold inline-flex items-center justify-center hover:bg-blue-deep transition-colors"
              >
                Book a Call
              </a>
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 rounded-xl border border-border text-sm font-semibold inline-flex items-center justify-center hover:border-blue-electric/40 transition-colors"
              >
                View Website Preview
              </a>
            </div>

            <div className="rounded-2xl bg-surface-light border border-border p-4 mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Website build</span>
                <span className="font-semibold">${PRICING.basePrice}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Management after year one</span>
                <span className="font-semibold">${PRICING.yearlyManagement}/year</span>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-surface p-6">
            <h3 className="font-bold mb-4">What this proposal includes</h3>
            <div className="grid gap-3 text-sm text-muted">
              {[
                "Prospect-specific recommendations based on CRM, scraped site data, review signals, and notes",
                "A clearer website positioning plan for local buyers",
                "Practical conversion improvements tied to the current online presence",
                "A direct path to either claim the site or book a walkthrough",
              ].map((item) => (
                <div key={item} className="flex gap-3 items-start">
                  <span className="text-blue-electric mt-0.5">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted mb-2">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
