import Image from "next/image";
import Link from "next/link";
import type { Categorie } from "@/lib/api/types";
import { CATEGORY_ICONS } from "@/lib/category-ui";

interface CategoryCardProps {
  categorie: Categorie;
}

export default function CategoryCard({ categorie }: CategoryCardProps) {
  const Icon = CATEGORY_ICONS[categorie.iconName];

  return (
    <Link
      href={`/categories/${categorie.slug}`}
      className="group relative block overflow-hidden rounded-2xl shadow-sm transition hover:shadow-lg focus-within:ring-2 focus-within:ring-primary"
      aria-label={categorie.nom}
    >
      {/* Cover image — ratio 4/3 */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={categorie.coverImageUrl || "/images/placeholder-produit.svg"}
          alt={categorie.nom}
          fill
          className="object-cover transition duration-200 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Ink gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />

        {/* Icon chip — top-left */}
        <div className="absolute left-3 top-3 rounded-xl bg-white/15 p-2 backdrop-blur">
          <Icon className="h-5 w-5 text-white" strokeWidth={1.75} aria-hidden="true" />
        </div>

        {/* 18+ badge — top-right */}
        {categorie.isAdult && (
          <span className="absolute right-3 top-3 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
            18+
          </span>
        )}

        {/* Category name + optional description — bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="font-display text-lg font-bold text-white leading-tight">
            {categorie.nom}
          </p>
          {categorie.description && (
            <p className="mt-0.5 line-clamp-1 text-sm text-white/80">
              {categorie.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
