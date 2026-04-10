import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import { BluejayLogoCircle } from "@/components/BluejayLogo";

const BASE_URL = "https://bluejayportfolio.com";
const PAGE_URL = `${BASE_URL}/terms`;
const LAST_UPDATED = "April 10, 2026";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the BlueJays Terms of Service governing website previews, web design services, domain and hosting setup, pricing, ownership, and communications.",
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    type: "article",
    siteName: "BlueJays",
    title: "Terms of Service | BlueJays",
    description:
      "Terms governing BlueJays website previews, web design services, pricing, ownership, and communications.",
    url: PAGE_URL,
  },
  twitter: {
    card: "summary",
    title: "Terms of Service | BlueJays",
    description:
      "Terms governing BlueJays website previews, web design services, pricing, ownership, and communications.",
  },
};

const sections = [
  {
    title: "Acceptance of These Terms",
    content: [
      "These Terms of Service govern your access to and use of the website, previews, communications, and services offered by BlueJays Business Solutions LLC, including through bluejayportfolio.com. By accessing our website, viewing a preview, responding to our outreach, or purchasing services from us, you agree to be bound by these Terms to the extent permitted by applicable law.",
      "If you are acting on behalf of a business, you represent that you have authority to bind that business to these Terms.",
    ],
  },
  {
    title: "Our Services",
    content: [
      "BlueJays provides custom web design and related business website services for local businesses. Our service offering may include design, development, copy adaptation, media integration, domain registration assistance, hosting setup, launch support, maintenance, support, and related consulting or implementation services.",
      "We may also create unsolicited or invited preview websites, mockups, or demo pages using publicly available business information so that a business can evaluate our work before purchasing. These previews are for demonstration purposes unless and until a paid engagement is completed.",
    ],
  },
  {
    title: "Free Previews and Demo Sites",
    content: [
      "BlueJays may present free custom preview websites or demo concepts to prospective clients. A preview is offered solely to demonstrate what we may build for your business and does not, by itself, transfer any ownership rights, source files, domain rights, hosting rights, or license to use the preview in commerce.",
      "You may view a preview without charge. However, payment is required before you may claim, publish, take possession of, request transfer of, or commercially use the design, code, layout, copy refinements prepared by us, or any derivative deliverables associated with that preview, except for any materials that you independently own and supplied to us.",
    ],
  },
  {
    title: "Pricing and Payment Terms",
    content: [
      "Unless otherwise agreed in writing, BlueJays currently offers a standard pricing structure of $997 as a one-time fee for a custom website package, which may include a custom website, domain registration assistance, and hosting setup. Ongoing services may be offered at $100 per year for domain renewal, hosting, maintenance, and support.",
      "Pricing is subject to change for future transactions, but any approved proposal or written agreement in effect at the time of purchase will control that transaction. Payment may be collected through third-party processors, including Stripe when enabled. You authorize us and our payment processors to charge the applicable fees, taxes, and related charges associated with your purchase.",
      "Unless otherwise stated in writing, fees are non-refundable once project work has materially commenced, domain purchases have been made, hosting has been provisioned, or deliverables have been transferred. Custom work often involves immediate allocation of labor and third-party costs, which is why refunds may be limited or unavailable after work begins.",
    ],
  },
  {
    title: "Client Responsibilities",
    content: [
      "To complete a project efficiently, you agree to provide accurate business information, timely feedback, required approvals, and any content or assets that you want included on your website. You are responsible for ensuring that materials you provide, including text, logos, images, and brand assets, do not infringe the rights of others and may lawfully be used in your project.",
      "Delays in communication, missing content, or changes in scope may affect delivery timelines and may require revised pricing or a new implementation schedule.",
    ],
  },
  {
    title: "Intellectual Property",
    content: [
      "BlueJays retains ownership of its pre-existing materials, methods, systems, reusable code, frameworks, templates, internal tools, design systems, know-how, and all preview materials unless expressly transferred in writing. This includes the right to reuse general-purpose components, patterns, and non-client-specific design or development assets across projects.",
      "You retain ownership of content and materials that you provide to us, subject to your grant of any rights necessary for us to use that content to perform the services. Upon full payment of all applicable fees, you will own the final client-specific website content and custom deliverables that we expressly provide to you for your business, excluding our retained tools, templates, and other reusable intellectual property unless otherwise agreed in writing.",
    ],
  },
  {
    title: "Domains, Hosting, and Third-Party Services",
    content: [
      "Domain registration, hosting, analytics, communications, payment processing, and related services may be provided through third-party providers. Availability, pricing, functionality, and uptime of third-party services are outside our direct control. We are not responsible for service interruptions, policy changes, or failures caused by third-party providers, although we may assist with reasonable support efforts where included in your plan.",
      "If BlueJays registers, configures, or manages services on your behalf, you agree to cooperate in providing accurate information and completing any required verification or ownership steps.",
    ],
  },
  {
    title: "Communications and Consent",
    content: [
      "By submitting your contact information, responding to our outreach, or otherwise engaging with BlueJays, you agree that we may contact you by email, phone, or SMS regarding your preview, our services, service updates, or your transaction, subject to applicable law. Consent to receive promotional SMS messages is not a condition of purchase. Message frequency may vary, and message and data rates may apply.",
      "You may opt out of marketing text messages by replying STOP and opt out of marketing emails by using the unsubscribe link included in the message or by contacting us directly. You acknowledge that we may still send non-marketing communications relating to an active project, transaction, or legal notice when appropriate.",
    ],
  },
  {
    title: "Acceptable Use",
    content: [
      "You agree not to misuse our website, previews, or services, including by attempting to copy or republish preview materials without authorization, interfere with site operation, reverse engineer protected systems beyond rights granted by law, or use our website in any manner that violates law or infringes the rights of others.",
    ],
  },
  {
    title: "Disclaimers",
    content: [
      "Our website, previews, and services are provided on an \"as is\" and \"as available\" basis except as otherwise expressly stated in writing. To the maximum extent permitted by law, BlueJays disclaims all implied warranties, including implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement.",
      "We do not guarantee that any website, preview, campaign, or service will produce a particular amount of revenue, leads, rankings, conversions, or business growth.",
    ],
  },
  {
    title: "Limitation of Liability",
    content: [
      "To the fullest extent permitted by law, BlueJays Business Solutions LLC and its owners, affiliates, contractors, and service providers will not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, or for any loss of profits, revenue, goodwill, data, business opportunity, or anticipated savings arising out of or related to your use of our website, previews, communications, or services.",
      "To the fullest extent permitted by law, our total aggregate liability for any claim arising out of or related to the services or these Terms will not exceed the total amount you paid to BlueJays for the specific services giving rise to the claim during the twelve months preceding the event giving rise to liability.",
    ],
  },
  {
    title: "Indemnification",
    content: [
      "You agree to defend, indemnify, and hold harmless BlueJays Business Solutions LLC and its affiliates, officers, owners, employees, and contractors from and against claims, liabilities, damages, judgments, losses, and expenses arising out of or related to your content, your misuse of our services, your breach of these Terms, or your violation of applicable law or third-party rights.",
    ],
  },
  {
    title: "Termination",
    content: [
      "We may suspend or terminate access to our website, previews, communications, or services if we believe you have violated these Terms, created legal or operational risk, failed to pay amounts due, or otherwise engaged in conduct inconsistent with a productive business relationship. Any provisions that by their nature should survive termination will survive, including payment obligations, ownership provisions, disclaimers, limitations of liability, and indemnification obligations.",
    ],
  },
  {
    title: "Changes to These Terms",
    content: [
      "We may revise these Terms from time to time. When we do, we will update the \"Last updated\" date at the top of this page. Updated Terms become effective when posted unless otherwise stated. Your continued use of our website or services after revised Terms are posted constitutes acceptance of those revised Terms to the extent permitted by law.",
    ],
  },
  {
    title: "Contact Information",
    content: [
      "Questions about these Terms may be sent to BlueJays Business Solutions LLC at bluejaycontactme@gmail.com.",
    ],
  },
];

function SectionCard({ title, content }: { title: string; content: string[] }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
      <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-white/70 sm:text-base">
        {content.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#050a14] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-24 top-10 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute right-10 top-16 h-64 w-64 rounded-full bg-cyan-400/8 blur-3xl" />
        </div>

        <div className="relative mx-auto flex max-w-5xl flex-col gap-8 px-6 py-8 sm:py-10">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-sm font-medium text-white/80 transition hover:text-sky-400"
            >
              <BluejayLogoCircle size={40} />
              <span>Back to BlueJays</span>
            </Link>
          </div>

          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-400">
              Terms of Service
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Terms governing previews, project work, pricing, and communications.
            </h1>
            <p className="mt-5 text-base leading-8 text-white/70 sm:text-lg">
              These Terms of Service explain the rules that apply when you access the BlueJays
              website, view a free custom preview, or purchase services from <strong>BlueJays
              Business Solutions LLC</strong>.
            </p>
          </div>

          <div className="grid gap-4 rounded-3xl border border-sky-500/20 bg-sky-500/5 p-5 text-sm text-white/75 sm:grid-cols-2 sm:p-6">
            <div>
              <p className="text-white/45">Last updated</p>
              <p className="mt-1 font-medium text-white">{LAST_UPDATED}</p>
            </div>
            <div>
              <p className="text-white/45">Current standard pricing</p>
              <p className="mt-1 font-medium text-white">$997 one-time + $100/year</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
        <div className="grid gap-8">
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Service Summary
            </h2>
            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm text-white/70">
                <tbody className="divide-y divide-white/10 bg-[#081120]">
                  <tr>
                    <th className="w-1/3 px-4 py-4 font-medium text-white">Provider</th>
                    <td className="px-4 py-4">BlueJays Business Solutions LLC</td>
                  </tr>
                  <tr>
                    <th className="px-4 py-4 font-medium text-white">Primary offer</th>
                    <td className="px-4 py-4">Custom website design for local businesses</td>
                  </tr>
                  <tr>
                    <th className="px-4 py-4 font-medium text-white">Included in standard package</th>
                    <td className="px-4 py-4">Custom website, domain registration assistance, and hosting setup</td>
                  </tr>
                  <tr>
                    <th className="px-4 py-4 font-medium text-white">Ongoing annual service</th>
                    <td className="px-4 py-4">Domain renewal, hosting, maintenance, and support</td>
                  </tr>
                  <tr>
                    <th className="px-4 py-4 font-medium text-white">Preview policy</th>
                    <td className="px-4 py-4">Free to view; payment required before claiming or using the work commercially</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {sections.map((section) => (
            <SectionCard key={section.title} title={section.title} content={section.content} />
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
