import Link from "next/link";
import TestGroupDashboard from "./TestGroupDashboard";
import { getCohortStats } from "@/lib/test-cohort";

/**
 * /dashboard/test-group/[id] — Wave-1 test cohort firehose.
 *
 * Per CLAUDE.md "Test Group Wave 1" spec, Ben answered #10D = full
 * firehose. This page shows: stages, per-prospect timeline, per-channel
 * attribution, costs accumulated, projected ROI, and the action queues
 * (top-10 to record Loom for, who needs a postcard, who hasn't been
 * contacted yet).
 *
 * Server component fetches the initial stats; client component handles
 * polling/refresh.
 */
export const dynamic = "force-dynamic";

export default async function TestGroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const initialStats = await getCohortStats(id);

  if (!initialStats) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <h1 className="text-2xl font-semibold mb-4">Test Cohort Not Found</h1>
        <p className="text-slate-300 mb-6">
          No prospects are tagged with cohort id <code className="bg-slate-900 px-2 py-1 rounded">{id}</code>.
        </p>
        <p className="text-slate-400 mb-6">
          To create + populate the Wave 1 cohort, POST to{" "}
          <code className="bg-slate-900 px-2 py-1 rounded">/api/test-cohort/select</code>{" "}
          (no body for dry-run, then again with{" "}
          <code className="bg-slate-900 px-2 py-1 rounded">{`{ "confirm": true }`}</code>).
        </p>
        <Link href="/dashboard" className="text-sky-400 hover:underline">
          ← Back to dashboard
        </Link>
      </main>
    );
  }

  return <TestGroupDashboard initialStats={initialStats} cohortId={id} />;
}
