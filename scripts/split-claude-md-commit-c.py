#!/usr/bin/env python3
"""Commit C · move outreach + site-copy template rules from CLAUDE.md
to docs/templates/."""

import os

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLAUDE_MD = os.path.join(REPO_ROOT, "CLAUDE.md")

MOVES = [
    (
        "## Outreach Email Template Rules (NON-NEGOTIABLE — locked in 2026-04-19)",
        "docs/templates/outreach-email-rules.md",
        "## Outreach Email Templates — see docs/templates/outreach-email-rules.md\n\n"
        "Locked rules for every cold-outreach email template. Read when "
        "editing src/lib/outreach/* or any new outbound email content.\n",
    ),
    (
        "## Outreach SMS Template Rules (NON-NEGOTIABLE — added 2026-04-19)",
        "docs/templates/outreach-sms-rules.md",
        "## Outreach SMS Templates — see docs/templates/outreach-sms-rules.md\n\n"
        "Locked rules for every cold-outreach SMS template (paired with "
        "Rule 35 TCPA gate). Read when editing inbound/outbound SMS content.\n",
    ),
    (
        "## Generated Site Copy Rules (NON-NEGOTIABLE — added 2026-04-19)",
        "docs/templates/generated-site-copy-rules.md",
        "## Generated Site Copy — see docs/templates/generated-site-copy-rules.md\n\n"
        "Rules every auto-generated site copy block must follow (hero "
        "headline, about, services, CTA, testimonials, etc.). Read when "
        "modifying generation prompts or template copy slots.\n",
    ),
]


def main() -> None:
    with open(CLAUDE_MD, "r", encoding="utf-8") as f:
        lines = f.readlines()

    moves: list[tuple[int, int, str, str, str]] = []
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

    for start, end, heading, target, _ in moves:
        target_abs = os.path.join(REPO_ROOT, target)
        os.makedirs(os.path.dirname(target_abs), exist_ok=True)
        heading_clean = heading.lstrip("# ").rstrip()
        with open(target_abs, "w", encoding="utf-8") as f:
            f.write(f"# {heading_clean}\n\n")
            f.write(
                f"Moved out of CLAUDE.md on 2026-05-07 to keep the always-"
                f"loaded surface lean. Read on demand.\n\n---\n\n"
            )
            f.writelines(lines[start:end])

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
    print(f"Removed {moved_lines} lines from CLAUDE.md")


if __name__ == "__main__":
    main()
