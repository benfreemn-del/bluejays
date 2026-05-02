"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getSuggestedSlots,
  buildBookingSmsBody,
  type BookingSlot,
} from "@/lib/booking-slots";

/**
 * BookingTimeModal — opens when the rep clicks "Send booking link".
 *
 * Why a picker (vs. just sending a generic Calendly URL):
 *   Hormozi: specificity closes. "How about tomorrow at 2:15?" gets
 *   a faster yes than "here's my calendar, pick a time." The
 *   recommended slot is auto-selected so the rep has zero friction —
 *   they confirm verbally on the call, fire the SMS, done.
 *
 * The modal shows ~12 next-available slots in 30-min spacing at
 * :15/:45 marks (mon-fri, 9-5, no lunch). The first viable slot is
 * pre-recommended. Rep can pick any other slot if the prospect
 * pushes back.
 */

type Channel = "sms" | "email";

type Props = {
  open: boolean;
  onClose: () => void;
  /**
   * Fires after the rep picks a slot and clicks confirm. The href is
   * either an `sms:` or `mailto:` deep-link (depending on `channel`)
   * pre-filled with the spoken time + booking URL. The caller is
   * responsible for actually opening it (window.location.href = href)
   * so it can also update its own UI state (mark sent, etc.).
   */
  onConfirm: (slot: BookingSlot, href: string, channel: Channel) => void;
  prospectFirstName: string;
  prospectPhone: string;
  prospectEmail?: string | null;
  callerFirstName: string;
  bookingUrl: string;
  prospectBusinessName?: string;
  /** Default channel when modal opens. Caller controls so the
   *  text/email Booking buttons each route to their respective
   *  channel without two separate modals. */
  channel?: Channel;
};

export default function BookingTimeModal({
  open,
  onClose,
  onConfirm,
  prospectFirstName,
  prospectPhone,
  prospectEmail,
  callerFirstName,
  bookingUrl,
  prospectBusinessName,
  channel = "sms",
}: Props) {
  const slots = useMemo<BookingSlot[]>(
    () => (open ? getSuggestedSlots(new Date(), 12) : []),
    [open],
  );
  const [selectedIso, setSelectedIso] = useState<string | null>(null);

  // Auto-pick the recommended slot when the modal opens
  useEffect(() => {
    if (!open) return;
    const rec = slots.find((s) => s.recommended) ?? slots[0];
    setSelectedIso(rec?.iso ?? null);
  }, [open, slots]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const selected = slots.find((s) => s.iso === selectedIso) ?? null;

  function handleConfirm() {
    if (!selected) return;
    const smsBody = buildBookingSmsBody({
      firstName: prospectFirstName || "there",
      callerFirst: callerFirstName,
      spoken: selected.spoken,
      bookingUrl,
    });
    if (channel === "email" && prospectEmail) {
      const subject = encodeURIComponent(
        `Quick 15-min walkthrough — ${prospectBusinessName || "your business"} (${selected.spoken})`,
      );
      const body = encodeURIComponent(
        `Hey ${prospectFirstName || "there"},\n\n${callerFirstName} with BlueJays — locking in ${selected.spoken} for the 15-min walkthrough we just talked about. Confirm here:\n\n${bookingUrl}\n\nIf that time stops working, pick anything else on the calendar and it'll re-route automatically.\n\nTalk soon,\n${callerFirstName}\nBlueJays\nben@bluejayportfolio.com`,
      );
      const href = `mailto:${prospectEmail}?subject=${subject}&body=${body}`;
      onConfirm(selected, href, "email");
      return;
    }
    const cleanedPhone = prospectPhone.replace(/[^0-9+]/g, "");
    const href = `sms:${cleanedPhone}?&body=${encodeURIComponent(smsBody)}`;
    onConfirm(selected, href, "sms");
  }

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/70 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-emerald-500/30 bg-slate-950 shadow-2xl shadow-emerald-500/10 overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/5">
          <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold mb-1">
            Hormozi assumptive close
          </p>
          <h2 className="text-xl font-bold text-white">
            Pick a time to lock in
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Say it out loud:{" "}
            <span className="text-emerald-300 font-semibold">
              &ldquo;How about {selected?.spoken ?? "tomorrow at 2:15"}?&rdquo;
            </span>
            <br />
            If they nudge, pick another. Specific times close faster than
            &ldquo;whenever.&rdquo;
          </p>
        </div>

        {/* Slot grid */}
        <div className="px-6 py-5 max-h-[55vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            {slots.map((slot) => {
              const isSelected = slot.iso === selectedIso;
              return (
                <button
                  key={slot.iso}
                  type="button"
                  onClick={() => setSelectedIso(slot.iso)}
                  className={`relative rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                    isSelected
                      ? "bg-emerald-500 text-emerald-950 font-bold shadow-md shadow-emerald-500/30"
                      : "bg-white/[0.03] border border-white/10 text-slate-200 hover:border-emerald-500/40 hover:bg-emerald-500/5"
                  }`}
                >
                  {slot.recommended && !isSelected && (
                    <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold uppercase tracking-wide bg-amber-400 text-amber-950 rounded px-1.5 py-0.5">
                      Best
                    </span>
                  )}
                  <div
                    className={`text-[10px] uppercase tracking-wider font-semibold ${
                      isSelected ? "text-emerald-900/80" : "text-slate-500"
                    }`}
                  >
                    {slot.dayLabel}
                  </div>
                  <div className="text-base font-mono tabular-nums">
                    {slot.timeLabel}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 pb-6 pt-3 border-t border-white/5 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 rounded-md px-4 py-2.5 text-sm text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selected}
            className="flex-1 rounded-md px-4 py-2.5 text-sm font-bold bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-emerald-950 transition-colors shadow-lg shadow-emerald-500/20"
          >
            {selected
              ? channel === "email"
                ? `📧 Email "${selected.spoken}"`
                : `📱 Text "${selected.spoken}"`
              : "Pick a time"}
          </button>
        </div>
      </div>
    </div>
  );
}
