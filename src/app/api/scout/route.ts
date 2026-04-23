import { NextRequest, NextResponse } from "next/server";
import { scout } from "@/lib/scout";
import type { Category } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { city, category, limit, pageToken } = body as {
      city: string;
      category: Category;
      limit?: number;
      pageToken?: string;
    };

    if (!city || !category) {
      return NextResponse.json(
        { error: "city and category are required" },
        { status: 400 }
      );
    }

    const result = await scout({ city, category, limit, pageToken });

    return NextResponse.json({
      message: `Found ${result.prospects.length} prospects`,
      prospects: result.prospects,
      nextPageToken: result.nextPageToken || null,
      exhausted: result.prospects.length === 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
