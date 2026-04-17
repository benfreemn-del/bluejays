"use client";

/**
 * Image Audit — manual review tool for the image-mapper stock library.
 *
 * Renders every category's slots as a numbered grid. The human reviewer
 * scans each image, compares it to the label, and jots down the numbers
 * of slots where the photo doesn't match. Claude then removes those slots
 * from src/app/image-mapper/[id]/page.tsx.
 *
 * Each row: [#NNN] [image] label  — click the image to open the full-size
 * Unsplash photo in a new tab. Click the "COPY" button to copy the ID list
 * to your clipboard.
 */

import { useMemo, useState } from "react";

// Pulled directly from src/app/image-mapper/[id]/page.tsx THEME_LIBRARY.
// Keep in sync if you add/remove slots — this page is display-only.
const THEME_LIBRARY: Record<string, { url: string; name: string }[]> = {
  dental: [
    { url: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80", name: "dentist-at-work" },
    { url: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80", name: "dental-consultation" },
    { url: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=800&q=80", name: "bright-smile" },
    { url: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&q=80", name: "dental-chair" },
    { url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80", name: "dental-office" },
    { url: "https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=800&q=80", name: "dental-hygienist" },
    { url: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800&q=80", name: "office-interior" },
    { url: "https://images.unsplash.com/photo-1593022356769-11f762e25ed9?w=800&q=80", name: "dental-instruments" },
    { url: "https://images.unsplash.com/photo-1667133295315-820bb6481730?w=800&q=80", name: "dental-exam" },
  ],
};

// Load full library at runtime from the mapper file via fetch (simpler than
// duplicating 400+ entries). Falls back to the small inline sample above.
export default function ImageAuditPage() {
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [library, setLibrary] = useState<Record<string, { url: string; name: string }[]>>(THEME_LIBRARY);
  const [loading, setLoading] = useState(true);

  // Fetch the full library on mount by reading the mapper source file.
  // The mapper route is /image-mapper/[id] so we can't directly import
  // THEME_LIBRARY from a client component — instead we ship a helper
  // API route that returns it. If the API isn't there, we just use the
  // inline sample above.
  useMemo(() => {
    fetch("/api/image-audit/library")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data === "object") setLibrary(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Flatten all slots into a single numbered list for easy reference.
  const entries = useMemo(() => {
    const out: { n: number; category: string; name: string; url: string }[] = [];
    let n = 1;
    for (const [category, slots] of Object.entries(library)) {
      for (const slot of slots) {
        out.push({ n, category, name: slot.name, url: slot.url });
        n++;
      }
    }
    return out;
  }, [library]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => set.add(e.category));
    return Array.from(set).sort();
  }, [entries]);

  const toggleFlag = (n: number) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };

  const flaggedList = Array.from(flagged).sort((a, b) => a - b).join(", ");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold mb-2">Image Mapper Audit</h1>
            <p className="text-white/60 text-sm max-w-2xl">
              Click any image that DOESN&apos;T match its label to flag it for removal.
              The flagged list updates live below — copy it and paste back to Claude
              to have those slots removed from the mapper.
            </p>
          </div>
          <div className="text-right text-sm text-white/60 space-y-1">
            <div>{entries.length} slots · {categories.length} categories</div>
            <div className="text-red-300">{flagged.size} flagged for removal</div>
          </div>
        </div>

        <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur border-b border-white/10 py-3 mb-4 -mx-6 px-6">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs uppercase tracking-wider text-white/40">
              Flagged IDs
            </span>
            <code className="flex-1 min-w-[280px] text-sm text-red-300 bg-black/50 border border-white/10 rounded px-3 py-2 font-mono">
              {flaggedList || "(none flagged yet)"}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(flaggedList)}
              disabled={flagged.size === 0}
              className="rounded-lg bg-sky-500/20 border border-sky-500/40 px-4 py-2 text-sm text-sky-200 hover:bg-sky-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Copy
            </button>
            <button
              onClick={() => setFlagged(new Set())}
              disabled={flagged.size === 0}
              className="rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center text-white/40 py-12">
            Loading full library...
          </div>
        )}

        {categories.map((category) => {
          const rows = entries.filter((e) => e.category === category);
          return (
            <section key={category} className="mb-10">
              <h2 className="text-xl font-bold mb-3 capitalize text-sky-300">
                {category.replace(/-/g, " ")}{" "}
                <span className="text-xs font-normal text-white/40 ml-2">
                  ({rows.length} slot{rows.length === 1 ? "" : "s"})
                </span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {rows.map((e) => {
                  const isFlagged = flagged.has(e.n);
                  return (
                    <div
                      key={e.n}
                      onClick={() => toggleFlag(e.n)}
                      className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                        isFlagged
                          ? "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                          : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={e.url}
                        alt={e.name}
                        className="w-full h-48 object-cover bg-black/40"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2 rounded-md bg-black/80 border border-white/20 px-2 py-1 text-xs font-mono font-bold">
                        #{e.n}
                      </div>
                      {isFlagged && (
                        <div className="absolute top-2 right-2 rounded-md bg-red-500 text-white px-2 py-1 text-xs font-bold">
                          REMOVE
                        </div>
                      )}
                      <div className={`px-3 py-2 text-xs ${isFlagged ? "bg-red-500/20" : "bg-black/60"}`}>
                        <div className="font-semibold truncate">{e.name}</div>
                        <a
                          href={e.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(evt) => evt.stopPropagation()}
                          className="text-white/40 hover:text-white/70 underline text-[10px]"
                        >
                          Open full-size ↗
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
