"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

interface ProspectInfo {
  id: string;
  businessName: string;
  ownerName?: string;
  email?: string;
  phone?: string;
  city: string;
  state: string;
}

interface Slot {
  iso: string;
  label: string;
  timezone: string;
  durationMinutes: number;
}

export default function BookCallPage() {
  const params = useParams();
  const prospectId = params.id as string;
  const [prospect, setProspect] = useState<ProspectInfo | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [status, setStatus] = useState<string>("");
  const [form, setForm] = useState({
    contactName: "",
    email: "",
    phone: "",
    notes: "",
  });

  useEffect(() => {
    let alive = true;

    Promise.all([
      fetch(`/api/prospects/${prospectId}`).then((r) => r.json()),
      fetch(`/api/calendar/available-slots`).then((r) => r.json()),
    ])
      .then(([prospectData, slotData]) => {
        if (!alive) return;
        if (!prospectData.error) {
          setProspect(prospectData);
          setForm((prev) => ({
            ...prev,
            contactName: prospectData.ownerName || prospectData.businessName,
            email: prospectData.email || "",
            phone: prospectData.phone || "",
          }));
        }
        setSlots(slotData.slots || []);
        if (slotData.slots?.[0]?.iso) {
          setSelectedSlot(slotData.slots[0].iso);
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [prospectId]);

  const selectedLabel = useMemo(
    () => slots.find((slot) => slot.iso === selectedSlot)?.label || "",
    [selectedSlot, slots]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setSaving(true);
    setStatus("");

    try {
      const res = await fetch("/api/calendar/available-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectId,
          contactName: form.contactName,
          email: form.email,
          phone: form.phone,
          slotIso: selectedSlot,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || "Unable to book that time.");
      } else {
        setStatus(`Booked successfully for ${selectedLabel}. Ben will follow up at ${form.email}.`);
      }
    } catch {
      setStatus("Something went wrong while booking. Please try another slot.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted">Loading available times...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-blue-electric/15 via-background to-background border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-surface border border-border text-xs text-muted mb-6">
            Schedule a quick sales walkthrough
          </div>
          <h1 className="text-4xl font-bold mb-4">Book a call with Ben</h1>
          <p className="text-lg text-muted leading-7">
            Choose a time that works for you and we will walk through the website for {prospect?.businessName || "your business"}, answer questions, and map out the next step.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 grid lg:grid-cols-[0.9fr_1.1fr] gap-8">
        <section className="rounded-3xl border border-border bg-surface p-6 space-y-4">
          <h2 className="text-xl font-bold">Meeting details</h2>
          <div className="space-y-3 text-sm text-muted">
            <p><strong className="text-foreground">Business:</strong> {prospect?.businessName}</p>
            <p><strong className="text-foreground">Location:</strong> {prospect?.city}, {prospect?.state}</p>
            <p><strong className="text-foreground">Schedule:</strong> Mon-Thu, 8:00 AM-4:00 PM PST through April 30, 2026</p>
            <p><strong className="text-foreground">Call length:</strong> 30 minutes</p>
          </div>
          <div className="rounded-2xl bg-surface-light border border-border p-4 text-sm text-muted leading-6">
            This is a low-pressure walkthrough. We can review the preview site, talk through edits, and cover the claim process if you are ready.
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-surface p-6">
          <h2 className="text-xl font-bold mb-5">Choose your time</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-muted mb-2">Available slot</label>
              <select
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-surface-light border border-border text-sm"
              >
                {slots.map((slot) => (
                  <option key={slot.iso} value={slot.iso}>{slot.label}</option>
                ))}
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Your name" value={form.contactName} onChange={(value) => setForm({ ...form, contactName: value })} />
              <Field label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
              <Field label="Phone" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
            </div>

            <div>
              <label className="block text-sm text-muted mb-2">Anything you want to cover?</label>
              <textarea
                rows={4}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-surface-light border border-border text-sm resize-none"
                placeholder="Questions about edits, launch timing, domain setup, pricing, or anything else."
              />
            </div>

            <button
              type="submit"
              disabled={saving || !selectedSlot || !form.contactName || !form.email}
              className="w-full h-12 rounded-xl bg-blue-electric text-white text-sm font-semibold hover:bg-blue-deep transition-colors disabled:opacity-50"
            >
              {saving ? "Booking..." : "Confirm Booking"}
            </button>

            {status && (
              <p className={`text-sm leading-6 ${status.toLowerCase().includes("success") || status.toLowerCase().includes("booked") ? "text-green-400" : "text-amber-400"}`}>
                {status}
              </p>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-muted mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 px-4 rounded-xl bg-surface-light border border-border text-sm"
      />
    </div>
  );
}
