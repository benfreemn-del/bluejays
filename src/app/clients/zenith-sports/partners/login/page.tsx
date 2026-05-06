import Link from "next/link";
import { redirect } from "next/navigation";
import PartnerLoginForm from "./PartnerLoginForm";
import { getCurrentPartner } from "@/lib/partner-auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Zenith Partner login — Zenith Sports / TEKKY®",
  robots: { index: false, follow: false },
};

/**
 * /clients/zenith-sports/partners/login — entry point for the Zenith
 * partner workspace. Mirrors the BlueJays /partners/login shape but
 * is scoped to client_slug='zenith-sports' so a partner with the same
 * email address across BlueJays + Zenith stays cleanly separated.
 *
 * Already-logged-in Zenith partners bounce straight to the workspace.
 */
export default async function ZenithPartnerLoginPage() {
  const partner = await getCurrentPartner("zenith-sports");
  if (partner) redirect("/clients/zenith-sports/partners/work");

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="border-b border-lime-500/10">
        <div className="mx-auto max-w-2xl px-6 py-5">
          <Link
            href="/clients/zenith-sports/partners"
            className="text-sm text-lime-300/80 hover:text-lime-200 transition-colors"
          >
            ← Zenith Partner Program
          </Link>
        </div>
      </header>

      <section className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-widest text-lime-300 font-semibold mb-3">
              Zenith Partner Workspace
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
              Log in to start sharing
            </h1>
            <p className="text-slate-400 text-sm">
              Use the email and partner code Philip emailed you.
            </p>
          </div>

          <PartnerLoginForm />

          <p className="mt-6 text-center text-xs text-slate-500">
            Don&apos;t have a code yet?{" "}
            <Link
              href="/clients/zenith-sports/partners"
              className="text-lime-300 hover:underline"
            >
              Apply →
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
