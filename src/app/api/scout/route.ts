import { NextRequest, NextResponse } from "next/server";
import { scout } from "@/lib/scout";
import type { Category } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { city, category, limit } = body as {
      city: string;
      category: Category;
      limit?: number;
    };

    if (!city || !category) {
      return NextResponse.json(
        { error: "city and category are required" },
        { status: 400 }
      );
    }

    const prospects = await scout({ city, category, limit });

    return NextResponse.json({
      message: `Found ${prospects.length} prospects`,
      prospects,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
