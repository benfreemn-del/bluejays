import Link from "next/link";
import PartnerApplyForm from "./PartnerApplyForm";

export const metadata = {
  title: "Apply — BlueJays Partner Program",
  robots: { index: false, follow: false },
};

export default function PartnerApplyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/5">
        <div className="mx-auto max-w-2xl px-6 py-5">
          <Link
            href="/partners"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← Partner program
          </Link>
        </div>
      </header>

      <section>
        <div className="mx-auto max-w-2xl px-6 py-12">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-widest text-amber-300 font-semibold mb-3">
              Partner Application
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
              Apply to be a BlueJays partner
            </h1>
            <p className="text-slate-400">
              60 seconds. Ben reviews every application personally —
              usually approves within 24 hours.
            </p>
          </div>

          <PartnerApplyForm />
        </div>
      </section>
    </main>
  );
}
