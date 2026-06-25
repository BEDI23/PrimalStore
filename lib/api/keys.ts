// Query keys factory TanStack Query — clés stables pour cache + invalidation.
import type {
  ProduitFilters,
  CommandeFilters,
  SousCategorieFilters,
} from "@/lib/api/types";

export const keys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  users: {
    all: ["users"] as const,
    list: () => ["users", "list"] as const,
  },
  categories: {
    all: ["categories"] as const,
    publicList: () => ["categories", "public", "list"] as const,
    publicDetail: (slug: string) =>
      ["categories", "public", "detail", slug] as const,
    publicSousCategories: (slug: string) =>
      ["categories", "public", slug, "sous-categories"] as const,
    adminList: () => ["categories", "admin", "list"] as const,
    adminDetail: (id: number) => ["categories", "admin", "detail", id] as const,
  },
  sousCategories: {
    all: ["sous-categories"] as const,
    publicDetail: (id: number) =>
      ["sous-categories", "public", "detail", id] as const,
    adminList: (filters?: SousCategorieFilters) =>
      ["sous-categories", "admin", "list", filters ?? {}] as const,
    adminDetail: (id: number) =>
      ["sous-categories", "admin", "detail", id] as const,
  },
  produits: {
    all: ["produits"] as const,
    publicList: (filters?: ProduitFilters) =>
      ["produits", "public", "list", filters ?? {}] as const,
    publicDetail: (id: number) => ["produits", "public", "detail", id] as const,
    adminList: (filters?: ProduitFilters) =>
      ["produits", "admin", "list", filters ?? {}] as const,
    adminDetail: (id: number) => ["produits", "admin", "detail", id] as const,
  },
  promotions: {
    all: ["promotions"] as const,
    adminList: (produitId: number) =>
      ["promotions", "admin", "list", produitId] as const,
    adminDetail: (id: number) => ["promotions", "admin", "detail", id] as const,
  },
  commandes: {
    all: ["commandes"] as const,
    adminList: (filters?: CommandeFilters) =>
      ["commandes", "admin", "list", filters ?? {}] as const,
    adminDetail: (id: number) => ["commandes", "admin", "detail", id] as const,
  },
  sitemap: ["sitemap"] as const,
  health: ["health"] as const,
};
