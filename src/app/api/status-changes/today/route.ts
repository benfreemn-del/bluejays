import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface StatusChangeRow {
  id: number;
  prospect_id: string;
  business_name: string | null;
  from_status: string | null;
  to_status: string;
  changed_at: string;
  source: string | null;
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ transitions: [], recent: [], since: null });
  }

  const since = new Date();
  since.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("prospect_status_changes")
    .select("id,prospect_id,business_name,from_status,to_status,changed_at,source")
    .gte("changed_at", since.toISOString())
    .order("changed_at", { ascending: false })
    .limit(500);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data as StatusChangeRow[] | null) ?? [];
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = `${row.from_status ?? "—"}→${row.to_status}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const transitions = Array.from(counts.entries())
    .map(([key, count]) => {
      const [from_status, to_status] = key.split("→");
      return { from_status, to_status, count };
    })
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({
    since: since.toISOString(),
    transitions,
    recent: rows.slice(0, 50),
  });
}
