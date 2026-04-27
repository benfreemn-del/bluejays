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
  videoUrl: string | null; // Loom share URL or YouTube — null shows placeholder
  siteUrl: string | null;  // link to their live site once it's ready
};

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Luke Wright",
    title: "Owner",
    business: "Pine & Particle Co.",
    quote:
      "I make custom furniture. I didn't think a website would change what I charge or who comes through the door. The audit flagged three specific things I'd never thought about — and after the new site went up, the people reaching out were a completely different caliber. Better projects, better budgets.",
    videoUrl: null, // TODO: get 20s iPhone video from Luke
    siteUrl: "https://bluejayportfolio.com/sites/pine-and-particle/",
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
    quote:
      "I honestly thought my old site was fine. The audit showed it wasn't even loading right on phones and my call button was broken on half the browsers. Things I never would've caught. New site's been up a few months and this has been my best spring.",
    videoUrl: null, // TODO: get 20s iPhone video from Erik
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
            const embedUrl = t.videoUrl ? toEmbedUrl(t.videoUrl) : null;
            return (
              <div
                key={t.name}
                className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden flex flex-col"
              >
                {/* Video slot */}
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    title={`${t.name} testimonial`}
                    className="w-full aspect-video bg-black"
                    frameBorder={0}
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  /* Placeholder — swaps out the moment videoUrl is filled in */
                  <div className="w-full aspect-video bg-slate-950 border-b border-white/5 flex flex-col items-center justify-center gap-3 relative overflow-hidden">
                    {/* Subtle grid pattern */}
                    <div
                      className="absolute inset-0 opacity-[0.04]"
                      style={{
                        backgroundImage:
                          "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                      }}
                    />
                    {/* Play button */}
                    <div className="relative w-14 h-14 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-sky-400 ml-0.5">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <p className="relative text-xs text-slate-500 font-medium">Video coming soon</p>
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
