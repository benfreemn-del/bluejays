"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ITC_SCRIPTS,
  ITC_SCRIPT_ORDER,
  ITC_HORMOZI_TIPS,
  fillItcVars,
  type ItcAudienceId,
  type ItcScriptVars,
} from "@/lib/itc-partners-script";

/**
 * /clients/itc-quick-attach/partners/script
 *
 * Audience-pickable script viewer for ITC's sales team. Renders a tab
 * row across the 6 verified ITC audiences (dealer/tym/forester/hunter/
 * hobbyist/community) and shows the matching script — intro, qualify,
 * pitch, CTA, voicemail, plus branched objection handlers — with live
 * variable substitution so reps can fill in the prospect's name, biz,
 * tractor brand, etc.
 */
export default function ItcScriptViewerPage() {
  const [audience, setAudience] = useState<ItcAudienceId>("dealer");
  const [vars, setVars] = useState<ItcScriptVars>({
    callerFirstName: "Jake",
    firstName: "",
    bizName: "",
    tractorBrand: "",
    acreage: "",
    city: "",
    state: "",
    configUrl: "itcquickattach.com/build",
  });

  const script = ITC_SCRIPTS[audience];

  const fill = useMemo(
    () => (line: string) => fillItcVars(line, vars),
    [vars],
  );

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-amber-500/10 bg-[#0a0a0a]/95 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <Link
            href="/clients/itc-quick-attach/partners"
            className="text-sm text-amber-300/70 hover:text-amber-200 transition-colors"
          >
            ← Partner program
          </Link>
          <h1 className="text-sm font-semibold text-amber-100">
            ITC Sales Script Library · 6 audiences
          </h1>
          <Link
            href="/clients/itc-quick-attach/portal"
            className="text-sm text-amber-300/70 hover:text-amber-200 transition-colors"
          >
            Portal →
          </Link>
        </div>
      </header>

      {/* Audience picker */}
      <section className="border-b border-amber-500/10 bg-[#101010]">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <p className="text-xs uppercase tracking-widest text-amber-300/80 font-semibold mb-3">
            Pick the customer you&apos;re calling
          </p>
          <div className="flex flex-wrap gap-2">
            {ITC_SCRIPT_ORDER.map((id) => {
              const s = ITC_SCRIPTS[id];
              const active = id === audience;
              return (
                <button
                  type="button"
                  key={id}
                  onClick={() => setAudience(id)}
                  className={`rounded-md px-3 py-2 text-sm font-semibold border transition-colors ${
                    active
                      ? "border-amber-400 bg-amber-500 text-amber-950"
                      : "border-amber-500/20 bg-[#1a1a1a] text-amber-100/80 hover:border-amber-500/50 hover:text-amber-100"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            <span className="text-amber-200 font-semibold">{script.label}</span>
            {" — "}
            {script.whoTheyAre}
          </p>
        </div>
      </section>

      {/* Variable inputs */}
      <section className="border-b border-amber-500/10">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <p className="text-xs uppercase tracking-widest text-amber-300/60 font-semibold mb-3">
            Fill in what you know · the script auto-updates
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <VarInput
              label="You (caller)"
              value={vars.callerFirstName}
              onChange={(v) => setVars((p) => ({ ...p, callerFirstName: v }))}
            />
            <VarInput
              label="Their first name"
              value={vars.firstName ?? ""}
              onChange={(v) => setVars((p) => ({ ...p, firstName: v }))}
            />
            <VarInput
              label="Business name"
              value={vars.bizName ?? ""}
              onChange={(v) => setVars((p) => ({ ...p, bizName: v }))}
              hide={audience !== "dealer"}
            />
            <VarInput
              label="Tractor brand"
              value={vars.tractorBrand ?? ""}
              placeholder="TYM, Kioti…"
              onChange={(v) => setVars((p) => ({ ...p, tractorBrand: v }))}
              hide={audience === "dealer" || audience === "community"}
            />
            <VarInput
              label="Acreage"
              value={vars.acreage ?? ""}
              placeholder="e.g. 12 ac"
              onChange={(v) => setVars((p) => ({ ...p, acreage: v }))}
              hide={audience !== "forester" && audience !== "hobbyist"}
            />
            <VarInput
              label="City"
              value={vars.city ?? ""}
              onChange={(v) => setVars((p) => ({ ...p, city: v }))}
            />
            <VarInput
              label="State"
              value={vars.state ?? ""}
              onChange={(v) => setVars((p) => ({ ...p, state: v }))}
            />
          </div>
        </div>
      </section>

      {/* Script body */}
      <section className="mx-auto max-w-5xl px-6 py-8 grid lg:grid-cols-[1fr,300px] gap-8">
        <div className="space-y-6">
          <ScriptBlock
            tone="intro"
            title={script.intro.title}
            goal={script.intro.goal}
            lines={script.intro.lines.map(fill)}
            callerNotes={script.intro.callerNotes}
          />
          <ScriptBlock
            tone="qualify"
            title={script.qualify.title}
            goal={script.qualify.goal}
            lines={script.qualify.lines.map(fill)}
            callerNotes={script.qualify.callerNotes}
          />
          <ScriptBlock
            tone="pitch"
            title={script.pitch.title}
            goal={script.pitch.goal}
            lines={script.pitch.lines.map(fill)}
            callerNotes={script.pitch.callerNotes}
          />
          <ScriptBlock
            tone="cta"
            title={script.cta.title}
            goal={script.cta.goal}
            lines={script.cta.lines.map(fill)}
            callerNotes={script.cta.callerNotes}
          />
          <ScriptBlock
            tone="voicemail"
            title={script.voicemail.title}
            lines={script.voicemail.lines.map(fill)}
          />

          {/* Objections */}
          <div className="rounded-2xl border border-rose-500/20 bg-rose-950/15 p-5">
            <p className="text-xs uppercase tracking-widest text-rose-300 font-semibold mb-3">
              Objection handling
            </p>
            <div className="space-y-4">
              {script.objections.map((o, i) => (
                <div key={i} className="border-l-2 border-rose-400/40 pl-4">
                  <p className="text-rose-200 text-sm font-bold italic mb-2">
                    &quot;{o.trigger}&quot;
                  </p>
                  {o.reply.map((line, j) => (
                    <p
                      key={j}
                      className="text-slate-200 leading-relaxed mb-1.5 last:mb-0"
                    >
                      {fill(line)}
                    </p>
                  ))}
                  {o.ifDoubleDown && (
                    <p className="text-xs text-rose-300/70 mt-2 italic">
                      If they double down: {fill(o.ifDoubleDown)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tips sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-950/10 p-5">
            <p className="text-xs uppercase tracking-widest text-amber-300 font-semibold mb-3">
              ITC dial tips
            </p>
            <ul className="space-y-2.5 text-sm text-slate-200 leading-relaxed">
              {ITC_HORMOZI_TIPS.map((tip, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-amber-400 shrink-0">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-5">
            <p className="text-xs uppercase tracking-widest text-emerald-300 font-semibold mb-2">
              Payout structure
            </p>
            <ul className="space-y-1.5 text-sm text-slate-200">
              <li>
                <span className="text-emerald-300 font-bold">$50</span> · retail
                close
              </li>
              <li>
                <span className="text-emerald-300 font-bold">$250</span> ·
                dealer signed
              </li>
              <li className="text-xs text-slate-400 pt-1">
                Paid Venmo/Zelle in 7 days
              </li>
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}

function ScriptBlock({
  tone,
  title,
  goal,
  lines,
  callerNotes,
}: {
  tone: "intro" | "qualify" | "pitch" | "cta" | "voicemail";
  title: string;
  goal?: string;
  lines: string[];
  callerNotes?: string[];
}) {
  const palette: Record<
    typeof tone,
    { border: string; bg: string; chip: string; chipBg: string }
  > = {
    intro: {
      border: "border-sky-500/25",
      bg: "bg-sky-950/15",
      chip: "text-sky-300",
      chipBg: "bg-sky-500/10",
    },
    qualify: {
      border: "border-violet-500/25",
      bg: "bg-violet-950/15",
      chip: "text-violet-300",
      chipBg: "bg-violet-500/10",
    },
    pitch: {
      border: "border-amber-500/25",
      bg: "bg-amber-950/15",
      chip: "text-amber-300",
      chipBg: "bg-amber-500/10",
    },
    cta: {
      border: "border-emerald-500/25",
      bg: "bg-emerald-950/15",
      chip: "text-emerald-300",
      chipBg: "bg-emerald-500/10",
    },
    voicemail: {
      border: "border-slate-500/25",
      bg: "bg-slate-900/40",
      chip: "text-slate-300",
      chipBg: "bg-slate-500/10",
    },
  };
  const c = palette[tone];

  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} p-5`}>
      <div className="flex items-baseline gap-3 mb-3">
        <span
          className={`text-[10px] uppercase tracking-widest ${c.chip} ${c.chipBg} font-bold rounded-full px-2 py-0.5`}
        >
          {tone}
        </span>
        <h3 className="font-bold text-white text-base">{title}</h3>
      </div>
      {goal && (
        <p className="text-xs text-slate-400 italic mb-3">Goal: {goal}</p>
      )}
      <div className="space-y-2.5">
        {lines.map((line, i) => (
          <p
            key={i}
            className="text-slate-100 leading-relaxed text-[15px]"
          >
            {line}
          </p>
        ))}
      </div>
      {callerNotes && callerNotes.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/5">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1.5">
            Caller notes
          </p>
          <ul className="space-y-1 text-xs text-slate-400">
            {callerNotes.map((n, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="text-slate-600">↳</span>
                <span className="leading-relaxed">{n}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function VarInput({
  label,
  value,
  onChange,
  placeholder,
  hide,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hide?: boolean;
}) {
  if (hide) return null;
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-amber-500/15 bg-[#0a0a0a] px-2.5 py-1.5 text-sm text-white placeholder:text-slate-600 focus:border-amber-400/60 focus:outline-none"
      />
    </label>
  );
}
