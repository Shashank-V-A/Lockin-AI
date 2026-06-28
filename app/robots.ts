import type { MetadataRoute } from "next";

/** Robots.txt for search engine crawlers. */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dashboard/", "/api/"] },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
