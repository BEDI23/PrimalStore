"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { commandesService } from "@/lib/api/services";
import { keys } from "@/lib/api/keys";
import type {
  Commande,
  CreateCommandeInput,
  UpdateStatutCommandeInput,
  CommandeFilters,
  ApiListResponse,
} from "@/lib/api/types";

// ── Public ────────────────────────────────────────────────────────────────────

export function useCreateCommande() {
  return useMutation({
    mutationFn: (input: CreateCommandeInput) => commandesService.create(input),
  });
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export function useCommandesAdmin(filters?: CommandeFilters) {
  return useQuery<ApiListResponse<Commande>>({
    queryKey: keys.commandes.adminList(filters),
    queryFn: () => commandesService.adminList(filters),
  });
}

export function useCommandeAdmin(id: number, enabled = true) {
  return useQuery<Commande>({
    queryKey: keys.commandes.adminDetail(id),
    queryFn: () => commandesService.adminById(id),
    enabled: enabled && Number.isFinite(id),
  });
}

export function useUpdateStatutCommande() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: UpdateStatutCommandeInput;
    }) => commandesService.updateStatut(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.commandes.all }),
  });
}
