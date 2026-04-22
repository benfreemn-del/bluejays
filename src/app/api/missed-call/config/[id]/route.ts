/**
 * GET/PATCH /api/missed-call/config/[id]
 *
 * Per-client missed-call auto-text configuration.
 *
 * Fields:
 *   - enabled: boolean (default true for paid clients)
 *   - customMessage: optional override for the auto-SMS text
 *   - clientPhoneNumber: the Twilio number assigned to this client
 *     (set this in their Twilio dashboard and record it here)
 */

import { NextRequest, NextResponse } from "next/server";
import { getProspect } from "@/lib/store";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prospect = await getProspect(id);
  if (!prospect) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let config = {
    enabled: true,
    customMessage: null as string | null,
    clientPhoneNumber: null as string | null,
    twilioWebhookUrl: `${BASE_URL}/api/missed-call/twiml/${id}`,
    statusCallbackUrl: `${BASE_URL}/api/missed-call/callback`,
  };

  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase
        .from("client_feature_configs")
        .select("*")
        .eq("prospect_id", id)
        .single();
      if (data) {
        config = { ...config, ...data.missed_call_config };
      }
    } catch {
      // Table may not exist yet
    }
  }

  return NextResponse.json(config);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prospect = await getProspect(id);
  if (!prospect) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updates = await request.json();

  if (isSupabaseConfigured()) {
    try {
      await supabase.from("client_feature_configs").upsert(
        {
          prospect_id: id,
          missed_call_config: updates,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "prospect_id" }
      );
    } catch {
      // Table may not exist yet
    }
  }

  return NextResponse.json({ success: true, updates });
}
