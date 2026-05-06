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
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      className={`relative aspect-[3/4] w-full ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 420px, 100vw"
        className="object-contain"
        priority={priority}
      />
    </motion.div>
  );
}

export default PlayerAvatar;
