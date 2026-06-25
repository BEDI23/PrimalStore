"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/lib/api/services";
import { keys } from "@/lib/api/keys";
import type { LoginInput, User } from "@/lib/api/types";

export function useMe() {
  return useQuery<User>({
    queryKey: keys.auth.me,
    queryFn: authService.me,
    retry: false,
    staleTime: 60_000,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (creds: LoginInput) => authService.login(creds),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.auth.me }),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => qc.clear(),
  });
}
