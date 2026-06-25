import { http, unwrap } from "@/lib/api/http";
import type { LoginInput, User } from "@/lib/api/types";

export const authService = {
  login: (input: LoginInput) =>
    http.post("/auth/login", input).then((r) => r.data),

  refresh: () => http.post("/auth/refresh").then(() => undefined),

  logout: () => http.post("/auth/logout").then(() => undefined),

  me: () => http.get<{ data: User }>("/auth/me").then(unwrap),
};
