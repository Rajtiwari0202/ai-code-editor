import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/terms", "/privacy"],
      disallow: ["/dashboard", "/playground", "/api"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
