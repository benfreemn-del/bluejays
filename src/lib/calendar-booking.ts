import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { supabase, isSupabaseConfigured } from "./supabase";

const DATA_DIR = path.join(process.cwd(), "data");
const BOOKINGS_DIR = path.join(DATA_DIR, "bookings");
const TIMEZONE = "America/Los_Angeles";
const SLOT_MINUTES = 30;

export interface CalendarBooking {
  id: string;
  prospectId: string;
  businessName: string;
  contactName: string;
  email: string;
  phone?: string;
  slotIso: string;
  timezone: string;
  notes?: string;
  createdAt: string;
}

function ensureDir() {
  if (!fs.existsSync(BOOKINGS_DIR)) fs.mkdirSync(BOOKINGS_DIR, { recursive: true });
}

const WORKING_DAYS = new Set([1, 2, 3, 4]); // Mon-Thu

function formatSlotIso(year: number, monthIndex: number, day: number, hour: number, minute: number) {
  const utcHour = hour + 7; // PDT (UTC-7) for April 2026
  return new Date(Date.UTC(year, monthIndex, day, utcHour, minute, 0)).toISOString();
}

function getCandidateSlots(): string[] {
  const slots: string[] = [];
  for (let day = 8; day <= 30; day += 1) {
    const date = new Date(Date.UTC(2026, 3, day, 12, 0, 0));
    const weekday = date.getUTCDay();
    if (!WORKING_DAYS.has(weekday)) continue;

    for (let minutes = 8 * 60; minutes < 16 * 60; minutes += SLOT_MINUTES) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      slots.push(formatSlotIso(2026, 3, day, hour, minute));
    }
  }
  return slots;
}

async function getStoredBookings(): Promise<CalendarBooking[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("calendar_bookings")
        .select("*")
        .order("slot_iso", { ascending: true });
      if (!error && data) {
        return data.map((row: Record<string, unknown>) => ({
          id: row.id as string,
          prospectId: row.prospect_id as string,
          businessName: row.business_name as string,
          contactName: row.contact_name as string,
          email: row.email as string,
          phone: row.phone as string | undefined,
          slotIso: row.slot_iso as string,
          timezone: row.timezone as string,
          notes: row.notes as string | undefined,
          createdAt: row.created_at as string,
        }));
      }
    } catch {
      // fall through to file storage
    }
  }

  if (process.env.VERCEL) return [];
  ensureDir();
  const files = fs.readdirSync(BOOKINGS_DIR).filter((file) => file.endsWith(".json"));
  return files.map((file) => JSON.parse(fs.readFileSync(path.join(BOOKINGS_DIR, file), "utf-8")) as CalendarBooking);
}

async function saveBooking(booking: CalendarBooking) {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from("calendar_bookings").insert({
        id: booking.id,
        prospect_id: booking.prospectId,
        business_name: booking.businessName,
        contact_name: booking.contactName,
        email: booking.email,
        phone: booking.phone || null,
        slot_iso: booking.slotIso,
        timezone: booking.timezone,
        notes: booking.notes || null,
        created_at: booking.createdAt,
      });
      return;
    } catch {
      // fall through to file storage
    }
  }

  if (process.env.VERCEL) return;
  ensureDir();
  fs.writeFileSync(path.join(BOOKINGS_DIR, `${booking.id}.json`), JSON.stringify(booking, null, 2));
}

export async function getAvailableSlots() {
  const booked = new Set((await getStoredBookings()).map((booking) => booking.slotIso));
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return getCandidateSlots()
    .filter((slot) => !booked.has(slot))
    .map((slotIso) => ({
      iso: slotIso,
      label: `${formatter.format(new Date(slotIso))} PST`,
      timezone: TIMEZONE,
      durationMinutes: SLOT_MINUTES,
    }));
}

export async function createBooking(input: {
  prospectId: string;
  businessName: string;
  contactName: string;
  email: string;
  phone?: string;
  slotIso: string;
  notes?: string;
}) {
  const availableSlots = await getAvailableSlots();
  if (!availableSlots.some((slot) => slot.iso === input.slotIso)) {
    throw new Error("That time slot is no longer available.");
  }

  const booking: CalendarBooking = {
    id: uuidv4(),
    prospectId: input.prospectId,
    businessName: input.businessName,
    contactName: input.contactName,
    email: input.email,
    phone: input.phone,
    slotIso: input.slotIso,
    timezone: TIMEZONE,
    notes: input.notes,
    createdAt: new Date().toISOString(),
  };

  await saveBooking(booking);
  return booking;
}
