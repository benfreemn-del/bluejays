"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Prospect {
  id: string;
  businessName: string;
  category: string;
  currentWebsite: string;
  status: string;
  scrapedData?: { photos?: string[] };
  imageMapping?: {
    images: { status: string }[];
    selectionStatus: string;
    lastUpdated: string;
  };
}

export default function ImageMapperLeadsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("/api/prospects?limit=200", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const list = data.prospects || data.data || data || [];
        // Only show prospects that aren't dismissed
        const active = list.filter((p: Prospect) => p.status !== "dismissed");
        setProspects(active);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter
    ? prospects.filter(
        (p) =>
          p.businessName.toLowerCase().includes(filter.toLowerCase()) ||
          p.category.toLowerCase().includes(filter.toLowerCase())
      )
    : prospects;

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0d1321]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold">Image Mapper</h1>
            <nav className="flex gap-1">
              <span className="px-4 py-2 rounded-lg bg-white/10 text-sm font-semibold">
                Leads
              </span>
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
              >
                Dashboard
              </Link>
            </nav>
          </div>
          <input
            type="text"
            placeholder="Search leads..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 w-64"
          />
        </div>
      </header>

      {/* Table */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-20 text-white/40">Loading leads...</div>
        ) : (
          <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">
                  <th className="px-6 py-4">Lead Name</th>
                  <th className="px-6 py-4">Industry</th>
                  <th className="px-6 py-4">Website</th>
                  <th className="px-6 py-4 text-center"># Images</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const imgMap = (p as Record<string, unknown>).imageMapping || (p.scrapedData as Record<string, unknown>)?.imageMapping;
                  const im = imgMap as { images?: { status: string }[]; selectionStatus?: string } | undefined;
                  const imageCount =
                    im?.images?.length ||
                    p.scrapedData?.photos?.length ||
                    0;
                  const mappingStatus = im?.selectionStatus;
                  const replaced =
                    im?.images?.filter(
                      (i) => i.status === "replaced" || i.status === "keep-original"
                    ).length || 0;

                  return (
                    <tr
                      key={p.id}
                      className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/image-mapper/${p.id}`}
                          className="text-sm font-semibold text-blue-400 hover:text-blue-300 hover:underline"
                        >
                          {p.businessName}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white/70 capitalize">
                          {p.category.replace(/-/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {p.currentWebsite ? (
                          <a
                            href={p.currentWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-white/40 hover:text-white/60 truncate block max-w-[200px]"
                          >
                            {p.currentWebsite.replace(/https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                          </a>
                        ) : (
                          <span className="text-xs text-white/20">No website</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-white/60">
                          {imageCount > 0 ? imageCount : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {mappingStatus === "completed" ? (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 font-semibold">
                            Completed
                          </span>
                        ) : mappingStatus === "in-progress" ? (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 font-semibold">
                            In Progress ({replaced}/{im?.images?.length || 0})
                          </span>
                        ) : (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-white/30">
                            Not Started
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-white/30 text-sm">
                {filter ? "No leads match your search" : "No leads found"}
              </div>
            )}
          </div>
        )}
        <p className="text-xs text-white/20 mt-4 text-center">
          {filtered.length} leads • Click a lead name to map images
        </p>
      </main>
    </div>
  );
}
