/**
 * Registry of shareable client docs.
 *
 * Each entry is a (slug, doc) pair pointing at a PDF in public/ AND a
 * companion /sign/[slug]/[doc] route that embeds the PDF + collects
 * client acknowledgment (sign-off + replies). Submissions trigger
 * sendOwnerAlert() so Ben gets SMS + email in real time.
 *
 * Pattern: see CLAUDE.md "Shareable Client Doc Pattern".
 *
 * To add a new doc:
 *   1. Generate the PDF and save to public/clients/[slug]/pdfs/
 *   2. Add an entry below
 *   3. The /sign/[slug]/[doc] route + API auto-wire from this registry
 */

export type OnboardDoc = {
  slug: string;
  doc: string;
  title: string;
  /** Brand display name (e.g., "TEKKY") shown above the PDF. */
  brand: string;
  /** Relative path to the PDF under public/. */
  pdfPath: string;
  /** SMS/email subject prefix when a client signs. */
  alertSubject: string;
  /** Optional one-line description shown to the signer. */
  description?: string;
  /**
   * Display ordering inside the per-client portal Docs tab. Lower
   * numbers render first. Entries without `displayOrder` fall to the
   * end in registry order. Use round numbers (10/20/30) so future docs
   * can slot between without renumbering.
   */
  displayOrder?: number;
  /** Extra free-form questions appended to the sign-off form. */
  extraQuestions?: {
    id: string;
    label: string;
    placeholder?: string;
    /** Optional click-to-prefill chips shown beneath the input. */
    presets?: string[];
  }[];
  /**
   * Optional "what's already running for you" value-proof strip rendered
   * above the PDF embed. Bold headline + bullet list. First impression =
   * value, not paperwork.
   */
  valueProof?: {
    headline: string;
    subhead?: string;
    bullets: { title: string; detail: string }[];
  };
  /**
   * Optional Stripe Payment Links shown at the bottom of the sign page
   * (and reinforced in the post-submit success state). Numbers MUST match
   * the pricing table inside the PDF — single source of truth lives in the
   * PDF generator, mirrored here for the in-page CTAs.
   *
   * Set `url` to "" when the Stripe Payment Link hasn't been created yet —
   * the UI renders a clear placeholder ("Ben will text you the link")
   * instead of a broken button.
   */
  paymentLinks?: {
    label: string;
    /** Stripe Payment Link URL. Empty string = placeholder state. */
    url: string;
    description?: string;
    /** Short badge above the label, e.g. "Due at launch". */
    badge?: string;
    /** Style the first/primary CTA larger + lime; others neutral. */
    primary?: boolean;
  }[];
};

const REGISTRY: OnboardDoc[] = [
  {
    slug: "zenith-sports",
    doc: "handoff",
    displayOrder: 20,
    title: "Owner Onboarding Packet",
    brand: "TEKKY · Zenith Sports",
    pdfPath: "/clients/zenith-sports/pdfs/tekky-onboarding-handoff.pdf",
    alertSubject: "Tekky onboarding signed",
    description:
      "Welcome packet for Paul — portal access, tab tour, ownership " +
      "matrix, pricing breakdown, account-creation permissions, and " +
      "card-on-file policy. Read through and confirm below. " +
      "Note: Phase A build work begins the business day Q1 payment clears.",
    valueProof: {
      headline: "What's already built for TEKKY",
      subhead:
        "Preview-ready as of Monday 2026-05-18. The funnel engine, ad library, " +
        "SEO layer, and portal cockpit are built and waiting. Final " +
        "tekky.org domain flip + Shopify shop integration come this week — " +
        "those are on Ben, no work needed from you.",
      bullets: [
        {
          title: "Bespoke TEKKY website (preview live)",
          detail:
            "Built ground-up to the TEKKY brand — not a template. Preview live at bluejayportfolio.com/clients/zenith-sports. Final tekky.org domain flip + Shopify shop integration come this week — Ben handling.",
        },
        {
          title: "986 leads pre-loaded + color-coded",
          detail:
            "Parent / coach / player / club audiences with Cmd-K search and bulk-action toolbar in your portal.",
        },
        {
          title: "43 ad creatives + 6-touch funnels",
          detail:
            "Meta Feed/Reels/Stories, Google Search/PMax/YouTube, Lob direct mail — paired with audience-specific email sequences that fire on day offsets.",
        },
        {
          title: "SEO that compounds (the long-tail engine)",
          detail:
            "llms.txt + JSON-LD structured data ship with every page so ChatGPT, Claude, Perplexity, Gemini, and Bing AI parse TEKKY cleanly. Every lead captured feeds back into the site as fresh on-page signal — search rank quietly compounds month over month. Most agencies bill this as a separate $1.5k/mo line item; here it's the byproduct of the funnel running.",
        },
        {
          title: "Tracking layer already firing",
          detail:
            "Microsoft Clarity heatmaps, Meta Pixel, GA4 — every click, scroll depth, and conversion event captured from day one. You'll have audience-specific conversion rates by week 2.",
        },
        {
          title: "AI Reply Drafter + Drill of Week (Phase A)",
          detail:
            "Personalized email drafts in your voice (you hit send) and an auto-broadcast drill to your coach list every Tuesday 9am PT — already LIVE.",
        },
      ],
    },
    extraQuestions: [
      {
        id: "account_creation_permission",
        label:
          "Do I have your permission to create accounts on TEKKY's behalf? (yes / no)",
        placeholder: "yes — proceed with Phase A account stand-up",
        presets: ["Yes — proceed", "Wait — let's discuss first"],
      },
      {
        id: "preferred_email_for_accounts",
        label:
          "Preferred email for new accounts (or a login you already have)",
        placeholder: "info@tekky.org · admin@zenithsports.org",
      },
      {
        id: "owner_cell",
        label:
          "Your direct cell — used for owner SMS alerts (new leads, AI flags, urgent funnel issues).",
        placeholder: "(360) 555-1234",
      },
      {
        id: "existing_accounts",
        label:
          "Existing accounts I should take over instead of creating fresh (Shopify · GBP · Meta BM · Google Ads · email tool)",
        placeholder:
          "Shopify yes (zenithsports.org) · GBP no · Meta BM no · Google Ads no · email tool: none",
      },
      {
        id: "customer_list",
        label:
          "Customer or email list to import? Rough size + segments (parents / coaches / past buyers)",
        placeholder: "Shopify: ~120 past buyers · newsletter: ~400 parents",
      },
      {
        id: "vendor_card_setup",
        label:
          "Third-party vendor accounts (Twilio · Meta ad spend · Google Ads · SendGrid paid tiers) each need their own card entered directly into the vendor — Stripe's PCI rules don't let me re-use the Q1 card for those. Q2-Q4 Stripe installments auto-charge the Q1 card; this question is just about the vendor side. How do you want to handle it?",
        placeholder: "screenshare during setup · send me the URLs · will get later",
        presets: [
          "Screenshare with me when you set them up",
          "Send the URLs, I'll enter myself",
          "Will get later",
        ],
      },
    ],
    paymentLinks: [
      {
        label: "Pay Q1 — $2,500",
        url: process.env.STRIPE_PAYMENT_LINK_TEKKY_Q1 || "",
        description:
          "Quarterly installment 1 of 4 — the launch payment. Unlocks Phase A build work the business day funds clear.",
        badge: "Due at launch (Monday 2026-05-18)",
        primary: true,
      },
    ],
  },
  {
    slug: "zenith-sports",
    doc: "brand-voice",
    displayOrder: 40,
    title: "Brand Voice Reference",
    brand: "TEKKY · Zenith Sports",
    pdfPath: "/clients/zenith-sports/pdfs/tekky-brand-voice.pdf",
    alertSubject: "Tekky brand-voice acknowledged",
    description:
      "The locked voice rules every Tekky email, SMS, ad, and AI-drafted " +
      "reply follows. Read once, then acknowledge below.",
  },
  // BlueJays SLA — same PDF, registered per slug so each AI System
  // client gets /sign/[slug]/sla and Ben gets a separate ack row in
  // onboarding_acks per signature. Add a new row when onboarding a
  // new AI System ($10k tier) client.
  {
    slug: "zenith-sports",
    doc: "sla",
    displayOrder: 30,
    title: "Service-Level Agreement",
    brand: "TEKKY · Zenith Sports",
    pdfPath: "/onboarding/bluejays-sla.pdf",
    alertSubject: "Tekky acknowledged BlueJays SLA",
    description:
      "Working contract between you and BlueJays — response times, " +
      "what's included every month, what's out of scope, and the " +
      "escalation order when something feels off. Read once, acknowledge " +
      "below.",
  },
  // Formal Service Agreement — the actual contract behind the $10k AI System.
  // Pair with the SLA: SLA = day-to-day response commitments; Agreement = the
  // legal contract (deliverables, IP, refund, data ownership, termination).
  {
    slug: "zenith-sports",
    doc: "agreement",
    displayOrder: 10,
    title: "Service Agreement (AI Marketing System)",
    brand: "TEKKY · Zenith Sports",
    pdfPath: "/onboarding/bluejays-service-agreement.pdf",
    alertSubject: "Tekky acknowledged BlueJays Service Agreement",
    description:
      "The formal contract for your $10,000 AI Marketing System — deliverables, " +
      "payment terms (4 quarterly installments of $2,500 or $9,700 pay-in-full), " +
      "refund policy, data ownership, IP, what continues after the 4-installment " +
      "program ends, and the optional $500/mo retainer. Read once, acknowledge below.",
  },
  {
    slug: "itc-quick-attach",
    doc: "sla",
    title: "Service-Level Agreement",
    brand: "ITC Quick-Attach",
    pdfPath: "/onboarding/bluejays-sla.pdf",
    alertSubject: "ITC acknowledged BlueJays SLA",
    description:
      "Working contract between you and BlueJays — response times, " +
      "what's included every month, what's out of scope, and the " +
      "escalation order when something feels off. Read once, acknowledge " +
      "below.",
  },
];

export function getOnboardDoc(slug: string, doc: string): OnboardDoc | null {
  return REGISTRY.find((d) => d.slug === slug && d.doc === doc) ?? null;
}

export function listOnboardDocs(slug?: string): OnboardDoc[] {
  const items = slug ? REGISTRY.filter((d) => d.slug === slug) : [...REGISTRY];
  // Sort by displayOrder ascending; entries without displayOrder fall to
  // the end in registry order (preserves backward compatibility for any
  // tenant that hasn't been explicitly ordered yet).
  return items.sort((a, b) => {
    const ao = a.displayOrder ?? Number.POSITIVE_INFINITY;
    const bo = b.displayOrder ?? Number.POSITIVE_INFINITY;
    return ao - bo;
  });
}
