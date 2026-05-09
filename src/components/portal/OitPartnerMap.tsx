"use client";

/**
 * OitPartnerMap — Olympic Peninsula affiliate-target map for the OIT
 * owner admin. Mirrors the Meyer Electric service-map pattern (Sequim
 * HQ, service rings 10/25/50 mi, dark Carto basemap) but the data set
 * is OIT-specific: realtors + mold remediation companies + water-damage
 * restoration contractors + property management firms + larger
 * commercial buildings (schools, hospitals, marinas, hotels) that
 * mold-inspection businesses typically partner with or sell into.
 *
 * Goal for Luke: every dot on this map is a candidate for a 5-minute
 * outreach call. Hover for the call-script angle, click for full
 * contact details + a one-tap "Mark as called" button.
 *
 * Data is hand-curated for v1. Future: feed from a partner_targets
 * table that auto-updates from a Google Places + LinkedIn scout.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import ScanWithProgress from "@/components/common/ScanWithProgress";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// SSR-safe react-leaflet import. Same pattern as the dashboard MapView.
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false },
);
const Circle = dynamic(
  () => import("react-leaflet").then((m) => m.Circle),
  { ssr: false },
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((m) => m.CircleMarker),
  { ssr: false },
);
const Tooltip = dynamic(
  () => import("react-leaflet").then((m) => m.Tooltip),
  { ssr: false },
);

type PartnerCategory =
  | "realtor"
  | "mold-remediation"
  | "water-damage"
  | "property-management"
  | "commercial-property"
  | "naturopathic"
  | "well-services";

type Partner = {
  id: string;
  name: string;
  category: PartnerCategory;
  city: string;
  lat: number;
  lng: number;
  phone?: string;
  website?: string;
  pitch: string; // 1-line angle Luke uses on the call
};

const SEQUIM_HQ = { lat: 48.0789, lng: -123.0926 };

// Hand-curated affiliate-target list across the Olympic Peninsula.
// V1 covers Sequim + Port Angeles + Port Townsend + Forks + Hoodsport +
// Bremerton + Silverdale (the population centers within service range).
// Coordinates are real city centroids with small jitter so multi-pin
// cities don't stack on top of each other.
const PARTNERS: Partner[] = [
  // ── Realtors / brokerages ──
  {
    id: "rea-1",
    name: "Coldwell Banker Uptown",
    category: "realtor",
    city: "Port Angeles",
    lat: 48.1186,
    lng: -123.43,
    pitch:
      "Pre-listing reports + pre-purchase peace-of-mind. 24-hr turnaround on findings.",
  },
  {
    id: "rea-2",
    name: "Windermere Sequim-East",
    category: "realtor",
    city: "Sequim",
    lat: 48.083,
    lng: -123.09,
    pitch:
      "Closing-day-saver for moisture flags. Tiered referral: $50/$75/$100.",
  },
  {
    id: "rea-3",
    name: "John L. Scott · Port Townsend",
    category: "realtor",
    city: "Port Townsend",
    lat: 48.117,
    lng: -122.76,
    pitch:
      "Older-home market needs lab-backed reports. We do crawlspace-heavy.",
  },
  {
    id: "rea-4",
    name: "Realty Group Pacific NW",
    category: "realtor",
    city: "Bremerton",
    lat: 47.567,
    lng: -122.63,
    pitch:
      "Higher-velocity broker — needs reliable inspector for back-to-back closings.",
  },
  {
    id: "rea-5",
    name: "Coldwell Banker Best Homes",
    category: "realtor",
    city: "Silverdale",
    lat: 47.644,
    lng: -122.694,
    pitch: "Kitsap referral channel — same tiered referral payout.",
  },
  {
    id: "rea-6",
    name: "RE/MAX Forks Office",
    category: "realtor",
    city: "Forks",
    lat: 47.95,
    lng: -124.385,
    pitch: "West-end coverage gap — high humidity = high mold-flag rate.",
  },

  // ── Mold remediation contractors (refer-out partners) ──
  {
    id: "rem-1",
    name: "Olympic Mold Removal",
    category: "mold-remediation",
    city: "Port Angeles",
    lat: 48.115,
    lng: -123.435,
    pitch:
      "Refer-out partner. They remove, we inspect + write the post-job clearance report.",
  },
  {
    id: "rem-2",
    name: "Peninsula Restoration Co",
    category: "mold-remediation",
    city: "Sequim",
    lat: 48.085,
    lng: -123.095,
    pitch: "Bidirectional referral — they need pre-bid + clearance reports.",
  },
  {
    id: "rem-3",
    name: "Servpro of Kitsap",
    category: "mold-remediation",
    city: "Bremerton",
    lat: 47.572,
    lng: -122.635,
    pitch: "Franchise — single contact, multi-job pipeline.",
  },

  // ── Water-damage / restoration ──
  {
    id: "wd-1",
    name: "PuroClean Olympic",
    category: "water-damage",
    city: "Port Angeles",
    lat: 48.122,
    lng: -123.42,
    pitch:
      "Insurance-driven jobs — they need third-party reports for claim files.",
  },
  {
    id: "wd-2",
    name: "Rainier Restoration",
    category: "water-damage",
    city: "Silverdale",
    lat: 47.648,
    lng: -122.688,
    pitch:
      "Storm-damage volume in winter. Pair us as their inspection partner.",
  },
  {
    id: "wd-3",
    name: "Disaster Cleanup Services",
    category: "water-damage",
    city: "Bremerton",
    lat: 47.563,
    lng: -122.625,
    pitch: "After-hours emergency response — we follow up next-day with report.",
  },

  // ── Property management ──
  {
    id: "pm-1",
    name: "Coastal Property Group",
    category: "property-management",
    city: "Sequim",
    lat: 48.078,
    lng: -123.1,
    pitch:
      "Annual mold checks on 80+ rentals. Recurring-revenue contract candidate.",
  },
  {
    id: "pm-2",
    name: "Olympic Property Services",
    category: "property-management",
    city: "Port Angeles",
    lat: 48.114,
    lng: -123.422,
    pitch: "Pre-tenant move-out inspections. High volume, low-touch jobs.",
  },
  {
    id: "pm-3",
    name: "Kitsap Property Mgmt",
    category: "property-management",
    city: "Bremerton",
    lat: 47.57,
    lng: -122.628,
    pitch: "Kitsap rental portfolio — same recurring-revenue play.",
  },

  // ── Larger commercial buildings (likely buyers, not affiliates) ──
  {
    id: "cp-1",
    name: "Olympic Medical Center",
    category: "commercial-property",
    city: "Port Angeles",
    lat: 48.119,
    lng: -123.439,
    pitch:
      "Hospital — IAQ assessments + post-incident clearance. High-margin commercial.",
  },
  {
    id: "cp-2",
    name: "Sequim School District",
    category: "commercial-property",
    city: "Sequim",
    lat: 48.082,
    lng: -123.087,
    pitch:
      "School district — annual classroom IAQ checks + portable inspections.",
  },
  {
    id: "cp-3",
    name: "John Wayne Marina",
    category: "commercial-property",
    city: "Sequim",
    lat: 48.0816,
    lng: -123.0489,
    pitch: "Marina = boat-cabin inspections gateway. Already on your services list.",
  },
  {
    id: "cp-4",
    name: "7 Cedars Hotel",
    category: "commercial-property",
    city: "Sequim",
    lat: 48.0356,
    lng: -123.0331,
    pitch:
      "Tribal hospitality — large HVAC system, recurring guest-complaint IAQ work.",
  },
  {
    id: "cp-5",
    name: "Harrison Medical Center",
    category: "commercial-property",
    city: "Bremerton",
    lat: 47.572,
    lng: -122.62,
    pitch:
      "Larger hospital system. Multi-building IAQ portfolio. High-ticket.",
  },

  // ── Naturopathic clinics (refer-out partners) ──
  // Naturopaths see chronic-illness patients whose symptoms often
  // trace back to indoor air quality (mold, VOCs, water damage).
  // High-trust referral channel — their patients arrive pre-qualified
  // for OIT's lab-grade IAQ testing.
  {
    id: "nat-1",
    name: "Sequim Natural Medicine",
    category: "naturopathic",
    city: "Sequim",
    lat: 48.078,
    lng: -123.094,
    pitch:
      "Chronic-illness practice — IAQ root-cause angle. Refer-out: $50/test commission.",
  },
  {
    id: "nat-2",
    name: "Olympic Naturopathic",
    category: "naturopathic",
    city: "Port Angeles",
    lat: 48.116,
    lng: -123.428,
    pitch:
      "Patients with mystery symptoms = mold-test gateway. Pitch the joint-protocol angle.",
  },
  {
    id: "nat-3",
    name: "Port Townsend Holistic Health",
    category: "naturopathic",
    city: "Port Townsend",
    lat: 48.118,
    lng: -122.762,
    pitch:
      "Older Victorian housing stock = high mold-positive rate. Built-in audience.",
  },
  {
    id: "nat-4",
    name: "Kitsap Natural Health Clinic",
    category: "naturopathic",
    city: "Bremerton",
    lat: 47.569,
    lng: -122.628,
    pitch:
      "Larger metro = higher patient volume. Refer-out partnerships scale fastest here.",
  },

  // ── Well & water services (refer-out partners for well-water testing) ──
  // Drillers, well repair, filtration installers + septic. They see
  // customers whose water needs testing pre-purchase, post-flood, or
  // after a repair. Two-way refer flow: we test, they fix.
  {
    id: "well-1",
    name: "Olympic Well Drilling",
    category: "well-services",
    city: "Sequim",
    lat: 48.077,
    lng: -123.099,
    pitch:
      "Two-way refer: their drill clients need post-install water tests, our well-test clients sometimes need a driller.",
  },
  {
    id: "well-2",
    name: "Peninsula Pump & Filter",
    category: "well-services",
    city: "Port Angeles",
    lat: 48.117,
    lng: -123.435,
    pitch:
      "Filtration installers — they sell remediation hardware. We give them pre-install lab data justifying the system.",
  },
  {
    id: "well-3",
    name: "Jefferson Water Solutions",
    category: "well-services",
    city: "Port Townsend",
    lat: 48.115,
    lng: -122.764,
    pitch:
      "Older Victorian + rural Jefferson County = lots of legacy wells. Pre-purchase + post-flood test volume.",
  },
];

const CATEGORY_META: Record<
  PartnerCategory,
  { label: string; color: string; emoji: string }
> = {
  realtor: { label: "Realtor / brokerage", color: "#60a5fa", emoji: "🪧" },
  "mold-remediation": {
    label: "Mold remediation",
    color: "#a78bfa",
    emoji: "🧪",
  },
  "water-damage": { label: "Water damage", color: "#22d3ee", emoji: "💧" },
  "property-management": {
    label: "Property management",
    color: "#f59e0b",
    emoji: "🏢",
  },
  "commercial-property": {
    label: "Commercial buyer",
    color: "#34d399",
    emoji: "🏥",
  },
  naturopathic: {
    label: "Naturopathic clinic",
    color: "#f472b6",
    emoji: "🌿",
  },
  "well-services": {
    label: "Well & water services",
    color: "#06b6d4",
    emoji: "💧",
  },
};

const RING_10_MI = 10 * 1609.344;
const RING_25_MI = 25 * 1609.344;
const RING_50_MI = 50 * 1609.344;

type ScoutedAffiliate = {
  id: string;
  org_name: string;
  role: string;
  city: string | null;
  phone: string | null;
  website: string | null;
  fit_score: number | null;
  status: string;
  source: string | null;
  last_contacted_at: string | null;
  lat: number | null;
  lng: number | null;
};

// Augment Partner with optional DB-row fields so the focused-detail
// panel can show "called X ago" + a Mark-as-called button when the
// pin came from client_affiliates (not from the curated seed).
type PartnerWithDb = Partner & {
  dbId?: string;
  status?: string;
  lastContactedAt?: string | null;
};

// Map DB role → local PartnerCategory so scouted rows merge cleanly
// with the curated seeds.
function roleToCategory(role: string): PartnerCategory | null {
  switch (role) {
    case "realtor":
      return "realtor";
    case "mold-remediation":
      return "mold-remediation";
    case "water-damage":
      return "water-damage";
    case "property-management":
      return "property-management";
    case "commercial-buyer":
    case "commercial-property":
      return "commercial-property";
    case "naturopathic":
    case "naturopath":
      return "naturopathic";
    case "well-services":
    case "well-driller":
    case "water-filtration":
      return "well-services";
    default:
      return null;
  }
}

export default function OitPartnerMap() {
  const [active, setActive] = useState<Set<PartnerCategory>>(
    new Set([
      "realtor",
      "mold-remediation",
      "water-damage",
      "property-management",
      "commercial-property",
      "naturopathic",
      "well-services",
    ]),
  );
  const [focused, setFocused] = useState<PartnerWithDb | null>(null);
  const [scouted, setScouted] = useState<PartnerWithDb[]>([]);
  const [scoutedLoaded, setScoutedLoaded] = useState(false);
  const [markBusy, setMarkBusy] = useState(false);
  const [markMsg, setMarkMsg] = useState<string | null>(null);

  // Live-scouted affiliates (auto-discovered by the weekly cron). Merged
  // with the curated PARTNERS[] seed at render — seed gives Luke a
  // reliable baseline, scout adds new candidates as they appear.
  // Extracted as useCallback so the manual Scan-now button can re-run
  // it after a fresh scout completes.
  const loadScouted = useCallback(async () => {
    try {
      const r = await fetch(
        "/api/clients/olympic-inspections/affiliates",
        { credentials: "include" },
      );
      if (!r.ok) return;
      const j = (await r.json()) as {
        ok: boolean;
        affiliates?: ScoutedAffiliate[];
      };
      if (!j.ok || !j.affiliates) return;
      const mapped: PartnerWithDb[] = [];
      for (const a of j.affiliates) {
        const cat = roleToCategory(a.role);
        if (!cat || a.lat == null || a.lng == null) continue;
        mapped.push({
          id: `scout-${a.id}`,
          dbId: a.id,
          status: a.status,
          lastContactedAt: a.last_contacted_at,
          name: a.org_name,
          category: cat,
          city: a.city ?? "",
          lat: a.lat,
          lng: a.lng,
          phone: a.phone ?? undefined,
          website: a.website ?? undefined,
          pitch:
            a.fit_score != null
              ? `Auto-scouted (fit score ${a.fit_score}). ${a.status === "discovered" ? "Cold — call this week." : a.status === "contacted" ? "Already reached out." : "In conversation."}`
              : "Auto-scouted partner candidate.",
        });
      }
      setScouted(mapped);
    } finally {
      setScoutedLoaded(true);
    }
  }, []);

  useEffect(() => {
    void loadScouted().catch(() => {});
  }, [loadScouted]);

  const allPartners = useMemo<PartnerWithDb[]>(() => {
    // Dedupe scouted vs seed by lowercase name+city
    const seedKeys = new Set(
      PARTNERS.map(
        (p) => `${p.name.toLowerCase()}::${p.city.toLowerCase()}`,
      ),
    );
    const uniqScouted = scouted.filter(
      (s) =>
        !seedKeys.has(`${s.name.toLowerCase()}::${s.city.toLowerCase()}`),
    );
    return [...PARTNERS, ...uniqScouted];
  }, [scouted]);

  // Mark-as-called handler. Only valid for scouted rows (ones with a
  // dbId). Optimistic UI update + server PATCH; toast result.
  const markCalled = async (partner: PartnerWithDb) => {
    if (!partner.dbId || markBusy) return;
    setMarkBusy(true);
    setMarkMsg(null);
    try {
      const r = await fetch(
        `/api/clients/olympic-inspections/affiliates/${partner.dbId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ markCalled: true }),
        },
      );
      const j = await r.json();
      if (j.ok) {
        // Update local copy + focused state
        const stamped = new Date().toISOString();
        setScouted((prev) =>
          prev.map((p) =>
            p.dbId === partner.dbId
              ? { ...p, status: "contacted", lastContactedAt: stamped }
              : p,
          ),
        );
        setFocused((cur) =>
          cur && cur.dbId === partner.dbId
            ? { ...cur, status: "contacted", lastContactedAt: stamped }
            : cur,
        );
        setMarkMsg("Logged. Pipeline stamped.");
      } else {
        setMarkMsg(j.error || "Couldn't update — try again.");
      }
    } catch {
      setMarkMsg("Network error — try again.");
    }
    setMarkBusy(false);
    setTimeout(() => setMarkMsg(null), 4000);
  };

  const visiblePartners = useMemo(
    () => allPartners.filter((p) => active.has(p.category)),
    [allPartners, active],
  );

  const counts = useMemo(() => {
    const c: Record<PartnerCategory, number> = {
      realtor: 0,
      "mold-remediation": 0,
      "water-damage": 0,
      "property-management": 0,
      "commercial-property": 0,
      naturopathic: 0,
      "well-services": 0,
    };
    for (const p of allPartners) c[p.category]++;
    return c;
  }, [allPartners]);

  const toggle = (cat: PartnerCategory) => {
    setActive((s) => {
      const next = new Set(s);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header + manual scan trigger */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "Merriweather, Georgia, serif",
              fontSize: 22,
              fontWeight: 700,
              color: "#2d4a2d",
            }}
          >
            🗺️ Olympic Peninsula partner map
          </div>
          <div style={{ fontSize: 13, color: "#7a857a", marginTop: 4 }}>
            {allPartners.length} candidate{allPartners.length === 1 ? "" : "s"}
            {scoutedLoaded && scouted.length > 0
              ? ` (${PARTNERS.length} curated + ${scouted.length} auto-scouted)`
              : ""}
            {" "}· Sequim HQ at center · service rings 10 / 25 / 50 mi
          </div>
        </div>
        <ScanWithProgress
          endpoint="/api/clients/olympic-inspections/scout-now"
          label="Scan now"
          emoji="🛰️"
          busyLabel="scanning Olympic Peninsula…"
          accentColor="#2d4a2d"
          onDone={loadScouted}
        />
      </div>

      {/* Layer toggles */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {(Object.keys(CATEGORY_META) as PartnerCategory[]).map((cat) => {
          const m = CATEGORY_META[cat];
          const on = active.has(cat);
          return (
            <button
              key={cat}
              type="button"
              onClick={() => toggle(cat)}
              style={{
                background: on ? `${m.color}22` : "transparent",
                border: `1px solid ${on ? m.color : "rgba(31,42,28,0.25)"}`,
                color: on ? "#1d331d" : "#7a857a",
                padding: "6px 12px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: m.color,
                  display: "inline-block",
                }}
              />
              {m.emoji} {m.label} · {counts[cat]}
            </button>
          );
        })}
      </div>

      {/* The map */}
      <div
        style={{
          height: 480,
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid rgba(31,42,28,0.10)",
          background: "#020617",
        }}
      >
        <MapContainer
          center={[SEQUIM_HQ.lat, SEQUIM_HQ.lng]}
          zoom={9}
          minZoom={7}
          maxZoom={13}
          scrollWheelZoom
          style={{ height: "100%", width: "100%", background: "#020617" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Service rings — 50 / 25 / 10 mi from Sequim HQ */}
          <Circle
            center={[SEQUIM_HQ.lat, SEQUIM_HQ.lng]}
            radius={RING_50_MI}
            pathOptions={{
              color: "#facc15",
              weight: 0.8,
              fillColor: "#facc15",
              fillOpacity: 0.02,
              dashArray: "4,6",
            }}
          />
          <Circle
            center={[SEQUIM_HQ.lat, SEQUIM_HQ.lng]}
            radius={RING_25_MI}
            pathOptions={{
              color: "#facc15",
              weight: 1,
              fillColor: "#facc15",
              fillOpacity: 0.04,
              dashArray: "4,6",
            }}
          />
          <Circle
            center={[SEQUIM_HQ.lat, SEQUIM_HQ.lng]}
            radius={RING_10_MI}
            pathOptions={{
              color: "#facc15",
              weight: 1.2,
              fillColor: "#facc15",
              fillOpacity: 0.06,
              dashArray: "4,6",
            }}
          />

          {/* HQ marker */}
          <CircleMarker
            center={[SEQUIM_HQ.lat, SEQUIM_HQ.lng]}
            radius={9}
            pathOptions={{
              color: "#facc15",
              fillColor: "#facc15",
              fillOpacity: 0.8,
              weight: 2,
            }}
          >
            <Tooltip permanent direction="top" offset={[0, -8]}>
              <strong>OIT HQ · Sequim</strong>
            </Tooltip>
          </CircleMarker>

          {/* Partner dots */}
          {visiblePartners.map((p) => {
            const m = CATEGORY_META[p.category];
            return (
              <CircleMarker
                key={p.id}
                center={[p.lat, p.lng]}
                radius={7}
                pathOptions={{
                  color: m.color,
                  fillColor: m.color,
                  fillOpacity: 0.7,
                  weight: 1.5,
                }}
                eventHandlers={{ click: () => setFocused(p) }}
              >
                <Tooltip direction="top" offset={[0, -6]}>
                  {m.emoji} <strong>{p.name}</strong>
                  <br />
                  <span style={{ fontSize: 11 }}>{p.city}</span>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      {/* Focused-partner detail panel */}
      {focused && (
        <div
          style={{
            background: "#fff",
            border: "1px solid rgba(31,42,28,0.12)",
            borderRadius: 10,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>
              {CATEGORY_META[focused.category].emoji}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#2d4a2d" }}>
                {focused.name}
              </div>
              <div style={{ fontSize: 12, color: "#7a857a" }}>
                {CATEGORY_META[focused.category].label} · {focused.city}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFocused(null)}
              style={{
                background: "transparent",
                border: "none",
                color: "#7a857a",
                fontSize: 18,
                cursor: "pointer",
              }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div
            style={{
              fontSize: 13,
              lineHeight: 1.5,
              color: "#4a5547",
              fontStyle: "italic",
              borderLeft: "3px solid rgba(45,74,45,0.3)",
              paddingLeft: 10,
            }}
          >
            <strong style={{ color: "#2d4a2d" }}>Pitch angle:</strong>{" "}
            {focused.pitch}
          </div>
          {/* Action row — Call / Open site / Mark as called.
              "Mark as called" only renders for scouted rows (have
              a dbId). Curated seed pins lack a DB row to update. */}
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginTop: 4,
            }}
          >
            {focused.phone && (
              <a
                href={`tel:${focused.phone}`}
                style={{
                  padding: "7px 12px",
                  background: "rgba(45,74,45,0.10)",
                  border: "1px solid rgba(45,74,45,0.30)",
                  color: "#2d4a2d",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                📞 Call
              </a>
            )}
            {focused.website && (
              <a
                href={focused.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "7px 12px",
                  background: "transparent",
                  border: "1px solid rgba(45,74,45,0.30)",
                  color: "#4a5547",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                🌐 Site
              </a>
            )}
            {focused.dbId && (
              <button
                type="button"
                onClick={() => markCalled(focused)}
                disabled={markBusy}
                style={{
                  padding: "7px 12px",
                  background:
                    focused.status === "contacted"
                      ? "rgba(31, 42, 28, 0.06)"
                      : "rgba(200, 123, 41, 0.10)",
                  border:
                    focused.status === "contacted"
                      ? "1px solid rgba(31, 42, 28, 0.20)"
                      : "1px solid rgba(200, 123, 41, 0.40)",
                  color:
                    focused.status === "contacted" ? "#7a857a" : "#7a4d18",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: markBusy ? "wait" : "pointer",
                }}
              >
                {markBusy
                  ? "Logging…"
                  : focused.status === "contacted"
                    ? "✓ Already called · log again"
                    : "✅ Mark as called"}
              </button>
            )}
            {markMsg && (
              <span style={{ fontSize: 11, color: "#2d4a2d", alignSelf: "center" }}>
                {markMsg}
              </span>
            )}
          </div>

          {focused.lastContactedAt && (
            <div style={{ fontSize: 11, color: "#7a857a" }}>
              Last contacted{" "}
              {new Date(focused.lastContactedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          )}

          <div style={{ fontSize: 12, color: "#7a857a", marginTop: 4 }}>
            {focused.dbId
              ? "Auto-scouted from Google Places. Updates persist to client_affiliates."
              : "Hand-curated seed. Outreach tracking lives on auto-scouted rows."}
          </div>
        </div>
      )}
    </div>
  );
}

