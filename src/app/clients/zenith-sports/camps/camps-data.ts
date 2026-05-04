/**
 * TEKKY® partner camps + clinics data.
 *
 * Currently empty — flagged in client_tasks: "Camp Finder needs partner
 * list from Philip & Paul." The page renders a clean empty state with a
 * "Notify me when a camp opens near you" capture so we still collect
 * leads while the catalog fills in.
 *
 * To activate: edit this file with the partner list, redeploy. The page
 * will automatically render the catalog grid + map markers.
 *
 * Schema note: keeping this in code (not Supabase) for now because the
 * list is small (<50 entries expected at launch) and Philip + Paul will
 * edit it via PR / Ben on their behalf, not a CMS UI.
 */

export type Camp = {
  id: string;
  name: string;
  /** Org running the camp (Zenith-direct, partner club, third-party). */
  org: string;
  city: string;
  state: string;
  /** US region used for the filter chip rail. */
  region: "Pacific NW" | "West" | "Mountain" | "Midwest" | "South" | "Northeast";
  /** Coordinates for future map view. Optional. */
  coords?: { lat: number; lng: number };
  /** ISO date or null for "rolling enrollment". */
  startDate: string | null;
  endDate?: string | null;
  /** Age range, free text. e.g. "U10–U14" */
  ageRange: string;
  /** "Day camp" | "Residential" | "Clinic" | "Demo" */
  format: "Day camp" | "Residential" | "Clinic" | "Demo";
  /** Whether TEKKY is included in the camp fee (yes = "in the box"). */
  ballIncluded: boolean;
  /** External URL — partner site, Eventbrite, etc. */
  url?: string;
  /** Optional short description. */
  blurb?: string;
};

export const CAMPS: Camp[] = [
  // EMPTY ON PURPOSE — see file header.
  // Example shape (commented out) so Philip can copy/edit:
  //
  // {
  //   id: "wa-summer-2026",
  //   name: "TEKKY® Summer Skills Camp",
  //   org: "Zenith Sports",
  //   city: "Seattle",
  //   state: "WA",
  //   region: "Pacific NW",
  //   coords: { lat: 47.6062, lng: -122.3321 },
  //   startDate: "2026-07-08",
  //   endDate: "2026-07-12",
  //   ageRange: "U10–U14",
  //   format: "Day camp",
  //   ballIncluded: true,
  //   url: "https://zenithsports.org/events/summer-camp",
  //   blurb: "5-day technical-skills camp at TEKKY HQ. Each player goes home with their own ball.",
  // },
];
