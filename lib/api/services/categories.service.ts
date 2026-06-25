import { http, unwrap } from "@/lib/api/http";
import type {
  Categorie,
  SousCategorie,
  CreateCategorieInput,
  UpdateCategorieInput,
  ReorderInput,
} from "@/lib/api/types";

export const categoriesService = {
  // ── Public ────────────────────────────────────────────────────────────────
  publicList: () =>
    http.get<{ data: Categorie[] }>("/categories").then(unwrap),

  publicBySlug: (slug: string) =>
    http.get<{ data: Categorie }>(`/categories/${slug}`).then(unwrap),

  publicSousCategories: (slug: string) =>
    http
      .get<{ data: SousCategorie[] }>(`/categories/${slug}/sous-categories`)
      .then(unwrap),

  // ── Admin ─────────────────────────────────────────────────────────────────
  adminList: () =>
    http.get<{ data: Categorie[] }>("/admin/categories").then(unwrap),

  adminById: (id: number) =>
    http.get<{ data: Categorie }>(`/admin/categories/${id}`).then(unwrap),

  create: (input: CreateCategorieInput) =>
    http.post<{ data: Categorie }>("/admin/categories", input).then(unwrap),

  update: (id: number, input: UpdateCategorieInput) =>
    http
      .patch<{ data: Categorie }>(`/admin/categories/${id}`, input)
      .then(unwrap),

  remove: (id: number) =>
    http.delete(`/admin/categories/${id}`).then(() => undefined),

  reorder: (input: ReorderInput) =>
    http.post("/admin/categories/reorder", input).then(() => undefined),
};
