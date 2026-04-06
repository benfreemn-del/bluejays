import { NextResponse } from "next/server";
import { getEmailHistory } from "@/lib/email-sender";
import { getSmsHistory } from "@/lib/sms";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const emails = await getEmailHistory(id);
  const sms = await getSmsHistory(id);

  // Merge into unified timeline
  const timeline = [
    ...emails.map((e) => ({
      id: e.id,
      type: "email" as const,
      channel: "Email",
      to: e.to,
      subject: e.subject,
      body: e.body,
      sequence: e.sequence,
      timestamp: e.sentAt,
    })),
    ...sms.map((s) => ({
      id: s.id,
      type: "sms" as const,
      channel: "SMS",
      to: s.to,
      subject: "",
      body: s.body,
      sequence: s.sequence,
      timestamp: s.sentAt,
    })),
  ].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return NextResponse.json({ timeline, totalEmails: emails.length, totalSms: sms.length });
}
