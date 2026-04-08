import { NextRequest, NextResponse } from "next/server";
import { getProspect } from "@/lib/store";
import { createBooking, getAvailableSlots } from "@/lib/calendar-booking";

export async function GET() {
  const slots = await getAvailableSlots();
  return NextResponse.json({
    owner: "Ben",
    timezone: "America/Los_Angeles",
    schedule: "Mon-Thu 8am-4pm PST through April 30, 2026",
    slots,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { prospectId, contactName, email, phone, slotIso, notes } = body;

  if (!prospectId || !contactName || !email || !slotIso) {
    return NextResponse.json(
      { error: "prospectId, contactName, email, and slotIso are required" },
      { status: 400 }
    );
  }

  const prospect = await getProspect(prospectId);
  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  try {
    const booking = await createBooking({
      prospectId,
      businessName: prospect.businessName,
      contactName,
      email,
      phone,
      slotIso,
      notes,
    });

    return NextResponse.json({ booking });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create booking" },
      { status: 400 }
    );
  }
}
