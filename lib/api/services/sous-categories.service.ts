import { http, unwrap } from "@/lib/api/http";
import type {
  SousCategorie,
  CreateSousCategorieInput,
  UpdateSousCategorieInput,
  SousCategorieFilters,
  ReorderInput,
} from "@/lib/api/types";

export const sousCategoriesService = {
  // ── Public ────────────────────────────────────────────────────────────────
  publicById: (id: number) =>
    http.get<{ data: SousCategorie }>(`/sous-categories/${id}`).then(unwrap),

  // ── Admin ─────────────────────────────────────────────────────────────────
  adminList: (filters?: SousCategorieFilters) =>
    http
      .get<{ data: SousCategorie[] }>("/admin/sous-categories", {
        params: filters,
      })
      .then(unwrap),

  adminById: (id: number) =>
    http
      .get<{ data: SousCategorie }>(`/admin/sous-categories/${id}`)
      .then(unwrap),

  create: (input: CreateSousCategorieInput) =>
    http
      .post<{ data: SousCategorie }>("/admin/sous-categories", input)
      .then(unwrap),

  update: (id: number, input: UpdateSousCategorieInput) =>
    http
      .patch<{ data: SousCategorie }>(`/admin/sous-categories/${id}`, input)
      .then(unwrap),

  remove: (id: number) =>
    http.delete(`/admin/sous-categories/${id}`).then(() => undefined),

  reorder: (input: ReorderInput) =>
    http.post("/admin/sous-categories/reorder", input).then(() => undefined),
};
