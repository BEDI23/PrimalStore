import { http, unwrap } from "@/lib/api/http";
import type {
  Promotion,
  CreatePromotionInput,
  UpdatePromotionInput,
} from "@/lib/api/types";

export const promotionsService = {
  // produitId est requis par l'API (query param).
  adminList: (produitId: number) =>
    http
      .get<{ data: Promotion[] }>("/admin/promotions", { params: { produitId } })
      .then(unwrap),

  adminById: (id: number) =>
    http.get<{ data: Promotion }>(`/admin/promotions/${id}`).then(unwrap),

  create: (input: CreatePromotionInput) =>
    http.post<{ data: Promotion }>("/admin/promotions", input).then(unwrap),

  update: (id: number, input: UpdatePromotionInput) =>
    http
      .patch<{ data: Promotion }>(`/admin/promotions/${id}`, input)
      .then(unwrap),

  remove: (id: number) =>
    http.delete(`/admin/promotions/${id}`).then(() => undefined),
};
