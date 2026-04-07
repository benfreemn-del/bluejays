"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface ProspectData {
  businessName: string;
  currentWebsite?: string;
  generatedSiteUrl?: string;
  category: string;
  googleRating?: number;
  reviewCount?: number;
}

export default function ComparePage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<ProspectData | null>(null);

  useEffect(() => {
    fetch(`/api/prospects/${id}`)
      .then((r) => r.json())
      .then((d) => { if (!d.error) setData(d); })
      .catch(() => {});
  }, [id]);

  if (!data) {
    return <div className="min-h-screen bg-[#050a14] flex items-center justify-center text-white/50">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#050a14] text-white">
      {/* Header */}
      <div className="text-center py-12 px-6">
        <p className="text-sky-400 text-xs font-bold uppercase tracking-[0.25em] mb-3">Side-by-Side Comparison</p>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
          See the <span className="text-sky-400">difference</span>
        </h1>
        <p className="text-white/50 text-lg max-w-xl mx-auto">
          Your current website vs. the premium site we built for {data.businessName}
        </p>
      </div>

      {/* Comparison */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Before */}
          <div className="rounded-2xl border border-red-500/20 overflow-hidden">
            <div className="bg-red-500/10 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="font-bold text-sm">Current Website</span>
              </div>
              <span className="text-xs text-red-400">BEFORE</span>
            </div>
            <div className="aspect-[16/10] bg-[#0a0a0a] relative">
              {data.currentWebsite ? (
                <iframe
                  src={data.currentWebsite}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts"
                  title="Current website"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center px-8">
                  <div className="text-5xl mb-4 opacity-30">🚫</div>
                  <p className="text-white/40 text-lg font-semibold mb-2">No Website Found</p>
                  <p className="text-white/30 text-sm">
                    {data.businessName} doesn&apos;t have a website yet. That means potential customers are going to competitors instead.
                  </p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-red-500/5">
              <div className="grid grid-cols-3 gap-4 text-center text-xs">
                <div>
                  <p className="text-red-400 font-bold">Slow</p>
                  <p className="text-white/30">Load Speed</p>
                </div>
                <div>
                  <p className="text-red-400 font-bold">Outdated</p>
                  <p className="text-white/30">Design</p>
                </div>
                <div>
                  <p className="text-red-400 font-bold">Poor</p>
                  <p className="text-white/30">Mobile</p>
                </div>
              </div>
            </div>
          </div>

          {/* After */}
          <div className="rounded-2xl border border-green-500/20 overflow-hidden">
            <div className="bg-green-500/10 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="font-bold text-sm">Your New Website</span>
              </div>
              <span className="text-xs text-green-400">AFTER</span>
            </div>
            <div className="aspect-[16/10] bg-[#0a0a0a] relative">
              {data.generatedSiteUrl ? (
                <iframe
                  src={data.generatedSiteUrl}
                  className="w-full h-full border-0"
                  title="New website preview"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white/30">
                  Preview not generated yet
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-green-500/5">
              <div className="grid grid-cols-3 gap-4 text-center text-xs">
                <div>
                  <p className="text-green-400 font-bold">90+</p>
                  <p className="text-white/30">PageSpeed</p>
                </div>
                <div>
                  <p className="text-green-400 font-bold">Modern</p>
                  <p className="text-white/30">Design</p>
                </div>
                <div>
                  <p className="text-green-400 font-bold">Perfect</p>
                  <p className="text-white/30">Mobile</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href={`/claim/${id}`}
            className="inline-flex items-center gap-3 h-14 px-8 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-lg hover:shadow-[0_0_40px_rgba(14,165,233,0.4)] transition-all duration-300"
          >
            Claim Your New Website — $997
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
          <p className="text-white/30 text-sm mt-4">
            One-time investment. Includes everything. Live within 48 hours.
          </p>
        </div>
      </div>
    </div>
  );
}
