# TEKKY Build-Your-Player — Female avatar re-generation spec

**Problem:** the female set lacks the child → teen → adult age/size progression the male set has.
Female 01–03 (REC) are near-identical young women; the 5–15 image isn't a young child, and the
"Ages 8–15" label doesn't match the boys' "Ages 5–15". Regenerate all 15 female images in order.

**Best method:** feed Hyper Agent (or any image model) the matching MALE image as a style reference
for each one. Change ONLY the athlete — keep the male image's kit color, star count + color,
background, framing, ball, and bottom label text identical. This guarantees the girls line up with
the boys tier-for-tier.

## Master style (constant across all 15)
3D animated character, modern Pixar/Disney sports-movie style. Full-body, front-facing, standing
straight, friendly confident smile, holding a TEKKY soccer ball at waist height with both hands
(white ball, teal/navy panels, "TEKKY" + small Z logo). Soft studio rim lighting. Deep navy
radial-gradient backdrop (#0a1830 → #16243f). Glowing stars in the upper corners (count/color per
tier — match the male reference). Big bold uppercase tier name centered at the very bottom, with
"Ages X–Y" beneath in lighter weight. Vertical 3:4 portrait. **Identical character proportions and
camera framing across the whole set** so any image swaps in cleanly.

## The fix — age/build MUST differ visibly per age band
- **Ages 5–15:** a YOUNG CHILD. Small, short, rounder child face, larger head-to-body ratio, kid
  proportions. Clearly ~8 years old. (Currently wrong — drawn as a teen.)
- **Ages 13–25:** a TEENAGER. Taller, leaner athletic teen, more defined features. Clearly older
  and taller than the 5–15.
- **Ages 25–35:** a full ADULT WOMAN. Tallest, mature adult face, athletic adult build. Clearly
  older and bigger than the teen.

Each step up = visibly TALLER and OLDER than the one before. Vary hair/skin tone subtly so they
aren't clones, but keep one consistent art style.

## Label fix
Bottom labels must read exactly (match the boys): "Ages 5-15", "Ages 13-25", "Ages 25-35".
Replace the current "Ages 8-15" on the REC 5–15 image.

## The 15 files to regenerate (overwrite in /public/avatars/tekky/female/)
| File | Reference (male) | Tier label | Age band | Athlete |
|---|---|---|---|---|
| 01_rec_age_5-15.png | male/01 | REC | Ages 5-15 | young girl (child) |
| 02_rec_age_13-25.png | male/02 | REC | Ages 13-25 | teen girl |
| 03_rec_age_25-35.png | male/03 | REC | Ages 25-35 | adult woman |
| 04_travel_age_5-15.png | male/04 | TRAVEL | Ages 5-15 | young girl (child) |
| 05_travel_age_13-25.png | male/05 | TRAVEL | Ages 13-25 | teen girl |
| 06_travel_age_25-35.png | male/06 | TRAVEL | Ages 25-35 | adult woman |
| 07_club_age_5-15.png | male/07 | CLUB | Ages 5-15 | young girl (child) |
| 08_club_age_13-25.png | male/08 | CLUB | Ages 13-25 | teen girl |
| 09_club_age_25-35.png | male/09 | CLUB | Ages 25-35 | adult woman |
| 10_ecnl_mls_next_age_5-15.png | male/10 | ECNL / MLS NEXT | Ages 5-15 | young girl (child) |
| 11_ecnl_mls_next_age_13-25.png | male/11 | ECNL / MLS NEXT | Ages 13-25 | teen girl |
| 12_ecnl_mls_next_age_25-35.png | male/12 | ECNL / MLS NEXT | Ages 25-35 | adult woman |
| 13_elite_age_5-15.png | male/13 | ELITE | Ages 5-15 | young girl (child) |
| 14_elite_age_13-25.png | male/14 | ELITE | Ages 13-25 | teen girl |
| 15_elite_age_25-35.png | male/15 | ELITE | Ages 25-35 | adult woman |

Kit colors + star counts are whatever the matching male image shows (REC = light blue + 2 blue
stars, etc.) — don't re-specify, just match the reference so the two genders stay in sync.

Once regenerated, drop them into /public/avatars/tekky/female/ with the EXACT filenames above and
redeploy the bluejays site. The quiz already swaps to the female folder when "Girl" is selected.
