#!/usr/bin/env node
// @ts-check

/**
 * check-client-site-urls — guardrail for the trailing-slash bug.
 *
 * Locked 2026-05-09 after a recurring class-of-bug:
 *
 *   Hardcoded URLs of the form `/sites/SLUG/` (with trailing slash)
 *   trigger a 308 redirect chain on Vercel that some browsers render
 *   as 404 in a new tab. Same problem with `/sites/SLUG/#anchor`.
 *
 *   The fix is to either (a) use clientSiteFor(slug) from
 *   src/lib/client-site-urls.ts, or (b) use the explicit
 *   /sites/SLUG/index.html form which bypasses every redirect.
 *
 *   This script scans the codebase and FAILS the build if any forbidden
 *   pattern slips through. The single allowed file is
 *   src/lib/client-site-urls.ts — that's where the canonical URLs live.
 *
 * Usage:
 *   node scripts/check-client-site-urls.mjs        # exits 0 clean, 1 dirty
 *   node scripts/check-client-site-urls.mjs --fix  # NOT IMPLEMENTED
 *
 * Wired into package.json:
 *   "lint:site-urls": "node scripts/check-client-site-urls.mjs"
 *   "prebuild":      "npm run lint:site-urls"
 *
 * Runs on every Vercel build and locally with `npm run build`.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = ["src"];
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "dist", "build"]);

// Files that are EXEMPT from the rule. The canonical URL map is the
// one place where `/sites/SLUG/index.html` URLs live by design.
const ALLOW_FILES = new Set([
  "src/lib/client-site-urls.ts",
  // The check script's docs reference the bad pattern.
  "scripts/check-client-site-urls.mjs",
]);

// Regexes for the forbidden patterns. We want to catch:
//   - "/sites/some-slug/"          (followed by quote, hash, or whitespace)
//   - "/sites/some-slug/#anchor"
// We do NOT want to catch:
//   - "/sites/some-slug/index.html"  (explicit, allowed)
//   - "/sites/some-slug/index.html#anchor"
//   - "public/sites/some-slug/" used as a directory path
//   - The canonical CLIENT_SITES map values
const FORBIDDEN_PATTERNS = [
  // Trailing slash followed by quote / closing brace / hash
  /\/sites\/[a-z0-9-]+\/(?:["'`)\s,#])/g,
];

let totalViolations = 0;
const violations = [];

function walk(dir) {
  const abs = join(ROOT, dir);
  let entries;
  try {
    entries = readdirSync(abs);
  } catch {
    return;
  }

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(abs, entry);
    const rel = relative(ROOT, full).replaceAll("\\", "/");

    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }

    if (st.isDirectory()) {
      walk(rel);
    } else if (st.isFile() && /\.(ts|tsx|js|jsx|mjs)$/.test(entry)) {
      checkFile(full, rel);
    }
  }
}

function checkFile(absPath, relPath) {
  if (ALLOW_FILES.has(relPath)) return;

  let content;
  try {
    content = readFileSync(absPath, "utf-8");
  } catch {
    return;
  }

  // Skip directory-path usages — `public/sites/...` strings refer to
  // filesystem paths, not URLs. We only flag URL-shaped occurrences
  // (those without a `public/` prefix).
  for (const pattern of FORBIDDEN_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(content)) !== null) {
      // Skip if the match is preceded by `public` (means it's a fs
      // path, e.g. `public/sites/lcac/`). Look back ~16 chars and
      // check for the literal string `public` immediately before
      // the `/sites` portion of the match.
      const start = Math.max(0, match.index - 16);
      const before = content.slice(start, match.index);
      if (/public$/.test(before)) continue;

      // Skip if line is a comment describing the bug
      const lineStart = content.lastIndexOf("\n", match.index) + 1;
      const lineEnd = content.indexOf("\n", match.index);
      const line = content.slice(lineStart, lineEnd >= 0 ? lineEnd : undefined);
      if (/^\s*(\/\/|\*|#)/.test(line)) continue;

      const lineNum = content.slice(0, match.index).split("\n").length;
      violations.push({
        file: relPath,
        line: lineNum,
        match: match[0],
        context: line.trim().slice(0, 100),
      });
      totalViolations++;
    }
  }
}

console.log("[check-client-site-urls] scanning…");
for (const dir of SCAN_DIRS) walk(dir);

if (totalViolations === 0) {
  console.log("[check-client-site-urls] ✓ no trailing-slash /sites/ URLs found");
  process.exit(0);
}

console.error(`\n[check-client-site-urls] ✗ ${totalViolations} violation(s) found\n`);
console.error(
  "Hardcoded `/sites/SLUG/` URLs trigger a 308 redirect chain that\n" +
    "some browsers render as a 404 in new tabs. Fix each one by:\n" +
    "  (a) using clientSiteFor(slug) from src/lib/client-site-urls.ts, OR\n" +
    "  (b) using the explicit /sites/SLUG/index.html form\n",
);
console.error("Violations:");
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}`);
  console.error(`    matched: ${v.match}`);
  console.error(`    line:    ${v.context}`);
}
console.error("");
process.exit(1);
