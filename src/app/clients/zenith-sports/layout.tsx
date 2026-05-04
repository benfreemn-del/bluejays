import type { Metadata, Viewport } from "next";
import { ClientTrackingScripts } from "@/components/client-tracking-scripts";

/**
 * Layout for /clients/zenith-sports. Houses metadata that the page
 * itself can't export — the page uses client components nested inside.
 *
 * Tracking stack (Clarity, Meta Pixel, GA4) loads via
 * ClientTrackingScripts — each individual tracker is gated on its own
 * env var, so missing vars simply omit the script (no errors).
 */
export const metadata: Metadata = {
  title:
    "Zenith Sports — TEKKY® · Building Better Players, One Touch at a Time · Patent Pending",
  description:
    "TEKKY® by Zenith Sports — a patent-pending technical training accelerator for youth soccer. FIFA Size 3 control, FIFA Size 5 match-day weight. Inspired by European-style development. Founded by Philip Lund and Paul Hanson.",
};

export const viewport: Viewport = {
  themeColor: "#0a1832",
};

export default function ZenithSportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/*
        TEKKY ball palette — pulled from the actual product photo
        (zenithsports.org/cdn/shop/files/ZENITHSPORTS-eComm00001.jpg).
        Three swoosh accents (mint-teal → cobalt-blue → violet) on a
        white-and-black panel base. Used here for the page-level
        scrollbar and surfaced as CSS vars so any nested component
        can pull them via var(--tekky-teal) etc.
      */}
      <style>{`
        .zenith-root {
          --tekky-teal:    #3BDAC0;
          --tekky-teal-dk: #1FAE96;
          --tekky-blue:    #2C4DD8;
          --tekky-blue-dk: #1A36AB;
          --tekky-violet:  #8A6FDF;
          --tekky-violet-dk: #6448C2;
        }
        /* Custom scrollbar — gradient down the thumb in ball colors.
           Scoped to .zenith-root via :where() to avoid global leak. */
        :where(.zenith-root) ::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }
        :where(.zenith-root) ::-webkit-scrollbar-track {
          background: #050d1f;
        }
        :where(.zenith-root) ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg,
            var(--tekky-teal) 0%,
            var(--tekky-blue) 55%,
            var(--tekky-violet) 100%);
          border-radius: 8px;
          border: 2px solid #050d1f;
          background-clip: padding-box;
        }
        :where(.zenith-root) ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg,
            var(--tekky-teal-dk) 0%,
            var(--tekky-blue-dk) 55%,
            var(--tekky-violet-dk) 100%);
          background-clip: padding-box;
        }
        /* Firefox fallback — single thumb color (Firefox can't gradient) */
        :where(.zenith-root) {
          scrollbar-width: thin;
          scrollbar-color: var(--tekky-blue) #050d1f;
        }
      `}</style>
      <ClientTrackingScripts slug="zenith-sports" />
      <div className="zenith-root">{children}</div>
    </>
  );
}
