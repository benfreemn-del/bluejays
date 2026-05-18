/**
 * Static skill registry.
 *
 * Every bj ai skill is registered here at build time. Adding a new
 * skill means: (1) drop the file under src/lib/ai-skills/skills/, (2)
 * add the import + REGISTRY entry below.
 *
 * Why static instead of fs-scanning .claude/skills/ at runtime:
 *   - Next.js serverless functions don't include arbitrary files
 *     outside src/ unless you fiddle with outputFileTracingIncludes
 *     (which we just spent a week burning down for the /public mess)
 *   - Static imports get tree-shaken + type-checked + IDE-navigable
 *   - The .claude/skills/ folder still exists as a Skill-tool-discoverable
 *     documentation mirror so Claude Code can also invoke these from
 *     a chat with `/echo` etc.
 */

import { echoSkill } from "./echo";
import { briefSkill } from "./brief";
import { qualifySkill } from "./qualify";
import { triageSkill } from "./triage";
import { draftTouchSkill } from "./draft-touch";
import type { Skill } from "../types";

export const SKILL_REGISTRY: Record<string, Skill> = {
  echo: echoSkill,
  brief: briefSkill,
  qualify: qualifySkill,
  triage: triageSkill,
  "draft-touch": draftTouchSkill,
};

export function listSkillNames(): string[] {
  return Object.keys(SKILL_REGISTRY);
}

export function getSkill(name: string): Skill | undefined {
  return SKILL_REGISTRY[name];
}
