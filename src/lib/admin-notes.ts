import type { Prospect } from "@/lib/types";

export function normalizeAdminNotes(notes?: string | null): string {
  return (notes || "").trim();
}

export function hasPendingAdminUpdates(
  prospect: Pick<
    Prospect,
    "adminNotes" | "lastSubmittedAdminNotes" | "selectedTheme" | "lastSubmittedTheme"
  >
): boolean {
  return (
    normalizeAdminNotes(prospect.adminNotes) !==
      normalizeAdminNotes(prospect.lastSubmittedAdminNotes) ||
    (prospect.selectedTheme || "") !== (prospect.lastSubmittedTheme || "")
  );
}
