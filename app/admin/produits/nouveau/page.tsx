import ProduitForm from "@/components/admin/ProduitForm";
import { getCategories } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function NouveauProduitPage() {
  const categories = await getCategories();

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold text-gray-900">
        Ajouter un produit
      </h2>
      <ProduitForm categories={categories} />
    </div>
  );
}
