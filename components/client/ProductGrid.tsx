"use client";

import { useState } from "react";
import { Categorie, ProduitAvecPromo } from "@/lib/types";
import ProductCard from "./ProductCard";

export default function ProductGrid({
  produits,
  categories,
}: {
  produits: ProduitAvecPromo[];
  categories: Categorie[];
}) {
  const [filtre, setFiltre] = useState<"tous" | "promo">("tous");
  const [categorieId, setCategorieId] = useState<string>("toutes");

  let filtered = filtre === "promo" ? produits.filter((p) => p.enPromo) : produits;

  if (categorieId !== "toutes") {
    filtered = filtered.filter((p) => p.categorie_id === categorieId);
  }

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
          <button
            onClick={() => setCategorieId("toutes")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              categorieId === "toutes"
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            Toutes catégories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategorieId(cat.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                categorieId === cat.id
                  ? "bg-gray-800 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {cat.nom}
            </button>
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
