// Lecture côté Server Components : fetch natif + cache Next (tags/revalidate).
// Pas d'axios ici (client-only). Aucune session requise pour les lectures publiques.
import type { ApiResponse, ApiListResponse } from "@/lib/api/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

export interface ApiGetOptions {
  tags?: string[];
  revalidate?: number;
  /** Transmet le cookie de la requête entrante (lecture authentifiée SSR). */
  cookie?: string;
}

async function apiFetch<T>(path: string, opts?: ApiGetOptions): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    cache: "force-cache",
    next: { tags: opts?.tags, revalidate: opts?.revalidate ?? 60 },
    headers: {
      Accept: "application/json",
      ...(opts?.cookie ? { cookie: opts.cookie } : {}),
    },
  });
  if (!res.ok) {
    throw new Error(`API ${res.status} ${path}`);
  }
  return (await res.json()) as T;
}

/** GET renvoyant une ressource unique enveloppée `{ data: T }`. */
export async function apiGet<T>(
  path: string,
  opts?: ApiGetOptions
): Promise<T> {
  const json = await apiFetch<ApiResponse<T>>(path, opts);
  return json.data;
}

/** GET renvoyant une liste paginée `{ data: T[], meta }`. */
export async function apiGetList<T>(
  path: string,
  opts?: ApiGetOptions
): Promise<ApiListResponse<T>> {
  return apiFetch<ApiListResponse<T>>(path, opts);
}
