import { http, unwrap } from "@/lib/api/http";
import type { SitemapEntry, HealthStatus } from "@/lib/api/types";

export const sitemapService = {
  get: () => http.get<{ data: SitemapEntry[] }>("/sitemap").then(unwrap),
};

export const ageService = {
  confirm: () =>
    http.post<{ confirmed: boolean }>("/age/confirm").then((r) => r.data),
};

export const healthService = {
  check: () => http.get<HealthStatus>("/health").then((r) => r.data),
};
