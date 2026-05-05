import { ItcLpShell, LpCaptureForm } from "../../_components/lp-shell";

export const metadata = {
  title: "Tractor + Chainsaw Setup for Clearing Jobs · ITC Quick Attach",
  description:
    "SawBoss chainsaw carrier ($180) + Chainbox setup. The combo our pro foresters run.",
};

export default function ForesterPage() {
  return (
    <ItcLpShell navTitle="Forester / Firewood">
      <div className="grid md:grid-cols-[1.2fr_1fr] gap-8 items-start">
        <div>
          <span className="inline-block text-[11px] uppercase tracking-[0.22em] text-amber-300 font-bold mb-3">
            🌲 Pro foresters & firewood crews
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-[1.05]">
            The chainsaw carrier setup our pros run.
          </h1>
          <p className="text-amber-50/70 text-lg mb-6">
            ITC&rsquo;s SawBoss is built for &ldquo;the hobby user as well as
            the professional forester&rdquo; — direct quote from the product
            page. American steel, HDPE base, top-quality fasteners. $180.
          </p>

          <ul className="space-y-2 text-sm text-amber-50/80 mb-6">
            <li>🔧 <span className="font-bold">SawBoss carrier</span> — $180. Holds any 16&Prime;–24&Prime; bar.</li>
            <li>🔧 <span className="font-bold">Chainbox add-on</span> — keeps spare chain, bar oil, and wedges with the saw.</li>
            <li>🔧 Bulk discount available (contact for &gt;5 units).</li>
            <li>🔧 Mounts on TYM, Kioti, Mahindra, Branson loader frames out of the box.</li>
          </ul>

          <p className="text-[12px] text-amber-50/40 italic">
            Source: itcquickattach.com SawBoss product page + brush-guard fit
            list. American-made in Blossvale, NY.
          </p>
        </div>

        <aside>
          <h2 className="text-lg font-black mb-2">Get the 1-acre clearing gear list</h2>
          <p className="text-sm text-amber-50/60 mb-3">
            5-min video walkthrough + PDF gear list of exactly what mounts on
            your tractor for a productive clearing day.
          </p>
          <LpCaptureForm
            audience="forester"
            intent="Tractor + chainsaw clearing gear list"
            submitLabel="Send the gear list"
            extraFields={[
              {
                name: "acreage",
                label: "Acreage you're clearing",
                type: "text",
                placeholder: "1, 5, 50, ongoing…",
              },
            ]}
          />
        </aside>
      </div>
    </ItcLpShell>
  );
}
