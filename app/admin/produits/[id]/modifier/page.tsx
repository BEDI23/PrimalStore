"use client";

import { useProduitAdmin } from "@/lib/api/hooks/use-produits";
import ProduitForm from "@/components/admin/ProduitForm";

export default function ModifierProduitPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  const { data: produit } = useProduitAdmin(id, Number.isFinite(id));

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold text-gray-900">
        {produit?.nom ? `Modifier : ${produit.nom}` : "Modifier le produit"}
      </h2>
      <ProduitForm produitId={id} />
    </div>
  );
}
