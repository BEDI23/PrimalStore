// Schémas valibot des formulaires réactifs branchés sur l'API NestJS v3.
// Style aligné sur lib/schemas.ts (namespace `v`, helpers, messages FR).
// Consommés via `valibotResolver(schema)` de react-hook-form.
import * as v from "valibot";
import { validatePhoneTogo } from "@/lib/utils";
import { ICON_NAMES } from "@/lib/api/types";

// ─────────────────────────────────────────────────────────────────────────────
// Regex partagées (miroir des DTO class-validator côté backend)
// ─────────────────────────────────────────────────────────────────────────────

const HEX = /^#[0-9a-fA-F]{6}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HTTP_URL = /^https?:\/\/.+/i;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const champRequis = (message: string) =>
  v.pipe(v.string(), v.trim(), v.minLength(1, message));

const texteOptionnel = v.optional(v.pipe(v.string(), v.trim()), "");

const champOptionnelMax = (max: number, message: string) =>
  v.optional(v.pipe(v.string(), v.trim(), v.maxLength(max, message)), "");

const nomBorne = (min: number, max: number, message: string) =>
  v.pipe(v.string(), v.trim(), v.minLength(min, message), v.maxLength(max, message));

const entierMin = (min: number, message: string) =>
  v.pipe(
    v.number(message),
    v.check((n) => Number.isFinite(n), message),
    v.integer(message),
    v.minValue(min, message)
  );

const slugRequis = v.pipe(
  v.string(),
  v.trim(),
  v.minLength(1, "Le slug est obligatoire."),
  v.regex(SLUG, "Slug invalide : minuscules, chiffres et tirets uniquement.")
);

const slugOptionnel = v.optional(
  v.pipe(
    v.string(),
    v.trim(),
    v.check(
      (s) => s === "" || SLUG.test(s),
      "Slug invalide : minuscules, chiffres et tirets uniquement."
    )
  ),
  ""
);

const urlRequise = (message: string) =>
  v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, message),
    v.regex(HTTP_URL, "URL invalide (doit commencer par http:// ou https://).")
  );

const urlOptionnelle = v.optional(
  v.pipe(
    v.string(),
    v.trim(),
    v.check(
      (s) => s === "" || HTTP_URL.test(s),
      "URL invalide (doit commencer par http:// ou https://)."
    )
  ),
  ""
);

const couleurHex = (label: string) =>
  v.pipe(
    v.string(),
    v.trim(),
    v.regex(HEX, `${label} : couleur hexadécimale attendue (#RRGGBB).`)
  );

// ─────────────────────────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────────────────────────

export const loginSchema = v.object({
  email: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, "L'email est obligatoire."),
    v.email("Adresse email invalide.")
  ),
  password: v.pipe(v.string(), v.minLength(1, "Le mot de passe est obligatoire.")),
});
export type LoginFormValues = v.InferInput<typeof loginSchema>;

export const userSchema = v.object({
  email: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, "L'email est obligatoire."),
    v.email("Adresse email invalide.")
  ),
  password: v.pipe(
    v.string(),
    v.minLength(8, "Le mot de passe doit faire au moins 8 caractères."),
    v.maxLength(128, "Le mot de passe ne peut dépasser 128 caractères.")
  ),
  role: v.optional(v.picklist(["admin"] as const, "Rôle invalide."), "admin"),
});
export type UserFormValues = v.InferInput<typeof userSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Thème + Catégorie
// ─────────────────────────────────────────────────────────────────────────────

export const themeSchema = v.object({
  primary: couleurHex("Couleur primaire"),
  primaryHover: couleurHex("Couleur primaire (survol)"),
  onPrimary: couleurHex("Couleur sur fond primaire"),
  secondary: couleurHex("Couleur secondaire"),
  accent: couleurHex("Couleur d'accent"),
});
export type ThemeFormValues = v.InferInput<typeof themeSchema>;

export const categorieSchema = v.object({
  nom: nomBorne(2, 64, "Le nom doit faire entre 2 et 64 caractères."),
  slug: slugRequis,
  description: champOptionnelMax(
    280,
    "La description ne peut dépasser 280 caractères."
  ),
  theme: themeSchema,
  iconName: v.picklist(ICON_NAMES, "Icône invalide."),
  coverImageUrl: urlRequise("L'image de couverture est obligatoire."),
  isAdult: v.boolean(),
  position: entierMin(0, "La position doit être un entier positif ou nul."),
  actif: v.boolean(),
});
export type CategorieFormValues = v.InferInput<typeof categorieSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Sous-catégorie
// ─────────────────────────────────────────────────────────────────────────────

export const sousCategorieSchema = v.object({
  categorieId: entierMin(1, "La catégorie parente est obligatoire."),
  nom: nomBorne(2, 64, "Le nom doit faire entre 2 et 64 caractères."),
  slug: slugRequis,
  description: champOptionnelMax(
    280,
    "La description ne peut dépasser 280 caractères."
  ),
  position: entierMin(0, "La position doit être un entier positif ou nul."),
  actif: v.boolean(),
});
export type SousCategorieFormValues = v.InferInput<typeof sousCategorieSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Produit
// ─────────────────────────────────────────────────────────────────────────────

export const produitSchema = v.object({
  nom: nomBorne(2, 120, "Le nom doit faire entre 2 et 120 caractères."),
  slug: slugOptionnel,
  prix: entierMin(1, "Le prix doit être un entier ≥ 1 (FCFA)."),
  descriptionCourte: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, "La description courte est obligatoire."),
    v.maxLength(280, "La description courte ne peut dépasser 280 caractères.")
  ),
  descriptionLongue: champRequis("La description longue est obligatoire."),
  badge: champOptionnelMax(40, "Le badge ne peut dépasser 40 caractères."),
  imageUrl: urlRequise("L'image du produit est obligatoire."),
  videoUrl: urlOptionnelle,
  sousCategorieId: entierMin(1, "La sous-catégorie est obligatoire."),
  actif: v.boolean(),
});
export type ProduitFormValues = v.InferInput<typeof produitSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Promotion
// ─────────────────────────────────────────────────────────────────────────────

export const promotionSchema = v.object({
  produitId: entierMin(1, "Le produit est obligatoire."),
  prixPromo: entierMin(1, "Le prix promotionnel doit être un entier ≥ 1 (FCFA)."),
  dateFin: champRequis("La date de fin est obligatoire."),
  actif: v.boolean(),
});
export type PromotionFormValues = v.InferInput<typeof promotionSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Commande (formulaire public client)
// ─────────────────────────────────────────────────────────────────────────────

export const commandeSchema = v.object({
  produitId: entierMin(1, "Le produit est invalide."),
  clientNom: champRequis("Le nom complet est obligatoire."),
  clientTelephone: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, "Le téléphone est obligatoire."),
    v.check(validatePhoneTogo, "Numéro invalide. Format attendu : +228XXXXXXXX")
  ),
  quartier: champRequis("Le quartier de livraison est obligatoire."),
  quantite: v.pipe(
    v.number("La quantité est invalide."),
    v.check((n) => Number.isFinite(n), "La quantité est invalide."),
    v.integer("La quantité doit être un entier."),
    v.minValue(1, "La quantité minimale est 1."),
    v.maxValue(1000, "La quantité maximale est 1000.")
  ),
  message: texteOptionnel,
});
export type CommandeFormValues = v.InferInput<typeof commandeSchema>;
