import { Promotion, Produit, ProduitAvecPromo } from "./types";

export function formatPrix(prix: number): string {
  return `${Math.round(prix).toLocaleString("fr-FR")} FCFA`;
}

export function isPromotionActive(promo: Promotion): boolean {
  if (!promo.actif) return false;
  return new Date(promo.date_fin) > new Date();
}

export function getActivePromotion(
  produitId: string,
  promotions: Promotion[]
): Promotion | null {
  const promo = promotions.find((p) => p.produit_id === produitId);
  if (!promo || !isPromotionActive(promo)) return null;
  return promo;
}

export function enrichProduit(
  produit: Produit,
  promotions: Promotion[]
): ProduitAvecPromo {
  const promotion = getActivePromotion(produit.id, promotions);
  const enPromo = !!promotion;
  const prixFinal = enPromo ? promotion!.prix_promo : produit.prix;
  return { ...produit, promotion, prixFinal, enPromo };
}

export function enrichProduits(
  produits: Produit[],
  promotions: Promotion[]
): ProduitAvecPromo[] {
  return produits.map((p) => enrichProduit(p, promotions));
}

export function validatePhoneTogo(phone: string): boolean {
  // On tolère les séparateurs courants (espaces, tirets, points, parenthèses)
  // saisis par les clients avant de valider le format togolais (+228 + 8 chiffres).
  const cleaned = phone.replace(/[\s.\-()]/g, "");
  return /^\+228\d{8}$/.test(cleaned);
}

export interface CommandePricing {
  produit_nom: string;
  produit_prix: number;
  quantite: number;
  prix_total: number;
}

/**
 * Calcule le prix d'une commande à partir de la SOURCE DE VÉRITÉ serveur
 * (produit + promotions en base), jamais à partir d'un montant fourni par le
 * client. Empêche la falsification de prix.
 */
export function computeCommandePricing(
  produit: Pick<Produit, "id" | "nom" | "prix">,
  promotions: Promotion[],
  quantite: number
): CommandePricing {
  const qte = Math.max(1, Math.floor(Number(quantite)) || 1);
  const promo = getActivePromotion(produit.id, promotions);
  const prixUnitaire = Math.round(promo ? promo.prix_promo : produit.prix);
  return {
    produit_nom: produit.nom,
    produit_prix: prixUnitaire,
    quantite: qte,
    prix_total: prixUnitaire * qte,
  };
}

export function getStartOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getStartOfWeek(date: Date = new Date()): Date {
  const d = getStartOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d;
}

export function getStartOfMonth(date: Date = new Date()): Date {
  const d = getStartOfDay(date);
  d.setDate(1);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function filterCommandesByDate<T extends { created_at: string }>(
  items: T[],
  filtre: string,
  dateSpecifique?: string
): T[] {
  if (filtre === "toutes" && !dateSpecifique) return items;

  const now = new Date();

  if (dateSpecifique) {
    const target = new Date(dateSpecifique);
    return items.filter((c) => isSameDay(new Date(c.created_at), target));
  }

  switch (filtre) {
    case "aujourdhui":
      return items.filter((c) =>
        isSameDay(new Date(c.created_at), now)
      );
    case "hier": {
      const hier = new Date(now);
      hier.setDate(hier.getDate() - 1);
      return items.filter((c) =>
        isSameDay(new Date(c.created_at), hier)
      );
    }
    case "semaine": {
      const start = getStartOfWeek(now);
      return items.filter((c) => new Date(c.created_at) >= start);
    }
    case "mois": {
      const start = getStartOfMonth(now);
      return items.filter((c) => new Date(c.created_at) >= start);
    }
    default:
      return items;
  }
}

export function sumRevenu(
  commandes: { statut: string; prix_total: number | null }[],
  statut: string
): number {
  return commandes
    .filter((c) => c.statut === statut)
    .reduce((sum, c) => sum + (c.prix_total ?? 0), 0);
}
