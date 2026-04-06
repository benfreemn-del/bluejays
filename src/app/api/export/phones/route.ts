import { NextRequest, NextResponse } from "next/server";
import { getAllProspects, filterProspects } from "@/lib/store";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category") || undefined;
  const status = searchParams.get("status") || undefined;
  const city = searchParams.get("city") || undefined;
  const format = searchParams.get("format") || "json";

  const prospects =
    category || status || city
      ? await filterProspects({ category, status, city })
      : await getAllProspects();

  const phones = prospects
    .filter((p) => p.phone)
    .map((p) => ({
      businessName: p.businessName,
      phone: p.phone!,
      category: p.category,
      city: p.city,
      state: p.state,
      status: p.status,
      email: p.email || "",
    }));

  if (format === "csv") {
    const csv = [
      "Business Name,Phone,Category,City,State,Status,Email",
      ...phones.map(
        (p) =>
          `"${p.businessName}","${p.phone}","${p.category}","${p.city}","${p.state}","${p.status}","${p.email}"`
      ),
    ].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=bluejays-phones.csv",
      },
    });
  }

  return NextResponse.json({ phones, total: phones.length });
}
