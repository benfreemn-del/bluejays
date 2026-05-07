#!/usr/bin/env python3
"""Commit B · move long playbook/spec sections from CLAUDE.md to
docs/playbooks/ + the residual dated content to docs/archive/.

Each moved section is replaced in CLAUDE.md by a one-line pointer so
future sessions can find it on demand without losing context.

Idempotent — only moves sections whose heading still exists.
"""

import os

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLAUDE_MD = os.path.join(REPO_ROOT, "CLAUDE.md")

# Each entry: (heading_to_match, target_relative_path, pointer_text)
MOVES = [
    (
        "## Mandatory Premium Features Per V2 Template (NON-NEGOTIABLE)",
        "docs/playbooks/v2-template-features.md",
        "## V2 Template Features — see docs/playbooks/v2-template-features.md\n\n"
        "Every premium feature mandated for new V2 category templates. Read on "
        "demand when building a new V2 template (electrician, plumber, salon, etc.).\n",
    ),
    (
        "## Locked QC Generation Rules (NON-NEGOTIABLE)",
        "docs/playbooks/qc-generation-rules.md",
        "## QC Generation Rules — see docs/playbooks/qc-generation-rules.md\n\n"
        "Rules locked into the site-generator pipeline. Read when modifying "
        "src/lib/site-audit.ts, src/lib/scraper.ts, or any prompt that drives "
        "automatic site copy/asset selection.\n",
    ),
    (
        "## Quality Gate — TWO Failsafes (NON-NEGOTIABLE)",
        "docs/playbooks/quality-gate-failsafes.md",
        "## Quality Gate — see docs/playbooks/quality-gate-failsafes.md\n\n"
        "The two failsafes (gate 1 = pre-generation lockout; gate 2 = "
        "post-generation auto-flag-for-review) that protect the production "
        "funnel from leaking bad output. Read when changing the QC pipeline.\n",
    ),
    (
        "## North Star: 5,000 Paying Sites — The Failure-Is-Not-An-Option Plan",
        "docs/playbooks/north-star-5k-paying-sites.md",
        "## North Star — see docs/playbooks/north-star-5k-paying-sites.md\n\n"
        "Long-form strategic plan: 5,000 paying sites at $997 = $5M ARR. Read "
        "when making decisions that touch growth strategy, pricing, or capacity.\n",
    ),
    (
        "## Today's Tasks — Day [N] ([date])",
        "docs/archive/2026-Q2-locked-rules.md",  # appended
        "## Today's Tasks — moved to docs/archive/2026-Q2-locked-rules.md\n\n"
        "Daily-task playbook from the 30-day growth ramp. Stale by design — "
        "the live to-do is /dashboard/all-tasks. Archive only.\n",
    ),
    (
        "## Locked-In Rules — Session 2026-05-06 evening (manufacturer ICP buildout + Madie's portal)",
        "docs/archive/2026-Q2-locked-rules.md",  # appended
        "## Locked-In Rules · 2026-05-06 evening — moved to docs/archive/2026-Q2-locked-rules.md\n\n"
        "Manufacturer ICP buildout + Madie's portal restore. Read on demand "
        "if a question references that build.\n",
    ),
]


def main() -> None:
    with open(CLAUDE_MD, "r", encoding="utf-8") as f:
        lines = f.readlines()

    moves: list[tuple[int, int, str, str, str]] = []
    # (start_idx, end_idx_excl, heading, target_path, pointer_text)

    i = 0
    while i < len(lines):
        line = lines[i].rstrip("\n")
        for heading, target, pointer in MOVES:
            if line == heading:
                j = i + 1
                while j < len(lines):
                    if lines[j].startswith("## "):
                        break
                    j += 1
                moves.append((i, j, heading, target, pointer))
                i = j
                break
        else:
            i += 1
            continue

    if not moves:
        print("No matching sections found.")
        return

    # Group by target path so each playbook gets one file with one
    # heading; archive appends instead.
    by_target: dict[str, list[tuple[int, int, str, str]]] = {}
    for start, end, heading, target, pointer in moves:
        by_target.setdefault(target, []).append((start, end, heading, pointer))

    for target, entries in by_target.items():
        target_abs = os.path.join(REPO_ROOT, target)
        os.makedirs(os.path.dirname(target_abs), exist_ok=True)

        is_archive = "/archive/" in target.replace("\\", "/")
        existed = os.path.exists(target_abs)

        with open(target_abs, "a" if (is_archive and existed) else "w", encoding="utf-8") as f:
            if not (is_archive and existed):
                # Playbook header
                heading_for_file = entries[0][2].lstrip("# ").rstrip()
                f.write(f"# {heading_for_file}\n\n")
                f.write(
                    f"Moved out of CLAUDE.md on 2026-05-07 to keep the always-"
                    f"loaded surface lean. Read this file on demand when the "
                    f"topic comes up.\n\n---\n\n"
                )
            for start, end, heading, _ in entries:
                f.write(f"<!-- moved from CLAUDE.md: {heading} -->\n\n")
                f.writelines(lines[start:end])
                f.write("\n---\n\n")

    # Build new CLAUDE.md: replace each moved range with its pointer.
    moved_ranges = sorted(moves, key=lambda m: m[0])
    new_lines: list[str] = []
    cursor = 0
    for start, end, _, _, pointer in moved_ranges:
        new_lines.extend(lines[cursor:start])
        new_lines.append(pointer)
        if not pointer.endswith("\n"):
            new_lines.append("\n")
        new_lines.append("\n")
        cursor = end
    new_lines.extend(lines[cursor:])

    with open(CLAUDE_MD, "w", encoding="utf-8") as f:
        f.writelines(new_lines)

    print(f"Moved {len(moves)} sections")
    moved_lines = sum(end - start for start, end, _, _, _ in moves)
    print(f"Removed {moved_lines} lines from CLAUDE.md (replaced with pointers)")


if __name__ == "__main__":
    main()
