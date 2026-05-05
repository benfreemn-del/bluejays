"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CAMPS } from "@/app/clients/zenith-sports/camps/camps-data";

/**
 * ZenithSpotlight — soccer-specific dashboard section for the Zenith
 * Sports owner portal Overview tab. Two cards:
 *   · 🎯 Drill of the Week — deterministic pick from the existing TEKKY
 *      drill library, refreshes weekly. Embeds the YouTube preview.
 *   · 📅 Upcoming Camps — next 3 camps from camps-data.ts, or a clear
 *      "Add your first camp" empty state when the catalog is empty.
 *
 * Both cards reuse content Philip + Paul already maintain — no new data
 * source, just surfacing it where the daily owner-portal eye lands.
 */

// Mirror of the TIERS shape from training-drills.tsx — kept inline here
// to avoid pulling the entire training-drills component (and its DOM
// styles) into this server-rendered card. Source of truth is still
// training-drills.tsx; sync updates manually if drills change.
const FEATURED_DRILLS: { id: string; name: string; tier: string }[] = [
  { id: "bX-HMzizdxU", name: "Instep Touch", tier: "Foundations" },
  { id: "Wzlr9RpBNs4", name: "Outside-Foot Gather, Instep Pass", tier: "Foundations" },
  { id: "G8aa_34JpFg", name: "Sole Trap, Instep Pass", tier: "Foundations" },
  { id: "l40Cq1RJ_QI", name: "La Croqueta", tier: "Skill Moves" },
  { id: "074-lKwl9kI", name: "La Croqueta · 2 Touch Shift", tier: "Skill Moves" },
  { id: "n4625BwqiU0", name: "Push Pull", tier: "Skill Moves" },
  { id: "v4bHgBiPW6I", name: "Inside · Outside", tier: "Skill Moves" },
  { id: "Lnny2pLZmiI", name: "Sole Drag", tier: "Skill Moves" },
];

/** ISO week number — drives the deterministic drill pick so it rotates
 *  weekly, same drill for everyone in the same week. */
function weekOfYear(d: Date): number {
  const target = new Date(d.valueOf());
  const dayNr = (d.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setUTCMonth(0, 1);
  if (target.getUTCDay() !== 4) {
    target.setUTCMonth(0, 1 + ((4 - target.getUTCDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

export default function ZenithSpotlight() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [campOpen, setCampOpen] = useState(false);

  // Drill rotates weekly — deterministic so Philip + Paul see the same
  // featured drill all week, refreshes Monday automatically.
  const featuredDrill = useMemo(() => {
    const week = weekOfYear(new Date());
    return FEATURED_DRILLS[week % FEATURED_DRILLS.length] ?? FEATURED_DRILLS[0];
  }, []);

  // Next 3 camps — chronological, drop past camps + null-startDate ones
  // unless we have nothing else to show.
  const upcomingCamps = useMemo(() => {
    const now = new Date();
    const dated = CAMPS.filter((c) => c.startDate)
      .map((c) => ({ ...c, _ts: new Date(c.startDate!).getTime() }))
      .filter((c) => c._ts >= now.getTime() - 1000 * 60 * 60 * 24)
      .sort((a, b) => a._ts - b._ts);
    return dated.slice(0, 3);
  }, []);

  return (
    <>
    <section className="grid lg:grid-cols-[0.55fr_0.45fr] gap-3">
      {/* DRILL OF THE WEEK */}
      <div className="rounded-2xl border border-lime-500/25 bg-gradient-to-br from-lime-950/30 via-slate-900/60 to-slate-900/40 p-4">
        <div className="flex items-baseline justify-between mb-3">
          <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-lime-300">
            🎯 Drill of the Week
          </p>
          <Link
            href="/clients/zenith-sports/training-guide"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] uppercase tracking-wider font-bold text-lime-300 hover:text-lime-200"
          >
            Full library →
          </Link>
        </div>

        {featuredDrill && (
          <>
            <div className="aspect-video rounded-lg overflow-hidden bg-black/40 border border-white/[0.04] mb-2.5">
              {/* youtube-nocookie keeps the preview privacy-friendly */}
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${featuredDrill.id}?rel=0&modestbranding=1`}
                title={featuredDrill.name}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <p className="text-sm font-bold text-white truncate">
                {featuredDrill.name}
              </p>
              <span className="text-[10px] uppercase tracking-wider text-lime-300/80 font-bold">
                {featuredDrill.tier}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-1.5">
              Featured this week. Drop the link in your team chat or attach
              to your next coach-affiliate email.
            </p>
          </>
        )}
      </div>

      {/* UPCOMING CAMPS */}
      <div className="rounded-2xl border border-blue-500/25 bg-gradient-to-br from-blue-950/30 via-slate-900/60 to-slate-900/40 p-4">
        <div className="flex items-baseline justify-between mb-3">
          <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-blue-300">
            📅 Upcoming Camps
          </p>
          <Link
            href="/clients/zenith-sports/camps"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] uppercase tracking-wider font-bold text-blue-300 hover:text-blue-200"
          >
            Camps page →
          </Link>
        </div>

        {upcomingCamps.length > 0 ? (
          <ul className="space-y-2">
            {upcomingCamps.map((c) => (
              <li
                key={c.id}
                className="rounded-lg border border-white/[0.06] bg-black/30 px-3 py-2.5"
              >
                <div className="flex items-baseline justify-between gap-2 flex-wrap mb-0.5">
                  <p className="text-sm font-bold text-white truncate">
                    {c.name}
                  </p>
                  <span className="text-[10px] uppercase tracking-wider text-blue-300 font-bold whitespace-nowrap">
                    {c.startDate
                      ? new Date(c.startDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })
                      : "TBD"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight truncate">
                  {c.city}, {c.state} · {c.format} · {c.ageRange}
                  {c.ballIncluded && (
                    <span className="ml-1.5 text-[10px] text-lime-300 font-bold">
                      · ⚽ ball included
                    </span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-lg border border-dashed border-blue-500/30 bg-blue-500/[0.04] p-4 text-center">
            <p className="text-2xl mb-1">⛳</p>
            <p className="text-sm font-bold text-white mb-1">
              No camps in the catalog yet
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              Camps are your highest-volume parent-lead funnel. Add the
              first one to populate the public Camps page.
            </p>
            <button
              type="button"
              onClick={() => setCampOpen(true)}
              className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-blue-200 hover:text-blue-100"
            >
              + Add a camp →
            </button>
          </div>
        )}

        {/* Action row at the bottom of the camps card */}
        <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setCampOpen(true)}
            className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-200 transition-colors"
          >
            + Add camp
          </button>
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md border border-lime-500/30 bg-lime-500/10 hover:bg-lime-500/20 text-lime-200 transition-colors"
          >
            🤝 Invite a coach
          </button>
        </div>
      </div>
    </section>

    {inviteOpen && (
      <InviteCoachModal onClose={() => setInviteOpen(false)} />
    )}
    {campOpen && <AddCampModal onClose={() => setCampOpen(false)} />}
    </>
  );
}

/**
 * InviteCoachModal — opens a pre-filled mailto for the coach-affiliate
 * partner program. Owner enters the coach's first name + email + club,
 * the modal generates the body with the personal touch + Sales Portal
 * link, and they hit send.
 */
function InviteCoachModal({ onClose }: { onClose: () => void }) {
  const [coachFirst, setCoachFirst] = useState("");
  const [coachEmail, setCoachEmail] = useState("");
  const [clubName, setClubName] = useState("");
  const [ageGroup, setAgeGroup] = useState("U12");
  const [from, setFrom] = useState("Philip");

  const subject = encodeURIComponent(
    `Quick offer for ${coachFirst || "coaches"} · $25/ball + $100/package`,
  );
  const body = encodeURIComponent(
    [
      `Hey ${coachFirst || "Coach"},`,
      "",
      `${from} from TEKKY/Zenith. Quick offer for ${clubName ? `${clubName} ` : ""}${ageGroup} coaches:`,
      "",
      "$25 commission on every TEKKY ball your parents buy through your link.",
      "$100 per Zenith coaching package signup.",
      "Paid Venmo/Zelle within 7 days.",
      "",
      "Drop a single message in your team chat at start of season — that's the whole effort. Most coaches stack $200-600/season for one Facebook post.",
      "",
      "Full program details + audience-tuned scripts here:",
      "https://bluejayportfolio.com/clients/zenith-sports/partners",
      "",
      "Reply if you want in — I'll set up your link tonight.",
      "",
      `— ${from}`,
    ].join("\n"),
  );
  const mailto = `mailto:${coachEmail}?subject=${subject}&body=${body}`;
  const ready = coachEmail.trim().length > 3;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative my-6 mx-4 w-full max-w-md rounded-2xl border border-lime-500/25 bg-slate-900 shadow-2xl p-5"
      >
        <div className="flex items-baseline justify-between mb-1">
          <h3 className="text-lg font-bold text-lime-200">🤝 Invite a coach</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm"
          >
            ✕
          </button>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Send a coach the partner-program offer in 30 seconds. We pre-fill
          the email; you hit send.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <ModalInput label="Coach first name" value={coachFirst} onChange={setCoachFirst} />
          <ModalInput label="Email *" value={coachEmail} onChange={setCoachEmail} type="email" />
          <ModalInput label="Club / org" value={clubName} onChange={setClubName} />
          <ModalInput label="Age group" value={ageGroup} onChange={setAgeGroup} />
          <ModalInput label="From (you)" value={from} onChange={setFrom} full />
        </div>

        <a
          href={ready ? mailto : "#"}
          onClick={(e) => {
            if (!ready) e.preventDefault();
          }}
          className={`block w-full text-center text-sm font-bold uppercase tracking-wider px-4 py-3 rounded-md mt-4 transition-colors ${
            ready
              ? "bg-lime-500 hover:bg-lime-400 text-lime-950"
              : "bg-slate-800 text-slate-500 cursor-not-allowed"
          }`}
        >
          Open in email →
        </a>
        <p className="text-[10px] text-slate-500 italic mt-2 text-center">
          Opens your email client with the message pre-filled. You hit send.
        </p>
      </div>
    </div>
  );
}

/**
 * AddCampModal — generates a copy-ready Camp object snippet for the
 * camps-data.ts file. Owner fills the form, hits Copy, sends to Ben who
 * appends + redeploys. Pure code-snippet generator — no DB write since
 * camps-data is currently a flat file.
 */
function AddCampModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [org, setOrg] = useState("Zenith Sports");
  const [city, setCity] = useState("");
  const [state, setState] = useState("WA");
  const [region, setRegion] = useState("Pacific NW");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [ageRange, setAgeRange] = useState("U10–U14");
  const [format, setFormat] = useState("Day camp");
  const [ballIncluded, setBallIncluded] = useState(true);
  const [url, setUrl] = useState("");
  const [blurb, setBlurb] = useState("");
  const [copied, setCopied] = useState(false);

  const id = useMemo(() => {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);
    return base || `camp-${Date.now()}`;
  }, [name]);

  const snippet = useMemo(() => {
    return `{
  id: "${id}",
  name: "${name}",
  org: "${org}",
  city: "${city}",
  state: "${state}",
  region: "${region}",
  startDate: ${start ? `"${start}"` : "null"},
  endDate: ${end ? `"${end}"` : "null"},
  ageRange: "${ageRange}",
  format: "${format}",
  ballIncluded: ${ballIncluded},
  ${url ? `url: "${url}",\n  ` : ""}${blurb ? `blurb: ${JSON.stringify(blurb)},` : ""}
},`;
  }, [
    id,
    name,
    org,
    city,
    state,
    region,
    start,
    end,
    ageRange,
    format,
    ballIncluded,
    url,
    blurb,
  ]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative my-6 mx-4 w-full max-w-xl rounded-2xl border border-blue-500/25 bg-slate-900 shadow-2xl p-5"
      >
        <div className="flex items-baseline justify-between mb-1">
          <h3 className="text-lg font-bold text-blue-200">📅 Add a camp</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm"
          >
            ✕
          </button>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Fill this in, copy the snippet, send to Ben. He appends to
          camps-data.ts and your camp is live within an hour. Eventually
          this will write to the DB directly — for now it's a snippet
          generator so you don&apos;t lose the data.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <ModalInput label="Camp name *" value={name} onChange={setName} full />
          <ModalInput label="Org" value={org} onChange={setOrg} />
          <ModalInput label="City" value={city} onChange={setCity} />
          <ModalInput label="State" value={state} onChange={setState} />
          <ModalSelect
            label="Region"
            value={region}
            onChange={setRegion}
            options={[
              "Pacific NW",
              "West",
              "Mountain",
              "Midwest",
              "South",
              "Northeast",
            ]}
          />
          <ModalInput label="Start date" value={start} onChange={setStart} placeholder="2026-07-08" />
          <ModalInput label="End date" value={end} onChange={setEnd} placeholder="2026-07-12" />
          <ModalInput label="Age range" value={ageRange} onChange={setAgeRange} />
          <ModalSelect
            label="Format"
            value={format}
            onChange={setFormat}
            options={["Day camp", "Residential", "Clinic", "Demo"]}
          />
          <label className="flex items-center gap-2 text-sm text-slate-200 sm:col-span-1 mt-5">
            <input
              type="checkbox"
              checked={ballIncluded}
              onChange={(e) => setBallIncluded(e.target.checked)}
              className="w-4 h-4"
            />
            <span>⚽ Ball included in fee</span>
          </label>
          <ModalInput label="External URL" value={url} onChange={setUrl} full />
          <ModalInput label="Short blurb (optional)" value={blurb} onChange={setBlurb} full />
        </div>

        <pre className="rounded-lg border border-white/[0.08] bg-black/40 p-3 text-[11px] text-slate-200 whitespace-pre-wrap leading-relaxed font-mono mb-3 max-h-40 overflow-y-auto">
          {snippet}
        </pre>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={copy}
            className={`flex-1 text-sm font-bold uppercase tracking-wider px-3 py-2.5 rounded-md transition-colors ${
              copied
                ? "bg-emerald-500 text-slate-950"
                : "bg-blue-500 hover:bg-blue-400 text-white"
            }`}
          >
            {copied ? "✓ Copied snippet" : "Copy snippet"}
          </button>
          <a
            href={`mailto:ben@bluejayportfolio.com?subject=${encodeURIComponent(
              `Add camp · ${name || "(name)"}`,
            )}&body=${encodeURIComponent(`Hey Ben — please add this camp:\n\n${snippet}`)}`}
            className="text-sm font-bold uppercase tracking-wider px-3 py-2.5 rounded-md border border-white/15 bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Email Ben
          </a>
        </div>
      </div>
    </div>
  );
}

function ModalInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  full,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  full?: boolean;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md bg-black/40 border border-white/[0.08] text-sm text-white px-2.5 py-1.5 placeholder:text-slate-600 focus:outline-none focus:border-blue-400/60"
      />
    </label>
  );
}

function ModalSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md bg-black/40 border border-white/[0.08] text-sm text-white px-2 py-1.5 focus:outline-none focus:border-blue-400/60"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
