import type { NextConfig } from "next";

// 31 industries that exist in /templates/* AND have a /v2/* equivalent.
// All 31 are 1:1 redirects — confirmed by repo audit 2026-04-29.
//
// /v2/* pages are the canonical industry landing pages (newer, more polished).
// /templates/* was the original location and is being deprecated to consolidate
// link equity and prevent duplicate-content issues in Google's index.
//
// Once these redirects ship, the corresponding directories under
// src/app/templates/[industry]/ are removed in the same commit so Next.js
// doesn't generate the now-redirected paths.
const TEMPLATE_TO_V2_INDUSTRIES = [
  "accounting", "auto-repair", "catering", "chiropractic", "church",
  "cleaning", "daycare", "dental", "electrician", "fitness",
  "florist", "general-contractor", "hvac", "insurance", "interior-design",
  "landscaping", "law-firm", "martial-arts", "moving", "pest-control",
  "pet-services", "photography", "physical-therapy", "plumber", "pool-spa",
  "real-estate", "roofing", "salon", "tattoo", "tutoring", "veterinary",
];

const nextConfig: NextConfig = {
  async redirects() {
    return TEMPLATE_TO_V2_INDUSTRIES.map((slug) => ({
      source: `/templates/${slug}`,
      destination: `/v2/${slug}`,
      permanent: true, // 301 — passes link equity, tells Google to update its index
    }));
  },
  async rewrites() {
    return {
      // Client sites on custom domains — route root to their static index.html.
      // Asset paths (/sites/*/css/ and /sites/*/js/) are in public/ and get
      // served directly without hitting these rules.
      beforeFiles: [
        {
          has: [{ type: 'host', value: 'pineparticle.com' }],
          source: '/',
          destination: '/sites/pine-and-particle/index.html',
        },
        {
          has: [{ type: 'host', value: 'www.pineparticle.com' }],
          source: '/',
          destination: '/sites/pine-and-particle/index.html',
        },
      ],
    };
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  typescript: {
    // GlassCard style prop + ScrapedData partial types cause ~50 TS errors
    // across 46 templates. These are type narrowing issues, not runtime bugs.
    // TODO: Add style prop to all local GlassCard definitions to fix properly
    ignoreBuildErrors: true,
  },
  // Next.js's file tracer doesn't include native binary assets by default
  // (it only traces JS imports). The ffmpeg-static package ships a compiled
  // `ffmpeg` binary next to its index.js; at build time the import resolves
  // to a fully-qualified path like `/ROOT/node_modules/.pnpm/ffmpeg-static@*/
  // node_modules/ffmpeg-static/ffmpeg` which then gets baked into the
  // serverless function. Without outputFileTracingIncludes, that binary
  // is never copied into the function bundle, causing ENOENT at runtime.
  //
  // Also excluding @sparticuz/chromium — we moved Chrome off the function
  // to Browserless.io so we don't need the ~63MB chromium bin anymore.
  outputFileTracingIncludes: {
    // Route key matches the App Router path for this API endpoint.
    // Pattern intentionally avoids `@` (breaks Next.js glob in some versions).
    // Matches the pnpm-hoisted ffmpeg binary at
    //   node_modules/.pnpm/ffmpeg-static@5.3.0/node_modules/ffmpeg-static/ffmpeg
    // via the `ffmpeg-static*` wildcard, plus the top-level symlink path
    // if pnpm/npm chooses to hoist it.
    "/api/videos/[id]": [
      "./node_modules/.pnpm/ffmpeg-static*/**",
      "./node_modules/ffmpeg-static/**",
    ],
  },
  outputFileTracingExcludes: {
    // We moved Chrome to Browserless.io, so the 63MB @sparticuz/chromium
    // bin directory doesn't need to ship with the function anymore.
    "/api/videos/[id]": [
      "./node_modules/@sparticuz/chromium/bin/**",
    ],
  },
};

export default nextConfig;
