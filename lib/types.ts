export interface Categorie {
  id: string;
  nom: string;
  created_at: string;
}

export interface Produit {
  id: string;
  nom: string;
  description_courte: string | null;
  description_complete: string | null;
  prix: number;
  badge: string;
  image_url: string | null;
  video_url: string | null;
  categorie_id: string | null;
  actif: boolean;
  created_at: string;
  categories?: { nom: string } | null;
}

export interface Promotion {
  id: string;
  produit_id: string;
  prix_promo: number;
  date_fin: string;
  actif: boolean;
  created_at: string;
}

export interface Commande {
  id: string;
  produit_id: string | null;
  produit_nom: string | null;
  produit_prix: number | null;
  client_nom: string;
  client_telephone: string;
  quartier: string;
  quantite: number;
  prix_total: number | null;
  message: string | null;
  statut: "nouvelle" | "confirmee" | "vendue" | "livree" | "annulee";
  created_at: string;
}

export type StatutCommande = Commande["statut"];

export interface ProduitAvecPromo extends Produit {
  promotion?: Promotion | null;
  prixFinal: number;
  enPromo: boolean;
}
