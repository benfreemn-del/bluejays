import { ItcLpShell, LpCaptureForm } from "../../_components/lp-shell";

export const metadata = {
  title: "Sub-compact Tractor First-Year Setup · ITC Quick Attach",
  description:
    "12 things every sub-compact owner should add in their first year. Free PDF.",
};

export default function HobbyistPage() {
  return (
    <ItcLpShell navTitle="First-Year Setup">
      <div className="grid md:grid-cols-[1.2fr_1fr] gap-8 items-start">
        <div>
          <span className="inline-block text-[11px] uppercase tracking-[0.22em] text-amber-300 font-bold mb-3">
            🚜 New tractor owner?
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-[1.05]">
            12 things to add to your sub-compact in year one.
          </h1>
          <p className="text-amber-50/70 text-lg mb-6">
            Skip the year-two regrets. We put together the actual list our
            customers wish they&rsquo;d done first — not the upsell list, the
            real one.
          </p>

          <ol className="space-y-2 text-sm text-amber-50/80 mb-6 list-decimal list-inside marker:text-amber-300 marker:font-black">
            <li>Brush guard with screen insert (the $249 that saves a $1,500 grille)</li>
            <li>Universal toolbox kit — $125</li>
            <li>SawBoss chainsaw carrier — $180</li>
            <li>LED light kit + mount</li>
            <li>Tractor steps + grab handle</li>
            <li>Quick-hitch system</li>
            <li>Milwaukee Packout mount (if you already run M18)</li>
            <li>Chainbox for chain + bar oil + wedges</li>
            <li>Front-end loader bucket-edge teeth</li>
            <li>Tire chains (year-two if you skip)</li>
            <li>Ballast box for backhoe / brush hog work</li>
            <li>Block heater + battery tender</li>
          </ol>

          <p className="text-[12px] text-amber-50/40 italic">
            All 12 items are real ITC SKUs or compatible add-ons. American-made
            in Blossvale, NY.
          </p>
        </div>

        <aside>
          <h2 className="text-lg font-black mb-2">Get the full PDF + cost calculator</h2>
          <p className="text-sm text-amber-50/60 mb-3">
            12-page PDF with photos, install times, and the cost-per-item
            breakdown. Free.
          </p>
          <LpCaptureForm
            audience="hobbyist"
            intent="First-year setup checklist PDF"
            submitLabel="Email me the checklist"
          />
        </aside>
      </div>
    </ItcLpShell>
  );
}
