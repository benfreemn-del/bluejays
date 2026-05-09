/**
 * inspection-clients.ts — backwards-compat alias for service-clients.
 *
 * The registry was generalized 2026-05-09 to cover sports/manufacturer
 * tenants too — see ./service-clients.ts. This file re-exports the
 * inspection-flavored API surface so existing imports keep working.
 *
 * New code should import from service-clients.ts directly. This file
 * exists only to avoid breaking historical imports during the
 * transition.
 */

import {
  type ServiceClientConfig,
  getServiceClient,
  renderBookingConfirmationEmail as renderBookingEmail,
  listServiceClientsByKind,
} from "./service-clients";

export type InspectionClientConfig = ServiceClientConfig;

/** Returns the config IFF the slug is registered AND it's an inspection-style tenant. */
export function getInspectionClient(
  slug: string,
): InspectionClientConfig | null {
  const c = getServiceClient(slug);
  if (!c) return null;
  // Allow callers that explicitly want inspection-only filtering. For
  // generic callers (booking confirmation, partner scout) any tenant
  // kind works fine — service-clients.ts has the right registry shape.
  if (c.kind !== "inspection") return null;
  return c;
}

/** Every registered inspection-kind tenant. */
export function listInspectionClients(): InspectionClientConfig[] {
  return listServiceClientsByKind("inspection");
}

/** Re-export — same signature, works for any kind. */
export const renderBookingConfirmationEmail = renderBookingEmail;
