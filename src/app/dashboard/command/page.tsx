/**
 * /dashboard/command — the Command center.
 *
 * ONE place to see every domain Ben operates: his own businesses (LinePlay,
 * Joe Moore, BlueJays) AND every client site BlueJays manages. Shows registrar,
 * expiry (color-coded: red <30d, amber <60d, green healthy), hosting, mailboxes,
 * and who each is associated with. Pulls live expiry from Namecheap (Sync) and
 * RDAP (per-domain Refresh). The weekly cron emails + SMSes Ben anything ≤60d.
 *
 * Auth: covered by /dashboard in middleware PROTECTED_PATHS.
 */

import CommandClient from "./CommandClient";

export const metadata = {
  title: "Command — Domains & Mailboxes | BlueJays",
};

export default function CommandPage() {
  return (
    <main className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-6 pb-32">
      <CommandClient />
    </main>
  );
}
