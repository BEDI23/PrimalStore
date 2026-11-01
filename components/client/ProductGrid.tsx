"use client";

import { useState } from "react";
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import type { Produit, Categorie } from "@/lib/api/types";
import ProductCard from "./ProductCard";
import ProductCardGrid from "./ProductCardGrid";
import EmptyState from "./EmptyState";

export default function ProductGrid({
  produits,
  categories,
  activeCategorieSlug,
}: {
  produits: Produit[];
  categories: Categorie[];
  activeCategorieSlug?: string;
}) {
  const [filtre, setFiltre] = useState<"tous" | "promo">("tous");

  const filtered =
    filtre === "promo" ? produits.filter((p) => p.promotion) : produits;

  const activeCategorie = categories.find((c) => c.slug === activeCategorieSlug);

  return (
    <div>
      <div className="mb-8 space-y-4">
        {categories.length > 0 && (
          <nav
            aria-label="Filtrer par catégorie"
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
          >
            <Link
              href="/produits"
              aria-current={!activeCategorieSlug ? "true" : undefined}
              className={`chip shrink-0 ${!activeCategorieSlug ? "bg-ink! text-white! border-transparent!" : ""}`}
            >
              Toutes catégories
            </Link>
            {categories.map((cat) => {
              const active = activeCategorieSlug === cat.slug;
              return (
                <Link
                  key={cat.id}
                  href={`/produits?categorie=${cat.slug}`}
                  aria-current={active ? "true" : undefined}
                  className={`chip shrink-0 ${active ? "bg-ink! text-white! border-transparent!" : ""}`}
                >
                  {cat.nom}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center justify-between gap-3">
          <div
            role="group"
            aria-label="Filtrer les produits"
            className="inline-flex rounded-xl bg-surface-subtle p-1"
          >
            {(
              [
                ["tous", "Tous"],
                ["promo", "En promotion"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setFiltre(id)}
                aria-pressed={filtre === id}
                className={`min-h-9 rounded-lg px-4 text-sm font-medium transition-colors duration-200 ${
                  filtre === id
                    ? "bg-white text-ink shadow-sm"
                    : "text-graphite hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-sm text-graphite" aria-live="polite">
            {filtered.length} produit{filtered.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="Aucun produit trouvé"
          description="Essayez un autre filtre ou parcourez toutes les catégories."
          action={
            <Link href="/categories" className="btn-secondary">
              Voir les catégories
            </Link>
          }
        />
      ) : (
        <ProductCardGrid>
          {filtered.map((produit) => (
            <ProductCard
              key={produit.id}
              produit={produit}
              categorie={activeCategorie?.nom}
            />
          ))}
        </ProductCardGrid>
      )}
    </div>
  );
}
