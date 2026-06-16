/**
 * /clients/mt-view-landscaping/ops — Mountain View operations + profitability
 * backend. Server component: reads the live dataset from Supabase (ops_* tables,
 * migration 20260616_mtv_ops_backend.sql) via ops-store, with a mock fallback,
 * then hands it to the client shell. The job-costing math lives in
 * profit-engine.ts; the UI in OpsClient.tsx.
 */

import { cookies } from "next/headers";
import OpsClient from "./OpsClient";
import { readOpsDataset } from "./ops-store";

export const dynamic = "force-dynamic";

export default async function MtViewOpsPage() {
  const mode = (await cookies()).get("bj_mtv_ops_mode")?.value === "real" ? "real" : "example";
  const slug = mode === "real" ? "mt-view-landscaping-real" : "mt-view-landscaping";
  const dataset = await readOpsDataset(slug);
  return <OpsClient dataset={dataset} mode={mode} />;
}
