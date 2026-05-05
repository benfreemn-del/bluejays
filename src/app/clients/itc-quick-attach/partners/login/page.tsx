import Link from "next/link";
import { redirect } from "next/navigation";
import ITCPartnerLoginForm from "./ITCPartnerLoginForm";
import { getCurrentPartner } from "@/lib/partner-auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ITC Quick Attach — Partner login",
  description: "Sign in to the ITC partner workspace.",
  robots: { index: false, follow: false },
};

/**
 * /clients/itc-quick-attach/partners/login — ITC-branded entry to
 * /clients/itc-quick-attach/partners/work.
 *
 * Auth shares the same backend as BlueJays partners (single partners
 * table, single /api/partners/login endpoint, same session cookie),
 * but the page itself stays inside the ITC visual pathway so reps
 * never see BlueJays branding while working ITC accounts.
 *
 * If already logged in, bounce straight to the ITC workspace.
 */
export default async function ITCPartnerLoginPage() {
  const partner = await getCurrentPartner();
  if (partner) redirect("/clients/itc-quick-attach/partners/work");

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <header className="border-b border-amber-500/10">
        <div className="mx-auto max-w-2xl px-6 py-5">
          <Link
            href="/clients/itc-quick-attach/partners"
            className="text-sm text-amber-300/70 hover:text-amber-200 transition-colors"
          >
            ← ITC Partner program
          </Link>
        </div>
      </header>

      <section className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-widest text-amber-300 font-semibold mb-3">
              ITC Quick Attach · Partner Workspace
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
              Log in to start calling
            </h1>
            <p className="text-amber-200/70 text-sm">
              Use the email and partner code Ben sent you when you were approved.
            </p>
          </div>

          <ITCPartnerLoginForm />

          <p className="mt-6 text-center text-xs text-amber-200/50">
            Don&apos;t have a code yet?{" "}
            <a
              href="mailto:partners@itcquickattach.com?subject=ITC Sales Partner Application"
              className="text-amber-300 hover:underline"
            >
              Apply →
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
