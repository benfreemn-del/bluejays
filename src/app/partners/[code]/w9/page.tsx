import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import W9UploadForm from "./W9UploadForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Upload your W-9 — BlueJays Partner",
  robots: { index: false, follow: false },
};

/**
 * /partners/[code]/w9 — partner-facing W-9 upload.
 *
 * URL-as-secret. Same auth pattern as /partners/[code] dashboard: the
 * code IS the credential. We render the existing-W-9 status (so a
 * partner can see "we already have yours") plus an upload form that
 * also lets them re-submit a corrected version.
 */
export default async function PartnerW9Page({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  if (!isSupabaseConfigured()) notFound();

  const { data: partnerRow } = await supabase
    .from("partners")
    .select("id, name, code, w9_received_at")
    .eq("code", code.toLowerCase())
    .maybeSingle();
  if (!partnerRow) notFound();
  const partner = partnerRow as {
    id: string;
    name: string;
    code: string;
    w9_received_at: string | null;
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/5">
        <div className="mx-auto max-w-2xl px-6 py-5">
          <Link
            href={`/partners/${partner.code}`}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← Partner dashboard
          </Link>
        </div>
      </header>

      <section>
        <div className="mx-auto max-w-2xl px-6 py-12">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-widest text-amber-300 font-semibold mb-3">
              Tax form on file
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
              Upload your W-9, {partner.name.split(" ")[0]}
            </h1>
            <p className="text-slate-400 max-w-lg mx-auto leading-relaxed">
              The IRS requires a W-9 on file before BlueJays can pay you
              more than $600 in a calendar year. We can&apos;t release
              your first commission until this is uploaded.
            </p>
          </div>

          {partner.w9_received_at && (
            <div className="mb-8 rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-5 text-sm text-emerald-200">
              <p className="font-bold">✅ W-9 already on file</p>
              <p className="text-emerald-300/80 mt-1">
                Received{" "}
                {new Date(partner.w9_received_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                . You&apos;re all set — re-upload below only if you need
                to correct something (TIN typo, name change, etc.).
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 mb-6">
            <h2 className="text-base font-bold text-white mb-3">
              Don&apos;t have a W-9 yet?
            </h2>
            <ol className="text-sm text-slate-300 space-y-2 list-decimal list-inside">
              <li>
                Download a blank W-9 from the IRS:{" "}
                <a
                  href="https://www.irs.gov/pub/irs-pdf/fw9.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-300 underline hover:text-amber-200"
                >
                  irs.gov/pub/irs-pdf/fw9.pdf
                </a>
              </li>
              <li>
                Fill it in. Use your legal name + SSN (or EIN if you
                have a business). Sign it.
              </li>
              <li>Save as PDF. Upload below.</li>
            </ol>
            <p className="text-xs text-slate-500 mt-3">
              We never email your W-9 to anyone. It&apos;s stored
              encrypted in our database and only Ben can access it for
              1099 filing.
            </p>
          </div>

          <W9UploadForm code={partner.code} />
        </div>
      </section>
    </main>
  );
}
