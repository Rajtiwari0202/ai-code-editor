import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

const publicRoutes = [
  { path: "/", priority: 1 },
  { path: "/terms", priority: 0.4 },
  { path: "/privacy", priority: 0.4 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();

  return publicRoutes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified,
    changeFrequency: "weekly",
    priority: route.priority,
  }));
}
