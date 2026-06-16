/**
 * /clients/mt-view-landscaping/ops — Mountain View operations + profitability
 * backend. Server component: reads the live dataset from Supabase (ops_* tables,
 * migration 20260616_mtv_ops_backend.sql) via ops-store, with a mock fallback,
 * then hands it to the client shell. The job-costing math lives in
 * profit-engine.ts; the UI in OpsClient.tsx.
 */

import OpsClient from "./OpsClient";
import { readOpsDataset } from "./ops-store";

export const dynamic = "force-dynamic";

export default async function MtViewOpsPage() {
  const dataset = await readOpsDataset("mt-view-landscaping");
  return <OpsClient dataset={dataset} />;
}
