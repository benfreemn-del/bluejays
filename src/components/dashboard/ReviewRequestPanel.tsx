"use client";

import { useState } from "react";

interface Props {
  prospectId: string;
  businessName: string;
}

interface Customer {
  name: string;
  phone: string;
}

export default function ReviewRequestPanel({ prospectId, businessName }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([{ name: "", phone: "" }]);
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<{ phone: string; success: boolean }[]>([]);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com";
  const reviewUrl = `${BASE_URL}/review/${prospectId}`;

  function addRow() {
    setCustomers((prev) => [...prev, { name: "", phone: "" }]);
  }

  function updateRow(index: number, field: keyof Customer, value: string) {
    setCustomers((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  }

  function removeRow(index: number) {
    setCustomers((prev) => prev.filter((_, i) => i !== index));
  }

  async function sendRequests() {
    const valid = customers.filter((c) => c.phone.replace(/\D/g, "").length >= 10);
    if (!valid.length) {
      setError("Add at least one valid phone number.");
      return;
    }
    setSending(true);
    setError("");
    setResults([]);

    const outcomes: { phone: string; success: boolean }[] = [];
    for (const customer of valid) {
      try {
        const res = await fetch("/api/review-request/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prospectId,
            customerPhone: customer.phone,
            customerName: customer.name || undefined,
          }),
        });
        outcomes.push({ phone: customer.phone, success: res.ok });
      } catch {
        outcomes.push({ phone: customer.phone, success: false });
      }
    }

    setResults(outcomes);
    setSending(false);
    // Clear form on success
    if (outcomes.every((o) => o.success)) {
      setCustomers([{ name: "", phone: "" }]);
    }
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">⭐</span>
          <span className="font-semibold text-gray-800 text-sm">Review Request</span>
          <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
            Client Feature
          </span>
        </div>
        <span className="text-gray-400 text-sm">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-3 space-y-4">
          {/* Explanation */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
            <strong>How it works:</strong> Text your past customers a review link. 5-star ratings
            go straight to Google. Under 5 stars sends private feedback to {businessName}&apos;s inbox.
          </div>

          {/* Review link preview */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
            <span className="text-xs text-gray-500 flex-1 truncate">{reviewUrl}</span>
            <button
              onClick={() => navigator.clipboard.writeText(reviewUrl)}
              className="text-xs text-blue-600 underline flex-shrink-0"
            >
              Copy
            </button>
          </div>

          {/* Customer rows */}
          <div className="space-y-2">
            {customers.map((customer, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Customer name"
                  value={customer.name}
                  onChange={(e) => updateRow(i, "name", e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={customer.phone}
                  onChange={(e) => updateRow(i, "phone", e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                {customers.length > 1 && (
                  <button
                    onClick={() => removeRow(i)}
                    className="text-gray-400 hover:text-red-500 px-1 text-lg"
                    aria-label="Remove"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={addRow}
              className="text-sm text-blue-600 underline"
            >
              + Add another
            </button>
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-1">
              {results.map((r, i) => (
                <div key={i} className={`text-xs flex items-center gap-1 ${r.success ? "text-green-600" : "text-red-500"}`}>
                  <span>{r.success ? "✓" : "✗"}</span>
                  <span>{r.phone} — {r.success ? "SMS sent" : "Failed"}</span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={sendRequests}
            disabled={sending}
            className="w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {sending ? "Sending..." : `Send Review Request${customers.length > 1 ? "s" : ""}`}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Each customer gets one SMS. Reply &apos;STOP&apos; to opt out.
          </p>
        </div>
      )}
    </div>
  );
}
