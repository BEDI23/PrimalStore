"use client";

import Link from "next/link";
import type { SousCategorie } from "@/lib/api/types";

interface FilterChipsProps {
  categorieSlug: string;
  sousCategories: SousCategorie[];
  activeSlug?: string;
}

export default function FilterChips({
  categorieSlug,
  sousCategories,
  activeSlug,
}: FilterChipsProps) {
  const actives = sousCategories
    .filter((sc) => sc.actif)
    .sort((a, b) => a.position - b.position);

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1"
      role="list"
      aria-label="Filtrer par sous-catégorie"
    >
      {/* Chip « Tout » */}
      <Link
        href={`/categories/${categorieSlug}`}
        role="listitem"
        className={[
          "chip shrink-0 min-h-[36px] focus:outline-none focus:ring-2 focus:ring-cat-accent focus:ring-offset-2",
          !activeSlug ? "chip-active" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-current={!activeSlug ? "true" : undefined}
      >
        Tout
      </Link>

      {actives.map((sc) => {
        const isActive = activeSlug === sc.slug;
        return (
          <Link
            key={sc.id}
            href={`/categories/${categorieSlug}?sous_categorie=${sc.slug}`}
            role="listitem"
            className={[
              "chip shrink-0 min-h-[36px] focus:outline-none focus:ring-2 focus:ring-cat-accent focus:ring-offset-2",
              isActive ? "chip-active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-current={isActive ? "true" : undefined}
          >
            {sc.nom}
          </Link>
        );
      })}
    </div>
  );
}
