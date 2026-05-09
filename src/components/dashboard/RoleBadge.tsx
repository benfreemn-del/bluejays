"use client";

import { useRole } from "@/lib/use-role";

/**
 * RoleBadge — drop-in component that shows the active session role
 * (sales / owner) in the header of any dashboard surface. Used to
 * diagnose "why does my UI look like X" in 1 second.
 *
 * Pink "Madie · Sales" or blue "Ben · Owner". If Madie sees blue,
 * her bj_role cookie isn't 'sales' — sign out + back in fixes it.
 *
 * Reads the bj_role cookie via useRole(). Renders nothing during
 * SSR / first paint (waits for the cookie effect) so there's no
 * mismatch flash.
 */
export default function RoleBadge() {
  const role = useRole();
  return (
    <span
      className={`text-[10px] uppercase tracking-[0.18em] font-bold px-2 py-1 rounded border whitespace-nowrap ${
        role === "sales"
          ? "border-pink-500/50 bg-pink-500/15 text-pink-200"
          : "border-blue-500/50 bg-blue-500/10 text-blue-200"
      }`}
      title={
        role === "sales"
          ? "Logged in as the sales role (Madie). bj_role=sales cookie is set."
          : "Logged in as the owner role (Ben). bj_role=owner cookie is set."
      }
    >
      {role === "sales" ? "Madie · Sales" : "Ben · Owner"}
    </span>
  );
}
