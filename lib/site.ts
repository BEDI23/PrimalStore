// URL publique du site, pour sitemap/robots (URLs absolues). À définir via NEXT_PUBLIC_SITE_URL.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://primal.tg"
).replace(/\/+$/, "");
