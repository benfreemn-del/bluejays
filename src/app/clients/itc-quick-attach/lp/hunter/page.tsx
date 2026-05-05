import { ItcLpShell, LpCaptureForm } from "../../_components/lp-shell";

export const metadata = {
  title: "Tractor Gun-Mount Install Guide · ITC Quick Attach",
  description:
    "Tractor firearm-mount install + 5 safety tips most owners learn the hard way.",
};

export default function HunterPage() {
  return (
    <ItcLpShell navTitle="Hunter & Outdoor">
      <div className="grid md:grid-cols-[1.2fr_1fr] gap-8 items-start">
        <div>
          <span className="inline-block text-[11px] uppercase tracking-[0.22em] text-amber-300 font-bold mb-3">
            🦌 Hunters · property owners
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-[1.05]">
            Mount your rifle the way a tractor owner actually does it.
          </h1>
          <p className="text-amber-50/70 text-lg mb-6">
            ITC sells firearm mounts because hunters were already buying our
            other accessories. Five tips most owners learn the hard way:
          </p>

          <ol className="space-y-2 text-sm text-amber-50/80 mb-6 list-decimal list-inside marker:text-amber-300 marker:font-black">
            <li>Mount on the ROPS upright, not the fender — vibration kills locks.</li>
            <li>Run a tether through the trigger guard, even on private land.</li>
            <li>Pair with our LED light mount for pre-dawn scouting.</li>
            <li>Cover with the brush-guard accessory canvas in shoulder season.</li>
            <li>Take it off before any public-road transport. Always.</li>
          </ol>

          <p className="text-[12px] text-amber-50/40 italic">
            Source: itcquickattach.com firearm-mount product category +
            brush-guard accessories.
          </p>
        </div>

        <aside>
          <h2 className="text-lg font-black mb-2">Get the install + safety guide</h2>
          <p className="text-sm text-amber-50/60 mb-3">
            PDF with step-by-step photos. Plus a bundle quote: firearm mount +
            LED kit + brush canvas = your seasonal package.
          </p>
          <LpCaptureForm
            audience="hunter"
            intent="Gun-mount install + safety guide"
            submitLabel="Email me the guide"
          />
        </aside>
      </div>
    </ItcLpShell>
  );
}
