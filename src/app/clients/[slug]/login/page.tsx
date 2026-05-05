"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * /clients/[slug]/login — owner sign-in page for the per-client portal.
 *
 * Renders a minimal centered form. Branding is intentionally subtle
 * (slug only, no client logo) so the page works for every client
 * without per-slug overrides. Success → /clients/{slug}/portal.
 *
 * Linked from the showcase footer with the "Owner login" entry. Anyone
 * who knows the slug can hit this URL directly — that's intentional.
 * Auth is gated by email + password, not URL discovery.
 */

export default function ClientLoginPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/client-portal/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          slug,
        }),
      });
      const j = (await r.json()) as { ok: boolean; error?: string; slug?: string };
      if (!j.ok) {
        setError(j.error || "Login failed");
        setLoading(false);
        return;
      }
      const targetSlug = j.slug || slug;
      router.push(`/clients/${targetSlug}/portal`);
    } catch {
      setError("Network error. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col">
      {/* Decorative top glow */}
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[150px] pointer-events-none"
      />

      <main className="relative flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <Link
            href={`/clients/${slug}`}
            className="block text-[11px] tracking-[0.28em] uppercase text-slate-500 hover:text-slate-300 mb-6"
          >
            ← Back to site
          </Link>

          <h1 className="text-3xl font-black tracking-tight mb-1">
            Owner sign-in
          </h1>
          <p className="text-sm text-slate-400 mb-8">
            Manage your leads, ads, and weekly reports. <br />
            Account: <span className="text-slate-300">{humanizeSlug(slug)}</span>
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500 block mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-md px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-500 block mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-md px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition"
              />
            </div>

            {error && (
              <div className="text-[12px] text-rose-400 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm tracking-tight py-3 rounded-md transition disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-[11px] text-slate-500 leading-relaxed">
            Forgot your password? Email{" "}
            <a href="mailto:bluejaycontactme@gmail.com" className="text-blue-400 hover:underline">
              bluejaycontactme@gmail.com
            </a>{" "}
            and we&apos;ll reset it for you.
          </p>
        </div>
      </main>

      <footer className="relative py-6 px-5 text-center text-[10px] tracking-[0.22em] uppercase text-slate-700">
        Operated by{" "}
        <a
          href="https://bluejayportfolio.com"
          className="hover:text-slate-500"
        >
          BlueJays
        </a>
      </footer>
    </div>
  );
}

// Per-slug branding overrides for headers / display. Mirrors the
// portal's SLUG_DISPLAY_NAME so "itc-quick-attach" reads as "ITC Quick
// Attach" instead of the title-case fallback.
const SLUG_DISPLAY_NAME: Record<string, string> = {
  "itc-quick-attach": "ITC Quick Attach",
  "zenith-sports": "Zenith Sports",
  "hector-landscaping": "Hector Landscaping",
  "ps-reiki": "PS Reiki",
  "heale-counseling": "Heale Counseling",
};

function humanizeSlug(slug: string): string {
  if (SLUG_DISPLAY_NAME[slug]) return SLUG_DISPLAY_NAME[slug];
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
