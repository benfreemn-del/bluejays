"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { ShoppingCart, ArrowRight } from "@phosphor-icons/react/dist/ssr";

/**
 * StickyMobileCta — gold "Shop TEKKY®" bottom bar pinned across all
 * mobile pages.
 *
 * Per the TEKKY Unified Brand Voice Guide, PRIORITY 5:
 *   - 70%+ of traffic is mobile
 *   - Checkout must be completable in 3 taps or fewer
 *   - Sticky bar is "must be built as priority, not an afterthought"
 *
 * Behavior:
 *   - Visible <lg only (desktop has the nav-bar Shop CTA already)
 *   - Hidden on the /shop page itself (they're already shopping)
 *   - Hidden when the mobile menu is open OR when the user has
 *     scrolled into the contact section (their attention is on the
 *     form, not on closing the sale)
 *   - Slides up after the user scrolls past the hero so it doesn't
 *     fight the hero CTAs on first load
 *
 * Why a portal-less fixed div is fine here: the parent <main> uses
 * default position so the fixed bar correctly anchors to the
 * viewport. (Same pitfall we hit on the mobile menu — see sticky-nav
 * for the backdrop-filter rabbit hole.)
 */

type Props = {
  /** "main" | "shop" — used to hide the bar on the shop page. */
  page: "main" | "shop";
  /** Override the destination if needed. Defaults to /shop. */
  href?: string;
  /** Override the label if needed. */
  label?: string;
};

export default function StickyMobileCta({
  page,
  href = "/clients/zenith-sports/shop",
  label = "Shop the TEKKY®",
}: Props) {
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [hideForContact, setHideForContact] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Show the bar after the user has scrolled past ~85% of the
      // first viewport height — they're committed, not just landing.
      setScrolledPastHero(window.scrollY > window.innerHeight * 0.85);

      // Hide the bar when the user is reading the contact form so
      // the sticky bar doesn't cover form fields on small phones.
      const contact = document.getElementById("contact");
      if (!contact) {
        setHideForContact(false);
        return;
      }
      const rect = contact.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      setHideForContact(inView);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (page === "shop") return null;

  const visible = scrolledPastHero && !hideForContact;

  return (
    <div
      aria-hidden={!visible}
      className="lg:hidden fixed inset-x-0 bottom-0 z-40 px-3 pb-3 pt-2 transition-transform duration-300 pointer-events-none"
      style={{
        // Slide off-screen when not visible. Adds bottom safe-area
        // for iPhones with home indicators.
        transform: visible ? "translateY(0)" : "translateY(120%)",
        paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <a
        href={href}
        className="pointer-events-auto flex items-center justify-between gap-3 bg-[#a3e635] text-[#0a1832] px-5 py-4 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.35)] hover:bg-white transition active:scale-[0.98]"
      >
        <span className="inline-flex items-center gap-2">
          <ShoppingCart size={18} weight="fill" />
          <span className="text-[14px] font-extrabold tracking-[0.06em] uppercase">
            {label}
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-[12px] font-bold tabular-nums">
          $59.95
          <ArrowRight size={14} weight="bold" />
        </span>
      </a>
    </div>
  );
}
