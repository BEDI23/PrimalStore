import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Categorie } from "@/lib/api/types";
import { getCategoryIcon } from "@/lib/category-ui";
import { hasRealImage } from "@/lib/images";
import ImageFallback from "./ImageFallback";
import SmartImage from "./SmartImage";

interface CategoryCardProps {
  categorie: Categorie;
  /** Charge l'image en priorité (au-dessus de la ligne de flottaison) */
  priority?: boolean;
}

export default function CategoryCard({
  categorie,
  priority = false,
}: CategoryCardProps) {
  const Icon = getCategoryIcon(categorie.iconName);
  const cover = hasRealImage(categorie.coverImageUrl)
    ? categorie.coverImageUrl
    : null;

  return (
    <Link
      href={`/categories/${categorie.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-soft-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      aria-label={categorie.nom}
    >
      {/* Image : affichée nette, sans voile ni texte par-dessus */}
      <div className="relative aspect-square overflow-hidden bg-surface-subtle sm:aspect-[4/3]">
        <SmartImage
          src={cover}
          alt=""
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          fallback={
            <ImageFallback icon={Icon} tint={categorie.theme?.primary} />
          }
        />

        {/* Léger voile en haut uniquement, pour la lisibilité des pastilles */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-ink/25 to-transparent" />

        <span className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-white/95 text-ink shadow-sm sm:left-3 sm:top-3 sm:h-9 sm:w-9">
          <Icon className="h-3.5 w-3.5 sm:h-[18px] sm:w-[18px]" strokeWidth={1.75} aria-hidden="true" />
        </span>

        {categorie.isAdult && (
          <span className="absolute right-2 top-2 rounded-md bg-ink/85 px-1.5 py-0.5 text-[11px] font-semibold text-white sm:right-3 sm:top-3 sm:px-2 sm:py-1 sm:text-xs">
            18+
          </span>
        )}
      </div>

      {/* Nom, description, indication de clic */}
      <div className="flex flex-1 items-start justify-between gap-2 p-3 sm:gap-3 sm:p-5">
        <div className="min-w-0">
          <p className="line-clamp-2 break-words font-display text-sm font-semibold leading-tight text-ink sm:text-xl">
            {categorie.nom}
          </p>
          {categorie.description && (
            <p className="mt-1 line-clamp-2 text-xs text-graphite sm:text-sm">
              {categorie.description}
            </p>
          )}
        </div>
        <span
          className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-ink transition-colors duration-200 group-hover:bg-primary group-hover:text-white sm:flex"
          aria-hidden="true"
        >
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
