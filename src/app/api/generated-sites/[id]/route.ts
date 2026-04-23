import { NextResponse } from "next/server";
import { getScrapedData } from "@/lib/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const siteData = await getScrapedData(id);

    if (!siteData) {
      return NextResponse.json(
        { error: "Generated site not found" },
        {
          status: 404,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    return NextResponse.json(siteData, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[api/generated-sites] Failed to load generated site", { id, error });

    return NextResponse.json(
      { error: "Failed to load generated site" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
