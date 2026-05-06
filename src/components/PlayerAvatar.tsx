"use client";

/**
 * PlayerAvatar
 *
 * The visual carrot for the Build Your Player lead-capture flow. Pulls the
 * matching Pixar-style 3D card from /public/avatars/tekky/{gender}/ based on
 * the user's gender + age + skill-level inputs. Falls back to DEFAULT_AVATAR
 * until all three are picked.
 *
 * Wrap the call site in <AnimatePresence mode="wait"> and key the swap on
 * `src` so each new avatar fades + scales in.
 */

import Image from "next/image";
import { motion } from "framer-motion";
import {
  resolveAvatar,
  DEFAULT_AVATAR,
  type Gender,
} from "@/lib/tekky-avatars";

/** Source images that ship with a baked-in border around the artwork.
 *  We scale these slightly above 1.0 so the border falls outside the
 *  3:4 viewport. Add new entries as we discover them; the underlying
 *  fix is "regenerate without the border" — this is a CSS-side
 *  workaround until we have replacements. */
const HAS_BAKED_BORDER = new Set([
  "/avatars/tekky/female/06_travel_age_25-35.png",
  "/avatars/tekky/female/14_elite_age_13-25.png",
]);

interface PlayerAvatarProps {
  gender?: Gender | null;
  age?: number | null;
  /** Form already uses 1–5 numerically; lib also accepts strings. */
  skillLevel?: number | string | null;
  className?: string;
  /** Optional alt-text override; defaults to a generic "Player avatar". */
  alt?: string;
  priority?: boolean;
}

export function PlayerAvatar({
  gender,
  age,
  skillLevel,
  className = "",
  alt = "Player avatar",
  priority = false,
}: PlayerAvatarProps) {
  const src =
    gender && typeof age === "number" && skillLevel !== null && skillLevel !== undefined
      ? resolveAvatar({ gender, age, skillLevel })
      : DEFAULT_AVATAR;

  return (
    <motion.div
      key={src}
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      className={`relative aspect-[3/4] w-full overflow-hidden ${className}`}
      style={{
        // Navy fallback so any sub-pixel seam matches the card's baked-in
        // gradient — no white frame around the artwork.
        background: "linear-gradient(180deg, #0a1628 0%, #1e3a5f 100%)",
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 420px, 100vw"
        // object-cover so a 3:4 source fits a 3:4 box with zero letterbox.
        // Two source files (female travel 25-35 + female elite 13-25)
        // ship with a baked-in light-gray / gold rounded border that the
        // others don't have — we crop those out by scaling the image up
        // ~8-10% so the border falls outside the visible frame. All other
        // cards get the default 1:1 fit.
        className="object-cover"
        style={{
          transform: HAS_BAKED_BORDER.has(src) ? "scale(1.10)" : undefined,
          transformOrigin: "center",
        }}
        priority={priority}
      />
    </motion.div>
  );
}

export default PlayerAvatar;
