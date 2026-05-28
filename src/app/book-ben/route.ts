import { NextResponse } from "next/server";
import { getBenBookingDestination } from "@/lib/booking";

/**
 * GET /book-ben
 *
 * Clean, on-brand short link for Ben's booking page. Prospects get
 * `https://bluejayportfolio.com/book-ben` in texts/emails (short enough
 * to dictate over the phone) and this 302-redirects them to the real
 * 115-char Google Calendar Appointment Schedule URL.
 *
 * Public route — prospects click it without an auth cookie. Not gated by
 * middleware (no /dashboard, /api, etc. prefix).
 *
 * Destination is `getBenBookingDestination()` (env override → Google
 * appt URL), so Ben can repoint it from Vercel without a code change.
 */

export const dynamic = "force-dynamic"; // always read the current destination

export function GET() {
  const dest = getBenBookingDestination();
  return NextResponse.redirect(dest, { status: 302 });
}
