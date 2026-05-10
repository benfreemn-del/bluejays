#!/usr/bin/env node
/**
 * scaffold-portal-demo.mjs
 *
 * Spins up a working portal-demo scaffold for any slug from the
 * meyer-electric reference. Reads the matching spec doc at
 * docs/mock-backends/<slug>.md for industry context, copies the
 * reference layout/page/mock-data files, performs slug + business-
 * name substitutions, and writes a SCAFFOLD-TODO checklist at the
 * top of each file so the operator knows exactly what's left to
 * customize.
 *
 * Usage:
 *   node scripts/scaffold-portal-demo.mjs --slug=tacos-yum
 *   node scripts/scaffold-portal-demo.mjs --slug=foo --business="Foo Co" --ref=meyer-electric
 *
 * Args:
 *   --slug         (required)   target slug (e.g. tacos-yum)
 *   --business=    (optional)   pretty business name; defaults to title-cased slug
 *   --ref=         (optional)   reference portal-demo slug; defaults to meyer-electric
 *   --force        (optional)   overwrite existing portal-demo dir
 *   --dry          (optional)   print actions without writing files
 *
 * Per docs/MOCK_BACKEND_TEMPLATE_AUDIT.md — this is the universal-gap
 * fix that drops install time from ~3-4 hrs to ~30 minutes (30 sec
 * scaffold + ~30 min operator polish).
 *
 * v1 limitations (deliberate — keep the script tractable):
 *   · Does NOT rewrite meyer-electric's industry-specific lead-score
 *     formula, signal types, or mock-data sample rows. Operator
 *     swaps these per the spec doc.
 *   · Does NOT generate a fresh page.tsx from spec. v2 will when
 *     mock-data is refactored into a shell consuming a config.
 *   · Does NOT register the slug in service-clients.ts. That's a
 *     separate ship — see roadmap item #2 in the audit doc.
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

/* ───────────────── ARG PARSE ───────────────── */

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    if (a === "--force" || a === "--dry") return [a.replace(/^--/, ""), true];
    const [k, ...rest] = a.replace(/^--/, "").split("=");
    return [k, rest.join("=")];
  }),
);

if (!args.slug) {
  console.error("error: --slug=<slug> is required");
  console.error("usage: node scripts/scaffold-portal-demo.mjs --slug=<slug> [--business=\"Pretty Name\"] [--ref=meyer-electric] [--force] [--dry]");
  process.exit(1);
}

const slug = args.slug;
const ref = args.ref || "meyer-electric";
const force = !!args.force;
const dryRun = !!args.dry;

if (!/^[a-z0-9-]+$/.test(slug)) {
  console.error(`error: slug must match /^[a-z0-9-]+$/ (got "${slug}")`);
  process.exit(1);
}

/* ───────────────── DERIVE NAMES ───────────────── */

function titleCaseFromSlug(s) {
  return s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const businessName = args.business || titleCaseFromSlug(slug);
const refBusinessName = "Meyer Electric"; // hard-coded for now — only one ref

/* ───────────────── PATHS ───────────────── */

const refDir = join(ROOT, "src/app/clients", ref, "portal-demo");
const targetDir = join(ROOT, "src/app/clients", slug, "portal-demo");
const specPath = join(ROOT, "docs/mock-backends", `${slug}.md`);

if (!existsSync(refDir)) {
  console.error(`error: reference portal-demo not found at ${refDir}`);
  process.exit(1);
}

if (existsSync(targetDir) && !force) {
  console.error(`error: ${targetDir} already exists. Use --force to overwrite.`);
  process.exit(1);
}

const specExists = existsSync(specPath);
if (!specExists) {
  console.warn(`warning: no spec doc at docs/mock-backends/${slug}.md — scaffold will use generic placeholders.`);
}

/* ───────────────── PARSE SPEC (LIGHTWEIGHT) ───────────────── */

let spec = {
  audiences: [],
  affiliates: [],
  funnels: [],
  industryTweak: null,
};

if (specExists) {
  const md = readFileSync(specPath, "utf-8");
  // Customer / Audience category mix table — match either header variant
  // (church.md + restaurant.md use "Audience" because of their non-
  // commercial framing).
  const mixMatch = md.match(/(?:Customer|Audience) category mix[\s\S]*?\| Type \|[\s\S]*?\n\n/);
  if (mixMatch) {
    const rows = mixMatch[0]
      .split("\n")
      .filter((l) => l.startsWith("|") && !/^\|\s*-+/.test(l) && !/Type\s*\|/.test(l));
    spec.audiences = rows
      .map((r) => {
        const cells = r.split("|").map((c) => c.trim()).filter(Boolean);
        return cells[0]?.replace(/[*_`]/g, "");
      })
      .filter(Boolean)
      .slice(0, 8);
  }
  // Affiliate categories — same pattern
  const affMatch = md.match(/Affiliate categories[\s\S]*?\| Category \|[\s\S]*?\n\n/);
  if (affMatch) {
    const rows = affMatch[0]
      .split("\n")
      .filter((l) => l.startsWith("|") && !/^\|\s*-+/.test(l) && !/Category\s*\|/.test(l));
    spec.affiliates = rows
      .map((r) => r.split("|").map((c) => c.trim()).filter(Boolean)[0]?.replace(/[*_`]/g, ""))
      .filter(Boolean)
      .slice(0, 8);
  }
  // 4 standard funnels — match numbered list under "## 4 standard funnels"
  const funnelMatch = md.match(/## 4 standard funnels[\s\S]*?\n##/);
  if (funnelMatch) {
    const lines = funnelMatch[0].split("\n").filter((l) => /^\d+\.\s+\*\*/.test(l));
    spec.funnels = lines
      .map((l) => l.match(/\*\*([^*]+)\*\*/)?.[1])
      .filter(Boolean);
  }
}

/* ───────────────── BUILD TODO HEADER ───────────────── */

const todoHeader = [
  "/* ═══════════════════════════════════════════════════════════════════",
  ` * SCAFFOLD-TODO · ${slug} portal-demo`,
  ` * Generated ${new Date().toISOString().slice(0, 10)} from ref=${ref}`,
  " *",
  " * Before this demo is prospect-ready, review:",
  ` *   1. Update business name in copy (${refBusinessName} → ${businessName})`,
  " *   2. Swap industry-specific lead types + signals in mock-data.ts",
  " *      (electrician signals → your industry's signals)",
  " *   3. Replace Pacific-Northwest geography with prospect's region",
  " *   4. Update the audience taxonomy from your spec doc:",
  spec.audiences.length > 0
    ? ` *      • Audiences: ${spec.audiences.join(", ")}`
    : " *      • Audiences: see docs/mock-backends/<slug>.md",
  spec.affiliates.length > 0
    ? ` *      • Affiliates: ${spec.affiliates.slice(0, 4).join(", ")}…`
    : " *      • Affiliates: see docs/mock-backends/<slug>.md",
  spec.funnels.length > 0
    ? ` *      • Funnels: ${spec.funnels.join(" / ")}`
    : " *      • Funnels: see docs/mock-backends/<slug>.md",
  " *   5. Rewire interactive features per spec (calculator + sizing tool)",
  " *   6. Update sample-data city list (currently Olympic Peninsula)",
  " *   7. Test password gate '1212' — should still work out of the box",
  " *",
  ` * Spec: docs/mock-backends/${slug}.md`,
  " * Playbook: docs/MOCK_BACKEND_PLAYBOOK.md",
  " * ═══════════════════════════════════════════════════════════════════ */",
  "",
].join("\n");

/* ───────────────── COPY + SUBSTITUTE ───────────────── */

function listFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? listFiles(full) : [full];
  });
}

function applySubstitutions(content) {
  // Be conservative — the goal is to flag what changed, not to silently
  // rewrite industry-specific copy.
  return content
    .replace(/meyer-electric/g, slug)
    .replace(/Meyer Electric/g, businessName);
}

const files = listFiles(refDir);
const written = [];

for (const sourceFile of files) {
  const rel = sourceFile.slice(refDir.length).replace(/^[\\/]/, "");
  const targetFile = join(targetDir, rel);
  const targetParentDir = dirname(targetFile);

  let content = readFileSync(sourceFile, "utf-8");
  content = applySubstitutions(content);

  // Inject TODO header at top (after first comment block if it's a /* ... */)
  const isTSish = /\.(ts|tsx|js|mjs)$/.test(targetFile);
  if (isTSish) {
    const firstClose = content.indexOf("*/");
    if (firstClose !== -1 && content.slice(0, 200).startsWith("/")) {
      content = content.slice(0, firstClose + 2) + "\n\n" + todoHeader + content.slice(firstClose + 2);
    } else {
      content = todoHeader + content;
    }
  }

  if (dryRun) {
    console.log(`[dry] would write ${targetFile} (${content.length} bytes)`);
  } else {
    if (!existsSync(targetParentDir)) mkdirSync(targetParentDir, { recursive: true });
    writeFileSync(targetFile, content, "utf-8");
    written.push(rel);
  }
}

/* ───────────────── REPORT ───────────────── */

console.log("");
console.log(`✓ Scaffold complete for ${slug}/portal-demo`);
console.log(`  Reference: ${ref}`);
console.log(`  Business name: ${businessName}`);
console.log(`  Spec doc: ${specExists ? "✓ found" : "✗ MISSING (using generic placeholders)"}`);
if (spec.audiences.length > 0) {
  console.log(`  Spec audiences (${spec.audiences.length}): ${spec.audiences.slice(0, 4).join(", ")}…`);
}
console.log(`  Files ${dryRun ? "would write" : "written"}: ${written.length || files.length}`);
if (!dryRun) {
  written.forEach((f) => console.log(`    + ${f}`));
}
console.log("");
console.log("Next steps:");
console.log(`  1. cd src/app/clients/${slug}/portal-demo`);
console.log("  2. Read the SCAFFOLD-TODO comment at the top of each file");
console.log("  3. Apply the per-spec swaps (mock-data signals, copy, geography)");
console.log(`  4. Add password feather to the public site at src/app/clients/${slug}/page.tsx`);
console.log(`  5. Test: visit /clients/${slug}/portal-demo, password "1212"`);
console.log("");
