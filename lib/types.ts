import type { Database } from "@/lib/database.types";

type Tables = Database["public"]["Tables"];

export type StatutCommande = "nouvelle" | "livree" | "annulee";

// `created_at` a un DEFAULT now() en base : jamais null en pratique. On le
// restreint à `string` au niveau applicatif ; la couche données (lib/data.ts)
// garantit cette forme. De même `statut` est du texte libre en base mais
// contraint par CHECK à l'union métier.
type AppRow<T extends keyof Tables> = Omit<Tables[T]["Row"], "created_at"> & {
  created_at: string;
};

export type Categorie = AppRow<"categories">;

export type Produit = AppRow<"produits"> & {
  categories?: { nom: string } | null;
};

export type Promotion = AppRow<"promotions">;

export type Commande = Omit<AppRow<"commandes">, "statut"> & {
  statut: StatutCommande;
};

export type ProduitAvecPromo = Produit & {
  promotion?: Promotion | null;
  prixFinal: number;
  enPromo: boolean;
};
