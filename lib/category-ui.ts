// Helpers UI partagés pour les catégories : map iconName → icône lucide,
// et génération des CSS vars de thème (--cat-*) pour thémer une page catégorie.
import {
  Heart,
  Shield,
  Sparkles,
  Pill,
  Flame,
  Gift,
  Leaf,
  Zap,
  Star,
  ShoppingBag,
  FlaskConical,
  Droplet,
  Droplets,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";
import type { IconName, CategorieTheme } from "@/lib/api/types";

/** Icône par défaut quand `iconName` est inconnue ou absente. */
export const FALLBACK_CATEGORY_ICON: LucideIcon = ShoppingBag;

/** Associe chaque iconName du backend à une icône lucide. */
export const CATEGORY_ICONS: Record<IconName, LucideIcon> = {
  heart: Heart,
  shield: Shield,
  sparkles: Sparkles,
  pill: Pill,
  flame: Flame,
  gift: Gift,
  leaf: Leaf,
  zap: Zap,
  star: Star,
  "shopping-bag": ShoppingBag,
  "flask-conical": FlaskConical,
  droplet: Droplet,
};

/**
 * Alias tolérants pour les drifts de seed côté backend (ex: `droplets` au pluriel
 * alors que le contrat OpenAPI déclare `droplet` au singulier).
 * Source canonique : `ICON_NAMES` dans `lib/api/types.ts`.
 */
const ICON_ALIASES: Record<string, LucideIcon> = {
  droplets: Droplets,
};

/**
 * Lookup tolérant : retourne l'icône lucide associée à `iconName`. Si la valeur
 * n'est pas dans la map canonique, tente un alias connu, sinon retourne
 * `FALLBACK_CATEGORY_ICON` pour éviter un crash runtime.
 */
export function getCategoryIcon(iconName: string | null | undefined): LucideIcon {
  if (!iconName) return FALLBACK_CATEGORY_ICON;
  return (
    (CATEGORY_ICONS as Record<string, LucideIcon | undefined>)[iconName] ??
    ICON_ALIASES[iconName] ??
    FALLBACK_CATEGORY_ICON
  );
}

/**
 * CSS variables `--cat-*` à poser (via `style`) sur un wrapper pour thémer la
 * page d'une catégorie selon son `theme`. Consommées par `bg-cat-primary`,
 * `text-cat-on`, `ring-cat-accent`, `.btn-cat`, `.chip-active`.
 */
export function categoryThemeVars(theme: CategorieTheme): CSSProperties {
  return {
    "--cat-primary": theme.primary,
    "--cat-hover": theme.primaryHover,
    "--cat-accent": theme.accent,
    "--cat-on": theme.onPrimary,
  } as CSSProperties;
}
