/**
 * Olympic Inspections & Testing — per-audience funnel definitions.
 *
 * Three parallel cadences keyed by audience_segment.
 *
 * Cadence rationale (mold inspections are TIME-SENSITIVE — homeowners
 * shopping for inspectors usually have a real-estate deadline or active
 * health concern, so the funnel is much tighter than Zenith's):
 *   HOMEOWNER  (4-touch / 7 days)  — direct buyer, decide fast
 *   REALTOR    (4-touch / 7 days)  — referral source, value education + payouts
 *   INSURANCE  (4-touch / 7 days)  — claim-driven urgency, focus on report quality
 *
 * Variables in templates: {{firstName}}, {{name}}, {{bookingUrl}},
 * {{quizUrl}}, {{partnersUrl}}, {{phone}}. Substituted at send time
 * by the funnel runner.
 */

import type { ClientLeadAudience } from "../client-leads";

export type FunnelStep = {
  day: number;
  channels: FunnelChannelTouch[];
};

export type FunnelChannelTouch =
  | {
      channel: "email";
      templateId: string;
      subject: string;
      body: string;
    }
  | {
      channel: "sms";
      templateId: string;
      body: string;
    };

export type AudienceFunnel = {
  audience: ClientLeadAudience;
  label: string;
  steps: FunnelStep[];
};

/* ──────────────────────────── HOMEOWNER ──────────────────────────── */

const HOMEOWNER: AudienceFunnel = {
  audience: "homeowner",
  label: "Homeowner · 4-touch · 7 days",
  steps: [
    {
      day: 0,
      channels: [
        {
          channel: "email",
          templateId: "homeowner.d0.welcome",
          subject:
            "Got your inspection request, {{firstName}} — confirming within a day",
          body: `Hi {{firstName}},

Thanks for reaching out about a mold inspection. We received your request and will confirm the exact time slot within one business day.

A quick note about how we work: we are an independent inspector. We never perform remediation ourselves, so you get an honest assessment with no pressure to spend more than necessary.

What happens next:
• I review your address + property notes
• Confirm the slot you picked (or suggest the closest available time)
• Send a short pre-inspection checklist so you know what to expect

If you have questions before then, just reply to this email or call {{phone}} — I'll get back to you the same day.

— Olympic Inspections & Testing`,
        },
        {
          channel: "sms",
          templateId: "homeowner.d0.sms",
          body: `Olympic Inspections — got your booking request. We'll confirm your slot within 1 business day. Questions? Reply or call {{phone}}.`,
        },
      ],
    },
    {
      day: 1,
      channels: [
        {
          channel: "email",
          templateId: "homeowner.d1.what-to-expect",
          subject: "{{firstName}} — what to expect on inspection day",
          body: `Hi {{firstName}},

Quick walkthrough so there are no surprises tomorrow:

1. We start with a visual walkthrough — every floor, attic, crawlspace, basement, HVAC.
2. Moisture meter readings on suspect walls, baseboards, behind appliances.
3. Thermal/infrared scan if you opted for that — finds hidden water behind drywall.
4. Air or surface samples sent to an ISO/IEC 17025-accredited lab if requested.

Total time on-site: 1-2 hours. We do NOT rush.

What to do beforehand:
• Move stuff from corners and closets you suspect
• Make sure crawlspace + attic access is clear
• If you have visible growth, leave it alone — we want to see it untouched

Report turnaround: 3-5 days. PDF emailed + printed copy on request.

— Olympic Inspections & Testing`,
        },
      ],
    },
    {
      day: 3,
      channels: [
        {
          channel: "email",
          templateId: "homeowner.d3.faq",
          subject:
            "{{firstName}} — quick answers to the questions homeowners always ask",
          body: `Hi {{firstName}},

Three questions homeowners ask in nearly every call:

"Do I really need lab samples?"
Visual inspection alone catches most issues. Lab samples confirm exact species + give you a paper trail for insurance or real estate. If your situation is straightforward, we'll tell you to skip the samples and save the money.

"Will you tell me to remediate?"
Only if the data clearly says so. Our report includes recommendations but we never perform remediation ourselves — that separation keeps the inspection honest. We'll refer reputable local options if needed.

"What if you find nothing?"
That's a result too. You'll get a written all-clear report you can hand to a buyer, insurance adjuster, or future-you.

Booking link if you haven't yet: {{bookingUrl}}

— Olympic Inspections & Testing`,
        },
        {
          channel: "sms",
          templateId: "homeowner.d3.sms",
          body: `{{firstName}} — quick reminder, your inspection slot is coming up. If you need to reschedule, reply or call {{phone}}.`,
        },
      ],
    },
    {
      day: 7,
      channels: [
        {
          channel: "email",
          templateId: "homeowner.d7.followup",
          subject:
            "{{firstName}} — checking in",
          body: `Hi {{firstName}},

Just circling back. If you haven't booked yet but still want to:

• Booking link: {{bookingUrl}}
• Not sure if you need an inspection? Run a 60-second cost estimate: {{calculatorUrl}}

If timing's off or you went with someone else, no problem — reply and let me know and I'll stop reaching out. I'd rather hear "no" than chase a "maybe" forever.

— Olympic Inspections & Testing`,
        },
      ],
    },
  ],
};

/* ──────────────────────────── REALTOR ──────────────────────────── */

const REALTOR: AudienceFunnel = {
  audience: "realtor",
  label: "Realtor · 4-touch · 7 days",
  steps: [
    {
      day: 0,
      channels: [
        {
          channel: "email",
          templateId: "realtor.d0.welcome",
          subject:
            "Welcome to the Olympic Inspections referral network, {{firstName}}",
          body: `Hi {{firstName}},

Thanks for joining the Olympic Inspections referral network. Quick rundown so you know how this works:

• Send your buyers/sellers our way for mold inspection — we handle scheduling, on-site, lab analysis, and the written report
• 3-5 day turnaround so you don't hold up closings
• Tiered referral payout: $50 (closes 1) → $75 (closes 2–5) → $100 (closes 6+)
• You get a unique link + tracking dashboard at {{partnersUrl}}

Why our reports work for transactions:
• Photo-documented PDF with chain-of-custody lab data
• Plain-English findings (your buyer's spouse can read it)
• Clear next-step recommendations + reputable remediation referrals
• Real-estate-ready format

I'll send your tracking link in a follow-up email tomorrow. In the meantime, if you have a buyer/seller asking about mold this week, just send them: {{bookingUrl}}

— Olympic Inspections & Testing`,
        },
      ],
    },
    {
      day: 1,
      channels: [
        {
          channel: "email",
          templateId: "realtor.d1.tracking-link",
          subject: "{{firstName}} — your referral tracking link is ready",
          body: `Hi {{firstName}},

Your unique tracking link is ready. Anyone who books through it gets tagged as your referral automatically — no special code, no extra step for them.

Your link: {{partnersUrl}}

Three ways agents typically use it:
1. Add to your email signature ("Recommended mold inspection: [link]")
2. Drop it in your buyer prep PDFs
3. Text it to clients when mold comes up in a transaction

Payout schedule:
• $50 — first inspection that closes from your link
• $75 — closes 2-5
• $100 — closes 6+
• $100 + bonus quarterly review — 20+ closes/year

We pay monthly via Zelle, Venmo, or check. Reports come out the 5th.

Questions? Just reply.

— Olympic Inspections & Testing`,
        },
      ],
    },
    {
      day: 3,
      channels: [
        {
          channel: "email",
          templateId: "realtor.d3.transaction-tips",
          subject: "Mold in real estate transactions — 3 things buyers miss",
          body: `Hi {{firstName}},

Three things we see come up over and over in transactions where mold is a question. Use whichever helps your clients most.

1. Older homes (pre-1980) often have moisture in unexpected places — crawlspace insulation, attic boots, basement subfloors. A $400 inspection is cheap insurance vs a post-close lawsuit.

2. Insurance carriers often require mold testing before they'll write a policy on a home with any history of water damage. We can write the report directly to insurance specs.

3. Sellers should test BEFORE listing if there's any musty smell. Cleaner-listing → smoother inspection contingency → faster close.

Booking link: {{bookingUrl}}

— Olympic Inspections & Testing`,
        },
      ],
    },
    {
      day: 7,
      channels: [
        {
          channel: "email",
          templateId: "realtor.d7.checkin",
          subject: "{{firstName}} — quick check-in",
          body: `Hi {{firstName}},

Just checking in. Some agents send 1-2 referrals a year, some send 30+. Either is fine — we just want to be the inspector you trust to recommend.

If there's anything I can do to make it easier for your buyers and sellers, reply and tell me. We've adjusted our process based on agent feedback before — happy to keep doing it.

Tracking link: {{partnersUrl}}

— Olympic Inspections & Testing`,
        },
      ],
    },
  ],
};

/* ──────────────────────────── INSURANCE-CLAIM ──────────────────────────── */

const INSURANCE: AudienceFunnel = {
  audience: "insurance",
  label: "Insurance claim · 4-touch · 7 days",
  steps: [
    {
      day: 0,
      channels: [
        {
          channel: "email",
          templateId: "insurance.d0.welcome",
          subject:
            "{{firstName}} — your insurance-grade mold inspection is in the queue",
          body: `Hi {{firstName}},

Thanks for reaching out. Insurance-related mold inspections are a daily part of our work — here's what to expect.

What carriers want to see:
• ISO/IEC 17025-accredited lab analysis (we use one — chain-of-custody documented)
• Indoor vs outdoor spore comparison (so the carrier can see baseline vs anomaly)
• Photo documentation of every area sampled
• Plain-English findings + species identification by genus
• Clear demarcation of moisture source (where the water came from)

Turnaround: 3-5 days from inspection to written report. Faster if you have a carrier deadline — let me know and we'll prioritize.

Cost: typical claim-driven inspection runs $400-800 depending on home size + sample count. Most carriers reimburse the full cost when the inspection is part of a claim.

We'll confirm your slot within one business day. If your timeline is tighter than that, reply with your deadline.

— Olympic Inspections & Testing`,
        },
        {
          channel: "sms",
          templateId: "insurance.d0.sms",
          body: `Olympic Inspections — got your insurance claim inspection request. We'll confirm within 1 biz day. If you need it faster, reply with your deadline.`,
        },
      ],
    },
    {
      day: 1,
      channels: [
        {
          channel: "email",
          templateId: "insurance.d1.checklist",
          subject: "{{firstName}} — claim documentation checklist",
          body: `Hi {{firstName}},

A few things that strengthen a mold claim. Pull these together before our inspection if you can:

• Photos of the original water event (leak, flood, roof damage) with timestamps if available
• Repair receipts for any plumbing/roof/HVAC work that preceded the mold
• Water bills around the time of the event (anomalies show up there)
• Any earlier visual documentation you have of growth or staining

We'll incorporate all of it into your written report so the adjuster has a single source of truth.

If you have a claim number already, reply with it — we'll reference it directly in the report header.

— Olympic Inspections & Testing`,
        },
      ],
    },
    {
      day: 3,
      channels: [
        {
          channel: "email",
          templateId: "insurance.d3.report-format",
          subject: "What your insurance report will look like",
          body: `Hi {{firstName}},

Quick preview of what you'll receive 3-5 days after the inspection:

10-25 page PDF including:
• Executive summary (1 page — what we found, what it means)
• Photo log of every area inspected
• Moisture meter readings + thermal imaging where applicable
• Lab results: spore counts by genus, indoor vs outdoor baseline
• Chain-of-custody sample documentation (the raw lab paperwork)
• Recommendations + suggested remediation scope

Reports are formatted to standard claim-adjuster expectations. We've worked with most major carriers — State Farm, Allstate, Liberty Mutual, Geico, USAA, Farmers, Travelers — and the format works for all of them.

Booking link if you haven't yet: {{bookingUrl}}

— Olympic Inspections & Testing`,
        },
        {
          channel: "sms",
          templateId: "insurance.d3.sms",
          body: `{{firstName}} — your claim-grade inspection slot is confirmed. Need to push the date or pull it forward? Reply or call {{phone}}.`,
        },
      ],
    },
    {
      day: 7,
      channels: [
        {
          channel: "email",
          templateId: "insurance.d7.followup",
          subject: "{{firstName}} — checking in",
          body: `Hi {{firstName}},

Just checking in. If your inspection happened, you should have your report by now. If you didn't get it or want anything clarified for your adjuster, reply and I'll handle it the same day.

If you're still deciding whether to book, our line is open at {{phone}} — no pressure.

— Olympic Inspections & Testing`,
        },
      ],
    },
  ],
};

/* ──────────────────────────── EXPORT ──────────────────────────── */

export const OLYMPIC_INSPECTIONS_FUNNELS: AudienceFunnel[] = [
  HOMEOWNER,
  REALTOR,
  INSURANCE,
];

export function getOITFunnel(
  audience: ClientLeadAudience | null,
): AudienceFunnel | null {
  if (!audience) return HOMEOWNER; // default
  return (
    OLYMPIC_INSPECTIONS_FUNNELS.find((f) => f.audience === audience) ?? null
  );
}

export function listOITFunnels(): AudienceFunnel[] {
  return OLYMPIC_INSPECTIONS_FUNNELS;
}

export default OLYMPIC_INSPECTIONS_FUNNELS;
