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

import { useMemo, useState } from "react";
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
  | "commercial-property";

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
};

const RING_10_MI = 10 * 1609.344;
const RING_25_MI = 25 * 1609.344;
const RING_50_MI = 50 * 1609.344;

export default function OitPartnerMap() {
  const [active, setActive] = useState<Set<PartnerCategory>>(
    new Set([
      "realtor",
      "mold-remediation",
      "water-damage",
      "property-management",
      "commercial-property",
    ]),
  );
  const [focused, setFocused] = useState<Partner | null>(null);

  const visiblePartners = useMemo(
    () => PARTNERS.filter((p) => active.has(p.category)),
    [active],
  );

  const counts = useMemo(() => {
    const c: Record<PartnerCategory, number> = {
      realtor: 0,
      "mold-remediation": 0,
      "water-damage": 0,
      "property-management": 0,
      "commercial-property": 0,
    };
    for (const p of PARTNERS) c[p.category]++;
    return c;
  }, []);

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
      {/* Header */}
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
          {PARTNERS.length} affiliate + commercial-buyer candidates · Sequim HQ
          at center · service rings 10 / 25 / 50 mi
        </div>
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
          <div style={{ fontSize: 12, color: "#7a857a", marginTop: 4 }}>
            Hand-curated v1 dataset. Future: auto-feed from Google Places +
            LinkedIn scout once the partner-targets cron lands.
          </div>
        </div>
      )}
    </div>
  );
}
