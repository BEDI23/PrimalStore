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
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";
import type { IconName, CategorieTheme } from "@/lib/api/types";

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
