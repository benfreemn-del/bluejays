import { NextRequest, NextResponse } from "next/server";
import {
  CLIENT_PORTAL_COOKIE,
  getOwnerByEmail,
  makeSessionCookie,
} from "@/lib/client-auth";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { checkSessionCookie } from "@/lib/auth";

/**
 * GET /api/admin/impersonate-client?slug=itc-quick-attach
 *
 * Admin shortcut: signs Ben in as the FIRST owner of a given client
 * slug, then 302-redirects to /clients/{slug}/portal. Lets him
 * "view as the owner" without typing the password.
 *
 * Hard-gated on the BlueJays admin cookie (same gate as the rest of
 * /api/admin/*). If the admin cookie is missing/invalid the route
 * 401s — no privilege escalation possible.
 *
 * Sets the standard CLIENT_PORTAL_COOKIE for the picked owner, so
 * from the portal's perspective Ben IS that owner. He can sign out
 * with the normal "Sign out" button which clears the cookie.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // 1. Gate on admin cookie. If you can read this endpoint, you've
  //    already passed the BlueJays admin login on /dashboard.
  const adminCookie = req.cookies.get("bluejays-session")?.value;
  if (!checkSessionCookie(adminCookie)) {
    return NextResponse.json(
      { ok: false, error: "Admin auth required" },
      { status: 401 },
    );
  }

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json(
      { ok: false, error: "slug query param required" },
      { status: 400 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Supabase not configured" },
      { status: 500 },
    );
  }

  // 2. Find ANY owner record for this slug (prefer the first by
  //    created_at — usually the founder).
  const { data, error } = await getSupabase()
    .from("client_owners")
    .select("email")
    .eq("client_slug", slug)
    .order("created_at", { ascending: true })
    .limit(1);
  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }
  const ownerEmail = data?.[0]?.email;
  if (!ownerEmail) {
    return NextResponse.json(
      {
        ok: false,
        error: `No owner registered for client_slug=${slug}. Seed a client_owners row first.`,
      },
      { status: 404 },
    );
  }

  // 3. Resolve full owner record (we need password_hash for the
  //    cookie signature).
  const owner = await getOwnerByEmail(ownerEmail);
  if (!owner) {
    return NextResponse.json(
      { ok: false, error: "Owner lookup failed" },
      { status: 500 },
    );
  }

  // 4. Set the portal session cookie + redirect to the portal.
  const cookie = makeSessionCookie(owner);
  const target = `/clients/${slug}/portal`;
  const res = NextResponse.redirect(new URL(target, req.url));
  res.cookies.set(CLIENT_PORTAL_COOKIE, cookie.value, cookie.options);
  return res;
}
