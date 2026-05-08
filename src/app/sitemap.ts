import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

const lastModified = new Date("2026-05-08");

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const pages = ["/", "/auth/signin", "/auth/signup", "/privacy", "/terms"];

  return pages.map((path) => ({
    url: new URL(path, siteUrl).toString(),
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.6,
  }));
}
