"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { promotionsService } from "@/lib/api/services";
import { keys } from "@/lib/api/keys";
import type {
  Promotion,
  CreatePromotionInput,
  UpdatePromotionInput,
} from "@/lib/api/types";

export function usePromotions(produitId: number, enabled = true) {
  return useQuery<Promotion[]>({
    queryKey: keys.promotions.adminList(produitId),
    queryFn: () => promotionsService.adminList(produitId),
    enabled: enabled && Number.isFinite(produitId),
  });
}

export function usePromotion(id: number, enabled = true) {
  return useQuery<Promotion>({
    queryKey: keys.promotions.adminDetail(id),
    queryFn: () => promotionsService.adminById(id),
    enabled: enabled && Number.isFinite(id),
  });
}

export function useCreatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePromotionInput) => promotionsService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.promotions.all }),
  });
}

export function useUpdatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdatePromotionInput }) =>
      promotionsService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.promotions.all }),
  });
}

export function useDeletePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => promotionsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.promotions.all }),
  });
}
