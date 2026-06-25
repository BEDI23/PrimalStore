import type { MetadataRoute } from "next";
import { apiGet } from "@/lib/api/server-fetch";
import { SITE_URL } from "@/lib/site";
import type { SitemapEntry } from "@/lib/api/types";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statics = ["", "/produits", "/a-propos", "/contact"].map((p) => ({
    url: `${SITE_URL}${p}`,
  }));

  let dynamics: MetadataRoute.Sitemap = [];
  try {
    const entries = await apiGet<SitemapEntry[]>("/sitemap");
    dynamics = entries.map((e) => ({
      url: e.url.startsWith("http") ? e.url : `${SITE_URL}${e.url}`,
    }));
  } catch {
    /* backend indisponible : on sert au moins les routes statiques */
  }

  // dédoublonne par URL
  const seen = new Set<string>();
  return [...statics, ...dynamics].filter((e) =>
    seen.has(e.url) ? false : (seen.add(e.url), true)
  );
}
