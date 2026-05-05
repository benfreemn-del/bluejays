"use client";

import { useMemo, useState } from "react";

/**
 * SignatureBuilder — Account-tab utility that generates a copy-ready
 * email signature using the owner's brand credentials (founders, role,
 * tagline). Pre-filled with reasonable per-tenant defaults so the owner
 * can ship a stronger signature than the no-credibility default they
 * usually run with.
 *
 * Pure clipboard utility — no DB write. The signature only exists where
 * the owner pastes it.
 */

const PER_SLUG_DEFAULTS: Record<
  string,
  {
    name: string;
    title: string;
    tagline: string;
    site: string;
    socialLine?: string;
  }
> = {
  "zenith-sports": {
    name: "Philip Lund & Paul Hanson",
    title: "Co-founders · Zenith Sports / TEKKY",
    tagline:
      "Former pros · Built TEKKY for the player who refuses to plateau.",
    site: "zenithsports.org",
    socialLine: "Instagram: @zenithsports · Facebook: Zenith Sports",
  },
  "itc-quick-attach": {
    name: "Jake McCall",
    title: "Owner · ITC Quick Attach",
    tagline:
      "American-made tractor accessories. Built in Blossvale, NY since 2014.",
    site: "itcquickattach.com",
  },
  "laser-lakes": {
    name: "Nate",
    title: "Founder · Laser Lakes",
    tagline:
      "Handcrafted Baltic-birch lake maps + wildlife wood art · Made in Minnesota.",
    site: "laserlakes.com",
    socialLine: "Facebook: @laserlakesmn",
  },
};

export default function SignatureBuilder({ slug }: { slug: string }) {
  const defaults = PER_SLUG_DEFAULTS[slug];
  const [name, setName] = useState(defaults?.name ?? "");
  const [title, setTitle] = useState(defaults?.title ?? "");
  const [tagline, setTagline] = useState(defaults?.tagline ?? "");
  const [site, setSite] = useState(defaults?.site ?? "");
  const [socialLine, setSocialLine] = useState(defaults?.socialLine ?? "");
  const [copied, setCopied] = useState(false);

  const signature = useMemo(() => {
    const lines = [
      "—",
      name,
      title,
      tagline,
      site ? `https://${site.replace(/^https?:\/\//, "")}` : "",
      socialLine,
    ].filter(Boolean);
    return lines.join("\n");
  }, [name, title, tagline, site, socialLine]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(signature);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = signature;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  if (!defaults) return null; // Only render for tenants with defined defaults

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-white">
            ✍️ Email signature
          </h3>
          <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
            Pre-filled with your brand credentials. Edit, copy, paste into
            Gmail / Outlook / your email client. Bigger signal in every
            outbound.
          </p>
        </div>
        <button
          type="button"
          onClick={copy}
          className={`text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-md transition-colors ${
            copied
              ? "bg-emerald-500 text-slate-950"
              : "bg-violet-500 hover:bg-violet-400 text-white"
          }`}
        >
          {copied ? "✓ Copied" : "Copy signature"}
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <Input label="Name(s)" value={name} onChange={setName} />
        <Input label="Title / role" value={title} onChange={setTitle} />
        <Input
          label="Tagline · 1 line"
          value={tagline}
          onChange={setTagline}
          full
        />
        <Input label="Website" value={site} onChange={setSite} />
        <Input
          label="Social handles · 1 line"
          value={socialLine}
          onChange={setSocialLine}
          full
        />
      </div>

      <pre className="rounded-lg border border-white/[0.06] bg-black/40 p-3 text-[12px] text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
        {signature}
      </pre>
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  full,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  full?: boolean;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md bg-black/40 border border-white/[0.08] text-sm text-white px-2.5 py-1.5 focus:outline-none focus:border-violet-400/60"
      />
    </label>
  );
}
