import { ClientTrackingScripts } from "@/components/client-tracking-scripts";
import BackToTopButton from "@/components/BackToTopButton";

/**
 * Layout for /clients/laser-lakes/* — Nate's bespoke marketing front.
 *
 * Page-level metadata is exported from page.tsx. This layout's only
 * job today is to scope the brown + cream/white scrollbar to the
 * Laser Lakes route subtree (matches the wood + Baltic-birch
 * aesthetic) and inject the per-tenant tracking scripts.
 *
 * Same scoping pattern as /clients/meyer-electric and
 * /clients/hector-landscaping — Next only renders this layout while
 * the visitor is inside the laser-lakes subtree, so other tenant
 * scrollbars stay untouched.
 */
export default function LaserLakesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Laser Lakes scrollbar — wood-brown gradient terminating in
          warm cream-white. The track sits on a near-black walnut tone
          so the gradient reads even on light page backgrounds. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            html { scrollbar-color: #8b5a2b #1c120a; scrollbar-width: thin; }
            ::-webkit-scrollbar { width: 12px; height: 12px; }
            ::-webkit-scrollbar-track { background: #1c120a; }
            ::-webkit-scrollbar-thumb {
              background: linear-gradient(180deg, #4a2c14 0%, #8b5a2b 45%, #d9b88a 80%, #faf6ee 100%);
              border-radius: 6px;
              border: 2px solid #1c120a;
            }
            ::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(180deg, #3a2210 0%, #6f4520 45%, #c2a070 80%, #ffffff 100%);
            }
            ::-webkit-scrollbar-corner { background: #1c120a; }
          `,
        }}
      />
      <ClientTrackingScripts slug="laser-lakes" />
      {children}
      <BackToTopButton bg="#d99f58" fg="#f6f1e8" />
    </>
  );
}
