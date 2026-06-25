// Types de la couche API PrimalStore (backend NestJS v3).
// Source de vérité : docs/openapi.json. Modèle camelCase, IDs numériques —
// DISTINCT de lib/types.ts (ancien schéma Supabase snake_case, en cours de retrait).

// ─────────────────────────────────────────────────────────────────────────────
// Enveloppe de réponse (TransformInterceptor + HttpExceptionFilter côté NestJS)
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
}

export interface ApiMeta {
  total: number;
  limit: number;
  offset: number;
}

export interface ApiListResponse<T> {
  data: T[];
  meta: ApiMeta;
}

export interface ApiErrorDetail {
  path: (string | number)[];
  message: string;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Énumérations / valeurs contraintes
// ─────────────────────────────────────────────────────────────────────────────

export type StatutCommande = "nouvelle" | "livree" | "annulee";

export const STATUTS_COMMANDE_API = [
  "nouvelle",
  "livree",
  "annulee",
] as const satisfies readonly StatutCommande[];

export const ICON_NAMES = [
  "heart",
  "shield",
  "sparkles",
  "pill",
  "flame",
  "gift",
  "leaf",
  "zap",
  "star",
  "shopping-bag",
  "flask-conical",
  "droplet",
] as const;

export type IconName = (typeof ICON_NAMES)[number];

export type UploadBucket = "produits" | "videos" | "categories";

export type Role = "admin";

// ─────────────────────────────────────────────────────────────────────────────
// Entités
// ─────────────────────────────────────────────────────────────────────────────

export interface CategorieTheme {
  primary: string;
  primaryHover: string;
  onPrimary: string;
  secondary: string;
  accent: string;
}

export interface Categorie {
  id: number;
  nom: string;
  slug: string;
  description: string | null;
  theme: CategorieTheme;
  iconName: IconName;
  coverImageUrl: string;
  isAdult: boolean;
  position: number;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
  sousCategories?: SousCategorie[];
}

export interface SousCategorie {
  id: number;
  categorieId: number;
  nom: string;
  slug: string;
  description: string | null;
  position: number;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
  produits?: Produit[];
}

/**
 * Promo active embarquée dans le DTO produit public (GET /produits, GET /produits/:id).
 * Renseignée uniquement pour la promo active (actif=true ET dateFin>now) ; null sinon.
 */
export interface PromotionPublique {
  prixPromo: number;
  dateFin: string;
}

export interface Produit {
  id: number;
  nom: string;
  slug: string | null;
  prix: number;
  descriptionCourte: string;
  descriptionLongue: string;
  badge: string | null;
  imageUrl: string;
  videoUrl: string | null;
  sousCategorieId: number;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
  /** Promo active embarquée par l'API publique. Optionnel : absent côté admin / si l'API ne l'envoie pas encore. */
  promotion?: PromotionPublique | null;
}

export interface Promotion {
  id: number;
  produitId: number;
  prixPromo: number;
  dateFin: string;
  actif: boolean;
  createdAt: string;
}

export interface Commande {
  id: number;
  produitId: number;
  produitNom: string;
  produitPrix: number;
  clientNom: string;
  clientTelephone: string;
  quartier: string;
  quantite: number;
  prixTotal: number;
  message: string | null;
  statut: StatutCommande;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  role: Role;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UploadResult {
  path: string;
  publicUrl: string;
}

export interface SitemapEntry {
  url: string;
}

export interface HealthStatus {
  status: string;
  [key: string]: unknown;
}

// ─────────────────────────────────────────────────────────────────────────────
// Payloads (corps de requête) — alignés sur les DTO NestJS
// ─────────────────────────────────────────────────────────────────────────────

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  role?: Role;
}

export type ThemeInput = CategorieTheme;

export interface CreateCategorieInput {
  nom: string;
  slug: string;
  description?: string;
  theme: ThemeInput;
  iconName: IconName;
  coverImageUrl: string;
  isAdult: boolean;
  position: number;
  actif: boolean;
}

export type UpdateCategorieInput = Partial<CreateCategorieInput>;

export interface ReorderItem {
  id: number;
  position: number;
}

export interface ReorderInput {
  items: ReorderItem[];
}

export interface CreateSousCategorieInput {
  categorieId: number;
  nom: string;
  slug: string;
  description?: string;
  position: number;
  actif: boolean;
}

export type UpdateSousCategorieInput = Partial<CreateSousCategorieInput>;

export interface CreateProduitInput {
  nom: string;
  slug?: string;
  prix: number;
  descriptionCourte: string;
  descriptionLongue: string;
  badge?: string;
  imageUrl: string;
  videoUrl?: string;
  sousCategorieId: number;
  actif: boolean;
}

export type UpdateProduitInput = Partial<CreateProduitInput>;

export interface CreatePromotionInput {
  produitId: number;
  prixPromo: number;
  dateFin: string;
  actif: boolean;
}

export type UpdatePromotionInput = Partial<CreatePromotionInput>;

export interface CreateCommandeInput {
  produitId: number;
  clientNom: string;
  clientTelephone: string;
  quartier: string;
  quantite: number;
  message?: string;
  prixAttendu?: number;
}

export interface UpdateStatutCommandeInput {
  statut: StatutCommande;
}

// ─────────────────────────────────────────────────────────────────────────────
// Filtres (query params) — noms snake_case attendus par l'API
// ─────────────────────────────────────────────────────────────────────────────

export interface ProduitFilters {
  categorie_slug?: string;
  sous_categorie_slug?: string;
  q?: string;
}

export interface CommandeFilters {
  statut?: StatutCommande;
}

export interface SousCategorieFilters {
  categorieId?: number;
}
