"use client";

import { useState } from "react";
import Link from "next/link";
import type { Produit, Categorie } from "@/lib/api/types";
import ProductCard from "./ProductCard";

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

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFiltre("tous")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            filtre === "tous"
              ? "bg-primary text-white"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          Tous
        </button>
        <button
          onClick={() => setFiltre("promo")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            filtre === "promo"
              ? "bg-primary text-white"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          En promotion
        </button>
      </div>

      {categories.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/produits"
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              !activeCategorieSlug
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            Toutes catégories
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/produits?categorie=${cat.slug}`}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                activeCategorieSlug === cat.slug
                  ? "bg-gray-800 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {cat.nom}
            </Link>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-gray-500">
          Aucun produit trouvé.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((produit) => (
            <ProductCard key={produit.id} produit={produit} />
          ))}
        </div>
      )}
    </div>
  );
}
