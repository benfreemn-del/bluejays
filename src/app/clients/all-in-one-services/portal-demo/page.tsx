"use client";

/* eslint-disable @next/next/no-img-element */

/**
 * /clients/all-in-one-services/portal-demo
 *
 * Owner-only backend preview for Kyle. Linked from the BlueJay-bird
 * icon in the marketing-site footer. Single-password gate (Kyle gets
 * the code in person; rotate the constant below to revoke).
 *
 * This is a STUB. The full mock backend (leads / projects / invoices
 * / schedule, Meyer Electric portal-demo pattern) is queued — Ben
 * builds it when he greenlights the AI System pitch.
 */

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  LockKey,
  House,
  ChartLineUp,
  Calendar,
  Receipt,
  Sparkle,
  Quotes,
} from "@phosphor-icons/react";
import AIOSMark from "../aios-mark";

// Rotate this to revoke access. Kyle gets the code verbally — don't
// drop it in any client-facing email or social post.
const GATE_CODE = "kyle2016";

const BG = "#f5ede0"; // Paper (matches the main site)
const BG_PANEL = "#fbf6ec"; // Brighter cream
const INK = "#1a1612"; // Espresso
const INK_SOFT = "rgba(26, 22, 18, 0.75)";
const INK_DIM = "rgba(26, 22, 18, 0.50)";
const RULE = "rgba(26, 22, 18, 0.12)";
const ACCENT = "#d97706";
const ACCENT_DARK = "#92400e";
const ACCENT_LIGHT = "#fbbf24";
const ACCENT_DIM = "rgba(217, 119, 6, 0.22)";
const COPPER_GRAD = `linear-gradient(135deg, ${ACCENT_LIGHT} 0%, ${ACCENT} 55%, ${ACCENT_DARK} 100%)`;
const FONT_HEAD = "'Space Grotesk', sans-serif";
const FONT_BODY = "'Inter', sans-serif";

const PORTAL_PREVIEW: Array<{ icon: React.ReactNode; title: string; body: string }> = [
  {
    icon: <ChartLineUp size={22} weight="duotone" />,
    title: "Live leads dashboard",
    body:
      "Every inquiry from the site, missed-call recovery SMS, and Facebook reply landing in one inbox. Tap-to-call, tap-to-text, tap-to-quote.",
  },
  {
    icon: <Calendar size={22} weight="duotone" />,
    title: "Project schedule + crew board",
    body:
      "Drag-and-drop calendar of every active job. Crew assignments, inspection dates, change orders documented before they hit the bill.",
  },
  {
    icon: <Receipt size={22} weight="duotone" />,
    title: "Invoices + change orders",
    body:
      "Itemized invoices generated from approved estimates. Customer signs digitally, payment processed via Stripe, copies emailed both directions.",
  },
  {
    icon: <Sparkle size={22} weight="duotone" />,
    title: "AI reply assistant",
    body:
      "Drafts a reply to every inbound lead in your tone of voice. You read it, tap send, move on. Cuts response time from 4 hrs to 60 seconds.",
  },
];

export default function PortalDemoPage() {
  const [input, setInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (input.trim().toLowerCase() === GATE_CODE) {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  }

  return (
    <main
      className="min-h-screen"
      style={{ background: BG, color: INK, fontFamily: FONT_BODY }}
    >
      {/* ── HEADER ── */}
      <header
        className="border-b"
        style={{
          background: BG_PANEL,
          borderColor: RULE,
        }}
      >
        <div className="mx-auto max-w-5xl px-5 sm:px-8 py-4 flex items-center justify-between gap-4">
          <Link
            href="/clients/all-in-one-services"
            className="inline-flex items-center gap-3 group"
          >
            <AIOSMark size={36} flat />
            <span className="flex flex-col leading-tight" style={{ fontFamily: FONT_HEAD }}>
              <span className="text-[14px] sm:text-[16px] font-bold tracking-wide" style={{ color: INK }}>
                ALL IN ONE SERVICES
              </span>
              <span className="text-[10px] tracking-[0.22em] uppercase font-medium" style={{ color: ACCENT_DARK }}>
                Owner Portal
              </span>
            </span>
          </Link>
          <Link
            href="/clients/all-in-one-services"
            className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.16em] font-semibold transition-opacity hover:opacity-70"
            style={{ color: INK_DIM, fontFamily: FONT_HEAD }}
          >
            <ArrowLeft size={14} weight="bold" />
            Back to site
          </Link>
        </div>
      </header>

      {!unlocked ? (
        /* ── PASSWORD GATE ── */
        <section className="mx-auto max-w-md px-5 sm:px-8 py-16 sm:py-24">
          <div
            className="rounded-2xl border p-8 sm:p-10"
            style={{
              background: BG_PANEL,
              borderColor: RULE,
            }}
          >
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-5"
              style={{
                background: COPPER_GRAD,
                color: "#0a0a0a",
              }}
            >
              <LockKey size={22} weight="duotone" />
            </div>
            <h1
              className="text-[28px] sm:text-[34px] font-bold tracking-tight leading-[1.05] mb-3"
              style={{ color: INK, fontFamily: FONT_HEAD }}
            >
              Kyle&apos;s owner portal.
            </h1>
            <p
              className="text-[15px] leading-relaxed mb-7"
              style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
            >
              Private access for the owner of All In One Service&apos;s LLC.
              Enter your access code to see the dashboard.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <label className="block mb-5">
                <span
                  className="block text-[10px] tracking-[0.22em] uppercase mb-2 font-semibold"
                  style={{ color: ACCENT_DARK, fontFamily: FONT_HEAD }}
                >
                  Access code
                </span>
                <input
                  type="password"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setError(false);
                  }}
                  autoComplete="off"
                  autoFocus
                  className="w-full bg-transparent border-b outline-none py-2.5 text-[18px] font-mono transition-colors focus:border-current"
                  style={{
                    borderColor: error ? "#b91c1c" : RULE,
                    color: INK,
                  }}
                />
              </label>

              {error && (
                <p
                  className="text-[13px] mb-5"
                  style={{ color: "#b91c1c", fontFamily: FONT_BODY }}
                >
                  Wrong code. Try again — or text Ben at BlueJays if you lost it.
                </p>
              )}

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 h-12 rounded-md font-bold text-[13px] uppercase tracking-[0.16em] text-black transition-all hover:brightness-110 active:scale-95"
                style={{
                  background: COPPER_GRAD,
                  fontFamily: FONT_HEAD,
                  boxShadow: "0 6px 18px rgba(217, 119, 6, 0.35)",
                }}
              >
                Unlock portal
                <ArrowRight size={14} weight="bold" />
              </button>
            </form>
          </div>

          <p
            className="text-center text-[12px] mt-6"
            style={{ color: INK_DIM, fontFamily: FONT_BODY }}
          >
            Need access?{" "}
            <a
              href="mailto:bluejaycontactme@gmail.com?subject=All%20In%20One%20Services%20portal%20access"
              className="font-semibold transition-colors hover:opacity-70"
              style={{ color: ACCENT_DARK }}
            >
              Email Ben at BlueJays
            </a>
          </p>
        </section>
      ) : (
        /* ── UNLOCKED PREVIEW ── */
        <section className="mx-auto max-w-5xl px-5 sm:px-8 py-12 sm:py-16 lg:py-20">
          <div className="mb-10">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.22em] mb-5"
              style={{
                background: "rgba(217, 119, 6, 0.12)",
                border: `1px solid ${ACCENT_DIM}`,
                color: ACCENT_DARK,
                fontFamily: FONT_HEAD,
              }}
            >
              <Sparkle size={12} weight="fill" />
              Preview · Coming Soon
            </div>
            <h1
              className="font-bold tracking-tight leading-[0.98] mb-4"
              style={{
                fontFamily: FONT_HEAD,
                fontSize: "clamp(36px, 6vw, 64px)",
                color: INK,
              }}
            >
              Kyle, this is your
              <br />
              <span
                style={{
                  background: COPPER_GRAD,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                tailored dashboard.
              </span>
            </h1>
            <p
              className="text-[17px] sm:text-[19px] leading-relaxed max-w-xl"
              style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
            >
              The marketing site you&apos;re reading is the front door. Once
              you sign on with BlueJays, this portal becomes your back office
              — every lead, every job, every invoice in one place. Here&apos;s
              what you&apos;ll see when it&apos;s built out.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 mb-10">
            {PORTAL_PREVIEW.map((p) => (
              <div
                key={p.title}
                className="p-6 sm:p-7 rounded-xl border"
                style={{ background: BG_PANEL, borderColor: RULE }}
              >
                <div
                  className="inline-flex items-center justify-center w-11 h-11 rounded-md mb-4"
                  style={{
                    background: "rgba(217, 119, 6, 0.12)",
                    color: ACCENT_DARK,
                    border: `1px solid ${ACCENT_DIM}`,
                  }}
                >
                  {p.icon}
                </div>
                <h3
                  className="text-[19px] sm:text-[20px] font-bold tracking-tight mb-2"
                  style={{ color: INK, fontFamily: FONT_HEAD }}
                >
                  {p.title}
                </h3>
                <p
                  className="text-[14px] sm:text-[15px] leading-relaxed"
                  style={{ color: INK_SOFT, fontFamily: FONT_BODY }}
                >
                  {p.body}
                </p>
              </div>
            ))}
          </div>

          <div
            className="p-7 sm:p-9 rounded-xl border"
            style={{
              background: COPPER_GRAD,
              borderColor: ACCENT_DIM,
              color: "#1a1612",
            }}
          >
            <Quotes size={28} weight="fill" className="mb-3 opacity-70" />
            <p
              className="text-[18px] sm:text-[22px] leading-snug font-medium mb-5 max-w-2xl"
              style={{ fontFamily: FONT_HEAD }}
            >
              The site sells you. The portal runs you. The AI System ties them
              together so leads come in and jobs roll out without you sitting
              at a screen all day.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/clients/all-in-one-services#estimate"
                className="inline-flex items-center gap-2 px-6 h-12 rounded-md font-bold text-[13px] uppercase tracking-[0.14em] transition-all hover:brightness-95 active:scale-95"
                style={{
                  background: "#1a1612",
                  color: "#fef6e8",
                  fontFamily: FONT_HEAD,
                }}
              >
                Back to the site
                <ArrowRight size={14} weight="bold" />
              </Link>
              <a
                href="mailto:bluejaycontactme@gmail.com?subject=All%20In%20One%20Services%20—%20talk%20about%20the%20portal"
                className="inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.14em] font-bold transition-opacity hover:opacity-70"
                style={{ color: "#1a1612", fontFamily: FONT_HEAD }}
              >
                Talk to Ben
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ── BLUEJAYS ATTRIBUTION ── */}
      <footer className="border-t" style={{ borderColor: RULE }}>
        <div className="mx-auto max-w-5xl px-5 sm:px-8 py-6 flex items-center justify-between text-[12px]" style={{ color: INK_DIM, fontFamily: FONT_BODY }}>
          <span className="inline-flex items-center gap-2">
            <Lock size={12} weight="fill" />
            Owner-only · Private preview
          </span>
          <a
            href="https://bluejayportfolio.com/audit"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold transition-opacity hover:opacity-70"
            style={{ color: ACCENT_DARK }}
          >
            Built by BlueJays — get your free site audit
          </a>
        </div>
      </footer>
    </main>
  );
}
