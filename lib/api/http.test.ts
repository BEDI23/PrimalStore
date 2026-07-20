// Intercepteur 401 de `http` (refresh transparent, un seul en vol).
// Régression clé : un login raté (401) ne doit PAS déclencher /auth/refresh —
// tandis qu'un /auth/me expiré DOIT le déclencher puis rejouer la requête.
// On simule le réseau via un adapter axios : aucune dépendance de mock ajoutée.
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  AxiosError,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { http } from "./http";

const realAdapter = http.defaults.adapter;
let calls: string[];

/** Réponse OK factice conforme à `AxiosResponse`. */
function ok(
  config: InternalAxiosRequestConfig,
  status = 200,
  data: unknown = { data: {} }
): AxiosResponse {
  return { data, status, statusText: "OK", headers: {}, config };
}

/** Échec HTTP (avec `response.status`) — le chemin vu par l'intercepteur. */
function fail(config: InternalAxiosRequestConfig, status: number): AxiosError {
  return new AxiosError(`HTTP ${status}`, "ERR_BAD_REQUEST", config, null, {
    data: { error: { code: "UNAUTHENTICATED", message: "x" } },
    status,
    statusText: "",
    headers: {},
    config,
  });
}

beforeEach(() => {
  calls = [];
});

afterEach(() => {
  http.defaults.adapter = realAdapter;
});

describe("http — intercepteur 401", () => {
  it("login raté (401) ne déclenche PAS /auth/refresh", async () => {
    http.defaults.adapter = (async (config: InternalAxiosRequestConfig) => {
      calls.push(config.url ?? "");
      if (config.url?.includes("/auth/login")) throw fail(config, 401);
      return ok(config); // /auth/refresh répondrait s'il était (à tort) appelé
    }) as AxiosAdapter;

    await expect(http.post("/auth/login", {})).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(calls).toEqual(["/auth/login"]); // pas de refresh parasite
  });

  it("me expiré (401) déclenche /auth/refresh puis rejoue /auth/me", async () => {
    let me = 0;
    http.defaults.adapter = (async (config: InternalAxiosRequestConfig) => {
      calls.push(config.url ?? "");
      if (config.url?.includes("/auth/me")) {
        me += 1;
        if (me === 1) throw fail(config, 401); // at expiré
        return ok(config, 200, { data: { id: "1" } }); // après refresh
      }
      if (config.url?.includes("/auth/refresh")) return ok(config, 204, "");
      return ok(config);
    }) as AxiosAdapter;

    const res = await http.get("/auth/me");

    expect(res.status).toBe(200);
    expect(calls).toEqual(["/auth/me", "/auth/refresh", "/auth/me"]);
  });
});
