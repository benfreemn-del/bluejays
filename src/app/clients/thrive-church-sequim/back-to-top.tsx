"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "@phosphor-icons/react";

/**
 * BackToTopButton — small circular floating button anchored to the
 * bottom-LEFT (opposite side from the Verse-of-Week popup which lives
 * bottom-right). Hidden until the visitor scrolls past the Connect
 * Card section, then fades in. Click smooth-scrolls to top.
 *
 * Mounted in layout.tsx so it appears on every Thrive subpage (home,
 * volunteer, portal-demo gate).
 */

const TEAL = "#0d4f4a";
const TEAL_DEEP = "#0a3a36";
const AMBER = "#d97706";
const CREAM = "#fbf7ee";

export default function BackToTopButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const update = () => {
      const connect = document.getElementById("connect");
      if (!connect) {
        // No Connect section on this page (e.g., /portal-demo) — fall
        // back to a generic scroll threshold so the button still
        // appears once you're meaningfully scrolled.
        setShow(window.scrollY > 600);
        return;
      }
      const rect = connect.getBoundingClientRect();
      // Show when the Connect Card has scrolled fully past the top of
      // the viewport (its bottom edge is above y=0).
      setShow(rect.bottom < 0);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
      className="fixed bottom-5 left-5 z-[55] flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 active:scale-95 sm:bottom-7 sm:left-7 sm:h-14 sm:w-14"
      style={{
        background: TEAL,
        color: CREAM,
        border: `1.5px solid ${AMBER}`,
        boxShadow: "0 14px 36px -10px rgba(13, 79, 74, 0.55)",
        opacity: show ? 1 : 0,
        pointerEvents: show ? "auto" : "none",
        transform: show ? "translateY(0)" : "translateY(12px)",
      }}
    >
      <ArrowUp size={18} weight="bold" />
    </button>
  );
}
