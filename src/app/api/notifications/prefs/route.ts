import { NextResponse } from "next/server";
import {
  getAllOwnerNotificationPrefs,
  setOwnerNotificationPref,
  type EmailFrequency,
  type SmsFrequency,
} from "@/lib/owner-notification-prefs";

const EMAIL_VALUES: EmailFrequency[] = ["instant", "daily", "weekly", "off"];
const SMS_VALUES: SmsFrequency[] = ["instant", "daily", "off"];

export async function GET() {
  const prefs = await getAllOwnerNotificationPrefs();
  return NextResponse.json({ ok: true, prefs });
}

export async function PUT(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    clientSlug?: unknown;
    emailFrequency?: unknown;
    smsFrequency?: unknown;
    dashboardSignal?: unknown;
  } | null;

  if (!body || typeof body.clientSlug !== "string" || !body.clientSlug.trim()) {
    return NextResponse.json(
      { ok: false, error: "clientSlug required" },
      { status: 400 },
    );
  }

  const patch: Parameters<typeof setOwnerNotificationPref>[1] = {};

  if (body.emailFrequency !== undefined) {
    if (
      typeof body.emailFrequency !== "string" ||
      !EMAIL_VALUES.includes(body.emailFrequency as EmailFrequency)
    ) {
      return NextResponse.json(
        { ok: false, error: "Invalid emailFrequency" },
        { status: 400 },
      );
    }
    patch.emailFrequency = body.emailFrequency as EmailFrequency;
  }

  if (body.smsFrequency !== undefined) {
    if (
      typeof body.smsFrequency !== "string" ||
      !SMS_VALUES.includes(body.smsFrequency as SmsFrequency)
    ) {
      return NextResponse.json(
        { ok: false, error: "Invalid smsFrequency" },
        { status: 400 },
      );
    }
    patch.smsFrequency = body.smsFrequency as SmsFrequency;
  }

  if (body.dashboardSignal !== undefined) {
    if (typeof body.dashboardSignal !== "boolean") {
      return NextResponse.json(
        { ok: false, error: "Invalid dashboardSignal" },
        { status: 400 },
      );
    }
    patch.dashboardSignal = body.dashboardSignal;
  }

  const updated = await setOwnerNotificationPref(body.clientSlug, patch);
  return NextResponse.json({ ok: true, pref: updated });
}
