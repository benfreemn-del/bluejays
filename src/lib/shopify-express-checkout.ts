/**
 * shopify-express-checkout — resolves the "best available" Shopify
 * checkout URL for a given product.
 *
 * Two states:
 *
 * 1. **Fully wired** (env var set with a Shopify cart-permalink):
 *    Format: `https://STORE.com/cart/VARIANT_ID:1/checkout`
 *    Result: one click from our showcase → Shopify-hosted checkout
 *    page with Apple Pay / Shop Pay / Google Pay automatic (assuming
 *    the store enabled them in Shopify Payments → Wallets).
 *    NO cart drawer step. NO add-to-cart click. NO Shopify product
 *    page hop. Just: button click → checkout form with wallet prompts
 *    visible at top.
 *
 * 2. **Fallback** (env var unset — current pre-launch state):
 *    Returns the public product-page URL on the storefront with
 *    `?channel=buy_button&utm_source=bluejays` appended so Shopify
 *    Analytics attributes the click correctly even before we wire
 *    direct checkout. Customer still lands on Shopify's product
 *    page, adds to cart manually, then checks out.
 *
 * The point: ship the scaffolding TODAY. The moment Philip pastes
 * variant IDs (from Shopify Admin → Products → Variants → URL
 * fragment), Ben sets `NEXT_PUBLIC_ZENITH_SHOPIFY_<KEY>_CHECKOUT_URL`
 * on Vercel and the buttons auto-upgrade to one-click checkout
 * without redeploying.
 *
 * Why permalinks instead of the Shopify Buy Button SDK:
 *   - Faster: no SDK bundle to load (~150KB gzipped), no CDN round-trip,
 *     no JS init blocking the click
 *   - Simpler: just a URL — no state, no CORS, no cart-drawer styling
 *   - More one-click: direct to checkout vs. button → cart modal →
 *     checkout (which is 2 clicks)
 *   - Same Apple Pay / Shop Pay / Google Pay support (those live on
 *     Shopify's checkout page, not in our embed)
 *
 * The Buy Button SDK is still the right call when the client wants
 * inline cart UX (cart drawer with multiple line items, upsells
 * inside the cart, etc.). For the Zenith 3-product catalog with no
 * cart-level upsell, permalink wins.
 *
 * Reusable for other Shopify-backed clients (KR Ranches, Nevarland,
 * future) — just add another `getXxxCheckoutUrl` helper following
 * the same pattern.
 */

const VALID_HTTPS = /^https:\/\//;

function resolveCheckoutUrl(
  envValue: string | undefined,
  fallbackUrl: string,
): string {
  if (envValue && VALID_HTTPS.test(envValue)) {
    return envValue;
  }
  // Append analytics tagging to fallback so Shopify still attributes
  // the click even when we're not running direct checkout yet.
  const sep = fallbackUrl.includes("?") ? "&" : "?";
  return `${fallbackUrl}${sep}channel=buy_button&utm_source=bluejays`;
}

/**
 * Zenith Sports / TEKKY — three SKUs.
 *
 * Env vars Ben sets on Vercel once Philip pastes variant IDs:
 *   NEXT_PUBLIC_ZENITH_SHOPIFY_BALL_CHECKOUT_URL  = "https://zenithsports.org/cart/VARIANT_ID:1/checkout"
 *   NEXT_PUBLIC_ZENITH_SHOPIFY_SOCKS_CHECKOUT_URL = "https://zenithsports.org/cart/VARIANT_ID:1/checkout"
 *   NEXT_PUBLIC_ZENITH_SHOPIFY_SHIRT_CHECKOUT_URL = "https://zenithsports.org/cart/VARIANT_ID:1/checkout"
 *
 * Where to find variant IDs (5 sec each, no API token needed):
 *   1. Open Shopify Admin
 *   2. Products → [pick product] → scroll to Variants
 *   3. Click the variant — URL becomes /admin/products/PRODUCT_ID/variants/VARIANT_ID
 *   4. The variant ID is the trailing number. Paste into the URL template.
 */
export function getZenithCheckoutUrl(
  productKey: "ball" | "socks" | "shirt",
  fallbackUrl: string,
): string {
  const envValue =
    productKey === "ball"
      ? process.env.NEXT_PUBLIC_ZENITH_SHOPIFY_BALL_CHECKOUT_URL
      : productKey === "socks"
        ? process.env.NEXT_PUBLIC_ZENITH_SHOPIFY_SOCKS_CHECKOUT_URL
        : process.env.NEXT_PUBLIC_ZENITH_SHOPIFY_SHIRT_CHECKOUT_URL;

  return resolveCheckoutUrl(envValue, fallbackUrl);
}

/**
 * Returns true when the Zenith store has any direct-checkout env vars
 * wired. Used by the UI to optionally surface a "⚡ One-click checkout"
 * micro-badge near Buy buttons so customers know they're seconds from
 * Apple Pay / Shop Pay.
 */
export function isZenithExpressCheckoutLive(): boolean {
  return [
    process.env.NEXT_PUBLIC_ZENITH_SHOPIFY_BALL_CHECKOUT_URL,
    process.env.NEXT_PUBLIC_ZENITH_SHOPIFY_SOCKS_CHECKOUT_URL,
    process.env.NEXT_PUBLIC_ZENITH_SHOPIFY_SHIRT_CHECKOUT_URL,
  ].some((v) => v && VALID_HTTPS.test(v));
}
