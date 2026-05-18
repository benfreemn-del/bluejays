"use client";

import { useEffect, useState } from "react";

import { listOnboardDocs } from "@/lib/onboard-docs";
import {
  getVoicemailKit,
  type VoicemailClip,
  type VoicemailKit,
} from "@/lib/voicemail-scripts";

type SignStatus = {
  doc: string;
  title: string;
  signed: boolean;
  signedBy: string | null;
  signedAt: string | null;
  totalSignatures: number;
};

/**
 * Per-client portal Docs tab — client-facing read-only view.
 *
 * Surfaces everything the owner might need to reference later:
 *   1. 📨 Onboarding PDFs (with sign URL for re-signing if needed)
 *   2. 🎙 Voicemail clip scripts — what to read when recording
 *
 * No credentials, no admin data, no PII. Anything sensitive stays
 * behind the operator dashboard at /dashboard/clients/[slug]/docs.
 *
 * Pattern: see CLAUDE.md "Per-Client Docs + Credentials Pattern" +
 * "Shareable Client Doc Pattern".
 */

type Props = { slug: string };

export default function ClientDocsTab({ slug }: Props) {
  const docs = listOnboardDocs(slug);
  const vmKit = getVoicemailKit(slug);
  const [statusByDoc, setStatusByDoc] = useState<Record<string, SignStatus>>({});
  const [statusLoaded, setStatusLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const r = await fetch(
          `/api/clients/${encodeURIComponent(slug)}/docs/sign-status`,
          { cache: "no-store" },
        );
        const j = (await r.json()) as { ok: boolean; status: SignStatus[] };
        if (!cancelled && j.ok) {
          const map: Record<string, SignStatus> = {};
          for (const s of j.status) map[s.doc] = s;
          setStatusByDoc(map);
        }
      } catch {
        // Network/API error — leave statusByDoc empty so cards render
        // as "Not yet signed" rather than crashing the tab.
      } finally {
        if (!cancelled) setStatusLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const signedCount = Object.values(statusByDoc).filter((s) => s.signed).length;

  return (
    <div className="space-y-10">
      <header>
        <h2 className="text-2xl font-bold text-white">Your docs</h2>
        <p className="text-sm text-slate-300 mt-1 max-w-2xl">
          Everything BlueJays delivered for {slug.replace(/-/g, " ")},
          all in one place. Open any PDF to read or print, or click the
          sign link to fill it out online.
        </p>
        {statusLoaded && docs.length > 0 && (
          <p className="text-sm text-lime-300 mt-2 font-semibold">
            {signedCount === docs.length
              ? `✓ All ${docs.length} docs signed — you're fully onboarded.`
              : `${signedCount} of ${docs.length} signed · ${docs.length - signedCount} still to go`}
          </p>
        )}
      </header>

      {/* ── Onboarding PDFs ── */}
      <section>
        <h3 className="text-lg font-bold text-white mb-1">
          📨 Onboarding packet
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Click any link to open the PDF in a new tab. The sign URL lets
          you fill it out and submit — Ben gets a text + email when you do.
          Once signed, the doc is logged here for your records.
        </p>
        {docs.length === 0 ? (
          <p className="text-sm text-slate-500">
            No onboarding docs registered for this client yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {docs.map((d) => (
              <DocCard
                key={`${d.slug}-${d.doc}`}
                doc={d}
                status={statusByDoc[d.doc]}
                loaded={statusLoaded}
              />
            ))}
          </ul>
        )}
      </section>

      {/* ── Voicemail scripts ── */}
      {vmKit && (
        <section>
          <h3 className="text-lg font-bold text-white mb-1">
            🎙 Voicemail scripts
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Three short clips to record in your own voice (18-24 sec each).
            Read the script as written — these are brand-aligned and
            already tuned to your audience. Open this tab on your phone
            when you sit down to record.
          </p>
          <ul className="space-y-4">
            {vmKit.clips.map((clip) => (
              <VoicemailCard key={clip.id} clip={clip} kit={vmKit} />
            ))}
          </ul>
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] p-3 text-xs text-amber-100">
            <p className="font-semibold mb-1">Recording tips</p>
            <ul className="space-y-1 list-disc list-inside text-amber-100/90">
              <li>Quiet room. Phone speaker face-down on a folded towel.</li>
              <li>Stand up. Voice comes through firmer than sitting.</li>
              <li>Smile on Clip 1 and 2 — it actually changes the tone.</li>
              <li>
                Use Voice Memos (iOS) or Recorder (Android). Send all
                three .m4a files to{" "}
                <span className="font-mono">bluejaycontactme@gmail.com</span>{" "}
                — Ben uploads them to your Twilio account.
              </li>
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}

function DocCard({
  doc,
  status,
  loaded,
}: {
  doc: ReturnType<typeof listOnboardDocs>[number];
  status?: SignStatus;
  loaded: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const signUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/sign/${doc.slug}/${doc.doc}`
      : `/sign/${doc.slug}/${doc.doc}`;
  const isSigned = !!status?.signed;
  // Outer card border tints green when signed so the whole list scans
  // at a glance — Paul + Philip can see what's left to do without
  // reading every card.
  const cardCls = isSigned
    ? "rounded-xl border border-lime-500/40 bg-lime-500/[0.06] p-4"
    : "rounded-xl border border-slate-800 bg-slate-900/40 p-4";
  return (
    <li className={cardCls}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h4 className="font-bold text-white">{doc.title}</h4>
          <p className="text-xs text-slate-400 mt-0.5">{doc.brand}</p>
        </div>
        {loaded && (
          <span
            className={
              isSigned
                ? "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-lime-500/20 text-lime-200 border border-lime-500/40"
                : "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-200 border border-amber-500/40"
            }
          >
            {isSigned ? "✓ Signed" : "Not yet signed"}
          </span>
        )}
      </div>
      {doc.description && (
        <p className="mt-2 text-sm text-slate-200">{doc.description}</p>
      )}
      {isSigned && status?.signedAt && (
        <p className="mt-2 text-xs text-lime-300">
          Signed by <span className="font-semibold">{status.signedBy}</span> on{" "}
          <time>{new Date(status.signedAt).toLocaleString()}</time>
          {status.totalSignatures > 1 && (
            <span className="text-lime-400">
              {" "}
              · {status.totalSignatures} signatures on file
            </span>
          )}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={doc.pdfPath}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-slate-800 text-slate-100 hover:bg-slate-700 transition-colors"
        >
          📄 Open PDF
        </a>
        <a
          href={signUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={
            isSigned
              ? "inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-lime-500/60 bg-lime-500/[0.10] text-lime-200 font-semibold hover:bg-lime-500/[0.18] transition-colors"
              : "inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-lime-500 text-slate-950 font-bold hover:bg-lime-400 transition-colors"
          }
        >
          {isSigned ? "✍ Re-sign" : "✍ Fill & sign online"}
        </a>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(signUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white transition-colors"
        >
          {copied ? "Copied!" : "Copy sign link"}
        </button>
      </div>
    </li>
  );
}

function VoicemailCard({
  clip,
  kit,
}: {
  clip: VoicemailClip;
  kit: VoicemailKit;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <li className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h4 className="font-bold text-white">{clip.title}</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Target length: {clip.targetSeconds} · Recorder: {kit.ownerFirstName}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(clip.script);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="text-xs px-3 py-1.5 rounded-full bg-slate-800 text-slate-100 hover:bg-slate-700 transition-colors whitespace-nowrap"
        >
          {copied ? "Copied!" : "Copy script"}
        </button>
      </div>
      <blockquote className="mt-3 rounded-lg border-l-2 border-lime-500 bg-slate-950/60 px-4 py-3 text-sm leading-relaxed text-slate-100">
        “{clip.script}”
      </blockquote>
      {clip.notes && (
        <p className="mt-2 text-xs text-slate-500 italic">
          {clip.notes}
        </p>
      )}
    </li>
  );
}
