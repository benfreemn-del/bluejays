import nextDynamic from "next/dynamic";
import Link from "next/link";

/**
 * /dashboard/tekky-map — Tekky lead-discovery map.
 *
 * Visual scout layer for the Zenith/TEKKY business: shows where the
 * highest-density "soccer towns" are across the US, sized by population,
 * with golden-glow overlays for places we've curated as strong soccer
 * markets per audience (parents / coaches / players).
 *
 * The actual Leaflet map is client-only (DOM + window dependencies), so
 * we dynamic-import it with ssr:false and render a small skeleton
 * during the initial paint.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TekkyMapClient = nextDynamic(() => import("./map.client"), {
  ssr: false,
  loading: () => (
    <div className="h-[calc(100vh-64px)] w-full flex items-center justify-center bg-[#070a13] text-slate-500">
      Loading map…
    </div>
  ),
});

export default function TekkyMapPage() {
  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#070a13]/90 backdrop-blur">
        <div className="mx-auto max-w-[1600px] px-4 py-3 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-[11px] tracking-[0.22em] uppercase font-bold text-slate-400 hover:text-white"
          >
            ← Dashboard
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold tracking-tight truncate">
              ⚽ Tekky lead-scrape map
              <span className="text-slate-500 font-normal ml-2">
                / soccer-town overlay
              </span>
            </h1>
            <div className="text-[11px] text-slate-500">
              Population-sized bullets · golden glow on curated soccer towns ·
              hover for detail · click a state to lock the top-10 sidebar
            </div>
          </div>
        </div>
      </header>
      <TekkyMapClient />
    </div>
  );
}
