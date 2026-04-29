import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { slugifyPartnerName, randomSuffix } from "@/lib/partners";
import {
  PARTNER_SESSION_COOKIE,
  signPartnerSession,
} from "@/lib/partner-auth";
import type { Partner } from "@/lib/partners";

/**
 * POST /api/partners/admin
 *
 * Body: { action, partnerId?, referralId?, method?, name?, email?, phone?, payoutHandle? }
 *
 * Actions:
 *   - approve         — set partner.status='approved', stamp approved_at
 *   - decline         — set partner.status='declined'
 *   - pause           — set partner.status='paused'
 *   - mark_paid       — set referral.payout_status='paid'
 *   - void_referral   — set referral.payout_status='void'
 *   - create          — admin-create a new partner (skip the public apply
 *                       form). Status auto-set to 'approved'. Returns
 *                       generated code + login URL Ben can text them.
 *   - enter_as_ben    — finds-or-creates Ben's partner record, marks
 *                       agreement accepted, mints session cookie, returns
 *                       redirect URL to /partners/work. One-click admin
 *                       bypass so Ben can use the workspace himself.
 *   - remove          — hard-DELETE the partner if they have no calls /
 *                       referrals on file (clean removal of test rows).
 *                       Otherwise soft-delete via status='declined' so
 *                       referral history + payouts remain intact.
 *
 * No auth gate yet — relies on /dashboard URL-as-secret. Add real auth
 * before exposing this beyond Ben.
 */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  let body: {
    action?: string;
    partnerId?: string;
    referralId?: string;
    method?: string;
    name?: string;
    email?: string;
    phone?: string;
    payoutHandle?: string;
  } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { action, partnerId, referralId, method, name, email, phone, payoutHandle } = body;
  if (!action) return NextResponse.json({ error: "Missing action" }, { status: 400 });

  switch (action) {
    case "approve": {
      if (!partnerId) return NextResponse.json({ error: "Missing partnerId" }, { status: 400 });
      const { error } = await supabase
        .from("partners")
        .update({ status: "approved", approved_at: new Date().toISOString() })
        .eq("id", partnerId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }
    case "decline": {
      if (!partnerId) return NextResponse.json({ error: "Missing partnerId" }, { status: 400 });
      const { error } = await supabase
        .from("partners")
        .update({ status: "declined" })
        .eq("id", partnerId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }
    case "pause": {
      if (!partnerId) return NextResponse.json({ error: "Missing partnerId" }, { status: 400 });
      const { error } = await supabase
        .from("partners")
        .update({ status: "paused" })
        .eq("id", partnerId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }
    case "mark_paid": {
      if (!referralId) return NextResponse.json({ error: "Missing referralId" }, { status: 400 });
      const { error } = await supabase
        .from("partner_referrals")
        .update({
          payout_status: "paid",
          paid_at: new Date().toISOString(),
          payout_method: (method || "manual").slice(0, 30),
        })
        .eq("id", referralId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }
    case "void_referral": {
      if (!referralId) return NextResponse.json({ error: "Missing referralId" }, { status: 400 });
      const { error } = await supabase
        .from("partner_referrals")
        .update({ payout_status: "void" })
        .eq("id", referralId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    case "create": {
      // Admin-create a partner (skip the public /partners/apply form).
      // Status is auto-set to 'approved' since Ben created the record.
      const cleanName = (name || "").trim().slice(0, 80);
      const cleanEmail = (email || "").trim().toLowerCase().slice(0, 200);
      if (!cleanName || cleanName.length < 2) {
        return NextResponse.json({ error: "Name required" }, { status: 400 });
      }
      if (!cleanEmail || !cleanEmail.includes("@")) {
        return NextResponse.json({ error: "Valid email required" }, { status: 400 });
      }

      // Email already on file → return existing record instead of dupe
      const { data: existing } = await supabase
        .from("partners")
        .select("code, status")
        .eq("email", cleanEmail)
        .maybeSingle();
      if (existing) {
        return NextResponse.json({
          ok: true,
          alreadyExists: true,
          code: (existing as { code: string }).code,
          status: (existing as { status: string }).status,
        });
      }

      // Generate unique code
      const baseSlug = slugifyPartnerName(cleanName);
      let code = baseSlug;
      for (let attempt = 0; attempt < 6; attempt++) {
        const { data: clash } = await supabase
          .from("partners")
          .select("id")
          .eq("code", code)
          .maybeSingle();
        if (!clash) break;
        code = `${baseSlug}-${randomSuffix(4)}`;
      }

      const { error: insertErr } = await supabase.from("partners").insert({
        code,
        name: cleanName,
        email: cleanEmail,
        phone: (phone || "").trim().slice(0, 30) || null,
        payout_handle: (payoutHandle || "").trim().slice(0, 200) || null,
        status: "approved",
        approved_at: new Date().toISOString(),
      });
      if (insertErr) {
        console.error("[partners/admin/create] insert failed:", insertErr);
        return NextResponse.json({ error: insertErr.message }, { status: 500 });
      }
      return NextResponse.json({ ok: true, code });
    }

    case "remove": {
      if (!partnerId) return NextResponse.json({ error: "Missing partnerId" }, { status: 400 });

      // Check if the partner has any historical activity worth preserving
      const [{ count: refCount }, { count: callCount }] = await Promise.all([
        supabase
          .from("partner_referrals")
          .select("*", { count: "exact", head: true })
          .eq("partner_id", partnerId),
        supabase
          .from("partner_calls")
          .select("*", { count: "exact", head: true })
          .eq("partner_id", partnerId),
      ]);
      const hasHistory = (refCount || 0) > 0 || (callCount || 0) > 0;

      if (hasHistory) {
        // Soft-delete: preserve referrals + call log for accounting
        const { error } = await supabase
          .from("partners")
          .update({ status: "declined" })
          .eq("id", partnerId);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({
          ok: true,
          mode: "soft",
          referralCount: refCount,
          callCount,
        });
      }

      // Clean DELETE — no history, safe to remove the row
      const { error } = await supabase.from("partners").delete().eq("id", partnerId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, mode: "hard" });
    }

    case "enter_as_ben": {
      // One-click admin bypass — creates or finds Ben's partner record,
      // sets agreement-accepted, mints session cookie, returns redirect.
      const BEN_EMAIL = "ben@bluejayportfolio.com";
      const BEN_CODE = "ben";

      // Find existing
      const { data: existing } = await supabase
        .from("partners")
        .select("*")
        .eq("email", BEN_EMAIL)
        .maybeSingle();

      let benPartner: Partner | null = (existing as unknown as Partner) || null;

      if (!benPartner) {
        // Create — code 'ben' should be unique; if collision, append suffix
        let code = BEN_CODE;
        const { data: clash } = await supabase
          .from("partners")
          .select("id")
          .eq("code", code)
          .maybeSingle();
        if (clash) code = `ben-${randomSuffix(4)}`;
        const { data: created, error: createErr } = await supabase
          .from("partners")
          .insert({
            code,
            name: "Ben Freeman",
            email: BEN_EMAIL,
            status: "approved",
            approved_at: new Date().toISOString(),
            agreement_accepted_at: new Date().toISOString(),
          })
          .select("*")
          .maybeSingle();
        if (createErr) {
          console.error("[partners/admin/enter_as_ben] create failed:", createErr);
          return NextResponse.json({ error: createErr.message }, { status: 500 });
        }
        benPartner = created as unknown as Partner;
      } else {
        // Already exists — make sure it's approved + agreement accepted
        const updates: Record<string, string> = {
          status: "approved",
          last_login_at: new Date().toISOString(),
        };
        if (!benPartner.agreement_accepted_at) {
          updates.agreement_accepted_at = new Date().toISOString();
        }
        if (!benPartner.approved_at) {
          updates.approved_at = new Date().toISOString();
        }
        await supabase.from("partners").update(updates).eq("id", benPartner.id);
      }

      if (!benPartner) {
        return NextResponse.json({ error: "Couldn't find/create Ben's partner record" }, { status: 500 });
      }

      const sessionToken = signPartnerSession(benPartner.id);
      const res = NextResponse.json({ ok: true, redirectTo: "/partners/work" });
      res.cookies.set(PARTNER_SESSION_COOKIE, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 86400,
      });
      return res;
    }

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
