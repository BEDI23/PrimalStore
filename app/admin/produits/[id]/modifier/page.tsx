"use client";

import { use } from "react";
import { useProduitAdmin } from "@/lib/api/hooks/use-produits";
import { PackageOpen } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
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
      <AdminPageHeader
        title={produit?.nom ? `Modifier : ${produit.nom}` : "Modifier le produit"}
        icon={PackageOpen}
      />
      <ProduitForm produitId={id} />
    </div>
  );
}
