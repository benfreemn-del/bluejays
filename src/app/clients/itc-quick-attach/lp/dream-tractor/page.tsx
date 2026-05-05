"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ItcLpShell } from "../../_components/lp-shell";
import { TractorVisual } from "./tractor-visual";

/**
 * /clients/itc-quick-attach/lp/dream-tractor — single-page tractor
 * configurator. Live SVG tractor on the right; toggle/slider grid on
 * the left. Each toggle = one real ITC product (verified prices from
 * itcquickattach.com). Total updates in real time. One submit at the
 * bottom captures the lead + fires Jake's instant alert.
 */

type Brand =
  | "tym"
  | "kioti"
  | "mahindra"
  | "branson"
  | "kubota"
  | "deere"
  | "other"
  | "shopping";

type AccessoryId =
  | "brush-guard"
  | "sawboss"
  | "toolbox"
  | "milwaukee-packout"
  | "light-kit"
  | "tractor-steps"
  | "firearm-mount"
  | "string-trimmer"
  | "fire-extinguisher"
  | "chainbox"
  | "gas-oil-carrier"
  | "rops-mount"
  | "loader-mount";

type Use = "landscaping" | "firewood" | "hunting" | "farm" | "commercial";

const BRANDS: Array<{ id: Brand; label: string; supported: boolean }> = [
  { id: "tym", label: "TYM", supported: true },
  { id: "kioti", label: "Kioti", supported: true },
  { id: "mahindra", label: "Mahindra", supported: true },
  { id: "branson", label: "Branson", supported: true },
  { id: "kubota", label: "Kubota", supported: false },
  { id: "deere", label: "John Deere", supported: false },
  { id: "other", label: "Other", supported: false },
  { id: "shopping", label: "Still shopping", supported: false },
];

const USES: Array<{ id: Use; label: string; emoji: string }> = [
  { id: "landscaping", label: "Landscaping", emoji: "🌱" },
  { id: "firewood", label: "Firewood", emoji: "🪓" },
  { id: "hunting", label: "Hunting", emoji: "🦌" },
  { id: "farm", label: "Farm", emoji: "🌾" },
  { id: "commercial", label: "Commercial", emoji: "🏗️" },
];

/**
 * Verified ITC product catalog — every accessory the quiz can recommend.
 * Prices are exact, sourced from itcquickattach.com (May 2026).
 */
const ACCESSORIES: Array<{
  id: AccessoryId;
  name: string;
  shortName: string;
  emoji: string;
  priceUsd: number;
  pitch: string;
  /** Tag the accessory with categories so we can suggest it based on
   * use case + brand instead of forcing the user to know what they need. */
  whenToSuggest: { use?: Use[]; brand?: Brand[]; default?: boolean };
  /** Special note shown when applicable (e.g., 28+ reviews social proof). */
  note?: string;
}> = [
  {
    id: "brush-guard",
    name: "Brush guard",
    shortName: "Brush guard",
    emoji: "🛡️",
    priceUsd: 249.99,
    pitch: "Saves a $1,500 grille from the first low branch. Brand-fit kit.",
    whenToSuggest: { use: ["landscaping", "hunting", "firewood", "farm"], brand: ["tym", "kioti", "mahindra", "branson"] },
    note: "28+ reviews on T474 fit",
  },
  {
    id: "sawboss",
    name: "SawBoss chainsaw carrier",
    shortName: "SawBoss",
    emoji: "🪚",
    priceUsd: 180,
    pitch: "Lifetime warranty. Holds any 16–24\" bar. Chain stays put.",
    whenToSuggest: { use: ["firewood", "landscaping", "farm"] },
  },
  {
    id: "toolbox",
    name: "Universal Tractor Toolbox",
    shortName: "Toolbox",
    emoji: "🧰",
    priceUsd: 125,
    pitch: "No more rattling tools. Tool sets stay on the tractor.",
    whenToSuggest: { default: true },
  },
  {
    id: "milwaukee-packout",
    name: "Milwaukee Packout Mount",
    shortName: "M18 Packout",
    emoji: "🟥",
    priceUsd: 100,
    pitch: "If you already run M18 Packout — bring it onto the tractor.",
    whenToSuggest: { use: ["commercial", "farm"] },
  },
  {
    id: "light-kit",
    name: "ROPS Light Brackets + LED pods",
    shortName: "LED light kit",
    emoji: "💡",
    priceUsd: 109.99,
    pitch: "Pre-dawn scouting + dusk farm work. Fits any 3\" ROPS.",
    whenToSuggest: { use: ["hunting", "farm", "commercial"] },
  },
  {
    id: "tractor-steps",
    name: "Tractor Step (TYM T234/T264/T25/RK25)",
    shortName: "Tractor steps",
    emoji: "🪜",
    priceUsd: 145,
    pitch: "Your knees and back will thank you.",
    whenToSuggest: { brand: ["tym"] },
    note: "4.9/5 across 48 reviews",
  },
  {
    id: "firearm-mount",
    name: "Tractor firearm mount",
    shortName: "Gun mount",
    emoji: "🦌",
    priceUsd: 89,
    pitch: "ROPS-mounted, vibration-tight. Property scouting / pest control.",
    whenToSuggest: { use: ["hunting"] },
  },
  {
    id: "string-trimmer",
    name: "String Trimmer Carrier",
    shortName: "Trimmer carrier",
    emoji: "✂️",
    priceUsd: 94.99,
    pitch: "Mount it once, never lose the trimmer in the truck again.",
    whenToSuggest: { use: ["landscaping", "commercial"] },
  },
  {
    id: "fire-extinguisher",
    name: "Fire Extinguisher Carrier",
    shortName: "Fire ext.",
    emoji: "🧯",
    priceUsd: 79.99,
    pitch: "Critical for forest + dry-grass work. Stays accessible, not loose.",
    whenToSuggest: { use: ["firewood", "farm", "commercial"] },
  },
  {
    id: "chainbox",
    name: "ITC Chainbox",
    shortName: "Chainbox",
    emoji: "📦",
    priceUsd: 70,
    pitch: "Spare chain, bar oil, wedges — all in one weatherproof spot.",
    whenToSuggest: { use: ["firewood"] },
  },
  {
    id: "gas-oil-carrier",
    name: "Gas/Oil and Tool Carrier",
    shortName: "Gas/oil",
    emoji: "⛽",
    priceUsd: 109.99,
    pitch: "Carry the can on the tractor, not in the truck.",
    whenToSuggest: { use: ["firewood", "farm", "commercial"] },
  },
  {
    id: "rops-mount",
    name: "ITC ROPS Mount (universal base)",
    shortName: "ROPS mount",
    emoji: "🔩",
    priceUsd: 65,
    pitch: "Universal base for any modular accessory. Buy once, expand later.",
    whenToSuggest: { default: true },
  },
  {
    id: "loader-mount",
    name: "ITC Loader Mount",
    shortName: "Loader mount",
    emoji: "🦾",
    priceUsd: 99.99,
    pitch: "Use your loader as accessory real estate. Modular all the way.",
    whenToSuggest: { use: ["commercial", "landscaping", "farm"] },
  },
];

const BRAND_COLOR_NOTE: Partial<Record<Brand, string>> = {
  kubota: "Universal kits fit your Kubota. Brand-specific brush guard not yet — community feedback drives our next product.",
  deere: "Universal kits fit your John Deere. Brand-specific brush guard queued.",
};

export default function DreamTractorPage() {
  const [brand, setBrand] = useState<Brand>("tym");
  const [use, setUse] = useState<Use>("landscaping");
  const [acreage, setAcreage] = useState<number>(5);
  const [picked, setPicked] = useState<Set<AccessoryId>>(new Set());
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: AccessoryId) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // "Suggested for you" — ranked accessories that match the user's
  // brand + use case. Visible chips so they can pick with one tap.
  const suggested = useMemo(() => {
    return ACCESSORIES.filter((a) => {
      if (a.whenToSuggest.use?.includes(use)) return true;
      if (a.whenToSuggest.brand?.includes(brand)) return true;
      if (a.whenToSuggest.default) return true;
      return false;
    }).map((a) => a.id);
  }, [brand, use]);

  const totalUsd = useMemo(() => {
    let t = 0;
    for (const id of picked) {
      const a = ACCESSORIES.find((x) => x.id === id);
      if (a) t += a.priceUsd;
    }
    return t;
  }, [picked]);

  // Translate accessory selections into the visual layer flags. The
  // SVG accepts a pain[] array — we map each picked accessory to a
  // "pain" code so the visual layers light up. Direct, no quiz step.
  const visualPains = useMemo(() => {
    const list: string[] = [];
    if (picked.has("brush-guard")) list.push("branch-scratches");
    if (picked.has("sawboss")) list.push("saw-doesnt-fit");
    if (picked.has("toolbox") || picked.has("milwaukee-packout"))
      list.push("no-storage");
    if (picked.has("light-kit")) list.push("low-light");
    if (picked.has("chainbox")) list.push("loose-tools");
    return list as ("branch-scratches" | "saw-doesnt-fit" | "no-storage" | "low-light" | "loose-tools" | "chain-falls-off")[];
  }, [picked]);

  // Pseudo-size for the visual based on acreage.
  const size: "backyard" | "hobby" | "pro" | "fleet" =
    acreage < 3 ? "backyard" : acreage < 25 ? "hobby" : acreage < 100 ? "pro" : "fleet";

  const submit = async () => {
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    if (picked.size === 0) {
      setError("Pick at least one accessory so we know what to build.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/clients/inquire", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug: "itc-quick-attach",
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          lp: "dream-tractor",
          intent: "Dream Tractor configurator",
          source: "lp-dream-tractor",
          quiz_brand: brand,
          quiz_use_case: use,
          quiz_acreage: acreage,
          quiz_size: size,
          recommended_skus: Array.from(picked)
            .map((id) => ACCESSORIES.find((a) => a.id === id)?.name)
            .filter(Boolean)
            .join(", "),
          recommended_total_usd: totalUsd,
          deal_value_usd: totalUsd,
        }),
      });
      const j = (await r.json()) as { ok: boolean; error?: string };
      if (!j.ok) {
        setError(j.error || "Something went wrong. Try again.");
        setBusy(false);
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Try again.");
    }
    setBusy(false);
  };

  if (done) {
    return (
      <ItcLpShell navTitle="Dream tractor configured">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-8 items-start">
          <div>
            <span className="inline-block text-[11px] uppercase tracking-[0.22em] text-emerald-300 font-bold mb-3">
              ✅ {name.split(" ")[0] || "You"}, your build is in
            </span>
            <h1 className="text-4xl font-black tracking-tight mb-4 leading-[1.05]">
              Build sheet inbound.
            </h1>
            <p className="text-amber-50/70 text-lg mb-6">
              Jake (the founder) just got pinged on his phone too. Expect a
              personal email or text inside 24h.
            </p>
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.05] p-5">
              <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-300 font-bold mb-3">
                Your dream tractor build
              </p>
              <ul className="space-y-1.5 text-amber-50/90 text-sm mb-4">
                {Array.from(picked).map((id) => {
                  const a = ACCESSORIES.find((x) => x.id === id);
                  if (!a) return null;
                  return (
                    <li key={id} className="flex items-center gap-2">
                      <span>{a.emoji}</span>
                      <span className="flex-1">{a.name}</span>
                      <span className="text-amber-300 font-bold">${a.priceUsd}</span>
                    </li>
                  );
                })}
              </ul>
              <div className="border-t border-emerald-500/20 pt-3 flex items-baseline justify-between">
                <span className="text-emerald-200 font-bold">Estimated total</span>
                <span className="text-3xl font-black text-emerald-300">
                  ${totalUsd.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="mt-5 flex gap-2 flex-wrap">
              <Link
                href="https://itcquickattach.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-md"
              >
                Browse the shop ↗
              </Link>
              <Link
                href="/clients/itc-quick-attach"
                className="text-xs font-bold uppercase tracking-wider border border-amber-900/40 text-amber-50/70 hover:text-amber-50 px-4 py-2 rounded-md"
              >
                Back to home
              </Link>
            </div>
          </div>
          <TractorVisual
            size={size}
            useCase={use}
            brand={brand}
            pains={visualPains}
          />
        </div>
      </ItcLpShell>
    );
  }

  return (
    <ItcLpShell navTitle="Build your dream tractor">
      {/* Header strip */}
      <div className="mb-6">
        <span className="inline-block text-[11px] uppercase tracking-[0.22em] text-amber-300 font-bold mb-2">
          ⚙️ Tractor configurator
        </span>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 leading-[1.05]">
          Build your dream tractor.
        </h1>
        <p className="text-amber-50/70">
          Toggle the accessories that fit your life. Tractor on the right
          updates as you click. Real ITC products, real prices.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 items-start">
        {/* LEFT — config controls */}
        <div className="space-y-6">
          {/* Brand selector */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-amber-50/50 font-bold mb-2">
              1. Tractor brand
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              {BRANDS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBrand(b.id)}
                  className={`text-[11px] font-bold rounded-md px-2 py-1.5 border transition ${
                    brand === b.id
                      ? "bg-amber-500 border-amber-300 text-black"
                      : b.supported
                        ? "border-amber-500/40 bg-amber-500/[0.05] text-amber-200 hover:bg-amber-500/[0.1]"
                        : "border-amber-900/40 text-amber-50/60 hover:text-amber-50/90"
                  }`}
                >
                  {b.label}
                  {b.supported && brand !== b.id && (
                    <span className="block text-[8px] uppercase tracking-wider text-amber-400">fit</span>
                  )}
                </button>
              ))}
            </div>
            {BRAND_COLOR_NOTE[brand] && (
              <p className="text-[10px] text-amber-50/40 italic mt-1.5">
                {BRAND_COLOR_NOTE[brand]}
              </p>
            )}
          </div>

          {/* Use case */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-amber-50/50 font-bold mb-2">
              2. Main use
            </p>
            <div className="flex flex-wrap gap-1.5">
              {USES.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setUse(u.id)}
                  className={`text-[11px] font-bold rounded-md px-2.5 py-1.5 border transition ${
                    use === u.id
                      ? "bg-amber-500 border-amber-300 text-black"
                      : "border-amber-900/40 bg-amber-950/[0.15] text-amber-200 hover:bg-amber-500/[0.1]"
                  }`}
                >
                  {u.emoji} {u.label}
                </button>
              ))}
            </div>
          </div>

          {/* Acreage slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-amber-50/50 font-bold">
                3. Acreage
              </p>
              <span className="text-amber-300 font-black">
                {acreage}{acreage >= 200 ? "+ ac" : " ac"}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={200}
              step={1}
              value={acreage}
              onChange={(e) => setAcreage(Number(e.target.value))}
              className="w-full accent-amber-400"
            />
            <div className="flex justify-between text-[9px] text-amber-50/30 mt-0.5">
              <span>backyard</span>
              <span>hobby</span>
              <span>pro</span>
              <span>fleet</span>
            </div>
          </div>

          {/* Accessory toggles */}
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-amber-50/50 font-bold">
                4. Accessories — toggle on what you want
              </p>
              <span className="text-[10px] text-amber-50/40">
                {picked.size}/{ACCESSORIES.length}
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-1.5">
              {ACCESSORIES.map((a) => {
                const on = picked.has(a.id);
                const isSuggested = suggested.includes(a.id);
                return (
                  <button
                    key={a.id}
                    onClick={() => toggle(a.id)}
                    className={`text-left rounded-lg border p-2.5 transition ${
                      on
                        ? "border-amber-400 bg-amber-500/15"
                        : isSuggested
                          ? "border-amber-500/40 bg-amber-500/[0.04] hover:bg-amber-500/[0.08]"
                          : "border-amber-900/40 bg-black/20 hover:border-amber-500/40"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg leading-none">{a.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-1">
                          <span className={`text-xs font-bold ${on ? "text-white" : "text-amber-50/85"}`}>
                            {a.shortName}
                          </span>
                          <span className={`text-[11px] font-black ${on ? "text-amber-300" : "text-amber-50/50"}`}>
                            ${a.priceUsd}
                          </span>
                        </div>
                        <div className="text-[10px] text-amber-50/50 leading-tight mt-0.5">
                          {a.pitch}
                        </div>
                        {a.note && (
                          <div className="text-[9px] text-amber-300/70 mt-1 italic">
                            ★ {a.note}
                          </div>
                        )}
                      </div>
                      <div
                        aria-hidden
                        className={`flex-shrink-0 w-8 h-4 rounded-full relative transition ${
                          on ? "bg-amber-500" : "bg-amber-900/40"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${
                            on ? "left-4" : "left-0.5"
                          }`}
                        />
                      </div>
                    </div>
                    {isSuggested && !on && (
                      <div className="text-[9px] uppercase tracking-wider text-amber-400 font-bold mt-1">
                        Suggested for {use}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Capture form + submit */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.05] p-5 space-y-3 sticky bottom-3">
            <div className="flex items-baseline justify-between">
              <p className="text-[10px] uppercase tracking-[0.22em] text-amber-300 font-bold">
                Your build
              </p>
              <p className="text-2xl font-black text-amber-300">
                ${totalUsd.toLocaleString()}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="bg-black/40 border border-amber-900/40 rounded-md px-3 py-2 text-sm focus:border-amber-500 outline-none"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="bg-black/40 border border-amber-900/40 rounded-md px-3 py-2 text-sm focus:border-amber-500 outline-none"
              />
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone (optional)"
              className="w-full bg-black/40 border border-amber-900/40 rounded-md px-3 py-2 text-sm focus:border-amber-500 outline-none"
            />
            {error && <p className="text-rose-400 text-xs">{error}</p>}
            <button
              onClick={submit}
              disabled={busy || picked.size === 0}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-tight py-3 rounded-md disabled:opacity-40"
            >
              {busy
                ? "Sending…"
                : picked.size === 0
                  ? "Pick at least one accessory"
                  : `Send my build sheet — ${picked.size} item${picked.size === 1 ? "" : "s"}`}
            </button>
            <p className="text-[10px] text-amber-50/30 text-center">
              Jake gets pinged the moment you submit. No spam.
            </p>
          </div>
        </div>

        {/* RIGHT — live tractor */}
        <div className="lg:sticky lg:top-20">
          <TractorVisual
            size={size}
            useCase={use}
            brand={brand}
            pains={visualPains}
          />
        </div>
      </div>
    </ItcLpShell>
  );
}
