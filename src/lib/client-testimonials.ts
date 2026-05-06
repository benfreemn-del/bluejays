/**
 * client-testimonials — DB helpers for per-client testimonial quotes.
 *
 * Powers the <TestimonialCarousel> component on showcase pages. Built
 * so the moment a client sends new quotes they go live without a code
 * change — admins drop them in via /dashboard/clients/[slug]/testimonials.
 */

import { getSupabase } from "./supabase";

export type ClientTestimonial = {
  id: string;
  client_slug: string;
  name: string;
  location: string | null;
  role: string | null;
  quote: string;
  photo_url: string | null;
  video_url: string | null;
  sort_order: number;
  is_active: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type NewClientTestimonial = Pick<
  ClientTestimonial,
  "client_slug" | "name" | "quote"
> &
  Partial<
    Pick<
      ClientTestimonial,
      | "location"
      | "role"
      | "photo_url"
      | "video_url"
      | "sort_order"
      | "is_active"
      | "published_at"
    >
  >;

/** List active, published testimonials in render order. Used by the
 *  public-facing showcase page. */
export async function listActiveTestimonials(
  clientSlug: string,
): Promise<ClientTestimonial[]> {
  const { data, error } = await getSupabase()
    .from("client_testimonials")
    .select("*")
    .eq("client_slug", clientSlug)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(`listActiveTestimonials: ${error.message}`);
  return (data ?? []) as ClientTestimonial[];
}

/** List ALL testimonials for a client, including inactive — for the
 *  admin dashboard. */
export async function listAllTestimonials(
  clientSlug: string,
): Promise<ClientTestimonial[]> {
  const { data, error } = await getSupabase()
    .from("client_testimonials")
    .select("*")
    .eq("client_slug", clientSlug)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(`listAllTestimonials: ${error.message}`);
  return (data ?? []) as ClientTestimonial[];
}

export async function createTestimonial(
  t: NewClientTestimonial,
): Promise<ClientTestimonial> {
  const { data, error } = await getSupabase()
    .from("client_testimonials")
    .insert([t])
    .select("*")
    .single();
  if (error) throw new Error(`createTestimonial: ${error.message}`);
  return data as ClientTestimonial;
}

export async function updateTestimonial(
  id: string,
  patch: Partial<
    Pick<
      ClientTestimonial,
      | "name"
      | "location"
      | "role"
      | "quote"
      | "photo_url"
      | "video_url"
      | "sort_order"
      | "is_active"
      | "published_at"
    >
  >,
): Promise<ClientTestimonial> {
  const { data, error } = await getSupabase()
    .from("client_testimonials")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(`updateTestimonial: ${error.message}`);
  return data as ClientTestimonial;
}

export async function deleteTestimonial(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from("client_testimonials")
    .delete()
    .eq("id", id);
  if (error) throw new Error(`deleteTestimonial: ${error.message}`);
}
