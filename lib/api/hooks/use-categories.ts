"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoriesService } from "@/lib/api/services";
import { keys } from "@/lib/api/keys";
import type {
  Categorie,
  SousCategorie,
  CreateCategorieInput,
  UpdateCategorieInput,
  ReorderInput,
} from "@/lib/api/types";

// ── Public ────────────────────────────────────────────────────────────────────

export function useCategories() {
  return useQuery<Categorie[]>({
    queryKey: keys.categories.publicList(),
    queryFn: categoriesService.publicList,
  });
}

export function useCategorie(slug: string, enabled = true) {
  return useQuery<Categorie>({
    queryKey: keys.categories.publicDetail(slug),
    queryFn: () => categoriesService.publicBySlug(slug),
    enabled: enabled && !!slug,
  });
}

export function useCategorieSousCategories(slug: string, enabled = true) {
  return useQuery<SousCategorie[]>({
    queryKey: keys.categories.publicSousCategories(slug),
    queryFn: () => categoriesService.publicSousCategories(slug),
    enabled: enabled && !!slug,
  });
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export function useCategoriesAdmin() {
  return useQuery<Categorie[]>({
    queryKey: keys.categories.adminList(),
    queryFn: categoriesService.adminList,
  });
}

export function useCategorieAdmin(id: number, enabled = true) {
  return useQuery<Categorie>({
    queryKey: keys.categories.adminDetail(id),
    queryFn: () => categoriesService.adminById(id),
    enabled: enabled && Number.isFinite(id),
  });
}

export function useCreateCategorie() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCategorieInput) => categoriesService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.categories.all }),
  });
}

export function useUpdateCategorie() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateCategorieInput }) =>
      categoriesService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.categories.all }),
  });
}

export function useDeleteCategorie() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoriesService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.categories.all }),
  });
}

export function useReorderCategories() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ReorderInput) => categoriesService.reorder(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.categories.all }),
  });
}
