"use client";

/**
 * Real client testimonials for the audit funnel.
 *
 * VIDEO CHECKLIST — ask each client for a 20-second iPhone video:
 *   "Say your name, your business, and one thing that happened after
 *    your new site launched. Selfie style is totally fine."
 *
 * Once you have a Loom share URL or YouTube link, drop it into the
 * videoUrl field below. The placeholder card auto-swaps to an embed.
 *
 * Site links: fill in custom_site_url once each client's new site is live.
 */

type Testimonial = {
  name: string;
  title: string;
  business: string;
  quote: string;
  // videoUrl can be:
  //   - null                            → shows placeholder
  //   - "https://loom.com/share/..."    → Loom embed
  //   - "https://youtube.com/watch?v=…" → YouTube embed
  //   - "/testimonials/foo.mp4"         → self-hosted <video> with poster
  videoUrl: string | null;
  posterUrl?: string | null; // poster image for self-hosted videos
  siteUrl: string | null;
};

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Luke Wright",
    title: "Owner",
    business: "Pine & Particle Co.",
    quote:
      "Hi, this is Luke with Pine & Particle. I went to Ben with BlueJays looking for a new website and a new backend for marketing — wanted to upgrade my whole brand and get a new name. He did a fantastic job. I'd recommend him to anybody, and I'd strongly recommend you call him.",
    videoUrl: null, // TODO: drop video file at /public/testimonials/luke-wright.mp4 + update this path
    siteUrl: "https://bluejayportfolio.com/sites/olympic-inspections/index.html",
  },
  {
    name: "Michelle Whitlow",
    title: "Executive Director",
    business: "Lewis County Autism Coalition",
    quote:
      "We're a small nonprofit. I couldn't spend thousands on a website. Ben built us something that makes families feel safe before they ever call — multiple people have said our website made them feel like we were the right place. That's everything for us.",
    videoUrl: null, // TODO: get 20s iPhone video from Michelle
    siteUrl: null,  // TODO: add lcautism.org once live
  },
  {
    name: "Erik Hernandez",
    title: "Owner",
    business: "Hector Landscaping & Design",
    // Quote matches Erik's actual spoken words in the video — viewer
    // reads it, presses play, hears the same thing. Trust compounds.
    // Cleaned up for written form (capitalization, punctuation) but
    // preserved his cadence + sentence structure verbatim.
    quote:
      "Before, I had zero online visibility and was losing a lot of potential customers. Now I've been getting a lot of work. I'm extremely satisfied with the website he made me.",
    videoUrl: "/testimonials/hector.mp4",
    posterUrl: "/testimonials/hector-poster.jpg",
    siteUrl: null,  // TODO: add once site is live
  },
  {
    name: "Bonnie Hunsaker",
    title: "Owner",
    business: "Mountain View Landscaping",
    quote:
      "I was worried it would look like a template. It doesn't. My biggest competitor has been in business longer than me and our sites look like equals now — honestly ours might be better. For $997 I wasn't expecting that.",
    videoUrl: null, // TODO: get 20s iPhone video from Bonnie
    siteUrl: null,  // TODO: add once site is live
  },
];

function toEmbedUrl(raw: string): string | null {
  const url = raw.trim();
  const loom = url.match(/loom\.com\/(?:share|embed)\/([a-z0-9]+)/i);
  if (loom) return `https://www.loom.com/embed/${loom[1]}`;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`;
  return null;
}

export default function AuditTestimonials() {
  return (
    <section className="border-b border-white/5 bg-slate-900/30">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-center text-xs uppercase tracking-wider text-sky-400 mb-3 font-semibold">
          Real businesses. Real results.
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
          What happened after the audit
        </h2>
        <p className="text-center text-slate-400 mb-12 max-w-xl mx-auto text-sm">
          These aren&apos;t made up. These are actual clients whose sites we built after the same audit you&apos;re about to run.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((t) => {
            // Self-hosted MP4 lives at "/testimonials/foo.mp4". Loom /
            // YouTube share URLs go through toEmbedUrl. Anything else
            // falls back to the "video coming soon" placeholder.
            const isSelfHosted = !!t.videoUrl && /\.(mp4|webm|mov)(\?|$)/i.test(t.videoUrl);
            const embedUrl = !isSelfHosted && t.videoUrl ? toEmbedUrl(t.videoUrl) : null;
            return (
              <div
                key={t.name}
                className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden flex flex-col"
              >
                {/* Video slot */}
                {isSelfHosted && t.videoUrl ? (
                  <video
                    src={t.videoUrl}
                    poster={t.posterUrl || undefined}
                    controls
                    preload="metadata"
                    playsInline
                    className="w-full aspect-video bg-black"
                  />
                ) : embedUrl ? (
                  <iframe
                    src={embedUrl}
                    title={`${t.name} testimonial`}
                    className="w-full aspect-video bg-black"
                    frameBorder={0}
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  /* Quote-only card header — no video, no "coming soon"
                     copy that signals incomplete brand. Big quote-mark
                     glyph + Verified client badge. Swaps to a video
                     card the moment videoUrl is set. */
                  <div className="w-full aspect-video bg-gradient-to-br from-sky-950/30 via-slate-900 to-slate-950 border-b border-white/5 flex flex-col items-center justify-center gap-4 relative overflow-hidden p-6">
                    {/* Subtle grid pattern */}
                    <div
                      className="absolute inset-0 opacity-[0.04]"
                      style={{
                        backgroundImage:
                          "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                      }}
                    />
                    {/* Big quotation mark glyph — owns the empty space
                        without promising video that isn't there yet */}
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                      className="relative w-14 h-14 text-sky-500/30"
                    >
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                    {/* Trust badge — emerald = "real, audited" */}
                    <div className="relative inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-300">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="w-3 h-3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Verified client
                    </div>
                  </div>
                )}

                {/* Quote + attribution */}
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-slate-200 text-sm leading-relaxed flex-1 mb-4">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/5">
                    <div>
                      <p className="font-semibold text-white text-sm">{t.name}</p>
                      <p className="text-xs text-slate-400">{t.title}, {t.business}</p>
                    </div>
                    {t.siteUrl && (
                      <a
                        href={t.siteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 text-xs text-sky-400 hover:text-sky-300 hover:underline transition-colors"
                      >
                        See their site →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
