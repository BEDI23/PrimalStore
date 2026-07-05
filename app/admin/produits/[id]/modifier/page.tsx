"use client";

import { use } from "react";
import { useProduitAdmin } from "@/lib/api/hooks/use-produits";
import ProduitForm from "@/components/admin/ProduitForm";

export default function ModifierProduitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = use(params);
  const id = Number(idParam);
  const { data: produit } = useProduitAdmin(id, Number.isFinite(id));

  return (
    <div>
      <h2 className="mb-6 font-display text-xl font-bold text-ink">
        {produit?.nom ? `Modifier : ${produit.nom}` : "Modifier le produit"}
      </h2>
      <ProduitForm produitId={id} />
    </div>
  );
}
