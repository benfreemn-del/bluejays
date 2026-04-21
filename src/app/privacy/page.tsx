import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import { BluejayLogoCircle } from "@/components/BluejayLogo";

const BASE_URL = "https://bluejayportfolio.com";
const PAGE_URL = `${BASE_URL}/privacy`;
const LAST_UPDATED = "April 10, 2026";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the BlueJays Privacy Policy to understand how BlueJays Business Solutions LLC collects, uses, stores, and protects prospect and client information.",
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    type: "article",
    siteName: "BlueJays",
    title: "Privacy Policy | BlueJays",
    description:
      "How BlueJays Business Solutions LLC collects, uses, stores, and protects prospect and client information.",
    url: PAGE_URL,
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | BlueJays",
    description:
      "How BlueJays Business Solutions LLC collects, uses, stores, and protects prospect and client information.",
  },
};

const sections = [
  {
    title: "Information We Collect",
    content: [
      "BlueJays Business Solutions LLC may collect information from publicly available sources and directly from business owners or representatives. Publicly available information may include business names, business addresses, phone numbers, website URLs, publicly visible Google reviews, social profiles, and other information that a business has made available online for marketing or informational purposes.",
      "We may also collect information that you voluntarily provide to us, including your name, business name, phone number, email address, mailing address, website information, project details, and any content you submit through forms, email, text message, or other communications with us.",
    ],
  },
  {
    title: "How We Use Information",
    content: [
      "We use collected information to identify businesses that may benefit from our services, create and present free custom website previews, communicate with prospects and clients, deliver web design and related services, process transactions, maintain business records, improve our website and outreach efforts, and comply with legal obligations.",
      "If we create a preview or proposal for your business, we may use publicly available information about your business, including review content, business descriptions, and brand references, solely to tailor that preview or proposal to your business.",
    ],
  },
  {
    title: "SMS, Email, and Outreach Communications",
    content: [
      "BlueJays may send promotional emails and SMS messages to business owners and representatives regarding our services, including offers to view a free custom website preview. By providing your phone number or otherwise engaging with our communications, you consent to receive communications from us to the extent permitted by applicable law.",
      "SMS consent is not a condition of purchase. Message frequency may vary (typically 2–4 messages per month per recipient). Message and data rates may apply based on your mobile carrier plan. To opt out of SMS messages at any time, reply STOP — you will receive one final confirmation and no further messages. For additional help, reply HELP or contact us at bluejaycontactme@gmail.com.",
      "Examples of the messages we send include: a link to your free custom website preview, a short follow-up if you have not responded, a link to a booking calendar to discuss your preview, a payment link if you express interest in purchasing, and transactional notices related to an active project.",
      "SMS consent, phone numbers, and mobile opt-in data are NOT shared with, sold to, or rented to any third parties or affiliates for marketing purposes. Phone numbers are used only by BlueJays and our direct messaging-service providers (such as Twilio) to deliver the messages you have consented to receive.",
      "Marketing emails may include an unsubscribe mechanism. You may opt out of promotional emails at any time by using the unsubscribe link provided in the email or by contacting us directly. Even if you opt out of marketing communications, we may still send service-related or transactional communications when appropriate.",
    ],
  },
  {
    title: "TCPA and Communication Consent",
    content: [
      "Where required by the Telephone Consumer Protection Act and similar laws, we seek to send text communications only where we believe we have an appropriate lawful basis to do so. We do not intend to send marketing text messages using telephone numbers obtained or used in violation of applicable law. If you believe you received a message from us in error or without appropriate consent, please contact us immediately so we can investigate and suppress future outreach.",
      "Your consent to receive marketing communications may be revoked at any time through the opt-out methods described in this policy.",
    ],
  },
  {
    title: "Cookies, Analytics, and Website Usage Data",
    content: [
      "Our website may use cookies, pixels, server logs, and similar technologies to understand site traffic, improve performance, measure campaign effectiveness, and maintain site security. These technologies may collect information such as IP address, browser type, device identifiers, pages viewed, referral information, and approximate location derived from network information.",
      "We may use analytics and hosting tools provided by third parties, including services associated with Vercel and other website infrastructure providers. You can generally control cookies through your browser settings, although disabling certain cookies may affect site functionality.",
      "We also use retargeting pixels provided by Meta (Facebook) and Google Ads on our homepage, preview pages, and claim pages. These pixels allow us to show relevant ads about BlueJays to visitors who have previously shown interest, across Meta properties (Facebook, Instagram) and the Google Display Network. The pixels record anonymized visit events only — no personal identifiers, purchase details, or message content are sent to Meta or Google. You can opt out of interest-based advertising via the Meta Ad Preferences page, Google Ads Settings, or your browser's Do Not Track settings.",
    ],
  },
  {
    title: "How We Store and Protect Data",
    content: [
      "Information may be stored and processed through cloud-based services we use to operate our business, including Vercel for website infrastructure and Supabase for database and application storage. We may also use email, CRM, communication, and payment service providers as needed to operate our business.",
      "We take commercially reasonable steps to protect information against unauthorized access, loss, misuse, or alteration. However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    title: "When We Share Information",
    content: [
      "We do not sell personal information for cash. We do NOT share, sell, rent, or transfer SMS consent, phone numbers, or mobile opt-in data to third parties or affiliates for their marketing or promotional purposes under any circumstances. This is separate from our general sharing practices and applies specifically to all mobile messaging data.",
      "We may share information with service providers and contractors who help us host our website, manage communications (including Twilio for SMS delivery and SendGrid for email delivery), process payments (Stripe), maintain databases (Supabase), support analytics, or otherwise operate our business, provided they are permitted to use the information only to deliver the service on our behalf and not for their own marketing.",
      "We may also disclose information if required to do so by law, to respond to legal process, to protect our rights or property, to enforce our agreements, or in connection with a merger, acquisition, financing, or sale of all or part of our business.",
    ],
  },
  {
    title: "Data Retention",
    content: [
      "We retain information for as long as reasonably necessary to fulfill the purposes described in this policy, including providing services, maintaining records, complying with legal obligations, resolving disputes, and enforcing agreements. Publicly sourced prospect information may be retained for lead management and suppression purposes, including to honor future opt-out requests.",
    ],
  },
  {
    title: "Your Choices and Rights",
    content: [
      "You may request that we update, correct, or delete certain information we hold about you, subject to applicable legal and operational requirements. You may also request that we stop sending promotional communications. To make a privacy-related request, please contact us at bluejaycontactme@gmail.com.",
      "Depending on your location, you may have additional rights under applicable privacy laws. We will review and respond to requests in accordance with applicable law.",
    ],
  },
  {
    title: "Third-Party Websites and Public Sources",
    content: [
      "Our website may contain links to third-party websites, and our outreach or previews may reference information obtained from public platforms such as business directories or review sites. We are not responsible for the privacy practices of third-party websites, platforms, or services. We encourage you to review their privacy policies separately.",
    ],
  },
  {
    title: "Children's Privacy",
    content: [
      "Our services are intended for business owners and adult representatives of businesses. We do not knowingly collect personal information from children under 13, and our website and services are not directed to children.",
    ],
  },
  {
    title: "Changes to This Privacy Policy",
    content: [
      "We may update this Privacy Policy from time to time to reflect changes in our services, legal obligations, or business practices. When we make changes, we will update the \"Last updated\" date at the top of this page. Your continued use of our website or continued engagement with our services after an update signifies your acceptance of the revised policy to the extent permitted by law.",
    ],
  },
  {
    title: "Contact Information",
    content: [
      "If you have questions about this Privacy Policy or our data practices, you may contact BlueJays Business Solutions LLC at bluejaycontactme@gmail.com or by using the contact methods available at bluejayportfolio.com.",
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

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#050a14] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute right-0 top-24 h-64 w-64 rounded-full bg-cyan-400/8 blur-3xl" />
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
              Privacy Policy
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              How BlueJays collects, uses, and protects business information.
            </h1>
            <p className="mt-5 text-base leading-8 text-white/70 sm:text-lg">
              This Privacy Policy describes how <strong>BlueJays Business Solutions LLC</strong>
              collects and uses information in connection with its website, outreach, free website
              previews, and web design services.
            </p>
          </div>

          <div className="grid gap-4 rounded-3xl border border-sky-500/20 bg-sky-500/5 p-5 text-sm text-white/75 sm:grid-cols-2 sm:p-6">
            <div>
              <p className="text-white/45">Last updated</p>
              <p className="mt-1 font-medium text-white">{LAST_UPDATED}</p>
            </div>
            <div>
              <p className="text-white/45">Business contact</p>
              <p className="mt-1 font-medium text-white">bluejaycontactme@gmail.com</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
        <div className="grid gap-8">
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              At a Glance
            </h2>
            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm text-white/70">
                <tbody className="divide-y divide-white/10 bg-[#081120]">
                  <tr>
                    <th className="w-1/3 px-4 py-4 font-medium text-white">Company</th>
                    <td className="px-4 py-4">BlueJays Business Solutions LLC</td>
                  </tr>
                  <tr>
                    <th className="px-4 py-4 font-medium text-white">Services</th>
                    <td className="px-4 py-4">Custom web design, domain setup, hosting setup, maintenance, and support</td>
                  </tr>
                  <tr>
                    <th className="px-4 py-4 font-medium text-white">Primary data sources</th>
                    <td className="px-4 py-4">Public business information, direct submissions, email, SMS, and website forms</td>
                  </tr>
                  <tr>
                    <th className="px-4 py-4 font-medium text-white">Outreach opt-out</th>
                    <td className="px-4 py-4">Reply STOP to SMS or use the unsubscribe link in emails</td>
                  </tr>
                  <tr>
                    <th className="px-4 py-4 font-medium text-white">Infrastructure</th>
                    <td className="px-4 py-4">Vercel, Supabase, and related service providers</td>
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
