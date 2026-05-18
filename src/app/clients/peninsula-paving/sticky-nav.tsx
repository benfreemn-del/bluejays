"use client";

/* eslint-disable @next/next/no-img-element -- single brand logo, no LCP win from <Image>. */

import { useState, useEffect } from "react";
import { Phone, ArrowRight, List, X } from "@phosphor-icons/react/dist/ssr";

/**
 * StickyNav — Peninsula Paving & Excavating site header.
 *
 * Uses the real JPEG brand logo (circular badge with PP monogram +
 * "PENINSULA PAVING & EXCAVATING / EST 1985 · SEQUIM, WA" arc text +
 * yellow road-stripe slash) instead of an SVG mark. Logo lives at
 * /clients/peninsula-paving/logo.jpeg.
 */

const NAV_LINKS = [
  { href: "#services", label: "Services" },
  { href: "#process", label: "Our Process" },
  { href: "#why-us", label: "Why Us" },
  { href: "#service-area", label: "Service Area" },
  { href: "#contact", label: "Contact" },
];

const PHONE_DISPLAY = "(360) 477-7015";
const PHONE_HREF = "tel:+13604777015";
const ACCENT = "#ea580c";
const LOGO_SRC = "/clients/peninsula-paving/logo.jpeg";

function PavingMark({ size = 36, flat = false }: { size?: number; flat?: boolean }) {
  // Real JPEG brand logo — circular badge with PP monogram, arc text
  // "PENINSULA PAVING & EXCAVATING / EST. 1985 · SEQUIM, WA".
  //
  // The source JPEG has whitespace padding around the badge artwork.
  // Wrapping in overflow-hidden + scaling the image up by 1.22× pushes
  // that whitespace outside the visible circle so the badge maxes
  // out the rounded frame edge-to-edge.
  return (
    <div
      className="rounded-full shrink-0 relative overflow-hidden"
      style={{
        width: size,
        height: size,
        boxShadow: flat
          ? "none"
          : "0 1px 2px rgba(28, 20, 16, 0.08), 0 0 0 1px rgba(234, 88, 12, 0.18)",
      }}
    >
      <img
        src={LOGO_SRC}
        alt={flat ? "" : "Peninsula Paving & Excavating"}
        aria-hidden={flat ? true : undefined}
        width={size}
        height={size}
        className="block w-full h-full"
        style={{
          objectFit: "cover",
          transform: "scale(1.22)",
          transformOrigin: "center center",
        }}
      />
    </div>
  );
}

export default function StickyNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className="sticky top-0 z-50 backdrop-blur-md border-b"
        style={{
          background: "rgba(254, 253, 251, 0.92)",
          borderColor: "rgba(234, 88, 12, 0.20)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-6">
          <a
            href="#top"
            className="flex items-center gap-3 min-w-0"
            aria-label="Peninsula Paving & Excavating"
          >
            <PavingMark size={52} />
            <span
              className="flex flex-col leading-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#1c1410" }}
            >
              <span className="text-[15px] sm:text-[17px] font-bold tracking-wide">
                PENINSULA PAVING
              </span>
              <span
                className="hidden sm:block text-[10px] sm:text-[10px] tracking-[0.24em] uppercase font-medium"
                style={{ color: "rgba(28, 20, 16, 0.55)" }}
              >
                Olympic Peninsula · Since 1985
              </span>
            </span>
          </a>

          <nav className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-colors"
                style={{ color: "rgba(28, 20, 16, 0.78)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#1c1410"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(28, 20, 16, 0.78)"; }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href={PHONE_HREF}
              className="hidden sm:inline-flex items-center gap-2 text-[14px] font-semibold transition-colors"
              style={{ color: "#1c1410" }}
            >
              <Phone size={16} weight="fill" style={{ color: ACCENT }} />
              <span>{PHONE_DISPLAY}</span>
            </a>
            <a
              href="#contact"
              className="hidden sm:inline-flex items-center gap-2 px-5 h-10 rounded-md font-bold text-[13px] uppercase tracking-wide text-white transition-all hover:brightness-110 active:scale-95 shadow-[0_4px_14px_rgba(234,88,12,0.35)]"
              style={{
                background: ACCENT,
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Free Estimate
              <ArrowRight size={14} weight="bold" />
            </a>

            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-md transition-colors"
              style={{ color: "#1c1410" }}
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            >
              <List size={26} weight="bold" />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div
          className="lg:hidden fixed inset-0 z-[60] backdrop-blur-md flex flex-col"
          style={{ background: "rgba(254, 253, 251, 0.98)" }}
        >
          <div
            className="flex items-center justify-between px-5 sm:px-8 h-16 sm:h-20 border-b"
            style={{ borderColor: "rgba(28, 20, 16, 0.08)" }}
          >
            <span
              className="flex items-center gap-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#1c1410" }}
            >
              <PavingMark size={44} flat />
              <span className="text-[15px] font-bold tracking-wide">
                PENINSULA PAVING
              </span>
            </span>
            <button
              type="button"
              className="inline-flex items-center justify-center w-11 h-11 rounded-md"
              style={{ color: "#1c1410" }}
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              <X size={26} weight="bold" />
            </button>
          </div>

          <nav className="flex-1 flex flex-col items-stretch px-6 py-8 gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block py-4 text-2xl font-semibold border-b"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: "#1c1410",
                  borderColor: "rgba(28, 20, 16, 0.10)",
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div
            className="p-6 space-y-3 border-t"
            style={{ borderColor: "rgba(28, 20, 16, 0.10)" }}
          >
            <a
              href={PHONE_HREF}
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 h-14 rounded-md border font-semibold"
              style={{
                color: "#1c1410",
                borderColor: "rgba(28, 20, 16, 0.15)",
              }}
            >
              <Phone size={18} weight="fill" style={{ color: ACCENT }} />
              {PHONE_DISPLAY}
            </a>
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 h-14 rounded-md font-bold uppercase tracking-wide text-white"
              style={{ background: ACCENT, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Free Estimate
              <ArrowRight size={16} weight="bold" />
            </a>
          </div>
        </div>
      )}
    </>
  );
}
