import { headers } from "next/headers";
import { BASE_PATH } from "./site";

/**
 * Link prefix for the current request.
 *
 * On mtviewlandscaping.com the middleware serves this showcase at the
 * root, so links are "/hardscapes". On bluejayportfolio.com (the demo and
 * pre-launch preview) the same pages live under /clients/mt-view-landscaping.
 * Reading the host keeps every internal link a real, crawlable URL on
 * whichever host is serving it, with no redirect hop.
 */
export async function getBase(): Promise<string> {
  const host = ((await headers()).get("host") || "").toLowerCase().split(":")[0];
  return host.replace(/^www\./, "") === "mtviewlandscaping.com" ? "" : BASE_PATH;
}
