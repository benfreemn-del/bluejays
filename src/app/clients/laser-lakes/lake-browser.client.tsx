"use client";

/**
 * LakeBrowser — searchable index of every lake in Nate's catalog.
 *
 * Drops onto the laser-lakes homepage as the answer to "is my lake on
 * the list?" — the single biggest objection on a custom-map site.
 * Type-ahead search by lake name / state / region; tap a result to
 * jump straight to the configurator pre-filled with that lake.
 */

import { useMemo, useState } from "react";
import { LAKES, STATES_WITH_LAKES, searchLakes, type Lake } from "@/data/laser-lakes-catalog";

export function LakeBrowser({
  onPick,
}: {
  onPick?: (lake: Lake) => void;
}) {
  const [q, setQ] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("");

  const results = useMemo(() => {
    let r = searchLakes(q, 200);
    if (stateFilter) r = r.filter((l) => l.state === stateFilter);
    return r;
  }, [q, stateFilter]);

  return (
    <div className="w-full">
      {/* Search input + state filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <span
            className="absolute left-4 top-1/2 -translate-y-1/2 text-lg pointer-events-none"
            aria-hidden
          >
            🔍
          </span>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search lakes — Mille Lacs, Tahoe, Winnipesaukee…"
            className="w-full pl-12 pr-4 py-4 rounded-md text-base sm:text-lg border-2 transition focus:outline-none"
            style={{
              backgroundColor: "rgba(43, 36, 28, 0.04)",
              borderColor: "rgba(43, 36, 28, 0.15)",
              color: "#2b241c",
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "rgba(43, 36, 28, 0.5)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "rgba(43, 36, 28, 0.15)")
            }
          />
        </div>
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="px-4 py-4 rounded-md text-base border-2 transition focus:outline-none"
          style={{
            backgroundColor: "rgba(43, 36, 28, 0.04)",
            borderColor: "rgba(43, 36, 28, 0.15)",
            color: "#2b241c",
          }}
        >
          <option value="">All states</option>
          {STATES_WITH_LAKES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Result strip · count */}
      <div
        className="text-xs uppercase tracking-[0.2em] mb-4 font-bold"
        style={{ color: "rgba(43, 36, 28, 0.55)" }}
      >
        {results.length} {results.length === 1 ? "lake" : "lakes"}
        {q || stateFilter ? " matched" : " in the catalog"} · {LAKES.length} total
      </div>

      {/* Result grid */}
      {results.length === 0 ? (
        <div
          className="text-center py-12 rounded-md border-2 border-dashed"
          style={{
            borderColor: "rgba(43, 36, 28, 0.18)",
            color: "rgba(43, 36, 28, 0.65)",
          }}
        >
          <div className="text-3xl mb-3">🌊</div>
          <p className="font-semibold mb-1">Don&apos;t see your lake?</p>
          <p className="text-sm">
            Nate adds new lakes weekly. Start a custom order and we&apos;ll cut
            the contour file from scratch — same price, same lead time.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {results.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => onPick?.(l)}
                className="group w-full text-left p-4 rounded-md border-2 transition-all hover:translate-y-[-1px]"
                style={{
                  backgroundColor: "rgba(43, 36, 28, 0.02)",
                  borderColor: "rgba(43, 36, 28, 0.1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(43, 36, 28, 0.4)";
                  e.currentTarget.style.backgroundColor = "rgba(43, 36, 28, 0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(43, 36, 28, 0.1)";
                  e.currentTarget.style.backgroundColor = "rgba(43, 36, 28, 0.02)";
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span
                    className="font-bold text-base leading-snug"
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      color: "#2b241c",
                    }}
                  >
                    {l.name}
                  </span>
                  <span
                    className="text-[10px] tracking-[0.18em] uppercase font-extrabold px-1.5 py-0.5 rounded shrink-0"
                    style={{
                      backgroundColor: "rgba(43, 36, 28, 0.12)",
                      color: "rgba(43, 36, 28, 0.7)",
                    }}
                  >
                    {l.state}
                  </span>
                </div>
                {(l.region || l.hint) && (
                  <div
                    className="text-[12px] leading-snug"
                    style={{ color: "rgba(43, 36, 28, 0.55)" }}
                  >
                    {[l.region, l.hint].filter(Boolean).join(" · ")}
                  </div>
                )}
                <div
                  className="mt-2 text-[11px] tracking-[0.18em] uppercase font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: "#5b3d1f" }}
                >
                  Cut my map →
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LakeBrowser;
