"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type {
  CallScript,
  CallTip,
  ScriptSection,
  ObjectionBranch,
} from "@/lib/partners-script";

/**
 * Client wrapper for /dashboard/script — handles queue navigation,
 * keyboard shortcuts, and section expansion. The heavy script-fill
 * work happens server-side; this only paints + navigates.
 *
 * Keyboard:
 *   ← / →     prev / next prospect in queue
 *   1–7       jump to script section by number
 *   esc       back to /dashboard
 */

type Prospect = {
  id: string;
  businessName: string;
  ownerName: string | null;
  phone: string | null;
  email: string | null;
  city: string;
  state: string;
  category: string;
  currentWebsite: string | null;
  previewUrl: string;
  leadDetailUrl: string;
  /**
   * Latest completed audit for this prospect. null when there is no
   * audit yet — the call workspace hides the audit pill in that case.
   * The score is the overallScore from audit_content; null if the
   * audit was generated before scoring was added.
   */
  latestAudit: { id: string; score: number | null; url: string } | null;
};

type Links = {
  previewUrl: string;
  auditUrl: string;
  scheduleUrl: string;
};

type Props = {
  ids: string[];
  index: number;
  prospect: Prospect;
  script: CallScript;
  tips: CallTip[];
  mantra: string;
  links: Links;
};

const SECTION_ORDER: Array<{
  key: keyof CallScript;
  label: string;
}> = [
  { key: "intro", label: "1. Intro" },
  { key: "qualify", label: "2. Qualify" },
  { key: "pitch", label: "3. Pitch" },
  { key: "bookTheCall", label: "4. Book the call" },
  { key: "textTheLink", label: "5. Text the link" },
  { key: "callbackClose", label: "6. Callback close" },
  { key: "voicemail", label: "7. Voicemail" },
];

export default function ScriptQueueClient({
  ids,
  index,
  prospect,
  script,
  tips,
  mantra,
  links,
}: Props) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<keyof CallScript>("intro");

  // Build URLs for prev/next
  const baseQS = `ids=${encodeURIComponent(ids.join(","))}`;
  const prevHref = index > 0 ? `/dashboard/script?${baseQS}&i=${index - 1}` : null;
  const nextHref = index < ids.length - 1 ? `/dashboard/script?${baseQS}&i=${index + 1}` : null;

  // Keyboard nav
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ignore when typing in inputs
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;

      if (e.key === "ArrowRight" && nextHref) {
        e.preventDefault();
        router.push(nextHref);
      } else if (e.key === "ArrowLeft" && prevHref) {
        e.preventDefault();
        router.push(prevHref);
      } else if (e.key === "Escape") {
        e.preventDefault();
        router.push("/dashboard");
      } else if (/^[1-7]$/.test(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        const target = SECTION_ORDER[idx];
        if (target) setActiveSection(target.key);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, nextHref, prevHref]);

  const currentSection = script[activeSection] as ScriptSection;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Sticky top bar — queue + nav */}
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white whitespace-nowrap">
              ← Dashboard
            </Link>
            <span className="text-slate-700">/</span>
            <span className="text-sm text-slate-300">Call Script</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 whitespace-nowrap">
              {index + 1} of {ids.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {prevHref ? (
              <Link
                href={prevHref}
                className="text-sm px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 transition-colors"
              >
                ← Prev
              </Link>
            ) : (
              <span className="text-sm px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.05] text-slate-600">
                ← Prev
              </span>
            )}
            {nextHref ? (
              <Link
                href={nextHref}
                className="text-sm px-3 py-1.5 rounded-lg bg-violet-500/20 border border-violet-500/40 text-violet-200 hover:bg-violet-500/30 transition-colors"
              >
                Next →
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="text-sm px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/30 transition-colors"
              >
                ✓ Done
              </Link>
            )}
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 bg-white/[0.04]">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300"
            style={{ width: `${((index + 1) / ids.length) * 100}%` }}
          />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Left rail — prospect info + section nav */}
        <aside className="space-y-4">
          {/* Prospect card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="font-bold text-lg text-white mb-1 leading-tight">
              {prospect.businessName}
            </h2>
            <p className="text-xs text-slate-400 mb-3">
              {prospect.category.replace(/-/g, " ")} · {prospect.city}, {prospect.state}
            </p>

            <div className="space-y-1.5 text-sm">
              {prospect.ownerName && (
                <Row label="Owner" value={prospect.ownerName} />
              )}
              {prospect.phone && (
                <Row
                  label="Phone"
                  value={
                    <a
                      href={`tel:${prospect.phone}`}
                      className="text-emerald-400 hover:text-emerald-300 font-mono text-base"
                    >
                      {prospect.phone}
                    </a>
                  }
                />
              )}
              {prospect.email && (
                <Row
                  label="Email"
                  value={
                    <a href={`mailto:${prospect.email}`} className="text-sky-400 hover:text-sky-300 truncate inline-block max-w-[180px]">
                      {prospect.email}
                    </a>
                  }
                />
              )}
              {prospect.currentWebsite && (
                <Row
                  label="Site"
                  value={
                    <a
                      href={prospect.currentWebsite.startsWith("http") ? prospect.currentWebsite : `https://${prospect.currentWebsite}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:text-amber-300 truncate inline-block max-w-[180px]"
                    >
                      ↗ {prospect.currentWebsite.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </a>
                  }
                />
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2">
              <a
                href={prospect.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-2.5 py-1 rounded-lg bg-blue-electric/10 text-blue-electric hover:bg-blue-electric/20"
              >
                Preview Site ↗
              </a>
              <Link
                href={prospect.leadDetailUrl}
                className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10"
              >
                Full lead ↗
              </Link>
              {/* Audit pill — server-side fetched. Color-coded so Ben
                  can read the prospect's score at a glance during a
                  call ("you scored a 47, we'd fix that...") and click
                  through to the full audit if they want details. */}
              {prospect.latestAudit && (
                <a
                  href={prospect.latestAudit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-xs px-2.5 py-1 rounded-lg border ${
                    prospect.latestAudit.score === null
                      ? "bg-slate-500/10 text-slate-300 border-slate-500/30 hover:bg-slate-500/20"
                      : prospect.latestAudit.score >= 80
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
                        : prospect.latestAudit.score >= 50
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                          : "bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20"
                  }`}
                  title="Latest completed site audit"
                >
                  📋 Audit
                  {prospect.latestAudit.score !== null
                    ? ` ${prospect.latestAudit.score}/100`
                    : ""}{" "}
                  ↗
                </a>
              )}
            </div>
          </div>

          {/* Section nav */}
          <nav className="rounded-2xl border border-white/10 bg-white/[0.03] p-2">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 px-2 pt-2 pb-1 font-bold">
              Script section
            </p>
            {SECTION_ORDER.map((s) => {
              const isActive = activeSection === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setActiveSection(s.key)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-violet-500/20 text-violet-200 font-semibold"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </nav>

          {/* Quick links */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 space-y-2">
            <a
              href={links.scheduleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs px-3 py-2 rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 font-semibold"
            >
              📅 Send my calendar →
            </a>
            <a
              href={links.auditUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs px-3 py-2 rounded-lg bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 font-semibold"
            >
              📋 Free audit link →
            </a>
          </div>

          {/* Mantra */}
          <p className="text-xs text-slate-500 italic px-2 leading-relaxed">{mantra}</p>

          <p className="text-[10px] text-slate-600 px-2">
            Tips: ← → to navigate · 1–7 to jump sections · Esc to exit
          </p>
        </aside>

        {/* Main script panel */}
        <section>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-xl font-bold">{currentSection.title}</h2>
              {currentSection.goal && (
                <span className="text-xs text-violet-400">Goal: {currentSection.goal}</span>
              )}
            </div>

            <div className="space-y-3">
              {currentSection.lines.map((line, i) => (
                <p key={i} className="text-base text-slate-200 leading-relaxed">
                  {line}
                </p>
              ))}
            </div>

            {currentSection.callerNotes && currentSection.callerNotes.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-amber-400 font-bold mb-2">
                  Caller notes
                </p>
                <ul className="space-y-1.5">
                  {currentSection.callerNotes.map((note, i) => (
                    <li key={i} className="text-sm text-slate-400 leading-relaxed">
                      • {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Objections — shown below current section, always */}
          <details className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden group">
            <summary className="cursor-pointer p-5 list-none flex items-center justify-between hover:bg-white/[0.03]">
              <span className="font-semibold text-sm">
                ⚠️ Objection responses ({script.objections.length})
              </span>
              <span className="text-slate-500 text-xs group-open:hidden">expand ▾</span>
              <span className="text-slate-500 text-xs hidden group-open:inline">collapse ▴</span>
            </summary>
            <div className="px-5 pb-5 space-y-4">
              {script.objections.map((o: ObjectionBranch) => (
                <div key={o.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <p className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">
                    They say: {o.trigger}
                  </p>
                  <ul className="space-y-1.5">
                    {o.response.map((line, i) => (
                      <li key={i} className="text-sm text-slate-300 leading-relaxed">
                        {line}
                      </li>
                    ))}
                  </ul>
                  {o.callerNotes && (
                    <p className="text-xs text-amber-400/80 mt-2 italic">→ {o.callerNotes}</p>
                  )}
                </div>
              ))}
            </div>
          </details>

          {/* Tips at the bottom */}
          <details className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden group">
            <summary className="cursor-pointer p-5 list-none flex items-center justify-between hover:bg-white/[0.03]">
              <span className="font-semibold text-sm">
                💡 Pre-call tips ({tips.length})
              </span>
              <span className="text-slate-500 text-xs group-open:hidden">expand ▾</span>
              <span className="text-slate-500 text-xs hidden group-open:inline">collapse ▴</span>
            </summary>
            <div className="px-5 pb-5 space-y-3">
              {tips.map((t) => (
                <div key={t.id} className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">{t.emoji}</span>
                  <div>
                    <p className="font-semibold text-sm">{t.title}</p>
                    <p className="text-sm text-slate-400 leading-relaxed">{t.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </details>
        </section>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}
