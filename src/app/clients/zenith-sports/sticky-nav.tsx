"use client";

/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import { ArrowRight, List, X, ShoppingCart } from "@phosphor-icons/react/dist/ssr";

/**
 * StickyNav for /clients/zenith-sports.
 *
 * Athletic premium feel — deep navy + ivory + electric-blue accent.
 * Pattern matches mt-view-landscaping/sticky-nav (mobile hamburger,
 * ESC closes, body-scroll lock). Two CTA modes:
 *
 *  - Main showcase page: anchor links jump within page; "Shop the TEKKY"
 *    is the right-rail CTA, links out to /clients/zenith-sports/shop.
 *  - Shop sub-page: same nav, but "Shop" is highlighted as active and
 *    the CTA flips to "View the TEKKY" anchor on the shop page itself.
 *
 * The `activePath` prop tells the nav which page it's rendered on so
 * the active state highlights correctly.
 */
type Props = {
  businessName: string;
  logoSrc: string;
  /** Either "/clients/zenith-sports" or "/clients/zenith-sports/shop". */
  activePath: "main" | "shop";
};

const MAIN_LINKS = [
  { href: "/clients/zenith-sports#top", label: "Home" },
  { href: "/clients/zenith-sports#about", label: "About" },
  { href: "/clients/zenith-sports#tekky", label: "TEKKY" },
  { href: "/clients/zenith-sports#training", label: "Training" },
  { href: "/clients/zenith-sports/build-your-player", label: "Build" },
  { href: "/clients/zenith-sports/shop", label: "Shop" },
  { href: "/clients/zenith-sports#contact", label: "Contact" },
];

export default function StickyNav({
  businessName,
  logoSrc,
  activePath,
}: Props) {
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

  const isActive = (label: string) => {
    if (activePath === "shop") return label === "Shop";
    if (activePath === "main") return label === "Home";
    return false;
  };

  return (
    <>
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0a1832]/90 border-b border-white/10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-6">
        <a
          href="/clients/zenith-sports"
          className="flex items-center gap-3 min-w-0"
        >
          <img
            src={logoSrc}
            alt={businessName}
            className="h-9 sm:h-12 w-auto"
          />
          <span className="hidden md:block tracking-tight text-[15px] font-bold uppercase text-white leading-tight">
            Zenith Sports
            <span className="block text-[10px] tracking-[0.22em] uppercase text-[#a3e635] font-semibold">
              The TEKKY<sup className="text-[0.55em] -ml-px top-[-0.45em]">®</sup> Ball
            </span>
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-7 text-[12px] tracking-[0.18em] uppercase font-semibold text-white/75">
          {MAIN_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`transition relative ${
                isActive(l.label)
                  ? "text-[#a3e635]"
                  : "hover:text-white"
              }`}
            >
              {l.label}
              {isActive(l.label) && (
                <span className="absolute -bottom-2 left-0 right-0 h-[2px] bg-[#a3e635]" />
              )}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="/clients/zenith-sports/shop"
            className="hidden sm:inline-flex items-center gap-2 bg-[#a3e635] text-[#0a1832] px-5 py-2.5 text-[12px] font-extrabold tracking-[0.18em] uppercase hover:bg-white transition"
          >
            <ShoppingCart size={14} weight="bold" />
            Shop Now
            <ArrowRight size={14} weight="bold" />
          </a>
          <a
            href="/clients/zenith-sports/shop"
            className="sm:hidden inline-flex items-center justify-center w-10 h-10 -mr-1 text-[#a3e635] hover:bg-white/5 transition"
            aria-label="Shop now"
          >
            <ShoppingCart size={20} weight="fill" />
          </a>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 -mr-2 text-white hover:bg-white/5 transition cursor-pointer"
          >
            <List size={22} weight="bold" />
          </button>
        </div>
      </div>
    </header>
    {/* Mobile menu rendered OUTSIDE <header>. The header uses
        backdrop-blur-md which creates a containing block for
        position:fixed descendants, so a fixed inset-0 child was
        constrained to the header's 64–80px height — that's why the
        page bled through under the menu items. Lifting it out of
        the header restores true viewport-fixed behaviour. */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-[100] bg-[#0a1832] flex flex-col overflow-y-auto">
          <div className="h-16 sm:h-20 px-5 sm:px-8 flex items-center justify-between border-b border-white/10">
            <a
              href="/clients/zenith-sports"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3"
            >
              <img src={logoSrc} alt={businessName} className="h-10 w-auto" />
              <span className="tracking-tight text-[16px] font-bold uppercase text-white">
                Zenith Sports
              </span>
            </a>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="inline-flex items-center justify-center w-10 h-10 -mr-2 text-white hover:bg-white/5 transition"
            >
              <X size={22} weight="bold" />
            </button>
          </div>
          <nav className="flex-1 flex flex-col px-5 sm:px-8 py-6 gap-0">
            {MAIN_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`text-[22px] sm:text-[28px] py-3 border-b border-white/10 transition font-bold uppercase tracking-tight ${
                  isActive(l.label)
                    ? "text-[#a3e635]"
                    : "text-white hover:text-[#a3e635]"
                }`}
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="px-5 sm:px-8 pb-10 pt-6 border-t border-white/10">
            <a
              href="/clients/zenith-sports/shop"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 bg-[#a3e635] text-[#0a1832] px-6 py-4 text-[14px] font-extrabold tracking-[0.18em] uppercase hover:bg-white transition"
            >
              <ShoppingCart size={16} weight="bold" />
              Shop the TEKKY
              <ArrowRight size={16} weight="bold" />
            </a>
          </div>
        </div>
      )}
    </>
  );
}
