/**
 * client-team-members — DB helpers for the per-client roster of
 * assignable people. Powers the assignee dropdown when clients (and
 * Ben) add new tasks to the portal to-do list.
 */

import { getSupabase } from "./supabase";

export type ClientTeamMember = {
  id: string;
  client_slug: string;
  name: string;
  email: string;
  is_bluejays_team: boolean;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type NewClientTeamMember = Pick<
  ClientTeamMember,
  "client_slug" | "name" | "email"
> &
  Partial<
    Pick<
      ClientTeamMember,
      "is_bluejays_team" | "is_primary" | "sort_order"
    >
  >;

export async function listClientTeamMembers(
  clientSlug: string,
): Promise<ClientTeamMember[]> {
  const { data, error } = await getSupabase()
    .from("client_team_members")
    .select("*")
    .eq("client_slug", clientSlug)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(`listClientTeamMembers: ${error.message}`);
  return (data ?? []) as ClientTeamMember[];
}

export async function createClientTeamMember(
  m: NewClientTeamMember,
): Promise<ClientTeamMember> {
  const { data, error } = await getSupabase()
    .from("client_team_members")
    .insert([m])
    .select("*")
    .single();
  if (error) throw new Error(`createClientTeamMember: ${error.message}`);
  return data as ClientTeamMember;
}

export async function updateClientTeamMember(
  id: string,
  patch: Partial<
    Pick<
      ClientTeamMember,
      | "name"
      | "email"
      | "is_bluejays_team"
      | "is_primary"
      | "sort_order"
    >
  >,
): Promise<ClientTeamMember> {
  const { data, error } = await getSupabase()
    .from("client_team_members")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(`updateClientTeamMember: ${error.message}`);
  return data as ClientTeamMember;
}

export async function deleteClientTeamMember(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from("client_team_members")
    .delete()
    .eq("id", id);
  if (error) throw new Error(`deleteClientTeamMember: ${error.message}`);
}

/** Quick lookup — is this email a BlueJays team member for the client?
 *  Used by the task-assignment notification path so we know to ping
 *  Ben (and not Philip) when a task lands on our side. */
export async function isBluejaysAssignee(
  clientSlug: string,
  email: string,
): Promise<boolean> {
  if (!email) return false;
  const { data } = await getSupabase()
    .from("client_team_members")
    .select("is_bluejays_team")
    .eq("client_slug", clientSlug)
    .eq("email", email.toLowerCase())
    .maybeSingle();
  return Boolean(data?.is_bluejays_team);
}
