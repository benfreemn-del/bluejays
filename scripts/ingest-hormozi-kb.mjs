#!/usr/bin/env node
// @ts-check

/**
 * ingest-hormozi-kb — add a chunk to the Hormozi diagnostic agent KB.
 *
 * Usage:
 *   # From a file (recommended for long transcripts)
 *   node scripts/ingest-hormozi-kb.mjs \
 *     --title "Closing Without Selling" \
 *     --url "https://youtu.be/XXXXX" \
 *     --tags offer,sales,close \
 *     --kind youtube \
 *     --file ./transcript.txt
 *
 *   # From stdin (paste then Ctrl-D)
 *   pbpaste | node scripts/ingest-hormozi-kb.mjs --title "Pricing Power" \
 *     --tags pricing,offer --kind framework
 *
 *   # List what's already in the KB
 *   node scripts/ingest-hormozi-kb.mjs --list
 *
 * Long transcripts (8k+ words) should be split into 1-2k word chunks
 * with distinct titles so the tag-based loader can select tightly.
 *
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in env (.env.local).
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// Load .env.local if present so the CLI works without `dotenv` wrapping
try {
  const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
  }
} catch {
  // .env.local missing is fine if env is set externally
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in env.");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) {
        out[key] = true;
      } else {
        out[key] = next;
        i++;
      }
    } else {
      out._.push(a);
    }
  }
  return out;
}

async function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (c) => (data += c));
    process.stdin.on("end", () => resolve(data));
  });
}

async function listKB() {
  const { data, error } = await sb
    .from("hormozi_kb_chunks")
    .select("id, title, source_kind, topic_tags, word_count, created_at")
    .order("created_at", { ascending: false });
  if (error) {
    console.error(error.message);
    process.exit(1);
  }
  console.log(`KB has ${data.length} chunks:\n`);
  for (const r of data) {
    console.log(
      `· [${r.source_kind}] ${r.title}  (${r.word_count} words, tags: ${r.topic_tags.join(",")})`,
    );
  }
}

async function main() {
  const args = parseArgs(process.argv);

  if (args.list) {
    await listKB();
    return;
  }

  if (!args.title || !args.tags) {
    console.error(
      "Required: --title \"...\" --tags tag1,tag2 [--kind framework|youtube|book|note] [--url ...] [--file path | stdin]",
    );
    process.exit(1);
  }

  let content;
  if (args.file) {
    content = readFileSync(args.file, "utf8");
  } else {
    if (process.stdin.isTTY) {
      console.error("Provide content via --file or pipe stdin");
      process.exit(1);
    }
    content = await readStdin();
  }
  content = String(content).trim();
  if (content.length < 50) {
    console.error("Content too short (need 50+ chars).");
    process.exit(1);
  }

  const tags = String(args.tags)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const kind = args.kind || (args.url ? "youtube" : "note");
  if (!["framework", "youtube", "book", "note"].includes(kind)) {
    console.error(`Invalid --kind: ${kind}`);
    process.exit(1);
  }

  const { data, error } = await sb
    .from("hormozi_kb_chunks")
    .insert({
      title: String(args.title),
      source_kind: kind,
      source_url: args.url ? String(args.url) : null,
      topic_tags: tags,
      content,
    })
    .select("id, word_count")
    .single();

  if (error) {
    console.error(error.message);
    process.exit(1);
  }
  console.log(`✓ Ingested "${args.title}" (${data.word_count} words, id ${data.id})`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
