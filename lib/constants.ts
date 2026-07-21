export const BOUTIQUE_NOM = "PrimalStore";
export const BOUTIQUE_SLOGAN =
  "Votre boutique en ligne à Lomé — santé, maison, high-tech et bien plus";
export const BOUTIQUE_DESCRIPTION =
  "PrimalStore propose un large catalogue à Lomé : produits naturels, articles ménagers, projecteurs, high-tech et bien d'autres. Parcourez nos catégories et commandez en ligne.";
export const WHATSAPP_NUMERO = "+22891810838";
export const WHATSAPP_DISPLAY = "+228 91 81 08 38";
export const CONTACT_EMAIL = "support@gmail.com";

export const STATUTS_COMMANDE = ["nouvelle", "livree", "annulee"] as const;

export const STATUT_LABELS: Record<string, string> = {
  nouvelle: "Nouvelle",
  livree: "Livrée",
  annulee: "Annulée",
};

export const STATUT_COLORS: Record<string, string> = {
  nouvelle: "bg-orange-100 text-orange-800",
  livree: "bg-green-100 text-green-800",
  annulee: "bg-red-100 text-red-800",
};

// Transitions autorisées : une commande « nouvelle » peut devenir livrée ou
// annulée. Une fois sortie de « nouvelle », elle ne peut plus y revenir ; seul
// le basculement livrée ↔ annulée reste possible (correction d'erreur).
export function statutsDisponibles(
  statutCourant: string
): readonly string[] {
  if (statutCourant === "nouvelle") return STATUTS_COMMANDE;
  return ["livree", "annulee"];
}

export const FILTRES_DATE = [
  { id: "toutes", label: "Toutes les dates" },
  { id: "aujourdhui", label: "Aujourd'hui" },
  { id: "hier", label: "Hier" },
  { id: "semaine", label: "Cette semaine" },
  { id: "mois", label: "Ce mois" },
] as const;

export const BADGE_OPTIONS = ["", "Nouveau", "Bestseller"] as const;
