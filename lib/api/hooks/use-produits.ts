"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { produitsService } from "@/lib/api/services";
import { keys } from "@/lib/api/keys";
import type {
  Produit,
  CreateProduitInput,
  UpdateProduitInput,
  ProduitFilters,
  ApiListResponse,
} from "@/lib/api/types";

// ── Public ────────────────────────────────────────────────────────────────────

export function useProduits(filters?: ProduitFilters) {
  return useQuery<ApiListResponse<Produit>>({
    queryKey: keys.produits.publicList(filters),
    queryFn: () => produitsService.publicList(filters),
  });
}

export function useProduit(id: number, enabled = true) {
  return useQuery<Produit>({
    queryKey: keys.produits.publicDetail(id),
    queryFn: () => produitsService.publicById(id),
    enabled: enabled && Number.isFinite(id),
  });
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export function useProduitsAdmin(filters?: ProduitFilters) {
  return useQuery<ApiListResponse<Produit>>({
    queryKey: keys.produits.adminList(filters),
    queryFn: () => produitsService.adminList(filters),
  });
}

export function useProduitAdmin(id: number, enabled = true) {
  return useQuery<Produit>({
    queryKey: keys.produits.adminDetail(id),
    queryFn: () => produitsService.adminById(id),
    enabled: enabled && Number.isFinite(id),
  });
}

export function useCreateProduit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProduitInput) => produitsService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.produits.all }),
  });
}

export function useUpdateProduit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateProduitInput }) =>
      produitsService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.produits.all }),
  });
}

export function useDeleteProduit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => produitsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.produits.all }),
  });
}
