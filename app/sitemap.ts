import type { MetadataRoute } from "next";
import { apiGet } from "@/lib/api/server-fetch";
import { getCategoriesPublic } from "@/lib/api/public-data";
import { SITE_URL } from "@/lib/site";
import type { SitemapEntry } from "@/lib/api/types";

// Généré au runtime (pas au build) : le backend n'est pas joignable pendant `docker build`.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statics = ["", "/produits", "/categories", "/a-propos", "/contact"].map(
    (p) => ({ url: `${SITE_URL}${p}` })
  );

  let dynamics: MetadataRoute.Sitemap = [];
  try {
    const entries = await apiGet<SitemapEntry[]>("/sitemap");
    dynamics = entries.map((e) => ({
      url: e.url.startsWith("http") ? e.url : `${SITE_URL}${e.url}`,
    }));
  } catch {
    /* backend indisponible : on sert au moins les routes statiques */
  }

  let categoryUrls: MetadataRoute.Sitemap = [];
  try {
    const categories = await getCategoriesPublic();
    categoryUrls = categories
      .filter((c) => c.actif)
      .map((c) => ({ url: `${SITE_URL}/categories/${c.slug}` }));
  } catch {
    /* catégories indisponibles : on continue sans elles */
  }

  // dédoublonne par URL
  const seen = new Set<string>();
  return [...statics, ...dynamics, ...categoryUrls].filter((e) =>
    seen.has(e.url) ? false : (seen.add(e.url), true)
  );
}
