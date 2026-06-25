// Barrel de la couche API PrimalStore (NestJS v3).
export * from "./types";
export * from "./keys";
export * from "./schemas";
export { http, unwrap, getApiError, getApiErrorMessage } from "./http";
export type { NormalizedApiError } from "./http";
export { apiGet, apiGetList } from "./server-fetch";
export * from "./services";
// NB : les hooks (`'use client'`) s'importent depuis "@/lib/api/hooks"
// pour ne pas tirer de code client dans un Server Component via ce barrel.
