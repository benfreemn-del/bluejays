import ProcessingClient from "./ProcessingClient";

export const metadata = {
  title: "Generating your audit — BlueJays",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Hormozi-mod video walkthrough on the wait page (Ben spec 2026-04-26):
 * pre-frames the audit before the prospect sees it. Set the URL via
 * NEXT_PUBLIC_AUDIT_PROCESSING_VIDEO_URL env var on Vercel — supports
 * Loom share URLs (loom.com/share/XXXX) and YouTube watch URLs
 * (youtube.com/watch?v=XXXX or youtu.be/XXXX).
 *
 * Leave the env var unset until the video is recorded. The processing
 * page hides the video slot cleanly when missing.
 */
export default async function AuditProcessingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Prefer env URL (Loom / YouTube hosted). Falls back to a self-hosted
  // mp4 in /public when NEXT_PUBLIC_AUDIT_PROCESSING_VIDEO_FALLBACK=1 is
  // set on Vercel — flip ONLY after Ben drops /public/processing-intro.mp4
  // (otherwise prospects see a broken video frame).
  const fallbackEnabled = process.env.NEXT_PUBLIC_AUDIT_PROCESSING_VIDEO_FALLBACK === "1";
  const videoUrl =
    process.env.NEXT_PUBLIC_AUDIT_PROCESSING_VIDEO_URL ||
    (fallbackEnabled ? "/processing-intro.mp4" : null);
  return <ProcessingClient auditId={id} videoUrl={videoUrl} />;
}
