import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const REFERRALS_FILE = path.join(process.cwd(), "data", "referrals.json");

interface Referral {
  id: string;
  referrerProspectId: string;
  referrerBusinessName: string;
  referredBusinessName: string;
  referredPhone?: string;
  referredEmail?: string;
  status: "pending" | "contacted" | "converted";
  discount: number; // dollars off management fee
  createdAt: string;
}

function getReferrals(): Referral[] {
  if (!fs.existsSync(REFERRALS_FILE)) return [];
  return JSON.parse(fs.readFileSync(REFERRALS_FILE, "utf-8"));
}

function saveReferrals(refs: Referral[]) {
  const dir = path.dirname(REFERRALS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(REFERRALS_FILE, JSON.stringify(refs, null, 2));
}

export async function GET() {
  const referrals = getReferrals();
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
    discount: 100, // $100 off management fee
    createdAt: new Date().toISOString(),
  };

  const refs = getReferrals();
  refs.push(referral);
  saveReferrals(refs);

  return NextResponse.json({
    message: `Referral recorded! ${referrerBusinessName} will get $100 off when ${referredBusinessName} signs up.`,
    referral,
  });
}
