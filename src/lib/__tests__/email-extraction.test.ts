import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidEmail } from "../scraper";

// Confirmed false positives from a 2026-05-09 bulk MX-record sweep —
// retina image filenames the old regex was matching as fake emails.
const IMAGE_FILENAME_FALSE_POSITIVES = [
  "Guarantee@2x.webp",
  "fancybox_loading@2x.gif",
  "logo-header-unscrolled@1x.webp",
  "Beach-Side@2x-scaled.webp",
  "about-truck-new-300x221@2x.webp",
  "community-photo-300x269@2x.avif",
  "logo@x2.png.webp",
  "ready-set-remove-logo@2x.webp",
  "flags@2x.webp",
];

const REAL_EMAILS = [
  "hello@bluejayportfolio.com",
  "info@hectorlandscaping.com",
  "ben@bluejaywebs.com",
  "support@example.org",
  "owner@small-shop.co.uk",
  "first.last+tag@startup.io",
];

test("rejects retina image filenames as fake emails", () => {
  for (const fp of IMAGE_FILENAME_FALSE_POSITIVES) {
    assert.equal(
      isValidEmail(fp),
      false,
      `Expected isValidEmail("${fp}") === false`,
    );
  }
});

test("accepts real email addresses", () => {
  for (const email of REAL_EMAILS) {
    assert.equal(
      isValidEmail(email),
      true,
      `Expected isValidEmail("${email}") === true`,
    );
  }
});

test("rejects miscellaneous obvious junk", () => {
  const junk = [
    "",
    "not-an-email",
    "missing-tld@example",
    "@no-local.com",
    "no-at-sign.com",
    "double@@at.com",
    "trailing-dot@example.",
  ];
  for (const j of junk) {
    assert.equal(isValidEmail(j), false, `Expected isValidEmail("${j}") === false`);
  }
});
