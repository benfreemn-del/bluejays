import { ItcLpShell, LpCaptureForm } from "../../_components/lp-shell";

export const metadata = {
  title: "Submit Your Build · ITC Quick Attach",
  description:
    "Submit a photo of your ITC-equipped tractor. Monthly winner gets a free product.",
};

export default function CommunityPage() {
  return (
    <ItcLpShell navTitle="Real Operators">
      <div className="grid md:grid-cols-[1.2fr_1fr] gap-8 items-start">
        <div>
          <span className="inline-block text-[11px] uppercase tracking-[0.22em] text-amber-300 font-bold mb-3">
            🏆 Operator of the Month
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-[1.05]">
            Show us your build.
            <br />
            <span className="text-amber-300">One winner per month.</span>
          </h1>
          <p className="text-amber-50/70 text-lg mb-6">
            Our newsletter picks one ITC-equipped tractor every month and ships
            the owner a free product. Last month: Jeremy&rsquo;s TYM T264 with
            the toolbox + SawBoss + brush guard combo.
          </p>

          <div className="rounded-xl border border-amber-900/40 bg-amber-950/[0.15] p-4 mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-300/70 font-bold mb-2">
              How it works
            </p>
            <ol className="text-sm text-amber-50/80 space-y-1.5 list-decimal list-inside marker:text-amber-300">
              <li>Snap front + side + your favorite mod (3 photos)</li>
              <li>Submit via the form (or email + your tractor model)</li>
              <li>We pick the winner the first Monday of each month</li>
              <li>Newsletter goes out featuring the winner. Free swag ships.</li>
            </ol>
          </div>

          <p className="text-[12px] text-amber-50/40 italic">
            Source: itcquickattach.com homepage testimonials section. ITC
            prioritizes new product design based on community feedback.
          </p>
        </div>

        <aside>
          <h2 className="text-lg font-black mb-2">Submit your build</h2>
          <p className="text-sm text-amber-50/60 mb-3">
            We&rsquo;ll email you for the photos after you sign up. No file
            uploads here — keep it simple.
          </p>
          <LpCaptureForm
            audience="community"
            intent="Submit your build — operator of the month"
            submitLabel="Enter the contest"
            extraFields={[
              {
                name: "tractor_model",
                label: "Tractor make + model",
                placeholder: "TYM T264, Kioti CK2610…",
                required: true,
              },
              {
                name: "favorite_mod",
                label: "Your favorite mod",
                placeholder: "SawBoss, brush guard, toolbox…",
              },
            ]}
          />
        </aside>
      </div>
    </ItcLpShell>
  );
}
