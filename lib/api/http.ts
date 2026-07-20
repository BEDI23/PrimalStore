// Client HTTP axios pour l'API NestJS v3.
// - withCredentials : envoie les cookies HttpOnly (at/rt) sur le domaine parent.
// - Intercepteur 401 → POST /auth/refresh (un seul refresh en vol) → retry.
// Le front ne lit JAMAIS les tokens : tout vit en cookies HttpOnly.
import axios, { AxiosError, AxiosResponse } from "axios";
import type { ApiErrorBody } from "@/lib/api/types";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export const http = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "X-Requested-With": "XMLHttpRequest" },
});

// ─────────────────────────────────────────────────────────────────────────────
// Refresh : un seul appel /auth/refresh concurrent (verrou `refreshing`).
// ─────────────────────────────────────────────────────────────────────────────

let refreshing: Promise<void> | null = null;

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config;
    const status = error.response?.status;

    // Pas un 401, déjà retried, ou requête de refresh elle-même → on propage.
    if (
      !original ||
      status !== 401 ||
      (original as { _retried?: boolean })._retried ||
      original.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    (original as { _retried?: boolean })._retried = true;

    refreshing ??= http
      .post("/auth/refresh")
      .then(() => undefined)
      .finally(() => {
        refreshing = null;
      });

    try {
      await refreshing;
      return http(original);
    } catch {
      // Refresh raté → en zone admin protégée, redirige vers le login.
      // Si on est déjà sur /admin/login, on rejette simplement pour éviter
      // une boucle de rechargement (window.location.assign re-déclenche
      // immédiatement useMe → 401 → refresh 401 → reload).
      if (
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/admin") &&
        window.location.pathname !== "/admin/login"
      ) {
        window.location.assign("/admin/login");
      }
      return Promise.reject(error);
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Helpers d'enveloppe / erreurs
// ─────────────────────────────────────────────────────────────────────────────

/** Déballe l'enveloppe `{ data: T }` renvoyée par le TransformInterceptor. */
export function unwrap<T>(response: AxiosResponse<{ data: T }>): T {
  return response.data?.data as T;
}

export interface NormalizedApiError {
  code: string;
  message: string;
  details?: { path: (string | number)[]; message: string }[];
  status?: number;
}

/** Extrait un message exploitable d'une erreur axios (codes du HttpExceptionFilter). */
export function getApiError(error: unknown): NormalizedApiError {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiErrorBody | undefined;
    if (body?.error) {
      return { ...body.error, status: error.response?.status };
    }
    return {
      code: "NETWORK_ERROR",
      message: error.message || "Erreur réseau. Réessayez.",
      status: error.response?.status,
    };
  }
  return { code: "UNKNOWN", message: "Une erreur inattendue est survenue." };
}

/** Message FR prêt à afficher (setError("root", ...)). */
export function getApiErrorMessage(error: unknown): string {
  return getApiError(error).message;
}
