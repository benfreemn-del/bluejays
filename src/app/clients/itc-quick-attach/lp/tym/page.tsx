import { ItcLpShell, LpCaptureForm } from "../../_components/lp-shell";

export const metadata = {
  title: "TYM Owner Accessory Hub · ITC Quick Attach",
  description:
    "Brush guards, toolboxes, and chassis protection sized for TYM T234, T264, T474. Free sticker pack on signup.",
};

/**
 * /clients/itc-quick-attach/lp/tym — TYM brand-owner hub.
 * Highest-leverage segment: ITC's brush-guard category over-represents
 * TYM (multi-model lineup, 28+ reviews on T474). Concrete social proof.
 */
export default function TymHubPage() {
  return (
    <ItcLpShell navTitle="TYM Owner Hub">
      <div className="grid md:grid-cols-[1.2fr_1fr] gap-8 items-start">
        <div>
          <span className="inline-block text-[11px] uppercase tracking-[0.22em] text-amber-300 font-bold mb-3">
            ⚙️ Built for TYM owners
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-[1.05]">
            Sized for your TYM.
            <br />
            <span className="text-amber-300">Not just any tractor.</span>
          </h1>
          <p className="text-amber-50/70 text-lg mb-6">
            We make brush guards, toolboxes, and chassis protection that actually
            fit the TYM T234, T264, and T474. The T474 brush guard already has
            28+ reviews from owners running it daily.
          </p>

          <ul className="space-y-2 text-sm text-amber-50/80 mb-6">
            <li>✅ <span className="font-bold">T474 Brush Guard Insert</span> — $249.99 (28 reviews)</li>
            <li>✅ <span className="font-bold">T234 / T264 Brush Guard</span> — drop-in fit, no drilling</li>
            <li>✅ Universal toolbox + Milwaukee Packout mount — fits any TYM loader</li>
            <li>✅ <span className="font-bold">Free TYM sticker pack</span> with every signup</li>
          </ul>

          <div className="text-[12px] text-amber-50/40 italic mb-2">
            Source: itcquickattach.com brush-guard collection. American-made in
            Blossvale, NY.
          </div>
        </div>

        <aside>
          <h2 className="text-lg font-black mb-2">Get the TYM fit guide</h2>
          <p className="text-sm text-amber-50/60 mb-3">
            Drop your model and we&apos;ll send the exact accessories that fit
            it — plus the sticker pack.
          </p>
          <LpCaptureForm
            audience="tym"
            intent="TYM accessory hub + sticker pack"
            submitLabel="Send my fit guide"
            extraFields={[
              {
                name: "tractor_model",
                label: "Your TYM model",
                placeholder: "T474, T264, T234, T194…",
                required: true,
              },
            ]}
          />
        </aside>
      </div>
    </ItcLpShell>
  );
}
