import { http, unwrap } from "@/lib/api/http";
import type {
  Produit,
  CreateProduitInput,
  UpdateProduitInput,
  ProduitFilters,
  ApiListResponse,
} from "@/lib/api/types";

export const produitsService = {
  // ── Public ────────────────────────────────────────────────────────────────
  publicList: (filters?: ProduitFilters) =>
    http
      .get<ApiListResponse<Produit>>("/produits", { params: filters })
      .then((r) => r.data),

  publicById: (id: number) =>
    http.get<{ data: Produit }>(`/produits/${id}`).then(unwrap),

  // ── Admin ─────────────────────────────────────────────────────────────────
  adminList: (filters?: ProduitFilters) =>
    http
      .get<ApiListResponse<Produit>>("/admin/produits", { params: filters })
      .then((r) => r.data),

  adminById: (id: number) =>
    http.get<{ data: Produit }>(`/admin/produits/${id}`).then(unwrap),

  create: (input: CreateProduitInput) =>
    http.post<{ data: Produit }>("/admin/produits", input).then(unwrap),

  update: (id: number, input: UpdateProduitInput) =>
    http.patch<{ data: Produit }>(`/admin/produits/${id}`, input).then(unwrap),

  remove: (id: number) =>
    http.delete(`/admin/produits/${id}`).then(() => undefined),
};
