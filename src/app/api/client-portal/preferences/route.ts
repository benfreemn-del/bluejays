import { NextRequest, NextResponse } from "next/server";
import { CLIENT_PORTAL_COOKIE, ownerFromCookie } from "@/lib/client-auth";
import {
  getOwnerPreferences,
  updateOwnerPreferences,
  type NotificationMode,
} from "@/lib/client-owner-preferences";

/**
 * GET  /api/client-portal/preferences  → read this owner's notification prefs
 * PATCH /api/client-portal/preferences → update them
 *
 * Cookie-scoped to the logged-in owner. Owners cannot read or write
 * another owner's prefs.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(CLIENT_PORTAL_COOKIE)?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }
  try {
    const prefs = await getOwnerPreferences(owner.id);
    return NextResponse.json({ ok: true, preferences: prefs });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}

const VALID_MODES: NotificationMode[] = ["instant", "digest", "off"];

export async function PATCH(req: NextRequest) {
  const cookie = req.cookies.get(CLIENT_PORTAL_COOKIE)?.value;
  const owner = await ownerFromCookie(cookie);
  if (!owner) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const patch: Parameters<typeof updateOwnerPreferences>[1] = {};
  if (typeof body.new_lead_email === "string") {
    if (!VALID_MODES.includes(body.new_lead_email as NotificationMode)) {
      return NextResponse.json({ ok: false, error: "Invalid new_lead_email" }, { status: 400 });
    }
    patch.new_lead_email = body.new_lead_email as NotificationMode;
  }
  if (typeof body.new_lead_sms === "string") {
    if (!VALID_MODES.includes(body.new_lead_sms as NotificationMode)) {
      return NextResponse.json({ ok: false, error: "Invalid new_lead_sms" }, { status: 400 });
    }
    patch.new_lead_sms = body.new_lead_sms as NotificationMode;
  }
  if (Array.isArray(body.instant_audience_filter)) {
    patch.instant_audience_filter = (body.instant_audience_filter as unknown[])
      .filter((v): v is string => typeof v === "string");
  }
  if (typeof body.digest_hour === "number" && body.digest_hour >= 0 && body.digest_hour <= 23) {
    patch.digest_hour = Math.floor(body.digest_hour);
  }
  if (typeof body.digest_timezone === "string" && body.digest_timezone.length < 64) {
    patch.digest_timezone = body.digest_timezone;
  }
  try {
    const prefs = await updateOwnerPreferences(owner.id, patch);
    return NextResponse.json({ ok: true, preferences: prefs });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
