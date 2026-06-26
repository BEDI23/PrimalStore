// Fetchers SSR publics — server-only (pas de "use client").
// Consomment lib/api/server-fetch.ts et lib/api/types.ts.
// Aucun import de lib/data.ts ni de lib/types.ts.

import { apiGet, apiGetList } from "@/lib/api/server-fetch";
import type { Produit, Categorie, SousCategorie } from "@/lib/api/types";

/**
 * Retourne la liste publique des produits actifs.
 * On passe limit=100 pour dépasser la pagination par défaut du backend (20 items)
 * et ramener l'ensemble du catalogue en une seule requête. À ajuster si le
 * catalogue dépasse 100 produits ou si le backend expose une pagination explicite.
 */
export async function getProduitsPublic(params?: {
  categorieSlug?: string;
  sousCategorieSlug?: string;
  q?: string;
  limit?: number;
}): Promise<Produit[]> {
  // URLSearchParams encode déjà les valeurs : pas de encodeURIComponent (sinon double-encodage).
  const qs = new URLSearchParams();

  if (params?.categorieSlug) {
    qs.set("categorie_slug", params.categorieSlug);
  }
  if (params?.sousCategorieSlug) {
    qs.set("sous_categorie_slug", params.sousCategorieSlug);
  }
  if (params?.q) {
    qs.set("q", params.q);
  }
  // Valeur par défaut : 100 (voir note ci-dessus)
  qs.set("limit", String(params?.limit ?? 100));

  const query = qs.toString() ? `?${qs.toString()}` : "";
  const result = await apiGetList<Produit>(`/produits${query}`);
  return result.data;
}

/**
 * Retourne un produit par son id, ou null si absent / en erreur (404, réseau…).
 * La page appelante est responsable de déclencher notFound() si null.
 */
export async function getProduitPublic(
  id: string | number
): Promise<Produit | null> {
  try {
    return await apiGet<Produit>(`/produits/${id}`);
  } catch {
    return null;
  }
}

/**
 * Retourne toutes les catégories actives.
 */
export async function getCategoriesPublic(): Promise<Categorie[]> {
  try {
    return await apiGet<Categorie[]>("/categories");
  } catch {
    return [];
  }
}

/** Détail public d'une catégorie par slug (GET /categories/:slug), ou null si absente/erreur. */
export async function getCategoriePublic(
  slug: string
): Promise<Categorie | null> {
  try {
    return await apiGet<Categorie>(`/categories/${encodeURIComponent(slug)}`);
  } catch {
    return null;
  }
}

/** Sous-catégories publiques d'une catégorie (GET /categories/:slug/sous-categories). */
export async function getSousCategoriesPublic(
  slug: string
): Promise<SousCategorie[]> {
  try {
    return await apiGet<SousCategorie[]>(
      `/categories/${encodeURIComponent(slug)}/sous-categories`
    );
  } catch {
    return [];
  }
}
