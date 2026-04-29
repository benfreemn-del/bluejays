import Link from "next/link";
import { redirect } from "next/navigation";
import PartnerLoginForm from "./PartnerLoginForm";
import { getCurrentPartner } from "@/lib/partner-auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Partner login — BlueJays",
  robots: { index: false, follow: false },
};

/**
 * /partners/login — entry to /partners/work.
 *
 * Login is one-factor: email + partner code (the slug they got at
 * application). Fine for sister/family team — tighten later.
 *
 * If already logged in (valid session cookie), bounce straight to
 * /partners/work — saves the click.
 */
export default async function PartnerLoginPage() {
  const partner = await getCurrentPartner();
  if (partner) redirect("/partners/work");

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="border-b border-white/5">
        <div className="mx-auto max-w-2xl px-6 py-5">
          <Link
            href="/partners"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← Partner program
          </Link>
        </div>
      </header>

      <section className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-widest text-amber-300 font-semibold mb-3">
              Partner Workspace
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
              Log in to start calling
            </h1>
            <p className="text-slate-400 text-sm">
              Use the email and partner code Ben gave you.
            </p>
          </div>

          <PartnerLoginForm />

          <p className="mt-6 text-center text-xs text-slate-500">
            Don&apos;t have a code yet?{" "}
            <Link
              href="/partners/apply"
              className="text-amber-300 hover:underline"
            >
              Apply →
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
