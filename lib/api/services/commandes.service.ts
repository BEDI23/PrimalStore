import { http, unwrap } from "@/lib/api/http";
import type {
  Commande,
  CreateCommandeInput,
  UpdateStatutCommandeInput,
  CommandeFilters,
  ApiListResponse,
} from "@/lib/api/types";

export const commandesService = {
  // ── Public ────────────────────────────────────────────────────────────────
  create: (input: CreateCommandeInput) =>
    http.post<{ data: Commande }>("/commandes", input).then(unwrap),

  // ── Admin ─────────────────────────────────────────────────────────────────
  adminList: (filters?: CommandeFilters) =>
    http
      .get<ApiListResponse<Commande>>("/admin/commandes", { params: filters })
      .then((r) => r.data),

  adminById: (id: number) =>
    http.get<{ data: Commande }>(`/admin/commandes/${id}`).then(unwrap),

  updateStatut: (id: number, input: UpdateStatutCommandeInput) =>
    http
      .patch<{ data: Commande }>(`/admin/commandes/${id}/statut`, input)
      .then(unwrap),
};
