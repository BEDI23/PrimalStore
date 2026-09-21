import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";

/**
 * Repli visuel intentionnel quand une image est absente : fond charbon ou
 * ivoire, léger halo de la couleur de la catégorie et grande icône discrète.
 * Remplit son conteneur (`position: relative` requis).
 */
export default function ImageFallback({
  icon: Icon,
  tint,
  tone = "dark",
  label,
}: {
  icon: LucideIcon;
  /** Couleur (CSS) du halo, ex. thème de la catégorie */
  tint?: string;
  tone?: "dark" | "light";
  /** Libellé accessible (ex. nom du produit) */
  label?: string;
}) {
  const dark = tone === "dark";
  const style: CSSProperties = {
    backgroundImage: tint
      ? `radial-gradient(120% 90% at 15% 0%, color-mix(in srgb, ${tint} ${dark ? 38 : 22}%, transparent), transparent 62%)`
      : undefined,
  };

  return (
    <div
      role="img"
      aria-label={label ?? "Image à venir"}
      style={style}
      className={`absolute inset-0 flex items-center justify-center ${
        dark
          ? "bg-ink-soft text-white/25"
          : "bg-surface-subtle text-graphite-light"
      }`}
    >
      <Icon
        className="h-1/4 w-1/4 max-h-24 max-w-24 min-h-8 min-w-8"
        strokeWidth={1.25}
        aria-hidden="true"
      />
    </div>
  );
}
