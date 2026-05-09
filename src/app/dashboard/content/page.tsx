"use client";

import { useEffect, useState } from "react";
import type { ContentBrief } from "@/lib/content-engine/briefs";
import { validateHook } from "@/lib/content-engine/hooks";

/**
 * /dashboard/content — morning content brief.
 *
 * Reads /api/content/brief, presents:
 *   - today's bucket + source data
 *   - 3 hook variants with structure labels
 *   - 4-beat script draft (editable)
 *   - CTA + comment-trigger keyword
 *   - tone guards (collapsible)
 *
 * v1: render-only. No persistence yet — Ben copies the script and
 * records. Phase 2 will save the chosen hook + script to
 * content_briefs and let the render pipeline pull from it.
 */
export default function ContentBriefPage() {
  const [brief, setBrief] = useState<ContentBrief | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chosenHook, setChosenHook] = useState<number | null>(null);
  const [scriptOverride, setScriptOverride] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/content/brief")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.brief) {
          setBrief(d.brief);
          setChosenHook(0);
        } else {
          setError(d.error || "no brief");
        }
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <main className="min-h-screen bg-slate-950 text-slate-300 p-8">loading…</main>;
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-300 p-8">
        <h1 className="text-xl font-bold text-white mb-3">content brief</h1>
        <p className="text-amber-400 text-sm">no brief: {error}</p>
        <p className="text-[12px] text-slate-500 mt-3 max-w-prose">
          most likely cause: no fresh material in any bucket today. fall
          back to the 30-day evergreen bank or post a quote card from
          yesterday&apos;s top comment. see{" "}
          <code className="text-slate-300">.claude/skills/content-engine/SKILL.md</code>{" "}
          → empty-day plan.
        </p>
      </main>
    );
  }

  if (!brief) return null;

  const hook =
    chosenHook != null && brief.hooks[chosenHook] ? brief.hooks[chosenHook] : brief.hooks[0];
  const hookText = scriptOverride.trim() || hook.text;
  const hookIssues = validateHook(hookText);
  const finalScript = renderFinalScript(brief, hookText);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 p-6 sm:p-10 max-w-4xl mx-auto">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            morning brief · {brief.date}
          </h1>
          <BucketChip bucket={brief.bucket} />
        </div>
        <p className="text-[12px] text-slate-500 mt-1.5 max-w-prose">
          source: <span className="text-slate-300 font-mono">{brief.candidate.sourceLabel}</span>{" "}
          · today&apos;s seed:{" "}
          <span className="text-slate-300">{brief.candidate.seed}</span>
        </p>
      </header>

      {/* Hook picker */}
      <section className="mb-7">
        <h2 className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500 mb-2">
          pick a hook (3s discipline · &lt;15 words)
        </h2>
        <div className="space-y-2">
          {brief.hooks.map((h, i) => (
            <button
              key={i}
              onClick={() => {
                setChosenHook(i);
                setScriptOverride("");
              }}
              className={`block w-full text-left p-3 rounded-lg border transition ${
                chosenHook === i
                  ? "border-emerald-500 bg-emerald-950/40"
                  : "border-slate-800 bg-slate-900/40 hover:border-slate-600"
              }`}
            >
              <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-slate-500 mb-1">
                {h.structure.replace("_", " · ")}
              </div>
              <div className="text-sm text-white font-medium">{h.text}</div>
              <div className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                {h.rationale}
              </div>
            </button>
          ))}
        </div>
        <div className="mt-3">
          <label className="block text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500 mb-1.5">
            or write your own
          </label>
          <textarea
            value={scriptOverride}
            onChange={(e) => setScriptOverride(e.target.value)}
            rows={2}
            placeholder={hook.text}
            className="w-full p-2.5 rounded-md bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-600"
          />
          {hookIssues.length > 0 && (
            <ul className="text-[11px] text-amber-400 mt-2 space-y-0.5">
              {hookIssues.map((issue, i) => (
                <li key={i}>· {issue}</li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Script preview */}
      <section className="mb-7">
        <h2 className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500 mb-2">
          script (30s · 4-beat)
        </h2>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-slate-100">
          {finalScript}
        </div>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(finalScript);
          }}
          className="mt-2.5 text-[11px] font-bold px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white"
        >
          copy script
        </button>
      </section>

      {/* B-roll cues */}
      <section className="mb-7">
        <h2 className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500 mb-2">
          b-roll cues + recommended surfaces
        </h2>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 space-y-4">
          {brief.scriptDraft.bRollCues.map((c, i) => (
            <div key={i} className="space-y-1.5">
              <div className="text-[12px] text-slate-300">
                <span className="font-mono text-emerald-400">@{c.atSecond}s</span>{" "}
                <span className="text-slate-500">·</span>{" "}
                <span className="font-bold text-white">{c.assetTag}</span>{" "}
                <span className="text-slate-500">— {c.note}</span>
              </div>
              {c.recommendations.length > 0 ? (
                <ul className="ml-4 space-y-1">
                  {c.recommendations.map((a) => (
                    <li key={a.id} className="text-[11px]">
                      <a
                        href={a.url.startsWith("/") ? a.url : a.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-blue-400 hover:text-blue-300"
                      >
                        {a.url}
                      </a>{" "}
                      <span className="text-slate-500">— {a.label}</span>{" "}
                      <span className="text-[10px] uppercase tracking-[0.18em] text-slate-600">
                        {a.captureMode}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="ml-4 text-[11px] text-amber-500">
                  no manifest match — add the surface to{" "}
                  <code className="text-amber-400">src/lib/content-engine/assets.ts</code>
                </p>
              )}
            </div>
          ))}
          <p className="text-[11px] text-slate-500 leading-relaxed pt-2 border-t border-slate-800">
            screen-record the linked surface (capcut · quicktime · OBS) at
            1080×1920 vertical. phase-3 cron will auto-render these.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="mb-7">
        <h2 className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500 mb-2">
          CTA · keyword: <span className="text-emerald-400 font-mono">{brief.ctaKeyword}</span>
        </h2>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 space-y-2 text-[13px] text-slate-200">
          <div>
            <span className="text-[10px] tracking-[0.18em] uppercase text-slate-500 font-bold">video</span>
            <div>{brief.cta.videoLine}</div>
          </div>
          <div>
            <span className="text-[10px] tracking-[0.18em] uppercase text-slate-500 font-bold">caption</span>
            <div>{brief.cta.captionLine}</div>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed mt-2 pt-2 border-t border-slate-800">
            {brief.cta.rationale}
          </p>
        </div>
      </section>

      {/* Tone guards */}
      <section className="mb-7">
        <h2 className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500 mb-2">
          tone guards · keep these in mind
        </h2>
        <ul className="text-[12px] text-slate-400 space-y-1 leading-relaxed">
          {brief.toneGuards.map((g, i) => (
            <li key={i}>· {g}</li>
          ))}
        </ul>
      </section>

      <footer className="text-[11px] text-slate-600 leading-relaxed border-t border-slate-900 pt-4">
        v1 brief · canonical reference:{" "}
        <code className="text-slate-500">.claude/skills/content-engine/SKILL.md</code>
      </footer>
    </main>
  );
}

function BucketChip({ bucket }: { bucket: string }) {
  const palette: Record<string, string> = {
    prospect_questions: "bg-blue-900/40 border-blue-600 text-blue-200",
    client_outcomes: "bg-emerald-900/40 border-emerald-600 text-emerald-200",
    build_in_public: "bg-amber-900/40 border-amber-600 text-amber-200",
    hot_takes: "bg-rose-900/40 border-rose-600 text-rose-200",
    ship_log: "bg-violet-900/40 border-violet-600 text-violet-200",
  };
  return (
    <span
      className={`text-[10px] font-bold tracking-[0.18em] uppercase px-2.5 py-1 rounded-full border ${
        palette[bucket] ?? "bg-slate-800 border-slate-700 text-slate-300"
      }`}
    >
      {bucket.replace("_", " ")}
    </span>
  );
}

function renderFinalScript(brief: ContentBrief, hookOverride?: string) {
  const s = brief.scriptDraft;
  return [
    `[0-3s · HOOK]`,
    hookOverride || s.hookSeconds,
    ``,
    `[3-8s · PROMISE]`,
    s.promiseSeconds,
    ``,
    `[8-22s · PROOF]`,
    s.proofSeconds,
    ``,
    `[22-30s · CTA]`,
    s.ctaSeconds,
  ].join("\n");
}
