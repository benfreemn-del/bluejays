import { NextResponse } from "next/server";
import { getAllProspects, getProspect } from "@/lib/store";
import { getEngagementScore } from "@/lib/engagement-tracker";
import {
  determineRetargetSegment,
  getRetargetEmail,
  getRetargetSequence,
  type RetargetSegment,
} from "@/lib/retargeting-emails";

/**
 * GET /api/retarget
 *
 * Lists all prospects eligible for retargeting with their segment
 * and next email in the sequence.
 */
export async function GET() {
  const prospects = await getAllProspects();
  const eligible: {
    prospectId: string;
    businessName: string;
    segment: RetargetSegment;
    nextSequence: number;
    totalEmails: number;
  }[] = [];

  for (const prospect of prospects) {
    const engagement = await getEngagementScore(prospect);
    const segment = determineRetargetSegment(
      prospect,
      engagement.signals.emailOpens,
      engagement.signals.emailClicks,
      engagement.signals.previewVisits
    );

    if (segment) {
      const sequence = getRetargetSequence(prospect, segment);
      eligible.push({
        prospectId: prospect.id,
        businessName: prospect.businessName,
        segment,
        nextSequence: 1, // Would track actual progress in production
        totalEmails: sequence.length,
      });
    }
  }

  return NextResponse.json({
    eligible: eligible.length,
    prospects: eligible,
  });
}

/**
 * POST /api/retarget
 *
 * Preview or send a retargeting email for a specific prospect.
 *
 * Body: { prospectId: string, sequence?: number, preview?: boolean }
 */
export async function POST(req: Request) {
  const body = await req.json();
  const { prospectId, sequence = 1, preview = true } = body;

  if (!prospectId) {
    return NextResponse.json({ error: "prospectId required" }, { status: 400 });
  }

  const prospect = await getProspect(prospectId);
  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  const engagement = await getEngagementScore(prospect);
  const segment = determineRetargetSegment(
    prospect,
    engagement.signals.emailOpens,
    engagement.signals.emailClicks,
    engagement.signals.previewVisits
  );

  if (!segment) {
    return NextResponse.json({
      error: "Prospect not eligible for retargeting",
      reason: "Does not meet engagement criteria or is in a terminal status",
      engagement: {
        score: engagement.score,
        level: engagement.level,
        status: prospect.status,
      },
    }, { status: 400 });
  }

  const email = getRetargetEmail(prospect, segment, sequence);
  if (!email) {
    return NextResponse.json({
      error: `No retarget email found for segment '${segment}' sequence ${sequence}`,
    }, { status: 404 });
  }

  if (preview) {
    return NextResponse.json({
      preview: true,
      segment,
      email: {
        to: prospect.email,
        subject: email.subject,
        body: email.body,
        sequence: email.sequence,
        delayDays: email.delayDays,
      },
      engagement: {
        score: engagement.score,
        level: engagement.level,
        signals: engagement.signals,
      },
    });
  }

  // In production, this would call sendEmail() from email-sender.ts
  // For now, return the email that would be sent
  return NextResponse.json({
    sent: false,
    message: "Retarget email send not yet wired to email-sender. Use preview mode.",
    segment,
    email: {
      to: prospect.email,
      subject: email.subject,
      body: email.body,
      sequence: email.sequence,
    },
  });
}
