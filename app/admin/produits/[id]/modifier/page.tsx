import { notFound } from "next/navigation";
import ProduitForm from "@/components/admin/ProduitForm";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ModifierProduitPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const [categories, { data: produit, error }] = await Promise.all([
    getCategories(),
    supabase.from("produits").select("*").eq("id", params.id).single(),
  ]);

  if (error || !produit) notFound();

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold text-gray-900">
        Modifier : {produit.nom}
      </h2>
      <ProduitForm produit={produit} categories={categories} />
    </div>
  );
}
