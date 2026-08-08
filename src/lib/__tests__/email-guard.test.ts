import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getEmailPauseMode,
  isEmailAllowed,
  blockedCategories,
  SUPPRESSED_PROSPECT_STATUSES,
  type EmailPauseMode,
} from "../email-guard";

/**
 * These assertions encode the contract the whole outbound-email stack
 * depends on. The bug they exist to prevent: BLUEJAYS_EMAILS_PAUSED
 * looking like "all email stopped" while marketing kept sending,
 * because each send path re-derived the flag's meaning for itself.
 */

function withEnv<T>(value: string | undefined, fn: () => T): T {
  const prev = process.env.BLUEJAYS_EMAILS_PAUSED;
  if (value === undefined) delete process.env.BLUEJAYS_EMAILS_PAUSED;
  else process.env.BLUEJAYS_EMAILS_PAUSED = value;
  try {
    return fn();
  } finally {
    if (prev === undefined) delete process.env.BLUEJAYS_EMAILS_PAUSED;
    else process.env.BLUEJAYS_EMAILS_PAUSED = prev;
  }
}

test("unset env var means marketing is PAUSED (fails closed)", () => {
  withEnv(undefined, () => {
    assert.equal(getEmailPauseMode(), "marketing");
    assert.equal(isEmailAllowed("marketing"), false);
  });
});

test("an empty string is treated as unset, not as 'off'", () => {
  withEnv("", () => assert.equal(getEmailPauseMode(), "marketing"));
});

test("an unrecognised value fails closed rather than resuming outreach", () => {
  // A typo in the Vercel dashboard must never silently restart the
  // funnel. This is the whole reason the parser has an explicit
  // allow-list per mode instead of a truthiness check.
  withEnv("banana", () => {
    assert.equal(getEmailPauseMode(), "marketing");
    assert.equal(isEmailAllowed("marketing"), false);
  });
});

test("marketing pause spares transactional + internal", () => {
  withEnv("marketing", () => {
    assert.equal(isEmailAllowed("marketing"), false);
    // Client lead forwards and booking confirmations must survive —
    // blocking these is the Rule 68 failure (Hector lost 3 jobs).
    assert.equal(isEmailAllowed("transactional"), true);
    assert.equal(isEmailAllowed("internal"), true);
  });
});

test("'all' blocks every category including client lead forwards", () => {
  withEnv("all", () => {
    assert.equal(getEmailPauseMode(), "all");
    assert.deepEqual(blockedCategories("all").sort(), [
      "internal",
      "marketing",
      "transactional",
    ]);
    for (const c of ["marketing", "transactional", "internal"] as const) {
      assert.equal(isEmailAllowed(c), false);
    }
  });
});

test("resume values all map to 'off'", () => {
  for (const v of ["off", "false", "0", "no", "none", "resume"]) {
    withEnv(v, () => {
      assert.equal(getEmailPauseMode(), "off", `"${v}" should resume`);
      assert.equal(isEmailAllowed("marketing"), true);
    });
  }
});

test("legacy truthy values still pause (backwards compatible)", () => {
  // The flag previously used a truthiness check, so anyone who already
  // had BLUEJAYS_EMAILS_PAUSED=true set must stay paused.
  for (const v of ["true", "1", "yes", "on"]) {
    withEnv(v, () => assert.equal(getEmailPauseMode(), "marketing"));
  }
});

test("mode parsing is case-insensitive and whitespace-tolerant", () => {
  withEnv("  ALL  ", () => assert.equal(getEmailPauseMode(), "all"));
  withEnv("Off", () => assert.equal(getEmailPauseMode(), "off"));
});

test("'off' blocks nothing", () => {
  assert.deepEqual(blockedCategories("off" as EmailPauseMode), []);
});

test("opt-out statuses are suppressed from marketing recipient sets", () => {
  // The win-loss survey cron shipped emailing status='unsubscribed'
  // people. Any cron assembling its own recipient list filters on this.
  assert.ok(SUPPRESSED_PROSPECT_STATUSES.includes("unsubscribed"));
  assert.ok(SUPPRESSED_PROSPECT_STATUSES.includes("bounced"));
});
