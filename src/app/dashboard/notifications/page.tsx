/**
 * /dashboard/notifications
 *
 * Per-client notification preferences. For each known client slug, Ben
 * chooses how he wants to be notified across three channels:
 *   - Email     — Instant / Daily digest / Weekly digest / Off
 *   - SMS       — Instant / Daily digest / Off
 *   - Dashboard — agent_signals feed surfacing (on/off)
 *
 * Defaults to instant everywhere; rows without a pref row in Supabase
 * follow that default. Saving a row writes through to
 * owner_notification_prefs via /api/notifications/prefs.
 *
 * The gate lives in src/lib/alerts.ts — every call to sendOwnerEmail()
 * or sendOwnerSms() with a clientSlug checks the pref before firing.
 */

import { allClientSlugs } from "@/lib/client-site-urls";
import { getAllOwnerNotificationPrefs } from "@/lib/owner-notification-prefs";
import NotificationsClient from "./NotificationsClient";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const prefs = await getAllOwnerNotificationPrefs();
  const slugs = allClientSlugs();

  const byClient = new Map(prefs.map((p) => [p.clientSlug, p]));
  const merged = slugs.map((slug) => {
    const existing = byClient.get(slug);
    return {
      clientSlug: slug,
      emailFrequency: existing?.emailFrequency ?? "instant",
      smsFrequency: existing?.smsFrequency ?? "instant",
      dashboardSignal: existing?.dashboardSignal ?? true,
      lastEmailDigestAt: existing?.lastEmailDigestAt ?? null,
      lastSmsDigestAt: existing?.lastSmsDigestAt ?? null,
    };
  });

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">
          Admin · Notifications
        </p>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Pick how each client&apos;s alerts reach you. Instant fires the
          moment the event happens. Daily &amp; Weekly batch everything for
          that client into a single digest at 5am PT (12:00 UTC daily,
          Mondays for weekly). Off silently drops the notification — the
          event is still recorded in agent_signals, you just won&apos;t be
          pinged about it.
        </p>
      </header>

      <NotificationsClient initialRows={merged} />
    </main>
  );
}
