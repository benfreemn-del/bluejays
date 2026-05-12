"use client";

import { useEffect, useState } from "react";

/**
 * Reads the bj_role cookie set at login (per /api/auth/login route).
 *
 * Per Q4=A locked 2026-05-08 — two roles supported:
 *   - "owner" — Ben (full access, default)
 *   - "sales" — Madie (gated tab visibility per the access matrix)
 *
 * The cookie is intentionally NOT httpOnly so client components
 * can filter their visible tabs. Security gate is the bluejays_auth
 * session-token cookie validated in middleware; bj_role is a UI hint.
 *
 * Falls back to "owner" when the cookie is missing — matches the
 * pre-Q4 behavior so any cached client without the new cookie still
 * sees the full UI. Once Madie auth is live in production, "sales"
 * is set explicitly at her login.
 */
export type Role = "owner" | "sales";

export function useRole(): Role {
  const [role, setRole] = useState<Role>("owner");

  useEffect(() => {
    if (typeof document === "undefined") return;
    const match = document.cookie.match(/(?:^|;\s*)bj_role=([^;]+)/);
    if (match) {
      const value = match[1];
      if (value === "sales" || value === "owner") {
        setRole(value);
      }
    }
  }, []);

  return role;
}

/** Identity of the logged-in operator (Ben / Madie / Raidas / Tyler).
 *  Falls back to null when the user logged in with the legacy
 *  env-password flow (no user_id cookie). UIs that need a name should
 *  gracefully degrade in that case. */
export interface BluejaysSessionUser {
  id: string | null;
  name: string | null;
  role: Role;
}

export function useBluejaysUser(): BluejaysSessionUser {
  const [user, setUser] = useState<BluejaysSessionUser>({
    id: null,
    name: null,
    role: "owner",
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    function readCookie(name: string): string | null {
      const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
      return m ? decodeURIComponent(m[1]) : null;
    }
    const roleRaw = readCookie("bj_role");
    const role: Role = roleRaw === "sales" ? "sales" : "owner";
    setUser({
      id: readCookie("bj_user_id"),
      name: readCookie("bj_user_name"),
      role,
    });
  }, []);

  return user;
}

/** Tab IDs Madie sees in the BlueJays top nav. Everything else is
 *  owner-only when role = "sales". */
export const SALES_TOP_NAV_ALLOWED = new Set([
  "overview", // shows Madie productivity tile (her own pace)
  "sales-portal",
  "diagnostic", // Madie uses this live on calls
  "sales-pipeline",
  "client-jobs",
  "win-loss",
  "settings",
]);

/** Tab IDs Madie sees in the per-client ClientTabsBar. */
export const SALES_CLIENT_TAB_ALLOWED = new Set([
  "tasks", // visible context (read-only effectively)
  "leads",
  "ads",
  "testimonials",
]);
