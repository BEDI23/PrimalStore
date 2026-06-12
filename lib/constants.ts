export const BOUTIQUE_NOM = "PrimalStore";
export const BOUTIQUE_SLOGAN =
  "Votre boutique en ligne à Lomé — santé, maison, high-tech et bien plus";
export const BOUTIQUE_DESCRIPTION =
  "PIPA-STOR propose un large catalogue à Lomé : produits naturels, articles ménagers, projecteurs, high-tech et bien d'autres. Parcourez nos catégories et commandez en ligne.";
export const WHATSAPP_NUMERO = "+22893378344";
export const WHATSAPP_DISPLAY = "+228 93 37 83 44";
export const CONTACT_EMAIL = "contact@pipastor.tg";

export const STATUTS_COMMANDE = [
  "nouvelle",
  "confirmee",
  "vendue",
  "livree",
  "annulee",
] as const;

export const STATUT_LABELS: Record<string, string> = {
  nouvelle: "Nouvelle",
  confirmee: "Confirmée",
  vendue: "Vendue",
  livree: "Livrée",
  annulee: "Annulée",
};

export const STATUT_COLORS: Record<string, string> = {
  nouvelle: "bg-orange-100 text-orange-800",
  confirmee: "bg-blue-100 text-blue-800",
  vendue: "bg-purple-100 text-purple-800",
  livree: "bg-green-100 text-green-800",
  annulee: "bg-red-100 text-red-800",
};

export const FILTRES_DATE = [
  { id: "toutes", label: "Toutes les dates" },
  { id: "aujourdhui", label: "Aujourd'hui" },
  { id: "hier", label: "Hier" },
  { id: "semaine", label: "Cette semaine" },
  { id: "mois", label: "Ce mois" },
] as const;

export const BADGE_OPTIONS = ["", "Nouveau", "Bestseller"] as const;
