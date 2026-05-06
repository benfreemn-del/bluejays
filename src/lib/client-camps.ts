/**
 * client-camps — DB helpers for the per-client camps catalog. Mirrors
 * the old src/app/clients/zenith-sports/camps/camps-data.ts shape but
 * pulls from Supabase so Philip can edit camps from the dashboard.
 */

import { getSupabase } from "./supabase";

export type ClientCampFormat = "Day camp" | "Residential" | "Clinic" | "Demo";
export type ClientCampRegion =
  | "Pacific NW"
  | "West"
  | "Mountain"
  | "Midwest"
  | "South"
  | "Northeast";

export type ClientCamp = {
  id: string;
  client_slug: string;
  name: string;
  org: string | null;
  city: string | null;
  state: string | null;
  region: string | null;
  lat: number | null;
  lng: number | null;
  start_date: string | null;
  end_date: string | null;
  age_range: string | null;
  format: string | null;
  ball_included: boolean;
  url: string | null;
  blurb: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type NewClientCamp = Pick<ClientCamp, "client_slug" | "name"> &
  Partial<
    Pick<
      ClientCamp,
      | "org"
      | "city"
      | "state"
      | "region"
      | "lat"
      | "lng"
      | "start_date"
      | "end_date"
      | "age_range"
      | "format"
      | "ball_included"
      | "url"
      | "blurb"
      | "sort_order"
      | "is_active"
    >
  >;

export async function listActiveCamps(slug: string): Promise<ClientCamp[]> {
  const { data, error } = await getSupabase()
    .from("client_camps")
    .select("*")
    .eq("client_slug", slug)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("start_date", { ascending: true, nullsFirst: false });
  if (error) throw new Error(`listActiveCamps: ${error.message}`);
  return (data ?? []) as ClientCamp[];
}

export async function listAllCamps(slug: string): Promise<ClientCamp[]> {
  const { data, error } = await getSupabase()
    .from("client_camps")
    .select("*")
    .eq("client_slug", slug)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(`listAllCamps: ${error.message}`);
  return (data ?? []) as ClientCamp[];
}

export async function createCamp(c: NewClientCamp): Promise<ClientCamp> {
  const { data, error } = await getSupabase()
    .from("client_camps")
    .insert([c])
    .select("*")
    .single();
  if (error) throw new Error(`createCamp: ${error.message}`);
  return data as ClientCamp;
}

export async function updateCamp(
  id: string,
  patch: Partial<Omit<ClientCamp, "id" | "client_slug" | "created_at" | "updated_at">>,
): Promise<ClientCamp> {
  const { data, error } = await getSupabase()
    .from("client_camps")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(`updateCamp: ${error.message}`);
  return data as ClientCamp;
}

export async function deleteCamp(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from("client_camps")
    .delete()
    .eq("id", id);
  if (error) throw new Error(`deleteCamp: ${error.message}`);
}
