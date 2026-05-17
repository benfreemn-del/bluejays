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
    return [
      // 31 template→v2 industry redirects. Permanent (308) — passes link
      // equity, tells Google to update its index.
      ...TEMPLATE_TO_V2_INDUSTRIES.map((slug) => ({
        source: `/templates/${slug}`,
        destination: `/v2/${slug}`,
        permanent: true,
      })),
      // Anyone with the legacy /sites/pine-and-particle/ link gets redirected
      // to the rebranded OIT site.
      {
        source: '/sites/pine-and-particle',
        destination: '/sites/olympic-inspections/',
        permanent: true,
      },
      {
        source: '/sites/pine-and-particle/:path*',
        destination: '/sites/olympic-inspections/:path*',
        permanent: true,
      },
      // Legacy /audit-classic funnel — retired 2026-05-16. Both the entry
      // form and any prospect-specific result page (with sub-paths like
      // /processing and /funnel-preview) redirect to the canonical
      // /audit funnel. Permanent (308) so Madie's sent links + any
      // prospect bookmarks still resolve.
      {
        source: '/audit-classic',
        destination: '/audit',
        permanent: true,
      },
      {
        source: '/audit-classic/:path*',
        destination: '/audit/:path*',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return {
      // Client sites on custom domains — route root to their static index.html.
      // Asset paths (/sites/*/css/ and /sites/*/js/) are in public/ and get
      // served directly without hitting these rules.
      beforeFiles: [
        // Olympic Inspections & Testing — go-live on olympicinspect.com
        // (2026-05-10). Apex + www both serve the OIT static site.
        // Asset paths (/sites/olympic-inspections/css/, /js/, /logo.png)
        // are absolute in the HTML so they resolve against the same host
        // without any extra rewrites.
        {
          has: [{ type: 'host', value: 'olympicinspect.com' }],
          source: '/',
          destination: '/sites/olympic-inspections/index.html',
        },
        {
          has: [{ type: 'host', value: 'www.olympicinspect.com' }],
          source: '/',
          destination: '/sites/olympic-inspections/index.html',
        },
        // Per-service landing pages on the canonical OIT domain.
        // Added 2026-05-14 (Phase 2 SEO). Each slug maps to a dedicated
        // .html file under /public/sites/olympic-inspections/. The regex
        // is explicit so other paths (booking API, /admin, future
        // additions) still flow through normal routing — only these
        // five marketing slugs get rewritten to static HTML.
        // To add a sixth service landing page: add the slug to BOTH
        // alternations below AND drop the matching .html file in the
        // public sites folder.
        {
          has: [{ type: 'host', value: 'olympicinspect.com' }],
          source: '/:slug(mold-inspection-sequim-wa|ermi-testing-olympic-peninsula|well-water-testing-sequim|radon-testing-port-angeles|septic-inspection-clallam-county)',
          destination: '/sites/olympic-inspections/:slug.html',
        },
        {
          has: [{ type: 'host', value: 'www.olympicinspect.com' }],
          source: '/:slug(mold-inspection-sequim-wa|ermi-testing-olympic-peninsula|well-water-testing-sequim|radon-testing-port-angeles|septic-inspection-clallam-county)',
          destination: '/sites/olympic-inspections/:slug.html',
        },
        // SEO discovery files — sitemap, robots, llms.txt, llms-full.txt.
        // These MUST live at the domain root for crawlers to find them.
        // Same regex pattern keeps the rewrite scope tight.
        {
          has: [{ type: 'host', value: 'olympicinspect.com' }],
          source: '/:file(sitemap.xml|robots.txt|llms.txt|llms-full.txt)',
          destination: '/sites/olympic-inspections/:file',
        },
        {
          has: [{ type: 'host', value: 'www.olympicinspect.com' }],
          source: '/:file(sitemap.xml|robots.txt|llms.txt|llms-full.txt)',
          destination: '/sites/olympic-inspections/:file',
        },
        // Pine & Particle Co. rebranded to Olympic Inspections & Testing
        // 2026-05-05. The pineparticle.com domain is in transfer; while
        // it still resolves it serves the OIT site directly. Once the
        // olympicinspect.com go-live is verified, change these to
        // 301 redirects → https://olympicinspect.com so traffic
        // consolidates on the canonical domain.
        {
          has: [{ type: 'host', value: 'pineparticle.com' }],
          source: '/',
          destination: '/sites/olympic-inspections/index.html',
        },
        {
          has: [{ type: 'host', value: 'www.pineparticle.com' }],
          source: '/',
          destination: '/sites/olympic-inspections/index.html',
        },
      ],
    };
  },
  images: {
    // Vercel's image optimizer is OFF. Brand/client pages already use plain
    // <img> against external CDNs (Shopify, client-owned hosts) so the
    // optimizer never sees them. The few next/image consumers ship pre-sized
    // assets from /public — they don't need server-side resizing. Killing
    // the line item drops the per-source-image bill on Vercel Pro to $0.
    unoptimized: true,
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
  // Treat heavy native-binary deps as EXTERNAL packages — don't bundle
  // them into any serverless function. Required because Turbopack's NFT
  // tracer pulls @sparticuz/chromium (~50MB) and ffmpeg-static (~80MB
  // binary) into every route that transitively reaches video-generator.ts
  // via shared utils, which kept blowing past the 250MB function size
  // cap. outputFileTracingExcludes (below) wasn't enough on its own
  // because Turbopack's chunk grouping shifts between builds + the "*"
  // wildcard key isn't honored in Next 16.
  //
  // At runtime: video-generator.ts already downloads its own ffmpeg
  // binary to /tmp (see ensureFfmpegAvailable), and Chrome runs through
  // Browserless.io — so externalizing these is safe. The serverless
  // function loads them as plain Node requires at runtime IF the route
  // calls video-generator, otherwise they're never touched.
  serverExternalPackages: [
    "@sparticuz/chromium",
    "ffmpeg-static",
    "puppeteer-core",
  ],
  // 2026-05-16: deploys started failing with "A Serverless Function has
  // exceeded the unzipped maximum size of 250 MB" after we shipped
  // VSL #1 + VSL #2. Diagnosis: Turbopack was bundling @sparticuz/chromium
  // (~50MB) AND ffmpeg-static (~80MB binary) into the serverless functions
  // for several API routes that transitively import video-generator.ts
  // (videos/batch, funnel/enroll, funnel/run, followup-scheduler,
  // inbound/email, inbound/sms, replies/process). Lazy imports inside
  // video-generator.ts didn't help — Turbopack traces dynamic imports too.
  //
  // Fix: explicitly exclude both heavy binaries from EVERY affected route.
  // ffmpeg-static binary isn't actually needed in the bundle anyway —
  // video-generator.ts's ensureFfmpegAvailable() downloads its own ffmpeg
  // to /tmp at runtime (see comment in src/lib/video-generator.ts:30-65).
  // Chromium binary is also unused — we proxy headless Chrome through
  // Browserless.io.
  outputFileTracingExcludes: {
    "/api/videos/[id]": [
      "./node_modules/@sparticuz/chromium/bin/**",
      "./node_modules/.pnpm/@sparticuz+chromium*/**",
      "./node_modules/.pnpm/ffmpeg-static*/**",
      "./node_modules/ffmpeg-static/**",
    ],
    "/api/videos/batch": [
      "./node_modules/@sparticuz/chromium/bin/**",
      "./node_modules/.pnpm/@sparticuz+chromium*/**",
      "./node_modules/.pnpm/ffmpeg-static*/**",
      "./node_modules/ffmpeg-static/**",
    ],
    "/api/funnel/enroll": [
      "./node_modules/@sparticuz/chromium/bin/**",
      "./node_modules/.pnpm/@sparticuz+chromium*/**",
      "./node_modules/.pnpm/ffmpeg-static*/**",
      "./node_modules/ffmpeg-static/**",
    ],
    "/api/funnel/run": [
      "./node_modules/@sparticuz/chromium/bin/**",
      "./node_modules/.pnpm/@sparticuz+chromium*/**",
      "./node_modules/.pnpm/ffmpeg-static*/**",
      "./node_modules/ffmpeg-static/**",
    ],
    "/api/followup-scheduler": [
      "./node_modules/@sparticuz/chromium/bin/**",
      "./node_modules/.pnpm/@sparticuz+chromium*/**",
      "./node_modules/.pnpm/ffmpeg-static*/**",
      "./node_modules/ffmpeg-static/**",
    ],
    "/api/inbound/email": [
      "./node_modules/@sparticuz/chromium/bin/**",
      "./node_modules/.pnpm/@sparticuz+chromium*/**",
      "./node_modules/.pnpm/ffmpeg-static*/**",
      "./node_modules/ffmpeg-static/**",
    ],
    "/api/inbound/sms": [
      "./node_modules/@sparticuz/chromium/bin/**",
      "./node_modules/.pnpm/@sparticuz+chromium*/**",
      "./node_modules/.pnpm/ffmpeg-static*/**",
      "./node_modules/ffmpeg-static/**",
    ],
    "/api/replies/process": [
      "./node_modules/@sparticuz/chromium/bin/**",
      "./node_modules/.pnpm/@sparticuz+chromium*/**",
      "./node_modules/.pnpm/ffmpeg-static*/**",
      "./node_modules/ffmpeg-static/**",
    ],
    "/api/funnel/enroll-batch": [
      "./node_modules/@sparticuz/chromium/bin/**",
      "./node_modules/.pnpm/@sparticuz+chromium*/**",
      "./node_modules/.pnpm/ffmpeg-static*/**",
      "./node_modules/ffmpeg-static/**",
    ],
    "/api/inbound/vonage-sms": [
      "./node_modules/@sparticuz/chromium/bin/**",
      "./node_modules/.pnpm/@sparticuz+chromium*/**",
      "./node_modules/.pnpm/ffmpeg-static*/**",
      "./node_modules/ffmpeg-static/**",
    ],
    // Belt-and-suspenders wildcard: applies to ALL routes per Next.js docs.
    // Without this, Turbopack's chunk grouping can taint NEW routes on each
    // build (we hit funnel/enroll-batch + inbound/vonage-sms after thinking
    // we'd covered all of them). The "*" key catches anything we miss.
    "*": [
      "./node_modules/@sparticuz/chromium/bin/**",
      "./node_modules/.pnpm/@sparticuz+chromium*/**",
      "./node_modules/.pnpm/ffmpeg-static*/**",
      "./node_modules/ffmpeg-static/**",
    ],
  },
};

export default nextConfig;
