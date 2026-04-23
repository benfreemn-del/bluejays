import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const REFERRALS_FILE = path.join(process.cwd(), "data", "referrals.json");

interface Referral {
  id: string;
  referrerProspectId: string;
  referrerBusinessName: string;
  referredBusinessName: string;
  referredPhone?: string;
  referredEmail?: string;
  status: "pending" | "contacted" | "converted";
  discount: number; // dollars off the annual maintenance fee
  createdAt: string;
}

async function getReferrals(): Promise<Referral[]> {
  // Read from Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        return data.map((row: Record<string, unknown>) => ({
          id: row.id as string,
          referrerProspectId: row.referrer_prospect_id as string,
          referrerBusinessName: row.referrer_business_name as string,
          referredBusinessName: row.referred_business_name as string,
          referredPhone: row.referred_phone as string | undefined,
          referredEmail: row.referred_email as string | undefined,
          status: row.status as "pending" | "contacted" | "converted",
          discount: row.discount as number,
          createdAt: row.created_at as string,
        }));
      }
    } catch {
      // Table might not exist yet
    }
  }

  // Skip file reads on Vercel if no Supabase
  if (process.env.VERCEL) return [];

  if (!fs.existsSync(REFERRALS_FILE)) return [];
  return JSON.parse(fs.readFileSync(REFERRALS_FILE, "utf-8"));
}

async function saveReferral(referral: Referral) {
  // Save to Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      await supabase.from("referrals").insert({
        id: referral.id,
        referrer_prospect_id: referral.referrerProspectId,
        referrer_business_name: referral.referrerBusinessName,
        referred_business_name: referral.referredBusinessName,
        referred_phone: referral.referredPhone || null,
        referred_email: referral.referredEmail || null,
        status: referral.status,
        discount: referral.discount,
        created_at: referral.createdAt,
      });
    } catch {
      // Table might not exist yet
    }
    return;
  }

  // Skip file writes on Vercel (read-only filesystem)
  if (process.env.VERCEL) {
    console.log("[Referral] Skipped file write on Vercel");
    return;
  }

  const dir = path.dirname(REFERRALS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const refs = await getReferrals();
  refs.push(referral);
  fs.writeFileSync(REFERRALS_FILE, JSON.stringify(refs, null, 2));
}

export async function GET() {
  const referrals = await getReferrals();
  return NextResponse.json({
    referrals,
    total: referrals.length,
    converted: referrals.filter((r) => r.status === "converted").length,
    totalDiscountsGiven: referrals.filter((r) => r.status === "converted").reduce((sum, r) => sum + r.discount, 0),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { referrerProspectId, referrerBusinessName, referredBusinessName, referredPhone, referredEmail } = body;

  if (!referrerProspectId || !referredBusinessName) {
    return NextResponse.json({ error: "referrerProspectId and referredBusinessName required" }, { status: 400 });
  }

  const referral: Referral = {
    id: uuidv4(),
    referrerProspectId,
    referrerBusinessName: referrerBusinessName || "Unknown",
    referredBusinessName,
    referredPhone,
    referredEmail,
    status: "pending",
    discount: 100, // $100 off the annual maintenance fee
    createdAt: new Date().toISOString(),
  };

  await saveReferral(referral);

  return NextResponse.json({
    message: `Referral recorded! ${referrerBusinessName} will get $100 off when ${referredBusinessName} signs up.`,
    referral,
  });
}
