import { notFound } from "next/navigation";
import { CATEGORY_CONFIG, PRICING } from "@/lib/types";
import { getProspect } from "@/lib/store";
import {
  generatePersonalizedProposal,
  getStoredProposal,
} from "@/lib/proposal-generator";
import ProposalClientExtras from "./ProposalClientExtras";

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

  // ROI calculator defaults — how many customers to break even at $997
  const categoryJobValues: Record<string, number> = {
    "real-estate": 9000, "dental": 800, "law-firm": 3500, "roofing": 7500,
    "hvac": 2500, "electrician": 1200, "plumber": 900, "auto-repair": 600,
    "landscaping": 1500, "cleaning": 350, "pest-control": 450,
    "moving": 1800, "general-contractor": 8000, "fitness": 80, "salon": 150,
    "photography": 1200, "interior-design": 5000, "accounting": 1500,
    "insurance": 600, "veterinary": 250, "dental-default": 800,
  };
  const defaultJobValue = categoryJobValues[prospect.category] ?? 500;
  const breakEvenClients = Math.ceil(PRICING.basePrice / defaultJobValue);

  // Agency comparison data
  const AGENCY_COMPARISON = [
    { feature: "Custom website design", bluejays: true, agency: true, diy: false },
    { feature: "Domain + hosting included", bluejays: true, agency: false, diy: false },
    { feature: "48-hour turnaround", bluejays: true, agency: false, diy: false },
    { feature: "One-time flat price", bluejays: true, agency: false, diy: false },
    { feature: "SEO + mobile optimized", bluejays: true, agency: true, diy: false },
    { feature: "No ongoing monthly fees", bluejays: true, agency: false, diy: true },
    { feature: "Industry-specific design", bluejays: true, agency: true, diy: false },
  ];

  const accentColor = config?.accentColor || "#0ea5e9";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-b from-blue-electric/15 via-background to-background border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-xs text-muted">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: accentColor }}
              />
              Personalized proposal for {prospect.businessName}
            </div>
            {/* PDF print button — client component */}
            <ProposalClientExtras />
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
          {/* Executive summary */}
          <section className="rounded-3xl border border-border bg-surface p-8">
            <h2 className="text-2xl font-bold mb-4">Executive summary</h2>
            <p className="text-muted leading-7 whitespace-pre-wrap">{proposal.summary}</p>
          </section>

          {/* ROI Calculator */}
          <section className="rounded-3xl border border-border bg-surface p-8">
            <h2 className="text-2xl font-bold mb-2">ROI — how quickly does this pay for itself?</h2>
            <p className="text-sm text-muted mb-6">
              Based on the average job value for {config?.label || prospect.category} businesses,
              here&apos;s how many new customers you need to fully pay for the website.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <RoiCard
                label="Website investment"
                value={`$${PRICING.basePrice.toLocaleString()}`}
                sub="one-time"
                accent={accentColor}
              />
              <RoiCard
                label="Average job value"
                value={`$${defaultJobValue.toLocaleString()}`}
                sub={`typical ${config?.label || prospect.category}`}
                accent={accentColor}
              />
              <RoiCard
                label="Break-even point"
                value={`${breakEvenClients} client${breakEvenClients !== 1 ? "s" : ""}`}
                sub="from your new website"
                accent={accentColor}
                highlight
              />
            </div>
            <p className="text-sm text-muted leading-6 rounded-2xl bg-surface-light border border-border p-4">
              If your new website brings in just{" "}
              <strong className="text-foreground">{breakEvenClients} additional customer{breakEvenClients !== 1 ? "s" : ""}</strong> this
              year, it&apos;s already paid for itself. Every customer after that is pure profit
              on a $0/month marketing asset.
            </p>
          </section>

          {/* Pain points */}
          <section className="rounded-3xl border border-border bg-surface p-8">
            <h2 className="text-2xl font-bold mb-5">Visible opportunities</h2>
            <div className="space-y-3">
              {proposal.painPoints.length > 0 ? proposal.painPoints.map((point) => (
                <div key={point} className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm leading-6 text-muted">
                  {point}
                </div>
              )) : (
                <p className="text-muted text-sm">
                  Our personalized analysis is in the full proposal below.
                </p>
              )}
            </div>
          </section>

          {/* Agency comparison */}
          <section className="rounded-3xl border border-border bg-surface p-8">
            <h2 className="text-2xl font-bold mb-2">
              {prospect.businessName} vs. the alternatives
            </h2>
            <p className="text-sm text-muted mb-6">
              Why BlueJays beats both hiring an agency and trying to DIY it.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 pr-4 font-medium text-muted">Feature</th>
                    <th className="text-center py-3 px-4 font-semibold" style={{ color: accentColor }}>BlueJays</th>
                    <th className="text-center py-3 px-4 font-medium text-muted">Agency ($5–15K)</th>
                    <th className="text-center py-3 px-4 font-medium text-muted">DIY (Wix/Squarespace)</th>
                  </tr>
                </thead>
                <tbody>
                  {AGENCY_COMPARISON.map((row, i) => (
                    <tr key={row.feature} className={i % 2 === 0 ? "bg-surface-light/30" : ""}>
                      <td className="py-3 pr-4 text-muted">{row.feature}</td>
                      <td className="text-center py-3 px-4">
                        <span className="text-green-400 text-base">&#10003;</span>
                      </td>
                      <td className="text-center py-3 px-4">
                        {row.agency
                          ? <span className="text-green-400 text-base">&#10003;</span>
                          : <span className="text-red-400 text-base">&#10007;</span>}
                      </td>
                      <td className="text-center py-3 px-4">
                        {row.diy
                          ? <span className="text-green-400 text-base">&#10003;</span>
                          : <span className="text-red-400 text-base">&#10007;</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted mt-4 leading-5">
              Agency pricing based on industry average for custom website builds ($5,000–$15,000+
              plus $150–500/month hosting and maintenance). Wix/Squarespace requires DIY design and
              charges $16–45/month forever.
            </p>
          </section>

          {/* Full proposal */}
          <section className="rounded-3xl border border-border bg-surface p-8">
            <h2 className="text-2xl font-bold mb-5">Full analysis</h2>
            <article className="prose prose-invert max-w-none whitespace-pre-wrap text-sm leading-7 text-slate-200">
              {proposal.content}
            </article>
          </section>
        </div>

        {/* Sidebar CTA */}
        <aside className="space-y-6">
          <section className="rounded-3xl border border-border bg-surface p-6 sticky top-6">
            <h2 className="text-xl font-bold mb-2">Ready to move forward?</h2>
            <p className="text-sm text-muted leading-6 mb-6">
              Claim the website now or book a free 15-minute walkthrough with Ben — he&apos;ll
              show you the full site live and answer any questions.
            </p>

            <div className="space-y-3">
              <a
                href={claimUrl}
                className="w-full h-12 rounded-xl bg-green-600 text-white text-sm font-semibold inline-flex items-center justify-center hover:bg-green-700 transition-colors"
              >
                Claim &amp; Pay — $997
              </a>
              <a
                href={bookUrl}
                className="w-full h-12 rounded-xl bg-blue-electric text-white text-sm font-semibold inline-flex items-center justify-center hover:bg-blue-deep transition-colors"
              >
                Book a Free Walkthrough
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

            <div className="rounded-2xl bg-surface-light border border-border p-4 mt-6 space-y-2">
              <PriceLine label="Website design + domain + hosting" value={`$${PRICING.basePrice}`} />
              <PriceLine label="Annual maintenance (after year 1)" value={`$${PRICING.yearlyManagement}/yr`} />
              <PriceLine label="Monthly fees" value="$0" />
              <div className="pt-2 border-t border-border text-xs text-muted">
                Payment plan: 3 payments of $349 available at checkout.
              </div>
            </div>
          </section>

          {/* What's included */}
          <section className="rounded-3xl border border-border bg-surface p-6">
            <h3 className="font-bold mb-4">What&apos;s included at $997</h3>
            <div className="grid gap-3 text-sm text-muted">
              {[
                "Custom design built around your brand and industry",
                "Domain registration (or connection) and hosting setup",
                "Mobile-optimized and SEO-configured",
                "Live in 48 hours",
                "Free revision round included",
              ].map((item) => (
                <div key={item} className="flex gap-3 items-start">
                  <span className="text-green-400 mt-0.5">&#10003;</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Trust signals */}
          {(prospect.googleRating || prospect.reviewCount) && (
            <section className="rounded-3xl border border-border bg-surface p-6">
              <h3 className="font-bold mb-3">Your current online presence</h3>
              <div className="space-y-2 text-sm text-muted">
                {prospect.googleRating && (
                  <div className="flex justify-between">
                    <span>Google rating</span>
                    <span className="font-semibold text-foreground">{prospect.googleRating} ★</span>
                  </div>
                )}
                {prospect.reviewCount && (
                  <div className="flex justify-between">
                    <span>Google reviews</span>
                    <span className="font-semibold text-foreground">{prospect.reviewCount}</span>
                  </div>
                )}
                <p className="text-xs leading-5 pt-2 border-t border-border">
                  Great ratings like yours deserve a website that shows them off to everyone
                  searching for {config?.label?.toLowerCase() || prospect.category} in {prospect.city}.
                </p>
              </div>
            </section>
          )}
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

function RoiCard({
  label, value, sub, accent, highlight,
}: {
  label: string; value: string; sub: string; accent: string; highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 text-center ${
        highlight ? "bg-surface-light border-current/20" : "bg-surface border-border"
      }`}
      style={highlight ? { borderColor: `${accent}33`, backgroundColor: `${accent}08` } : undefined}
    >
      <p className="text-xs text-muted mb-1">{label}</p>
      <p
        className="text-2xl font-bold"
        style={highlight ? { color: accent } : undefined}
      >
        {value}
      </p>
      <p className="text-xs text-muted mt-1">{sub}</p>
    </div>
  );
}

function PriceLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
