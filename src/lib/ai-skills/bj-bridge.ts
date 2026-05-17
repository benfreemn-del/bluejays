/**
 * Subprocess bridge — invoke bj.mjs subcommands from inside a Node
 * runtime and capture the stdout.
 *
 * Why this exists: skill context-gatherers should compose the
 * existing deterministic CLI commands (`bj leads list`, `bj signals
 * tail`, etc.) rather than reimplementing the Supabase queries
 * directly. That way:
 *   - Output formatting stays consistent with what Ben sees in his
 *     terminal (so debugging is symmetrical)
 *   - bj.mjs's safety guards (rate limits, env checks) apply to
 *     skill-driven reads
 *   - When bj.mjs gets a new subcommand, every skill picks it up
 *     for free
 *
 * Not suitable for high-frequency loops (subprocess spawn cost is
 * ~30ms). Use direct Supabase queries inside the skill if a
 * context-gatherer needs > ~20 reads.
 */

import { spawn } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Resolve repo root from this file's location at build time.
// __dirname at runtime in Next's bundled context isn't reliable, so
// we walk up from import.meta.url instead.
function getBjScriptPath(): string {
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    // src/lib/ai-skills/ → up 3 → repo root → scripts/bj.mjs
    return join(here, "..", "..", "..", "scripts", "bj.mjs");
  } catch {
    // Fallback for environments where import.meta.url isn't set
    // (some test runners). Assumes process.cwd() is the bluejays root.
    return join(process.cwd(), "scripts", "bj.mjs");
  }
}

/**
 * Run `node scripts/bj.mjs <args>` and return stdout as a string.
 * Inherits process.env so SUPABASE_* + BJ_BASE_URL flow through.
 */
export function execBj(
  args: string[],
  opts: { timeoutMs?: number } = {},
): Promise<string> {
  const timeoutMs = opts.timeoutMs ?? 15_000;
  const script = getBjScriptPath();

  return new Promise((resolve, reject) => {
    const child = spawn("node", [script, ...args], {
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error(`bj ${args.join(" ")} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout.on("data", (b: Buffer) => (stdout += b.toString("utf8")));
    child.stderr.on("data", (b: Buffer) => (stderr += b.toString("utf8")));

    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        reject(new Error(`bj ${args.join(" ")} exited ${code}: ${stderr.trim()}`));
        return;
      }
      resolve(stdout.trim());
    });
  });
}

/** Convenience: split a bj subcommand string ("leads list --limit 5")
 *  into argv-style and run it. */
export function execBjCmd(cmd: string, opts?: { timeoutMs?: number }) {
  // Naive split — fine for our flag patterns which don't have spaces
  // inside quoted values yet. Upgrade to a real shell parser if a
  // skill ever needs --note "..." style args.
  const parts = cmd.trim().split(/\s+/);
  return execBj(parts, opts);
}
