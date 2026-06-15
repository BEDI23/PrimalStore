import * as v from "valibot";
import { validatePhoneTogo } from "./utils";

/**
 * Schémas de validation valibot partagés par les formulaires (react-hook-form).
 * Ces schémas sont la source de vérité de la validation côté client : ils sont
 * testés unitairement et réutilisés via `valibotResolver`.
 *
 * Règle : ne référence aucune API navigateur (File, FileList) au niveau module
 * pour rester exécutable en environnement Node (tests vitest). La validation des
 * fichiers reste gérée à part dans les composants concernés.
 */

const champRequis = (message: string) =>
  v.pipe(v.string(), v.trim(), v.minLength(1, message));

// Champ texte facultatif : chaîne trimée, vide autorisé. On évite v.optional()
// pour garder des types d'entrée/sortie identiques (compatibilité valibotResolver).
const texteOptionnel = v.pipe(v.string(), v.trim());

const entierPositif = (message: string) =>
  v.pipe(
    v.number(message),
    v.check((n) => Number.isFinite(n), message),
    v.integer(message),
    v.minValue(0, message)
  );

// --- Commande client -------------------------------------------------------
export const commandeSchema = v.object({
  client_nom: champRequis("Le nom complet est obligatoire."),
  client_telephone: v.pipe(
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
    v.minValue(1, "La quantité minimale est 1.")
  ),
  message: texteOptionnel,
});
export type CommandeFormValues = v.InferOutput<typeof commandeSchema>;

// --- Connexion admin -------------------------------------------------------
export const loginSchema = v.object({
  email: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, "L'email est obligatoire."),
    v.email("Adresse email invalide.")
  ),
  password: v.pipe(v.string(), v.minLength(1, "Le mot de passe est obligatoire.")),
});
export type LoginFormValues = v.InferOutput<typeof loginSchema>;

// --- Produit (admin) -------------------------------------------------------
export const produitSchema = v.object({
  categorie_id: champRequis("La catégorie est obligatoire."),
  nom: champRequis("Le nom est obligatoire."),
  description_courte: champRequis("La description courte est obligatoire."),
  description_complete: texteOptionnel,
  prix: entierPositif("Le prix doit être un nombre positif."),
  badge: texteOptionnel,
  actif: v.boolean(),
});
export type ProduitFormValues = v.InferOutput<typeof produitSchema>;

// --- Catégorie (admin) -----------------------------------------------------
export const categorieSchema = v.object({
  nom: champRequis("Le nom est obligatoire."),
});
export type CategorieFormValues = v.InferOutput<typeof categorieSchema>;

// --- Promotion (admin) -----------------------------------------------------
export const promotionSchema = v.object({
  produit_id: champRequis("Le produit est obligatoire."),
  prix_promo: entierPositif("Le prix promotionnel doit être un nombre positif."),
  date_fin: champRequis("La date de fin est obligatoire."),
  actif: v.boolean(),
});
export type PromotionFormValues = v.InferOutput<typeof promotionSchema>;
