/**
 * Smoke test for the Meta + Google Ads client mocks.
 * Run via: npx tsx scripts/smoke-test-ads-clients.ts
 *
 * Confirms: factory returns mock clients when env vars unset, mock
 * methods don't throw, returned shapes match the interfaces.
 */
import {
  getMetaAdsClient,
  isMetaAdsConfigured,
  resetMetaAdsClientCache,
} from "../src/lib/meta-ads-client";
import {
  getGoogleAdsClient,
  isGoogleAdsConfigured,
  resetGoogleAdsClientCache,
} from "../src/lib/google-ads-client";

async function main() {
  // Force mock mode by clearing env vars for the test
  delete process.env.META_ADS_SYSTEM_TOKEN;
  delete process.env.META_ADS_ACCOUNT_ID;
  delete process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  delete process.env.GOOGLE_ADS_REFRESH_TOKEN;
  resetMetaAdsClientCache();
  resetGoogleAdsClientCache();

  console.log("=== Meta Ads Client (mock) ===");
  console.log("isConfigured:", isMetaAdsConfigured());
  const meta = getMetaAdsClient();
  console.log("ping:", await meta.ping());
  console.log("aggregate insights:", (await meta.getInsights({ adId: "test_ad_1", daysBack: 7 }))[0]);
  console.log(
    "daily insights count:",
    (await meta.getInsights({ adId: "test_ad_1", daysBack: 7, granularity: "daily" })).length,
  );
  const newMetaAd = await meta.createAd({
    adSetId: "adset_123",
    name: "test-variant-1",
    headline: "Test headline",
    primaryText: "Test text",
    cta: "LEARN_MORE",
    destinationUrl: "https://bluejayportfolio.com/audit",
  });
  console.log("createAd:", newMetaAd.adId, newMetaAd.status);
  await meta.setAdStatus(newMetaAd.adId, "PAUSED");
  console.log("setAdStatus: ok");
  await meta.updateAdSetBudget({ adSetId: "adset_123", dailyBudgetUsd: 75 });
  console.log("updateAdSetBudget: ok");

  console.log("\n=== Google Ads Client (mock) ===");
  console.log("isConfigured:", isGoogleAdsConfigured());
  const google = getGoogleAdsClient();
  console.log("ping:", await google.ping());
  console.log("aggregate insights:", (await google.getInsights({ adId: "g_test_1", daysBack: 7 }))[0]);
  console.log(
    "daily insights count:",
    (await google.getInsights({ adId: "g_test_1", daysBack: 7, granularity: "daily" })).length,
  );
  const newGoogleAd = await google.createAd({
    adGroupId: "adgroup_456",
    name: "test-variant-1",
    headlines: ["Free Audit", "60-Sec Score", "See What's Costing You"],
    descriptions: ["Find out why your site isn't booking.", "Free. No card."],
    finalUrl: "https://bluejayportfolio.com/audit",
  });
  console.log("createAd:", newGoogleAd.adId, newGoogleAd.status);
  await google.setAdStatus(newGoogleAd.adId, "PAUSED");
  console.log("setAdStatus: ok");
  await google.updateCampaignBudget({ campaignId: "campaign_789", dailyBudgetUsd: 50 });
  console.log("updateCampaignBudget: ok");

  console.log("\nAll mock methods succeeded.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
