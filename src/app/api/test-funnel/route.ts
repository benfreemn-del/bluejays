import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email-sender";
import {
  AGENT_VOICE,
  PRICING_FRAMEWORK,
  CONSERVATIVE_FUNNEL,
  OBJECTION_RESPONSES,
  CONTACT_RULES,
} from "@/lib/agent-personality";
import {
  getPitchEmail,
  getFollowUp1,
  getFollowUp2,
} from "@/lib/email-templates";
import {
  getInitialSms,
  getFollowUpSms1,
  getFollowUpSms2,
} from "@/lib/sms";
import type { Prospect } from "@/lib/types";

const TEST_EMAIL = "benfreemn@gmail.com";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com";

// Use our best V2 showcase as the test preview
const TEST_PREVIEW_URL = `${BASE_URL}/v2/electrician`;

// Mock prospect for test funnel
const MOCK_PROSPECT: Prospect = {
  id: "test-funnel-preview",
  businessName: "Cascade Electric Co.",
  ownerName: "Test Owner",
  phone: "(206) 555-0103",
  email: TEST_EMAIL,
  address: "123 Main St",
  city: "Seattle, WA",
  state: "WA",
  category: "electrician",
  currentWebsite: "https://example.com",
  googleRating: 4.9,
  reviewCount: 250,
  estimatedRevenueTier: "high",
  status: "pending-review",
  generatedSiteUrl: "/v2/electrician",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export async function POST() {
  try {
    // ═══════════════════════════════════════════════════════
    // EMAIL 1: Full Funnel Strategy + All Email Sequences
    // ═══════════════════════════════════════════════════════
    const pitchEmail = getPitchEmail(MOCK_PROSPECT, TEST_PREVIEW_URL);
    const followUp1 = getFollowUp1(MOCK_PROSPECT, TEST_PREVIEW_URL);
    const followUp2 = getFollowUp2(MOCK_PROSPECT, TEST_PREVIEW_URL);

    const strategyBody = `
═══════════════════════════════════════════════════════
🐦 BLUEJAYS FUNNEL TEST — Full Strategy & Email Preview
═══════════════════════════════════════════════════════

This is a test of our complete sales funnel. Below you'll find:
1. Our agent's voice & personality
2. Full funnel timeline
3. Pricing framework
4. Objection handling playbook
5. All 3 email sequences (exactly as a prospect would receive them)
6. Contact rules & anti-spam safeguards

Preview site used for this test: ${TEST_PREVIEW_URL}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 AGENT VOICE & PERSONALITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Tone: ${AGENT_VOICE.tone}
• Personality: ${AGENT_VOICE.personality}
• Core Principle: ${AGENT_VOICE.corePrinciple}
• Key Sales Distinction: ${AGENT_VOICE.keyDistinction}

ALWAYS DO:
${AGENT_VOICE.alwaysDo.map((d) => `  ✅ ${d}`).join("\n")}

NEVER SAY:
${AGENT_VOICE.neverSay.map((n) => `  ❌ ${n}`).join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 FUNNEL TIMELINE (Conservative Cadence)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${CONSERVATIVE_FUNNEL.map(
  (step) =>
    `Day ${step.day.toString().padStart(2)}: [${step.channels.join(" + ").toUpperCase()}] ${step.label}\n         ${step.description}`
).join("\n\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 PRICING FRAMEWORK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Price: $${PRICING_FRAMEWORK.price} (one-time)
• Yearly Management: $${PRICING_FRAMEWORK.yearlyManagement}
• Positioning: ${PRICING_FRAMEWORK.positioning}
• Never negotiate: ${PRICING_FRAMEWORK.neverNegotiate ? "YES — price is FIRM" : "No"}

Comparison Points:
${PRICING_FRAMEWORK.comparisonPoints.map((p) => `  • ${p}`).join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️ OBJECTION HANDLING PLAYBOOK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${Object.entries(OBJECTION_RESPONSES)
  .map(
    ([objection, { response, followUp }]) =>
      `"${objection.toUpperCase()}":\n  Response: ${response}\n  Follow-up: ${followUp || "(none — respect their decision)"}`
  )
  .join("\n\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 EMAIL SEQUENCE 1 OF 3 — INITIAL PITCH (Day 0)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subject: ${pitchEmail.subject}

${pitchEmail.body}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 EMAIL SEQUENCE 2 OF 3 — GENTLE FOLLOW-UP (Day 5)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subject: ${followUp1.subject}

${followUp1.body}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 EMAIL SEQUENCE 3 OF 3 — FINAL CHECK-IN (Day 12)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subject: ${followUp2.subject}

${followUp2.body}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 CONTACT RULES & ANTI-SPAM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Max emails/day: ${CONTACT_RULES.maxEmailsPerDay}
• Max texts/day: ${CONTACT_RULES.maxTextsPerDay}
• Max voicemails/week: ${CONTACT_RULES.maxVoicemailsPerWeek}
• Never before 7am: ${CONTACT_RULES.neverContactBefore7am}
• Never after 9pm: ${CONTACT_RULES.neverContactAfter9pm}
• Cool off after no response: ${CONTACT_RULES.coolOffAfterNoResponse} days

STOP IMMEDIATELY IF:
${CONTACT_RULES.stopImmediatelyIf.map((r) => `  🛑 ${r}`).join("\n")}

═══════════════════════════════════════════════════════
Test sent at: ${new Date().toLocaleString()}
═══════════════════════════════════════════════════════
`;

    await sendEmail(
      "test-funnel-strategy",
      TEST_EMAIL,
      "🐦 BlueJays Funnel Test — Full Strategy + All 3 Email Sequences",
      strategyBody,
      0
    );

    // ═══════════════════════════════════════════════════════
    // EMAIL 2: All SMS/Text Sequences
    // ═══════════════════════════════════════════════════════
    const sms1 = getInitialSms(MOCK_PROSPECT, TEST_PREVIEW_URL);
    const sms2 = getFollowUpSms1(MOCK_PROSPECT, TEST_PREVIEW_URL);
    const sms3 = getFollowUpSms2(MOCK_PROSPECT, TEST_PREVIEW_URL);

    const smsBody = `
═══════════════════════════════════════════════════════
📱 BLUEJAYS FUNNEL TEST — All Text/SMS Sequences
═══════════════════════════════════════════════════════

This is a test of our complete SMS funnel. Below are all 3 text messages
a prospect would receive, in order, at the scheduled intervals.

Preview site used for this test: ${TEST_PREVIEW_URL}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 TEXT 1 OF 3 — INITIAL PITCH (Day 0, sent with Email 1)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${sms1}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 TEXT 2 OF 3 — FOLLOW-UP (Day 12, sent with Email 3)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${sms2}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 TEXT 3 OF 3 — FINAL (Day 30)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${sms3}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 SMS DELIVERY NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Sent from: Twilio number ${process.env.TWILIO_PHONE_NUMBER || "(not configured)"}
• Max 1 text per day per prospect
• Links in texts point to the highest version template we have
• All texts include the business name for personalization
• Texts are SHORT — under 160 chars when possible for single SMS delivery

═══════════════════════════════════════════════════════
Test sent at: ${new Date().toLocaleString()}
═══════════════════════════════════════════════════════
`;

    await sendEmail(
      "test-funnel-sms",
      TEST_EMAIL,
      "📱 BlueJays Funnel Test — All 3 Text/SMS Sequences",
      smsBody,
      0
    );

    return NextResponse.json({
      success: true,
      message: `Test funnel sent! Check ${TEST_EMAIL} for 2 emails: (1) Full strategy + email sequences, (2) All SMS sequences`,
      previewUsed: TEST_PREVIEW_URL,
      emailsSent: 2,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
