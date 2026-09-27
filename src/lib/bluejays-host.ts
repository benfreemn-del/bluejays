/**
 * isBluejaysHost — true only on BlueJays' own hosts.
 *
 * The root layout wraps EVERY route, including client showcases served
 * on the clients' own domains via CLIENT_DOMAIN_MAP (elitehardscapesnw.com,
 * sequimelectrician.com, tekky.org, ...). BlueJays' retargeting pixels and
 * Clarity must not run there: they'd put our Meta/Google Ads cookies on the
 * client's customers, pollute our audiences with their traffic, and cost
 * the client page speed. Found on the Elite launch audit 2026-09-27.
 *
 * Vercel preview URLs + localhost count as ours so testing still works.
 */
export function isBluejaysHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return (
    h === "bluejayportfolio.com" ||
    h === "www.bluejayportfolio.com" ||
    h === "localhost" ||
    h === "127.0.0.1" ||
    h.endsWith(".vercel.app")
  );
}
