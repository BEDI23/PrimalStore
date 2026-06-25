import { http, unwrap } from "@/lib/api/http";
import type { CreateUserInput, User } from "@/lib/api/types";

export const usersService = {
  list: () => http.get<{ data: User[] }>("/admin/users").then(unwrap),

  create: (input: CreateUserInput) =>
    http.post<{ data: User }>("/admin/users", input).then(unwrap),

  remove: (id: string) =>
    http.delete(`/admin/users/${id}`).then(() => undefined),
};
