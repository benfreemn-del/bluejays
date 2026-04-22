/**
 * GET /api/schedule/slots/[id]?date=YYYY-MM-DD
 *
 * Returns available time slots for a given date for this client's business.
 * Slot backend priority:
 *   1. Calendly — if client has a calendlyUrl configured
 *   2. Google Calendar — if client has googleCalendarId configured (future)
 *   3. Custom — Mon–Thu, 9 AM–5 PM PDT, 30-min slots, excludes booked ones
 *
 * Also supports GET with no date → returns the next 60 days with availability
 * (used to highlight which calendar days should be clickable).
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getProspect } from "@/lib/store";

const SLOT_MINUTES = 30;
const START_HOUR = 9;   // 9 AM PDT
const END_HOUR = 17;    // 5 PM PDT
const WORKING_DAYS = new Set([1, 2, 3, 4]); // Mon–Thu (0=Sun, 6=Sat)

export interface TimeSlot {
  iso: string;       // ISO 8601 UTC
  label: string;     // "9:00 AM"
  available: boolean;
}

// Returns true if the given date (local PDT) is a working day in the future
function isWorkingDay(dateStr: string): boolean {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (d < today) return false;
  return WORKING_DAYS.has(d.getDay());
}

// Build candidate slots for a YYYY-MM-DD date in PDT
function buildSlots(dateStr: string): TimeSlot[] {
  const [year, month, day] = dateStr.split("-").map(Number);
  const now = new Date();
  const slots: TimeSlot[] = [];

  for (let minutes = START_HOUR * 60; minutes < END_HOUR * 60; minutes += SLOT_MINUTES) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    // PDT = UTC-7
    const utcHour = hour + 7;
    const slotDate = new Date(Date.UTC(year, month - 1, day, utcHour, minute, 0));

    // Skip past slots (give 1-hour buffer for same-day)
    if (slotDate.getTime() < now.getTime() + 60 * 60 * 1000) continue;

    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const period = hour >= 12 ? "PM" : "AM";
    const label = `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;

    slots.push({ iso: slotDate.toISOString(), label, available: true });
  }
  return slots;
}

// Get already-booked slot ISOs for a specific prospect+date
async function getBookedSlots(prospectId: string, dateStr: string): Promise<Set<string>> {
  const [year, month, day] = dateStr.split("-").map(Number);
  // Start of day UTC (PDT midnight = UTC 07:00)
  const dayStart = new Date(Date.UTC(year, month - 1, day, 7, 0, 0)).toISOString();
  const dayEnd = new Date(Date.UTC(year, month - 1, day, 23, 59, 0)).toISOString();

  if (!isSupabaseConfigured()) return new Set();

  try {
    const { data } = await supabase
      .from("schedule_bookings")
      .select("slot_iso")
      .eq("prospect_id", prospectId)
      .eq("status", "confirmed")
      .gte("slot_iso", dayStart)
      .lte("slot_iso", dayEnd);
    return new Set((data ?? []).map((r: { slot_iso: string }) => r.slot_iso));
  } catch {
    return new Set();
  }
}

// Fetch Calendly availability for a date range (if configured)
async function getCalendlySlots(
  calendlyUrl: string,
  dateStr: string
): Promise<TimeSlot[] | null> {
  const token = process.env.CALENDLY_PERSONAL_ACCESS_TOKEN;
  if (!token) return null;

  try {
    // Extract event type slug from URL, e.g. calendly.com/user/event-type
    const urlParts = calendlyUrl.replace(/\/$/, "").split("/");
    const userSlug = urlParts[urlParts.length - 2];
    const eventSlug = urlParts[urlParts.length - 1];

    const [year, month, day] = dateStr.split("-").map(Number);
    const dayStart = new Date(year, month - 1, day, 0, 0, 0).toISOString();
    const dayEnd = new Date(year, month - 1, day, 23, 59, 0).toISOString();

    // Get the event type URI first
    const etRes = await fetch(
      `https://api.calendly.com/event_types?user=${encodeURIComponent(`https://api.calendly.com/users/${userSlug}`)}&slug=${eventSlug}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!etRes.ok) return null;
    const etData = await etRes.json();
    const eventTypeUri = etData.collection?.[0]?.uri;
    if (!eventTypeUri) return null;

    // Get available times
    const avRes = await fetch(
      `https://api.calendly.com/event_type_available_times?event_type=${encodeURIComponent(eventTypeUri)}&start_time=${dayStart}&end_time=${dayEnd}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!avRes.ok) return null;
    const avData = await avRes.json();

    return (avData.collection ?? []).map((slot: { start_time: string }) => {
      const d = new Date(slot.start_time);
      const hour = d.getHours();
      const minute = d.getMinutes();
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const period = hour >= 12 ? "PM" : "AM";
      return {
        iso: slot.start_time,
        label: `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`,
        available: true,
      };
    });
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date"); // YYYY-MM-DD
  const mode = searchParams.get("mode"); // "days" = return available days for a month

  const prospect = await getProspect(id);
  if (!prospect) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // ── MODE: available days for a month ──────────────────────────────────────
  if (mode === "days") {
    const yearParam = searchParams.get("year");
    const monthParam = searchParams.get("month");
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();
    const month = monthParam ? parseInt(monthParam) : new Date().getMonth() + 1;
    const daysInMonth = new Date(year, month, 0).getDate();

    const availableDays: string[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      if (isWorkingDay(dateStr)) {
        availableDays.push(dateStr);
      }
    }

    return NextResponse.json({ availableDays });
  }

  // ── MODE: slots for a specific date ───────────────────────────────────────
  if (!date) {
    return NextResponse.json({ error: "date param required (YYYY-MM-DD)" }, { status: 400 });
  }

  if (!isWorkingDay(date)) {
    return NextResponse.json({ slots: [] });
  }

  // Check for Calendly config
  const calendlyUrl = (prospect as { calendlyUrl?: string }).calendlyUrl ||
    (prospect.scrapedData?.calendlyUrl as string | undefined);

  if (calendlyUrl) {
    const calendlySlots = await getCalendlySlots(calendlyUrl, date);
    if (calendlySlots) {
      return NextResponse.json({ slots: calendlySlots, backend: "calendly" });
    }
    // Fall through to custom if Calendly fails
  }

  // Custom slot system
  const allSlots = buildSlots(date);
  const booked = await getBookedSlots(id, date);
  const slots = allSlots.map((s) => ({ ...s, available: !booked.has(s.iso) }));

  return NextResponse.json({ slots, backend: "custom" });
}
