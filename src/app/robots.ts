import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://bluejayportfolio.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/v2/", "/preview/"],
        disallow: [
          "/dashboard",
          "/api/",
          "/login",
          "/admin",
          "/onboarding/",
          "/claim/",
          "/expired/",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
