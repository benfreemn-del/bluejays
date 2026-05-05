"use client";

import { useState } from "react";
import { ItcLpShell, LpCaptureForm } from "../../_components/lp-shell";

/**
 * /clients/itc-quick-attach/lp/dealer — wholesale ROI calculator + capture.
 * Dealers enter monthly tractor deliveries → we project incremental
 * accessory revenue at common attach rates. The Cascade Tractor Supply
 * (Spokane WA) precedent is the only dealer relationship publicly visible
 * for ITC, so this is greenfield channel revenue.
 */

const WHOLESALE_AVG_PER_TRACTOR = 120; // dealer margin assumption (USD)
const ATTACH_RATE_OPTIONS = [
  { label: "30% (light push)", value: 0.3 },
  { label: "50% (active push)", value: 0.5 },
  { label: "70% (Cascade-style)", value: 0.7 },
];

export default function DealerPage() {
  const [monthly, setMonthly] = useState(20);
  const [rate, setRate] = useState(0.5);

  const monthlyRevenue = Math.round(monthly * rate * WHOLESALE_AVG_PER_TRACTOR);
  const annualRevenue = monthlyRevenue * 12;

  return (
    <ItcLpShell navTitle="Dealer / Wholesale">
      <span className="inline-block text-[11px] uppercase tracking-[0.22em] text-amber-300 font-bold mb-3">
        🤝 Tractor dealers · wholesale
      </span>
      <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3 leading-[1.05]">
        Add accessory revenue to every tractor you deliver.
      </h1>
      <p className="text-amber-50/70 text-lg mb-8 max-w-2xl">
        Cascade Tractor Supply (Spokane WA) ships ITC accessories on every
        Branson delivery — attach rate north of 70%. Plug in your numbers and
        see what that means for your dealership.
      </p>

      {/* Calculator */}
      <div className="grid md:grid-cols-[1fr_1fr] gap-6 mb-10">
        <div className="rounded-2xl border border-amber-900/40 bg-amber-950/[0.15] p-5 space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-amber-50/50 block mb-2">
              Tractors delivered per month
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={5}
                max={200}
                step={5}
                value={monthly}
                onChange={(e) => setMonthly(Number(e.target.value))}
                className="flex-1 accent-amber-400"
              />
              <span className="text-2xl font-black text-amber-300 w-14 text-right">
                {monthly}
              </span>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-amber-50/50 block mb-2">
              Accessory attach rate
            </label>
            <div className="flex flex-col gap-1.5">
              {ATTACH_RATE_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setRate(o.value)}
                  className={`text-sm font-bold px-3 py-2 rounded-lg border transition text-left ${
                    rate === o.value
                      ? "bg-amber-500 border-amber-300 text-black"
                      : "border-amber-900/40 text-amber-50/70 hover:text-amber-50"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-amber-50/40 italic">
            Assumes ~${WHOLESALE_AVG_PER_TRACTOR} avg dealer margin per attached
            accessory bundle. Real numbers vary by SKU mix.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.08] p-6 flex flex-col justify-center">
          <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-300 font-bold mb-2">
            Projected accessory revenue
          </p>
          <p className="text-4xl font-black text-emerald-300 mb-1">
            ${monthlyRevenue.toLocaleString()}
            <span className="text-base text-emerald-300/70 font-normal">
              /mo
            </span>
          </p>
          <p className="text-2xl font-black text-amber-300/90">
            ${annualRevenue.toLocaleString()}
            <span className="text-sm text-amber-300/70 font-normal"> /yr</span>
          </p>
          <p className="text-[11px] text-emerald-300/60 mt-3">
            On top of your existing tractor margin. No inventory risk — drop-ship
            from ITC.
          </p>
        </div>
      </div>

      {/* Capture */}
      <div className="grid md:grid-cols-[1fr_1.2fr] gap-6 items-start">
        <div>
          <h2 className="text-2xl font-black mb-2">Get your custom dealer report</h2>
          <p className="text-amber-50/70 mb-3">
            We&rsquo;ll send a 1-pager with your projected numbers, the SKUs
            that move best at your tractor mix, and the wholesale price sheet.
            24-hour turnaround.
          </p>
          <ul className="text-sm text-amber-50/60 space-y-1">
            <li>✓ Wholesale price sheet (PDF)</li>
            <li>✓ Bestsellers per tractor brand (TYM / Kioti / Mahindra / Branson)</li>
            <li>✓ Drop-ship + accessorize-on-delivery playbook</li>
          </ul>
        </div>
        <LpCaptureForm
          audience="dealer"
          intent="Wholesale ROI calculator"
          submitLabel="Send my dealer report"
          extraFields={[
            {
              name: "dealership_name",
              label: "Dealership name",
              required: true,
              placeholder: "Cascade Tractor Supply",
            },
            {
              name: "monthly_deliveries",
              label: "Avg monthly deliveries",
              type: "number",
              placeholder: String(monthly),
            },
            {
              name: "tractor_brands",
              label: "Brands you carry",
              placeholder: "TYM, Kioti, Mahindra, Branson…",
            },
          ]}
        />
      </div>
    </ItcLpShell>
  );
}
