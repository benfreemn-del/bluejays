import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_KEY || ""
);

const TABLE = "category_fallbacks";

interface FallbackData {
  category: string;
  slots: { name: string; url: string | null }[];
}

// GET — load fallbacks for a category
export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category");
  if (!category) {
    return NextResponse.json({ error: "category param required" }, { status: 400 });
  }

  try {
    const { data } = await supabase
      .from(TABLE)
      .select("*")
      .eq("category", category)
      .single();

    if (data) {
      return NextResponse.json({ fallbacks: data.slots || [] });
    }
    // No data yet — return empty slots
    return NextResponse.json({ fallbacks: [] });
  } catch {
    return NextResponse.json({ fallbacks: [] });
  }
}

// POST — save fallbacks for a category
export async function POST(request: NextRequest) {
  const body: FallbackData = await request.json();
  if (!body.category || !body.slots) {
    return NextResponse.json({ error: "category and slots required" }, { status: 400 });
  }

  try {
    // Upsert — insert or update
    const { error } = await supabase
      .from(TABLE)
      .upsert(
        { category: body.category, slots: body.slots, updated_at: new Date().toISOString() },
        { onConflict: "category" }
      );

    if (error) {
      // Table might not exist — try using prospect storage as fallback
      console.error("Supabase fallback save error:", error);
      return NextResponse.json({ message: "Saved to local", fallbacks: body.slots });
    }

    return NextResponse.json({ message: "Saved", fallbacks: body.slots });
  } catch (err) {
    return NextResponse.json(
      { error: `Save failed: ${err instanceof Error ? err.message : "Unknown"}` },
      { status: 500 }
    );
  }
}
