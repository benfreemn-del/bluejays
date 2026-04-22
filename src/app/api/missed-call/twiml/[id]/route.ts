/**
 * GET /api/missed-call/twiml/[id]
 *
 * TwiML handler for a client business's incoming calls.
 *
 * Setup (per client):
 *   1. In Twilio dashboard, buy or assign a phone number to the client.
 *   2. Set that number's "A call comes in" webhook to:
 *      https://bluejayportfolio.com/api/missed-call/twiml/[prospectId]
 *   3. Set the status callback to:
 *      https://bluejayportfolio.com/api/missed-call/callback
 *
 * What this does:
 *   - Greets the caller with the business name
 *   - Records a voicemail
 *   - Twilio fires the status callback after the call ends
 *   - The callback sends an auto-SMS to the caller if the call was missed
 */

import { NextRequest } from "next/server";
import { getProspect } from "@/lib/store";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prospect = await getProspect(id);
  const businessName = prospect?.businessName || "this business";

  // TwiML: greet, record voicemail, set status callback to fire auto-SMS
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">
    Thank you for calling ${businessName}. We can't take your call right now.
    Please leave a message after the tone and we'll get back to you as soon as possible.
    You can also expect a text message with a link to book an appointment at your convenience.
  </Say>
  <Record
    maxLength="60"
    timeout="5"
    transcribe="false"
    action="${BASE_URL}/api/missed-call/recorded"
  />
  <Say voice="Polly.Joanna">Thank you. Goodbye.</Say>
</Response>`;

  return new Response(twiml, {
    headers: { "Content-Type": "text/xml" },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return GET(request, { params });
}
