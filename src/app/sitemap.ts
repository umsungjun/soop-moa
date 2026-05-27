import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: siteConfig.url, lastModified: now, priority: 1 },
    { url: `${siteConfig.url}/live`, lastModified: now, priority: 0.8 },
    { url: `${siteConfig.url}/multiview`, lastModified: now, priority: 0.9 },
  ];
}
