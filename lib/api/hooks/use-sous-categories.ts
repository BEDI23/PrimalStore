"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sousCategoriesService } from "@/lib/api/services";
import { keys } from "@/lib/api/keys";
import type {
  SousCategorie,
  CreateSousCategorieInput,
  UpdateSousCategorieInput,
  SousCategorieFilters,
  ReorderInput,
} from "@/lib/api/types";

// ── Public ────────────────────────────────────────────────────────────────────

export function useSousCategorie(id: number, enabled = true) {
  return useQuery<SousCategorie>({
    queryKey: keys.sousCategories.publicDetail(id),
    queryFn: () => sousCategoriesService.publicById(id),
    enabled: enabled && Number.isFinite(id),
  });
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export function useSousCategoriesAdmin(filters?: SousCategorieFilters) {
  return useQuery<SousCategorie[]>({
    queryKey: keys.sousCategories.adminList(filters),
    queryFn: () => sousCategoriesService.adminList(filters),
  });
}

export function useSousCategorieAdmin(id: number, enabled = true) {
  return useQuery<SousCategorie>({
    queryKey: keys.sousCategories.adminDetail(id),
    queryFn: () => sousCategoriesService.adminById(id),
    enabled: enabled && Number.isFinite(id),
  });
}

export function useCreateSousCategorie() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSousCategorieInput) =>
      sousCategoriesService.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.sousCategories.all });
      qc.invalidateQueries({ queryKey: keys.categories.all });
    },
  });
}

export function useUpdateSousCategorie() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: UpdateSousCategorieInput;
    }) => sousCategoriesService.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.sousCategories.all });
      qc.invalidateQueries({ queryKey: keys.categories.all });
    },
  });
}

export function useDeleteSousCategorie() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sousCategoriesService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.sousCategories.all });
      qc.invalidateQueries({ queryKey: keys.categories.all });
    },
  });
}

export function useReorderSousCategories() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ReorderInput) => sousCategoriesService.reorder(input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: keys.sousCategories.all }),
  });
}
