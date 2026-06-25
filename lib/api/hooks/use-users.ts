"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersService } from "@/lib/api/services";
import { keys } from "@/lib/api/keys";
import type { CreateUserInput, User } from "@/lib/api/types";

export function useUsers() {
  return useQuery<User[]>({
    queryKey: keys.users.list(),
    queryFn: usersService.list,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) => usersService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.users.all }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.users.all }),
  });
}
