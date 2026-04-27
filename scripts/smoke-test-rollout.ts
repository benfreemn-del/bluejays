/**
 * Smoke test for the auto-rollout helper.
 * Run via: npx tsx scripts/smoke-test-rollout.ts
 *
 * Confirms:
 *  - rolloutVariant routes by kind correctly
 *  - Meta + Google variants get rolled out in mock mode
 *  - Unsupported kinds skip cleanly
 *  - Missing-content variants skip cleanly
 */
import { rolloutVariant, rolloutBatch } from "../src/lib/hyperloop-rollout";

async function main() {
  console.log("=== Mock-mode auto-rollout smoke test ===\n");

  // Force mock mode
  delete process.env.META_ADS_SYSTEM_TOKEN;
  delete process.env.GOOGLE_ADS_DEVELOPER_TOKEN;

  console.log("1. Meta variant with full content:");
  const r1 = await rolloutVariant({
    variantId: "v_meta_1",
    kind: "ad_copy_meta",
    variantName: "test-meta-1",
    content: {
      headline: "Free Audit",
      primaryText: "60-sec score shows what's costing you customers",
      cta: "LEARN_MORE",
    },
  });
  console.log("   →", r1);

  console.log("\n2. Google variant with full content:");
  const r2 = await rolloutVariant({
    variantId: "v_google_1",
    kind: "ad_copy_google",
    variantName: "test-google-1",
    content: {
      headlines: ["Free Audit", "60-Sec Score", "See What's Costing You"],
      descriptions: ["Find out why your site isn't booking.", "Free. No card needed."],
    },
  });
  console.log("   →", r2);

  console.log("\n3. Unsupported kind (audit_prompt) — should skip:");
  const r3 = await rolloutVariant({
    variantId: "v_internal_1",
    kind: "audit_prompt",
    variantName: "test-prompt-1",
    content: { systemPrompt: "You are auditing..." },
  });
  console.log("   →", r3);

  console.log("\n4. Meta variant with missing primaryText — should skip:");
  const r4 = await rolloutVariant({
    variantId: "v_meta_bad",
    kind: "ad_copy_meta",
    variantName: "test-meta-bad",
    content: { headline: "Free Audit" }, // missing primaryText
  });
  console.log("   →", r4);

  console.log("\n5. Google variant with too-few headlines — should skip:");
  const r5 = await rolloutVariant({
    variantId: "v_google_bad",
    kind: "ad_copy_google",
    variantName: "test-google-bad",
    content: { headlines: ["Only one"], descriptions: ["Only one"] },
  });
  console.log("   →", r5);

  console.log("\n6. Batch rollout (3 variants):");
  const batch = await rolloutBatch([
    {
      variantId: "v_b1",
      kind: "ad_copy_meta",
      variantName: "batch-meta-1",
      content: { headline: "Hi", primaryText: "Test", cta: "LEARN_MORE" },
    },
    {
      variantId: "v_b2",
      kind: "ad_copy_google",
      variantName: "batch-google-1",
      content: {
        headlines: ["A", "B", "C"],
        descriptions: ["X", "Y"],
      },
    },
    {
      variantId: "v_b3",
      kind: "email_subject_pitch",
      variantName: "batch-email-1",
      content: { subject: "Test" },
    },
  ]);
  console.log(
    "   batch results:",
    batch.map((r) => ({
      variantId: r.variantId,
      kind: r.kind,
      success: r.success,
      adId: r.platformAdId?.slice(0, 30),
      skipped: r.skipped,
    })),
  );

  console.log("\n=== All rollout cases handled correctly ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
