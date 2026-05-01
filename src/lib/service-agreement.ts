/**
 * BlueJays Service Agreement — versioned, plan-aware contract text.
 *
 * Why this exists: every paid client should accept a written service
 * agreement before onboarding. Up to now we ran on handshakes —
 * exposed on payment terms, IP transfer, liability cap, refund triggers.
 *
 * Storage strategy: when a client accepts, we record
 * `prospect.scraped_data.serviceAgreement = { version, acceptedAt }` so
 * we have a permanent audit trail. If we ever change the agreement
 * text, we bump SERVICE_AGREEMENT_VERSION — past acceptances stay
 * tied to the version they actually saw.
 *
 * Legal note: this template was drafted by Ben + AI assistance and
 * covers the standard bases for a single-member WA LLC web-design
 * service. It's a strong starting point but **should be reviewed by
 * a Washington-state small-business attorney once you cross 10+ closes**
 * (~$300–500 one-time review). Until then, this is materially better
 * than no agreement at all and is enforceable as a click-wrap contract
 * in WA when accepted via the onboarding checkbox.
 *
 * Click-wrap requirements satisfied here:
 *   1. Clear notice of the agreement (linked from onboarding form)
 *   2. Affirmative consent (unchecked checkbox, must be ticked)
 *   3. Ability to review full text before consenting (link opens
 *      a public, scrollable page rendering this text in full)
 *   4. Record of consent (timestamp + version stored on prospect)
 *   5. Identifiable consenter (prospect.email + prospect.id)
 */

export const SERVICE_AGREEMENT_VERSION = "1.1.0";
export const SERVICE_AGREEMENT_EFFECTIVE_DATE = "2026-04-30";

export type ServiceAgreementPlan =
  | "standard"     // $997 one-time + $100/yr starting year 2
  | "installment"  // $349 × 3 + $100/yr starting year 2
  | "custom"       // bespoke pricing
  | "agency";      // $9,700 (or 3 × $3,500) AI Marketing System + $497/mo retainer

type AgreementVars = {
  plan: ServiceAgreementPlan;
  planLabel: string;
  upfrontTotal: string;
  paymentSchedule: string;
};

function planVars(plan: ServiceAgreementPlan): AgreementVars {
  switch (plan) {
    case "installment":
      return {
        plan,
        planLabel: "Installment Plan",
        upfrontTotal: "$1,047 ($349 × 3 monthly payments)",
        paymentSchedule:
          "Three (3) monthly installments of $349 USD. The first installment is due upon acceptance of this Agreement; the second and third installments are due thirty (30) and sixty (60) days after the first.",
      };
    case "custom":
      return {
        plan,
        planLabel: "Custom",
        upfrontTotal: "as quoted by Provider in writing",
        paymentSchedule:
          "Per the written quote provided by Provider and accepted by Client. Payment is due in full upon acceptance of this Agreement unless otherwise specified in the quote.",
      };
    case "agency":
      return {
        plan,
        planLabel: "AI Marketing System (Agency)",
        upfrontTotal: "$9,700 USD one-time (save $300) OR three (3) milestone payments totaling $10,000",
        paymentSchedule:
          "Two payment options: (a) $9,700 USD paid in full upon acceptance of this Agreement; OR (b) three milestone payments — $3,500 upon acceptance, $3,500 at Day 30 of the engagement, $3,000 at Day 60 ($10,000 total). Optional ongoing retainer of $497 USD per month begins on Day 91, billed monthly via Stripe Subscriptions, cancellable any time with thirty (30) days’ notice.",
      };
    case "standard":
    default:
      return {
        plan: "standard",
        planLabel: "Standard",
        upfrontTotal: "$997 USD (one-time)",
        paymentSchedule:
          "One (1) payment of $997 USD, due in full upon acceptance of this Agreement.",
      };
  }
}

export type AgreementSection = {
  heading: string;
  paragraphs: string[];
};

/**
 * Build the full agreement structured by section. Used by the public
 * viewer at /legal/service-agreement and by the onboarding checkbox
 * disclosure tooltip.
 *
 * The "agency" plan ($9,700 AI Marketing System) is materially
 * different from the website plans — different deliverables, a
 * lead-volume guarantee instead of a "money-back if you hate the
 * preview" guarantee, ongoing retainer obligations, ad-spend
 * obligations on the Client side, etc. Dispatched to its own builder.
 */
export function buildServiceAgreement(plan: ServiceAgreementPlan): AgreementSection[] {
  if (plan === "agency") return buildAgencyAgreement();
  const v = planVars(plan);

  return [
    {
      heading: "1. Parties",
      paragraphs: [
        "This Service Agreement (the “Agreement”) is between BlueJay Business Solutions LLC, a Washington State limited liability company located in Quilcene, Washington (“Provider,” “BlueJays,” “we,” “us,” or “our”), and the individual or business identified during onboarding (the “Client,” “you,” or “your”).",
        "By checking the acceptance box on the onboarding form, you (a) confirm that you have authority to bind the Client to this Agreement, (b) confirm that you have read this Agreement in full, and (c) agree to be bound by its terms.",
      ],
    },
    {
      heading: "2. Services & Deliverables",
      paragraphs: [
        "Provider will deliver one (1) custom website (“the Site”) for Client’s business, including:",
        "• Custom design tailored to Client’s industry and brand",
        "• Mobile-first, responsive layout across desktop, tablet, and mobile",
        "• Domain name registration (one domain selected by Client, subject to availability)",
        "• Hosting setup for the first year",
        "• Professional copywriting based on Client-provided content + Provider’s research",
        "• Local SEO optimization (meta tags, structured data, image optimization)",
        "• Up to five (5) standard pages (Home, About, Services, Contact, plus one additional)",
        "• A live preview link for Client review prior to launch",
        "• Free revisions during the build phase (see Section 6)",
        "Excluded unless purchased separately: e-commerce / payment processing integration, custom apps or APIs beyond the standard build, ongoing SEO services, paid advertising management, content for additional pages beyond the five included, photography services, video production, and translation services.",
      ],
    },
    {
      heading: "3. Pricing & Payment",
      paragraphs: [
        `Plan: ${v.planLabel}.`,
        `Total Project Fee: ${v.upfrontTotal}.`,
        `Payment Schedule: ${v.paymentSchedule}`,
        "Annual Maintenance Fee: One hundred dollars ($100 USD) per year, beginning twelve (12) months after the Site goes live, covering domain renewal, hosting, security, software updates, uptime monitoring, and minor content changes. Client may cancel the maintenance subscription at any time before annual renewal; cancellation does not entitle Client to a refund of any prepaid maintenance fees but does entitle Client to transfer the domain to a registrar of their choice (see Section 7).",
        "Payments are processed via Stripe. Failed payments will be retried per Stripe’s standard dunning schedule. Repeated failure may result in suspension of services until current.",
        "All fees are stated in U.S. Dollars and are exclusive of any applicable taxes, which Client is responsible for.",
      ],
    },
    {
      heading: "4. Money-Back Guarantee & Refunds",
      paragraphs: [
        "Provider offers a 100% money-back guarantee under the following terms:",
        "• Client may request a full refund at any time prior to launch of the Site if, in Client’s reasonable judgment, the delivered preview does not meet the standard of work represented by Provider on bluejayportfolio.com.",
        "• Refund requests must be submitted in writing (email to ben@bluejayportfolio.com) prior to launch.",
        "• Upon refund, Client will receive 100% of fees paid to date, less any third-party domain registration fees that have already been paid by Provider on Client’s behalf and are non-refundable per the registrar’s policy.",
        "• Refunds are not available after the Site has gone live (i.e., the domain is pointed at the new Site and the Site is publicly accessible). After launch, Client’s remedy for dissatisfaction is the free-revisions policy in Section 6.",
        "• Refunds for the annual maintenance fee follow the cancellation policy in Section 3.",
      ],
    },
    {
      heading: "5. Timeline",
      paragraphs: [
        "Provider commits to delivering a preview of the Site within forty-eight (48) hours of receiving Client’s completed onboarding form (the “Onboarding Submission”). The forty-eight-hour clock starts when the Onboarding Submission is complete; if Client provides only partial information, the clock starts when the missing required fields are supplied.",
        "Required onboarding fields include: business name, primary contact, brand colors, list of services offered, hours of operation, and any photos or assets Client wishes to feature.",
        "Provider is not responsible for delays caused by Client’s failure to respond to revision requests, provide content, or make payment.",
        "Total project completion (preview → revisions → launch) typically occurs within five (5) business days of the Onboarding Submission, though complex projects may take longer.",
      ],
    },
    {
      heading: "6. Revisions",
      paragraphs: [
        "Provider offers free revisions during the build phase (between preview delivery and launch) until Client is satisfied with the Site, subject to the following limits:",
        "• Revisions must be requested in writing (email or a designated revision form) and clearly describe the change.",
        "• Revisions of design (layout, color, typography) and copy (text content) are unlimited within the scope of the original five (5) pages.",
        "• Adding new pages, new functionality, or new media beyond the original scope is a new engagement and will be quoted separately.",
        "• Provider commits to completing each revision round within twenty-four (24) business hours of receipt.",
        "• Once Client approves the Site for launch, the build phase ends. Post-launch changes are covered by the annual maintenance fee for minor content updates, or quoted separately for significant changes.",
      ],
    },
    {
      heading: "7. Domain & Hosting",
      paragraphs: [
        "Provider registers Client’s domain name through a third-party registrar (currently Namecheap) on Client’s behalf during the first year of service.",
        "Domain ownership: The domain is registered under Client’s name and contact information from the outset. Client is the legal owner of the domain at all times.",
        "Domain transfer: Upon Client’s written request — with or without ongoing maintenance — Provider will transfer registrar control of the domain to a registrar of Client’s choice within seven (7) business days. Client is responsible for any transfer fees charged by the receiving registrar.",
        "Hosting: Provider hosts the Site on a third-party hosting platform (currently Vercel) for the first year as part of the project fee. Beginning in year 2, hosting is included in the annual maintenance fee.",
        "If Client cancels the annual maintenance subscription, Client may either (a) take over hosting on a registrar/host of their choice, or (b) request that Provider take the Site offline. Provider is not obligated to continue hosting an unpaid Site.",
      ],
    },
    {
      heading: "8. Client Responsibilities",
      paragraphs: [
        "Client agrees to:",
        "• Provide accurate, current, and complete information during onboarding",
        "• Provide content (text, photos, logos, brand colors) that Client owns or has the legal right to use, and to indemnify Provider against any claim that Client-provided content infringes third-party rights",
        "• Respond to revision requests and approval prompts in a reasonable timeframe (Provider may pause work after fourteen (14) days of unresponsiveness)",
        "• Maintain payment in good standing per the schedule in Section 3",
        "• Not use the Site for unlawful purposes, including but not limited to fraud, defamation, copyright infringement, or content that violates U.S. or Washington State law",
      ],
    },
    {
      heading: "9. Intellectual Property",
      paragraphs: [
        "Upon receipt of full payment of the Project Fee, Provider transfers to Client a perpetual, irrevocable, worldwide, royalty-free license to use the Site’s final delivered code, copy, design, and assets in connection with Client’s business.",
        "Client owns all final delivered work product, except for: (a) third-party libraries, fonts, plugins, and stock photography licensed under their original licensors’ terms; (b) Provider’s underlying design templates, V2 framework code, internal scripts, and proprietary methodologies, which remain the property of Provider; and (c) any content, photos, or copy provided by Client, which remains Client’s property.",
        "Provider retains the right to feature the Site, screenshots of the Site, and a link to the live Site in Provider’s portfolio, case studies, marketing materials, and ad creatives. Client may opt out of public portfolio inclusion by written request.",
      ],
    },
    {
      heading: "10. Confidentiality",
      paragraphs: [
        "Both parties agree to keep confidential any non-public information shared during the engagement, including pricing details, business strategies, customer lists, and proprietary content. This obligation survives termination of the Agreement.",
        "Confidentiality does not apply to information that is (a) publicly known through no fault of the receiving party, (b) independently developed without use of the other party’s confidential information, or (c) required to be disclosed by law.",
      ],
    },
    {
      heading: "11. Limitation of Liability",
      paragraphs: [
        "TO THE MAXIMUM EXTENT PERMITTED BY LAW, PROVIDER’S TOTAL LIABILITY UNDER OR RELATING TO THIS AGREEMENT SHALL NOT EXCEED THE TOTAL FEES PAID BY CLIENT TO PROVIDER IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM.",
        "PROVIDER SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOST PROFITS, LOST REVENUE, LOST DATA, OR BUSINESS INTERRUPTION, EVEN IF PROVIDER HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.",
        "Provider makes no warranty that the Site will rank in any particular position on Google or any other search engine, generate any specific number of leads or customers, or produce any particular financial outcome for Client’s business. Provider warrants only that the Site will be delivered substantially as represented and will function as a working website.",
      ],
    },
    {
      heading: "12. Indemnification",
      paragraphs: [
        "Client shall indemnify, defend, and hold harmless Provider, its members, employees, and affiliates from and against any claims, damages, losses, or expenses (including reasonable attorneys’ fees) arising out of or related to: (a) content, photos, or copy provided by Client; (b) Client’s use of the Site after delivery; (c) Client’s violation of any law or third-party right; or (d) any breach of this Agreement by Client.",
      ],
    },
    {
      heading: "13. Termination",
      paragraphs: [
        "Either party may terminate this Agreement for material breach by the other party if the breach remains uncured for fourteen (14) days after written notice. Client may also terminate without cause prior to launch, subject to the refund terms in Section 4.",
        "Upon termination: (a) Client remains responsible for any fees accrued prior to termination, (b) Provider’s confidentiality obligations survive, and (c) the IP license granted to Client in Section 9 remains in effect for any work product for which full payment was made.",
      ],
    },
    {
      heading: "14. Force Majeure",
      paragraphs: [
        "Neither party shall be liable for any delay or failure to perform caused by events beyond their reasonable control, including but not limited to natural disasters, acts of God, pandemics, war, terrorism, civil unrest, government action, internet or hosting provider outages, or labor disputes. The affected party shall notify the other promptly and resume performance as soon as reasonably practicable.",
      ],
    },
    {
      heading: "15. Governing Law & Dispute Resolution",
      paragraphs: [
        "This Agreement is governed by the laws of the State of Washington, without regard to its conflict-of-laws principles.",
        "Any dispute arising out of or relating to this Agreement shall first be subject to good-faith mediation between the parties. If mediation fails to resolve the dispute within thirty (30) days, the dispute shall be resolved by binding arbitration administered by the American Arbitration Association (AAA) in Jefferson County, Washington, under its Commercial Arbitration Rules. Judgment on the arbitrator’s award may be entered in any court of competent jurisdiction.",
        "Each party shall bear its own costs of mediation and arbitration unless the arbitrator awards costs to the prevailing party.",
        "Notwithstanding the foregoing, either party may seek injunctive relief in any court of competent jurisdiction for breach of confidentiality or intellectual property rights.",
      ],
    },
    {
      heading: "16. General Provisions",
      paragraphs: [
        "Entire Agreement: This Agreement constitutes the entire agreement between the parties regarding the Services and supersedes all prior negotiations, communications, or agreements.",
        "Amendments: This Agreement may only be modified in writing signed (or click-accepted via a re-issued onboarding form) by both parties.",
        "Severability: If any provision is held invalid or unenforceable, the remaining provisions shall continue in full force and effect.",
        "No Waiver: Failure by either party to enforce any provision shall not constitute a waiver of that provision or any other provision.",
        "Assignment: Neither party may assign this Agreement without the other’s written consent, except that Provider may assign to a successor entity in the event of a merger, acquisition, or sale of substantially all of its assets.",
        "Notices: Notices shall be sent by email to ben@bluejayportfolio.com (for Provider) or to the email address provided by Client during onboarding.",
        "Counterparts: This Agreement may be accepted electronically. An electronic acceptance via the onboarding checkbox constitutes a binding signature under the U.S. Electronic Signatures in Global and National Commerce Act (E-SIGN) and applicable Washington State law.",
      ],
    },
    {
      heading: "17. Acceptance",
      paragraphs: [
        `By checking the “I have read and agree to the BlueJays Service Agreement” checkbox on the onboarding form, you accept this Agreement (Version ${SERVICE_AGREEMENT_VERSION}, effective ${SERVICE_AGREEMENT_EFFECTIVE_DATE}) and become legally bound by its terms.`,
        "A copy of this Agreement is available at https://bluejayportfolio.com/legal/service-agreement at any time and a record of your acceptance (including timestamp, your email, and the version accepted) is retained by Provider.",
        "Questions? Email ben@bluejayportfolio.com before accepting.",
      ],
    },
  ];
}

/**
 * Agency / AI Marketing System service agreement.
 *
 * Different beast from the $997 site plans:
 *   - Different deliverables (full system, not a website)
 *   - 100-qualified-lead guarantee instead of preview-stage refund
 *   - Ad-spend is a Client obligation, not Provider's
 *   - IP transfer covers ad accounts + sequences + lead magnet, not
 *     just the site
 *   - Ongoing $497/mo retainer is opt-in, cancellable monthly
 *
 * Pulled into its own builder to keep the website plan unchanged
 * while remaining version-aligned (single SERVICE_AGREEMENT_VERSION
 * for both — bumping it bumps both, which is correct: a v1.1.0 client
 * either accepted v1.1.0 or didn't, regardless of plan).
 */
function buildAgencyAgreement(): AgreementSection[] {
  const v = planVars("agency");

  return [
    {
      heading: "1. Parties",
      paragraphs: [
        "This Service Agreement (the “Agreement”) is between BlueJay Business Solutions LLC, a Washington State limited liability company located in Quilcene, Washington (“Provider,” “BlueJays,” “we,” “us,” or “our”), and the individual or business identified during onboarding (the “Client,” “you,” or “your”).",
        "By checking the acceptance box on the onboarding form, you (a) confirm that you have authority to bind the Client to this Agreement, (b) confirm that you have read this Agreement in full, and (c) agree to be bound by its terms.",
      ],
    },
    {
      heading: "2. Services & Deliverables",
      paragraphs: [
        "Provider will design, build, and deploy a self-learning AI Marketing System (the “System”) custom for Client’s business. The System is a single connected funnel that includes:",
        "• Custom website (designed for Client’s industry, mobile-first, conversion-tracked)",
        "• Google Ads — full account setup, structure, and first ninety (90) days of active management",
        "• Meta Ads (Facebook + Instagram) — full setup and first ninety (90) days of active management",
        "• Email automation — sequences, re-engagement flows, weekly newsletter setup, and integration with the website",
        "• SMS automation — replies, reminders, and drip flows via Twilio",
        "• Voicemail-drop capability — broadcast voicemails to opted-in prospect lists via a Client-supplied or Provider-supplied compliant vendor",
        "• SEO foundation — schema markup, sitemap, on-page optimization, and Google Business Profile optimization",
        "• Custom AI lead magnet — an industry-specific audit, quiz, calculator, or asset designed to feed the top of the funnel",
        "• Logo refinement (if Client requires) and brand polish across the System",
        "• AI auto-responder — handles inbound replies on email and SMS within the System’s configured guardrails",
        "• Monthly performance reports — actual numbers showing how each component is tightening week-over-week",
        "Provider will deliver a working System within thirty (30) days of receiving Client’s completed onboarding (the “Onboarding Submission”). “Working” means each component above is wired, sending live traffic and capturing live leads, even if optimization is ongoing.",
        "Excluded unless purchased separately: paid ad spend (see Section 4), translation services, custom CRM development beyond the standard integration, video production, professional voice-over, and bespoke direct-mail campaigns.",
      ],
    },
    {
      heading: "3. Pricing & Payment",
      paragraphs: [
        `Plan: ${v.planLabel}.`,
        `Total Project Fee: ${v.upfrontTotal}.`,
        `Payment Schedule: ${v.paymentSchedule}`,
        "Optional Ongoing Retainer: Beginning Day 91 of the engagement, Client may elect to retain Provider for ongoing optimization and management at four hundred ninety-seven dollars ($497 USD) per month, billed monthly via Stripe Subscriptions. The retainer covers continued ad management, sequence iteration, AI tuning, monthly reporting, and Provider’s direct availability. Client may cancel the retainer at any time with thirty (30) days’ written notice; cancellation does not entitle Client to a refund of any prepaid retainer fees but does entitle Client to retain ownership of the System per Section 10.",
        "Payments are processed via Stripe. Failed payments will be retried per Stripe’s standard dunning schedule. Repeated failure may result in suspension of services until current.",
        "All fees are stated in U.S. Dollars and are exclusive of any applicable taxes, which Client is responsible for.",
      ],
    },
    {
      heading: "4. Ad Spend & Third-Party Costs",
      paragraphs: [
        "Ad spend is a separate cost paid by Client directly to the relevant ad platform (Google, Meta, etc.) and is NOT included in the Project Fee or the optional retainer. Provider will recommend a starting ad budget during onboarding (typically $750–$3,000/month combined across platforms) but Client controls the budget at all times.",
        "Client is solely responsible for: (a) maintaining valid billing methods on each ad platform, (b) covering all ad spend invoiced by the platforms, (c) keeping accounts in good standing, and (d) any chargebacks or platform suspensions caused by Client billing issues.",
        "Other third-party costs Client is responsible for include: domain registration (one (1) domain at cost, typically $10–$15/year), SMS messaging fees via Twilio (typically $0.01 per message at scale), email-sending costs above the included threshold (Provider includes 10,000 sends per month; overages billed at SendGrid rates), and any premium tools Client elects to add.",
        "Provider does not mark up ad spend, domain fees, or messaging costs. Client pays vendors at cost.",
      ],
    },
    {
      heading: "5. Lead-Volume Guarantee",
      paragraphs: [
        "Provider guarantees that the System will generate at least one hundred (100) Qualified Leads for Client within the first ninety (90) days following the System’s go-live date (the “Guarantee Window”).",
        "“Qualified Lead” means a unique human prospect, fitting the Ideal Customer Profile (ICP) defined jointly during onboarding, who has taken at least one of the following actions through the System: (a) booked a call on Client’s calendar, (b) replied affirmatively to an outbound email or SMS sequence, (c) completed a form submission on the website indicating interest in Client’s services, or (d) responded to a voicemail or call campaign with stated interest.",
        "If the System has not generated at least 100 Qualified Leads by the end of the Guarantee Window, Provider will continue running, optimizing, and managing the System at no additional Project Fee — and at no charge for ongoing retainer hours during the extension — until the 100-lead threshold is met (the “Extension Period”). Client remains responsible for ad spend during the Extension Period.",
        "The Guarantee is conditional on the following Client obligations being met during the Guarantee Window: (a) maintaining the recommended minimum ad spend (typically $750/mo combined across platforms; specifics agreed during onboarding), (b) responding to qualified leads within forty-eight (48) hours of receipt so Provider can iterate on real-world conversion data, (c) not materially altering the System (account passwords, ad creative, sequences) without Provider’s written consent, and (d) keeping all third-party accounts (Google Ads, Meta, Twilio, SendGrid) in good standing.",
        "The Guarantee does not cover: revenue, profit, return on ad spend (ROAS), or Client’s close rate on the leads delivered. The Guarantee is a Lead-volume guarantee only, because Client’s sales process is outside Provider’s control.",
        "Lead counts are tracked transparently in Client’s shared workspace and reported weekly. Disputes about whether a specific lead qualifies must be raised in writing within fourteen (14) days of the lead being delivered.",
      ],
    },
    {
      heading: "6. Onboarding & Timeline",
      paragraphs: [
        "Provider commits to delivering a live, functioning System within thirty (30) days of receiving Client’s completed Onboarding Submission. The thirty-day clock starts when the Onboarding Submission is complete; if Client provides only partial information, the clock starts when the missing required fields are supplied.",
        "Required onboarding fields include: business name, primary contact, ICP definition (industry, geography, buyer title, deal size), brand assets (logo, colors, voice), legal disclosures Client requires on ads, list of services + pricing, current website (if any), competitor list, and access credentials for any existing ad/email/CRM accounts Client wants to keep.",
        "Provider is not responsible for delays caused by Client’s failure to provide required onboarding information, sign required platform access invitations, or approve initial ad creative.",
        "The 90-day Guarantee Window begins on the System’s go-live date, which is the date the first paid traffic begins driving leads to the live website. Provider will notify Client in writing of the go-live date.",
      ],
    },
    {
      heading: "7. Revisions & Iteration",
      paragraphs: [
        "Provider continuously iterates on the System during the 90-day engagement and any Extension Period. Iteration is data-driven (winners scaled, losers cut) and does not require Client approval for routine optimization.",
        "Material changes — new lead magnets, repositioning of the offer, significant brand changes, addition of new ad platforms — require Client written approval before implementation.",
        "Free Client-requested revisions during the engagement: unlimited copy and headline revisions, unlimited audience-targeting tweaks, unlimited sequence iteration, and up to three (3) major creative redesigns. Beyond three major creative redesigns within the 90-day window, Provider may charge for additional design hours at a rate quoted in advance.",
      ],
    },
    {
      heading: "8. Refunds & Termination",
      paragraphs: [
        "Pre-go-live refund: Client may request a full refund at any time prior to the System’s go-live date if, in Client’s reasonable judgment, the System under construction does not meet the standard of work represented by Provider in Provider’s public marketing materials. Refund requests must be submitted in writing (email to ben@bluejayportfolio.com) prior to go-live. Upon refund, Client will receive 100% of fees paid to date, less any third-party fees (domain, ad spend, etc.) already paid by Provider on Client’s behalf and not reimbursed by the relevant vendor.",
        "Post-go-live: refunds are not available after the System has gone live. Client’s remedy is the Lead-Volume Guarantee in Section 5.",
        "Termination for cause: either party may terminate this Agreement for material breach by the other party if the breach remains uncured for fourteen (14) days after written notice.",
        "Termination by Client without cause after go-live: Client may terminate at any time. Termination ends Provider’s ongoing obligations (including the Lead-Volume Guarantee) but does NOT terminate Client’s ownership of the System per Section 10.",
        "Effect of termination: (a) Client remains responsible for any fees accrued prior to termination, (b) Provider’s confidentiality obligations survive, (c) the IP license granted to Client in Section 10 remains in effect for any work product for which full payment was made, and (d) Provider will, on written request, hand over administrative ownership of all accounts (ad platforms, email, SMS, domain, hosting) within seven (7) business days.",
      ],
    },
    {
      heading: "9. Client Responsibilities",
      paragraphs: [
        "Client agrees to:",
        "• Provide accurate, current, and complete information during onboarding, including ICP definition and access credentials",
        "• Maintain valid billing methods on Google Ads, Meta, Twilio, SendGrid, and any other third-party platforms required by the System",
        "• Cover all ad spend and third-party costs as described in Section 4",
        "• Respond to qualified leads within forty-eight (48) hours of receipt so Provider can iterate on real conversion data and the Guarantee remains valid",
        "• Provide content, photos, and brand assets that Client owns or has the legal right to use, and indemnify Provider against any claim that Client-provided content infringes third-party rights",
        "• Comply with all applicable laws governing email (CAN-SPAM), SMS (TCPA, A2P 10DLC registration), telephony (TCPA), and advertising (FTC, platform-specific rules). Provider will set up infrastructure for compliance, but Client is the sender of record and bears ultimate responsibility for the content sent",
        "• Not use the System for unlawful purposes, including but not limited to fraud, defamation, copyright infringement, or content that violates U.S. or Washington State law",
        "• Maintain payment in good standing per the schedule in Section 3",
      ],
    },
    {
      heading: "10. Intellectual Property & Ownership",
      paragraphs: [
        "Upon receipt of full payment of the Project Fee, Provider transfers to Client a perpetual, irrevocable, worldwide, royalty-free license to use, modify, and continue running the System’s final delivered components in connection with Client’s business. This includes: the website code and design, the ad account structures and campaigns, the email and SMS sequences, the AI auto-responder configuration, the lead magnet, and the brand assets created for the System.",
        "Account ownership: at engagement end (Day 90 or termination, whichever is later), Provider transfers full administrative ownership of all third-party accounts (Google Ads, Meta Business Manager, Twilio, SendGrid, domain registrar, hosting) to Client. Client owns these accounts at all times during the engagement; Provider operates them as a contractor.",
        "Provider retains: (a) Provider’s underlying methodologies, V2 framework code, internal scripts, AI prompts, and proprietary playbooks (these power the System but do not transfer to Client as an operating manual), and (b) the right to use anonymized, aggregated performance data from the System to improve Provider’s products and services across other clients.",
        "Provider may feature the engagement, results, screenshots, and a link to Client’s System in Provider’s portfolio, case studies, marketing materials, and ad creatives. Client may opt out of public portfolio inclusion by written request before go-live.",
      ],
    },
    {
      heading: "11. Confidentiality",
      paragraphs: [
        "Both parties agree to keep confidential any non-public information shared during the engagement, including pricing details, business strategies, customer lists, performance data, and proprietary content. This obligation survives termination of the Agreement.",
        "Confidentiality does not apply to information that is (a) publicly known through no fault of the receiving party, (b) independently developed without use of the other party’s confidential information, or (c) required to be disclosed by law.",
      ],
    },
    {
      heading: "12. Limitation of Liability",
      paragraphs: [
        "TO THE MAXIMUM EXTENT PERMITTED BY LAW, PROVIDER’S TOTAL LIABILITY UNDER OR RELATING TO THIS AGREEMENT SHALL NOT EXCEED THE TOTAL FEES PAID BY CLIENT TO PROVIDER IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM (NOT INCLUDING AD SPEND OR THIRD-PARTY COSTS, WHICH ARE PAID DIRECTLY TO VENDORS).",
        "PROVIDER SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOST PROFITS, LOST REVENUE, LOST DATA, BUSINESS INTERRUPTION, OR AD ACCOUNT SUSPENSIONS BY THIRD-PARTY PLATFORMS, EVEN IF PROVIDER HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.",
        "Provider makes no warranty regarding revenue, profit, ROAS, or Client’s close rate. The Lead-Volume Guarantee in Section 5 is the sole performance warranty Provider extends.",
      ],
    },
    {
      heading: "13. Indemnification",
      paragraphs: [
        "Client shall indemnify, defend, and hold harmless Provider, its members, employees, and affiliates from and against any claims, damages, losses, or expenses (including reasonable attorneys’ fees) arising out of or related to: (a) content, photos, copy, or claims provided or approved by Client; (b) Client’s use of the System after delivery; (c) Client’s violation of any law (including TCPA, CAN-SPAM, or platform terms of service) or third-party right; or (d) any breach of this Agreement by Client.",
      ],
    },
    {
      heading: "14. Force Majeure",
      paragraphs: [
        "Neither party shall be liable for any delay or failure to perform caused by events beyond their reasonable control, including but not limited to natural disasters, acts of God, pandemics, war, terrorism, civil unrest, government action, internet or hosting provider outages, ad-platform suspensions or policy changes outside Provider’s control, or labor disputes. The affected party shall notify the other promptly and resume performance as soon as reasonably practicable. The Guarantee Window pauses during a force-majeure event affecting Provider’s ability to operate the System.",
      ],
    },
    {
      heading: "15. Governing Law & Dispute Resolution",
      paragraphs: [
        "This Agreement is governed by the laws of the State of Washington, without regard to its conflict-of-laws principles.",
        "Any dispute arising out of or relating to this Agreement shall first be subject to good-faith mediation between the parties. If mediation fails to resolve the dispute within thirty (30) days, the dispute shall be resolved by binding arbitration administered by the American Arbitration Association (AAA) in Jefferson County, Washington, under its Commercial Arbitration Rules. Judgment on the arbitrator’s award may be entered in any court of competent jurisdiction.",
        "Each party shall bear its own costs of mediation and arbitration unless the arbitrator awards costs to the prevailing party.",
        "Notwithstanding the foregoing, either party may seek injunctive relief in any court of competent jurisdiction for breach of confidentiality or intellectual property rights.",
      ],
    },
    {
      heading: "16. General Provisions",
      paragraphs: [
        "Entire Agreement: This Agreement constitutes the entire agreement between the parties regarding the Services and supersedes all prior negotiations, communications, or agreements.",
        "Amendments: This Agreement may only be modified in writing signed (or click-accepted via a re-issued onboarding form) by both parties.",
        "Severability: If any provision is held invalid or unenforceable, the remaining provisions shall continue in full force and effect.",
        "No Waiver: Failure by either party to enforce any provision shall not constitute a waiver of that provision or any other provision.",
        "Assignment: Neither party may assign this Agreement without the other’s written consent, except that Provider may assign to a successor entity in the event of a merger, acquisition, or sale of substantially all of its assets.",
        "Notices: Notices shall be sent by email to ben@bluejayportfolio.com (for Provider) or to the email address provided by Client during onboarding.",
        "Counterparts: This Agreement may be accepted electronically. An electronic acceptance via the onboarding checkbox constitutes a binding signature under the U.S. Electronic Signatures in Global and National Commerce Act (E-SIGN) and applicable Washington State law.",
      ],
    },
    {
      heading: "17. Acceptance",
      paragraphs: [
        `By checking the “I have read and agree to the BlueJays Service Agreement” checkbox on the onboarding form, you accept this Agreement (Version ${SERVICE_AGREEMENT_VERSION}, effective ${SERVICE_AGREEMENT_EFFECTIVE_DATE}, AI Marketing System variant) and become legally bound by its terms.`,
        "A copy of this Agreement is available at https://bluejayportfolio.com/legal/service-agreement?plan=agency at any time and a record of your acceptance (including timestamp, your email, and the version accepted) is retained by Provider.",
        "Questions? Email ben@bluejayportfolio.com before accepting.",
      ],
    },
  ];
}

export type AcceptedAgreement = {
  version: string;
  acceptedAt: string;       // ISO timestamp
  plan: ServiceAgreementPlan;
  acceptorIp?: string | null;
  acceptorUserAgent?: string | null;
};

export function newAcceptedAgreement(args: {
  plan: ServiceAgreementPlan;
  ip?: string | null;
  userAgent?: string | null;
}): AcceptedAgreement {
  return {
    version: SERVICE_AGREEMENT_VERSION,
    acceptedAt: new Date().toISOString(),
    plan: args.plan,
    acceptorIp: args.ip ?? null,
    acceptorUserAgent: args.userAgent ?? null,
  };
}
