/**
 * Generate 13 character portraits for the Bloodlines client showcase.
 *
 * Uses OpenAI gpt-image-1 (best image model as of 2025) at quality=high.
 * Cost: ~$0.17 per HD image × 13 = ~$2.21 total. Logged to console.
 *
 * Output: /public/images/clients/bloodlines/characters/<id>.png
 *
 * Run: node --env-file=.env.local scripts/generate-bloodlines-portraits.mjs
 *
 * Re-running is safe — overwrites any existing portrait file. Skip a
 * single character with --only=<id> or --skip=<id1,id2>.
 */

import { writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "../public/images/clients/bloodlines/characters");

const STYLE_SUFFIX =
  " — Painterly fantasy book-cover portrait, head and shoulders composition, " +
  "head positioned in upper third of frame so a circular face crop reads cleanly. " +
  "Cinematic atmospheric lighting with deep golden and crimson color grade against " +
  "a smoky charcoal/leather background. Donato Giancola / Brom style — detailed but " +
  "painterly, not photorealistic, not anime, not stylized cartoon. Solemn fantasy " +
  "tone matching a sword-and-sorcery saga with a hidden tech-magic core. " +
  "Aged-parchment and oil-painting texture. No text, no captions, no logos, no watermarks. " +
  "Square 1024x1024 format.";

const CHARACTERS = [
  {
    id: "sopher",
    prompt:
      "Sopher Brooks — a young man in his late teens, farm boy turned reluctant warrior, " +
      "sun-weathered face with the high cheekbones of someone raised on hard work, dark " +
      "windblown hair, plain Uplands homespun tunic in linen and leather, simple sword " +
      "strap visible at the shoulder, caught between fear and quiet resolve, gaze directed " +
      "slightly off-camera as if just spotted something on the road.",
  },
  {
    id: "proph",
    prompt:
      "Shiloh \"Proph\" Morgan — a young woman in her late teens, watchful unblinking eyes, " +
      "the wilted-rose sigil tattooed on her neck just beneath the jaw line, dark hair " +
      "loosely braided over one shoulder, plain Uplands traveling clothes in muted earth " +
      "tones, expression of quiet intensity — the look of someone who sees more than she " +
      "ever lets on. Subtle warmth behind the guard.",
  },
  {
    id: "avi",
    prompt:
      "Queen Avi — a young queen in her early twenties, fine golden circlet resting on her " +
      "brow, formal Annarose royal vestments in deep crimson and beaten gold, embroidery " +
      "of the kingdom's heraldry on the high collar, composed regal expression carrying the " +
      "weight of a crown her advisors think she does not yet understand. Pale skin, dark " +
      "auburn hair, eyes that have already started reading the room.",
  },
  {
    id: "alice",
    prompt:
      "Alice — a court healer in her mid-thirties, calm steady eyes, hands lifted slightly " +
      "with faint tideborn-elleta water-glow shimmering at her wrists, simple practical " +
      "healer's robes in slate blue and natural linen, dark hair tied back, lined kind " +
      "face, the look of someone who has kept half a court alive and lost too much sleep " +
      "to the other half.",
  },
  {
    id: "talia",
    prompt:
      "Talia — a young woman in her late teens, freckles across her nose, the hint of an " +
      "easy slight smile, plain Uplands kitchen-table everyday clothing in soft cream and " +
      "russet, warm chestnut hair, eyes that see through people but forgive them anyway. " +
      "Quietly the steadiest person in the room.",
  },
  {
    id: "quade",
    prompt:
      "Quade — a Royal Guard veteran in his late thirties, weathered scarred face, " +
      "Annarose Royal Guard armor in burnished gold and crimson with the kingdom's " +
      "heraldry on the breastplate, the strap of a foldable broadsword visible across " +
      "his shoulder, slow-to-draw expression of tactical patience, gray-flecked beard, " +
      "the look of a man who has waited for the right moment more times than he has acted.",
  },
  {
    id: "phage",
    prompt:
      "Phage — an operative of indeterminate age and gender, hood half-drawn over a face " +
      "scarred by old burn marks across one cheek, dark hooded clothing in soot-black and " +
      "deep oxblood marked with the wilted-rose sigil at the collar, severe controlled " +
      "expression — the look of someone whose loyalty to the Rose is settled and whose " +
      "useful temper is held on a short leash.",
  },
  {
    id: "rea",
    prompt:
      "Rea — a court archivist, woman in her mid-thirties, ink-stained fingers half-raised " +
      "as if mid-thought, scholarly Annarose robes in deep blue with brass clasps, a " +
      "partially unrolled vellum scroll in one hand, sharp clear eyes that read between " +
      "lines, hair pinned up loosely, narrow reading lenses on a chain at her chest.",
  },
  {
    id: "father-roberts",
    prompt:
      "Father Roberts — an itinerant priest in his fifties, weathered traveling robes in " +
      "dusty grey wool with a frayed prayer cord at the waist, an old leather-bound book " +
      "held at his chest, the faint outline of a hidden knife at his belt, lined kind-but-" +
      "tired face, salt-and-pepper beard, eyes of a man who walks the road faster than the " +
      "messengers chasing him.",
  },
  {
    id: "rowan",
    prompt:
      "Sergeant Rowan Miller — a career military sergeant in his fifties, hard-set jaw, " +
      "gray-streaked close-cropped hair, Annarose military fatigues in olive-and-charcoal " +
      "with sergeant's chevrons stitched at the shoulder, decades-of-service expression, " +
      "the look of a man who fixes a unit by standing inside it.",
  },
  {
    id: "remi",
    prompt:
      "Remi — a Tags-born merchant woman in her late twenties, lowland traveling clothes " +
      "in road-dusted browns and oranges with a leather satchel at her hip, a clearly " +
      "visible mechanical Mechy arm-sleeve in burnished brass and copper tech-magic " +
      "prosthetic gauntlet running up to her elbow, pragmatic shrewd half-smile, hair " +
      "tied back, the look of a trader who knows what every coin is for.",
  },
  {
    id: "dodge",
    prompt:
      "Dodge — an outsider man in his thirties from past the Wyldhelm border, scarred " +
      "weathered features, foreign furs over a layered traveling coat in steel-grey and " +
      "rust, the strap of a foreign holstered weapon visible at his side, wary unwelcoming " +
      "stare, dark hair pulled back, two pale scars across the cheek that read like old " +
      "bullet wounds.",
  },
  {
    id: "sarv-e",
    prompt:
      "Sarv-e — an ancient elleta being, humanoid but clearly elemental, eyes that glow " +
      "with low ember-light, skin tones of bronze and banked coal with faint cracks of " +
      "inner flame at the temples and along the jaw, no human clothing — instead drapings " +
      "of ash-cloth and a circlet of charred filigree, solemn patient ageless expression, " +
      "the look of a being whose oldest contract predates the kingdom itself.",
  },
];

const args = process.argv.slice(2);
const onlyArg = args.find((a) => a.startsWith("--only="));
const skipArg = args.find((a) => a.startsWith("--skip="));
const onlyIds = onlyArg ? onlyArg.replace("--only=", "").split(",") : null;
const skipIds = skipArg ? skipArg.replace("--skip=", "").split(",") : [];

const targets = CHARACTERS.filter((c) => {
  if (onlyIds && !onlyIds.includes(c.id)) return false;
  if (skipIds.includes(c.id)) return false;
  return true;
});

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error("✗ OPENAI_API_KEY not set. Run with --env-file=.env.local");
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });
  console.log(`→ Output dir: ${OUT_DIR}`);
  console.log(`→ Generating ${targets.length} portraits...\n`);

  let totalCost = 0;
  let successCount = 0;
  let failCount = 0;

  for (const c of targets) {
    const startTime = Date.now();
    process.stdout.write(`  [${c.id.padEnd(16)}] generating...`);
    try {
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt: c.prompt + STYLE_SUFFIX,
          n: 1,
          size: "1024x1024",
          quality: "high",
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`HTTP ${response.status}: ${errBody}`);
      }

      const json = await response.json();
      const b64 = json?.data?.[0]?.b64_json;
      if (!b64) throw new Error("No b64_json in response");

      const buf = Buffer.from(b64, "base64");
      const outPath = resolve(OUT_DIR, `${c.id}.png`);
      await writeFile(outPath, buf);

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const sizeMb = (buf.length / 1024 / 1024).toFixed(2);
      console.log(` ✓ ${sizeMb}MB · ${elapsed}s`);
      successCount += 1;
      totalCost += 0.17;
    } catch (err) {
      console.log(` ✗ ${err.message?.slice(0, 100) ?? err}`);
      failCount += 1;
    }
  }

  console.log(
    `\n✓ Done. ${successCount} success / ${failCount} fail. ` +
      `Est. cost: $${totalCost.toFixed(2)}.`,
  );
  if (failCount > 0) {
    console.log("Re-run failed characters with --only=<id1,id2>");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("\n✗ Script failed:", e);
  process.exit(1);
});
