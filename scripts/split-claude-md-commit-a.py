#!/usr/bin/env python3
"""Commit A · move dated session-locked rule sections from CLAUDE.md
to docs/archive/2026-Q2-locked-rules.md.

Run from the repo root. Idempotent — only moves sections that match
specific section headings; if you re-run, sections that have already
been moved are no-ops.

Sections moved:
  - BEN'S HOME TODO LIST (updated 2026-04-22)
  - Marketing Plan — Cold Outreach Without SMS (locked in 2026-04-20)
  - Locked-In Rules — Session 2026-04-23 (post-launch)
  - Locked-In Rules — 2026-04-23 evening (V2 showcase audit)
  - Locked-In Rules — 2026-04-24 evening (Wave 1 sales-funnel)
  - Stripe LIVE Launch Procedure (locked 2026-04-25)
  - Review Blast Wave 1 — Customer-Facing Fulfillment
  - Test Group Wave 1 — Full-Stack Outreach Test
  - Locked-In Rules — 2026-04-26 evening (audit funnel)
  - Locked-In Rules — 2026-04-27 (Stage-2 Hyperloop)
  - Daily Task System — 30-Day Growth Ramp
  - 6-Month Marketing Ramp Plan
"""

import os
import re

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLAUDE_MD = os.path.join(REPO_ROOT, "CLAUDE.md")
ARCHIVE = os.path.join(REPO_ROOT, "docs", "archive", "2026-Q2-locked-rules.md")

# Section headings to move. Match the START heading exactly; the section
# ends at the next "## " heading.
SECTIONS_TO_MOVE = [
    "## ════════════════════════════════════════════",  # BEN'S HOME TODO triple-line wrapper
    "## Marketing Plan — Cold Outreach Without SMS (locked in 2026-04-20)",
    "## Locked-In Rules — Session 2026-04-23 (post-launch hardening)",
    "## Locked-In Rules — Session 2026-04-23 evening (V2 showcase image audit)",
    "## Locked-In Rules — Session 2026-04-24 evening (Wave 1 sales-funnel hardening)",
    "## Stripe LIVE Launch Procedure (locked 2026-04-25)",
    "## Review Blast Wave 1 — Customer-Facing Fulfillment (Locked 2026-04-25)",
    "## Test Group Wave 1 — Full-Stack Outreach Test (Locked 2026-04-25)",
    "## Locked-In Rules — Session 2026-04-26 evening (audit funnel hardening)",
    "## Locked-In Rules — Session 2026-04-27 (Stage-2 Hyperloop hardening)",
    "## Daily Task System — 30-Day Growth Ramp (started 2026-04-28)",
    "## 6-Month Marketing Ramp Plan (started 2026-04-28)",
]


def main() -> None:
    with open(CLAUDE_MD, "r", encoding="utf-8") as f:
        lines = f.readlines()

    # Find each section's range. A section starts at its heading line
    # and ends just before the next "## " heading line.
    moves: list[tuple[int, int, str]] = []  # (start_idx, end_idx_excl, heading)
    i = 0
    while i < len(lines):
        line = lines[i].rstrip("\n")

        # Special-case the triple-line wrapper for BEN'S HOME TODO.
        # The heading "## ═══..." appears 3 times — skip if we've
        # already captured the BEN'S TODO range.
        if line == "## ════════════════════════════════════════════" and (
            i + 1 < len(lines)
            and "BEN'S HOME TODO LIST" in lines[i + 1]
        ):
            # Section runs from this line until the next non-wrapper "## " heading.
            j = i + 3  # skip the three wrapper lines + 1 blank
            while j < len(lines):
                if lines[j].startswith("## ") and not lines[j].rstrip("\n").startswith(
                    "## ════"
                ):
                    break
                j += 1
            moves.append((i, j, "BEN'S HOME TODO LIST (updated 2026-04-22)"))
            i = j
            continue

        if line in SECTIONS_TO_MOVE:
            j = i + 1
            while j < len(lines):
                if lines[j].startswith("## "):
                    break
                j += 1
            moves.append((i, j, line.lstrip("# ").rstrip()))
            i = j
            continue

        i += 1

    if not moves:
        print("No matching sections found — nothing to move.")
        return

    # Build the archive content (in original order, with separator headers).
    archive_chunks: list[str] = []
    archive_chunks.append("# 2026 Q2 · Archived rules and plans\n")
    archive_chunks.append("\n")
    archive_chunks.append(
        "Sections moved out of CLAUDE.md on 2026-05-07 to keep the\n"
        "always-loaded rules surface lean. Each section below was a\n"
        "real, applied rule at the time it was locked — preserved here\n"
        "verbatim for historical reference. NOT actively enforced unless\n"
        "the rule was duplicated into the slim CLAUDE.md.\n"
    )
    archive_chunks.append("\n---\n\n")

    for start, end, heading in moves:
        archive_chunks.append(f"<!-- archived {heading} -->\n\n")
        archive_chunks.extend(lines[start:end])
        if not lines[end - 1].endswith("\n"):
            archive_chunks.append("\n")
        archive_chunks.append("\n---\n\n")

    # Build the new CLAUDE.md by skipping the moved ranges.
    moved_ranges = sorted(moves, key=lambda m: m[0])
    new_lines: list[str] = []
    cursor = 0
    for start, end, _ in moved_ranges:
        new_lines.extend(lines[cursor:start])
        cursor = end
    new_lines.extend(lines[cursor:])

    # Write the archive.
    os.makedirs(os.path.dirname(ARCHIVE), exist_ok=True)
    if os.path.exists(ARCHIVE):
        # Append, don't overwrite — preserves manual edits + lets
        # subsequent commits stack their archives.
        with open(ARCHIVE, "a", encoding="utf-8") as f:
            f.writelines(archive_chunks)
    else:
        with open(ARCHIVE, "w", encoding="utf-8") as f:
            f.writelines(archive_chunks)

    # Write the slimmed CLAUDE.md.
    with open(CLAUDE_MD, "w", encoding="utf-8") as f:
        f.writelines(new_lines)

    print(f"Moved {len(moves)} sections")
    moved_lines = sum(end - start for start, end, _ in moves)
    print(f"Removed {moved_lines} lines from CLAUDE.md")
    print(f"Archive: {ARCHIVE}")


if __name__ == "__main__":
    main()
