"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "@phosphor-icons/react";

/**
 * BackToTopButton — universal floating "back to top" pill anchored
 * bottom-LEFT on every bespoke client site. Visible only after the
 * visitor has scrolled past the first 1/3 of the page (configurable
 * via the `threshold` prop). Click smooth-scrolls to top.
 *
 * Per-client brand color via the `bg` / `fg` / `border` props. Pattern
 * mirrored from `clients/thrive-church-sequim/back-to-top.tsx` so every
 * site feels consistent without being identical.
 *
 * Mount in each client's `layout.tsx` so it appears across every
 * subroute (portal, volunteer, etc.). If no layout.tsx exists, mount
 * once at the top level of `page.tsx`.
 */

type Props = {
  /** Solid background hex (the client's accent / brand color). */
  bg: string;
  /** Icon + outline-text color — should contrast cleanly on `bg`. */
  fg: string;
  /** Optional secondary brand color used as a 1.5px ring. */
  border?: string;
  /** Optional drop-shadow color in rgba(). Defaults to a neutral. */
  shadow?: string;
  /**
   * Fraction of total document height the user must scroll past
   * before the button fades in. Defaults to 1/3 of the page.
   */
  threshold?: number;
};

export default function BackToTopButton({
  bg,
  fg,
  border,
  shadow,
  threshold = 0.33,
}: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const update = () => {
      const doc = document.documentElement;
      const totalScrollable = doc.scrollHeight - window.innerHeight;
      if (totalScrollable <= 0) {
        setShow(false);
        return;
      }
      setShow(window.scrollY > totalScrollable * threshold);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [threshold]);

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
        background: bg,
        color: fg,
        border: border ? `1.5px solid ${border}` : `1.5px solid rgba(255,255,255,0.25)`,
        boxShadow: shadow
          ? `0 14px 36px -10px ${shadow}`
          : "0 14px 36px -10px rgba(15, 15, 15, 0.45)",
        opacity: show ? 1 : 0,
        pointerEvents: show ? "auto" : "none",
        transform: show ? "translateY(0)" : "translateY(12px)",
      }}
    >
      <ArrowUp size={18} weight="bold" />
    </button>
  );
}
