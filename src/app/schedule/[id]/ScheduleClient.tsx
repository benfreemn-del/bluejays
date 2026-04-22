"use client";

import { useState, useEffect, useCallback } from "react";

interface Props {
  prospectId: string;
  businessName: string;
  ownerName?: string;
  category: string;
  accentColor: string;
  prefillName?: string;
  prefillPhone?: string;
  prefillEmail?: string;
  isEmbed?: boolean;
}

interface TimeSlot {
  iso: string;
  label: string;
  available: boolean;
}

type Stage = "calendar" | "slots" | "details" | "confirmed";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export default function ScheduleClient({
  prospectId,
  businessName,
  accentColor,
  prefillName = "",
  prefillPhone = "",
  prefillEmail = "",
  isEmbed = false,
}: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1); // 1-based
  const [availableDays, setAvailableDays] = useState<Set<string>>(new Set());
  const [loadingDays, setLoadingDays] = useState(false);

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const [stage, setStage] = useState<Stage>("calendar");
  const [form, setForm] = useState({
    name: prefillName,
    phone: prefillPhone,
    email: prefillEmail,
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmation, setConfirmation] = useState<{
    dateFormatted: string;
    timeFormatted: string;
    smsSent: boolean;
    emailSent: boolean;
  } | null>(null);

  // ── Load available days when month/year changes ───────────────────────────
  const loadAvailableDays = useCallback(async () => {
    setLoadingDays(true);
    try {
      const res = await fetch(
        `/api/schedule/slots/${prospectId}?mode=days&year=${viewYear}&month=${viewMonth}`
      );
      const data = await res.json();
      setAvailableDays(new Set(data.availableDays ?? []));
    } catch {
      setAvailableDays(new Set());
    } finally {
      setLoadingDays(false);
    }
  }, [prospectId, viewYear, viewMonth]);

  useEffect(() => {
    loadAvailableDays();
  }, [loadAvailableDays]);

  // ── Load time slots when a date is selected ───────────────────────────────
  async function selectDate(dateStr: string) {
    setSelectedDate(dateStr);
    setSelectedSlot(null);
    setSlots([]);
    setLoadingSlots(true);
    setStage("slots");
    try {
      const res = await fetch(`/api/schedule/slots/${prospectId}?date=${dateStr}`);
      const data = await res.json();
      setSlots(data.slots ?? []);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  function selectSlot(slot: TimeSlot) {
    setSelectedSlot(slot);
    setStage("details");
  }

  async function submitBooking() {
    if (!selectedSlot || !selectedDate) return;
    if (!form.name.trim()) { setSubmitError("Please enter your name."); return; }
    if (!form.phone.trim() && !form.email.trim()) {
      setSubmitError("Please enter a phone number or email."); return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch(`/api/schedule/book/${prospectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotIso: selectedSlot.iso,
          slotLabel: selectedSlot.label,
          date: selectedDate,
          contactName: form.name.trim(),
          phone: form.phone.trim() || undefined,
          email: form.email.trim() || undefined,
          notes: form.notes.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setConfirmation({
        dateFormatted: data.dateFormatted,
        timeFormatted: data.timeFormatted,
        smsSent: data.smsSent,
        emailSent: data.emailSent,
      });
      setStage("confirmed");

      // Notify parent iframe if embedded
      if (isEmbed && window.parent) {
        window.parent.postMessage({ type: "bluejays-booking-complete", bookingId: data.bookingId }, "*");
      }
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Calendar grid helpers ─────────────────────────────────────────────────
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth - 1, 1).getDay();

  function prevMonth() {
    if (viewMonth === 1) { setViewMonth(12); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 12) { setViewMonth(1); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  const todayStr = toDateStr(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const isPastMonth =
    viewYear < today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth <= today.getMonth() + 1 &&
      !(viewYear === today.getFullYear() && viewMonth === today.getMonth() + 1));

  // ── Render ────────────────────────────────────────────────────────────────
  const wrapperClass = isEmbed
    ? "w-full h-full flex flex-col"
    : "min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8";

  return (
    <div className={wrapperClass} style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Top accent bar */}
        <div style={{ background: accentColor }} className="h-1.5 w-full flex-shrink-0" />

        {/* Header */}
        <div className="px-6 pt-5 pb-3 flex-shrink-0">
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-400">
            Schedule an Appointment
          </p>
          <h1 className="text-lg font-bold text-gray-900 mt-0.5">{businessName}</h1>
        </div>

        {/* ── STAGE: Calendar ───────────────────────────────────────────── */}
        {stage === "calendar" && (
          <div className="px-6 pb-6 flex-1 overflow-y-auto">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevMonth}
                disabled={viewYear === today.getFullYear() && viewMonth <= today.getMonth() + 1}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ‹
              </button>
              <span className="font-semibold text-gray-800 text-sm">
                {MONTHS[viewMonth - 1]} {viewYear}
              </span>
              <button
                onClick={nextMonth}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
              >
                ›
              </button>
            </div>

            {/* Day of week headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAY_LABELS.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-y-1">
              {/* Empty cells before first day */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Days */}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const dateStr = toDateStr(viewYear, viewMonth, day);
                const isToday = dateStr === todayStr;
                const isAvailable = availableDays.has(dateStr);
                const isPast = dateStr < todayStr;

                return (
                  <button
                    key={day}
                    onClick={() => isAvailable && !isPast && selectDate(dateStr)}
                    disabled={!isAvailable || isPast || loadingDays}
                    className={[
                      "relative flex items-center justify-center h-9 w-full rounded-full text-sm font-medium transition-all",
                      isAvailable && !isPast
                        ? "hover:opacity-90 cursor-pointer text-white"
                        : "text-gray-300 cursor-not-allowed",
                      isToday && !isAvailable ? "ring-2 ring-inset ring-gray-300 text-gray-500" : "",
                    ].join(" ")}
                    style={
                      isAvailable && !isPast
                        ? { background: accentColor }
                        : undefined
                    }
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {loadingDays && (
              <p className="text-center text-xs text-gray-400 mt-3">Loading availability...</p>
            )}

            {!loadingDays && availableDays.size === 0 && !isPastMonth && (
              <p className="text-center text-xs text-gray-400 mt-3">
                No available dates this month — try next month.
              </p>
            )}
          </div>
        )}

        {/* ── STAGE: Time Slots ─────────────────────────────────────────── */}
        {stage === "slots" && (
          <div className="px-6 pb-6 flex-1 overflow-y-auto">
            {/* Back + selected date */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setStage("calendar")}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                ‹ Back
              </button>
              <span className="text-sm font-semibold text-gray-800">
                {formatDisplayDate(selectedDate)}
              </span>
            </div>

            <p className="text-xs text-gray-500 mb-3">Select a time (Pacific Time)</p>

            {loadingSlots && (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            )}

            {!loadingSlots && slots.length === 0 && (
              <p className="text-sm text-gray-400 py-4 text-center">
                No available times on this date. Please go back and select another day.
              </p>
            )}

            <div className="space-y-2">
              {slots.filter((s) => s.available).map((slot) => (
                <button
                  key={slot.iso}
                  onClick={() => selectSlot(slot)}
                  className="w-full py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all text-left"
                  style={{
                    borderColor: accentColor,
                    color: accentColor,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = accentColor;
                    (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color = accentColor;
                  }}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STAGE: Details Form ───────────────────────────────────────── */}
        {stage === "details" && (
          <div className="px-6 pb-6 flex-1 overflow-y-auto">
            {/* Back + selected slot summary */}
            <button
              onClick={() => setStage("slots")}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-1"
            >
              ‹ Back
            </button>
            <div
              className="rounded-xl px-4 py-3 mb-5"
              style={{ background: `${accentColor}15` }}
            >
              <p className="text-xs font-semibold" style={{ color: accentColor }}>
                Your appointment
              </p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {formatDisplayDate(selectedDate)}
              </p>
              <p className="text-sm text-gray-700">{selectedSlot?.label} (Pacific Time)</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Jane Smith"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all"
                  style={{ ["--tw-ring-color" as string]: accentColor }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="(206) 555-0100"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="jane@example.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Anything we should know..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 resize-none transition-all"
                />
              </div>
            </div>

            {submitError && (
              <p className="text-red-500 text-xs mt-2">{submitError}</p>
            )}

            <button
              onClick={submitBooking}
              disabled={submitting}
              className="w-full mt-4 py-3 rounded-xl text-white font-semibold text-sm shadow-sm transition-opacity disabled:opacity-50"
              style={{ background: accentColor }}
            >
              {submitting ? "Confirming..." : "Confirm Appointment"}
            </button>
          </div>
        )}

        {/* ── STAGE: Confirmed ──────────────────────────────────────────── */}
        {stage === "confirmed" && confirmation && (
          <div className="px-6 pb-8 flex-1 flex flex-col items-center text-center">
            {/* Checkmark */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl mt-4 mb-4"
              style={{ background: accentColor }}
            >
              ✓
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-1">
              You&apos;re all set!
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Your appointment is confirmed with {businessName}.
            </p>

            {/* Appointment card */}
            <div className="w-full rounded-2xl border border-gray-100 shadow-sm p-4 text-left space-y-2">
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">📅</span>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Date</p>
                  <p className="text-sm font-semibold text-gray-900">{confirmation.dateFormatted}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">🕐</span>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Time</p>
                  <p className="text-sm font-semibold text-gray-900">{confirmation.timeFormatted} (Pacific)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">📍</span>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Business</p>
                  <p className="text-sm font-semibold text-gray-900">{businessName}</p>
                </div>
              </div>
            </div>

            {/* Confirmation channel notice */}
            <p className="text-xs text-gray-400 mt-4">
              {confirmation.smsSent && confirmation.emailSent
                ? "A confirmation has been sent to your phone and email."
                : confirmation.smsSent
                ? "A confirmation text has been sent to your phone."
                : confirmation.emailSent
                ? "A confirmation has been sent to your email."
                : "Your appointment is saved. Contact the business if you need to reschedule."}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 pb-4 pt-1 text-center flex-shrink-0 border-t border-gray-50">
          <p className="text-xs text-gray-300">
            Powered by{" "}
            <a
              href="https://bluejayportfolio.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              bluejayportfolio.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
