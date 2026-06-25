import ProduitForm from "@/components/admin/ProduitForm";

export const dynamic = "force-dynamic";

export default function NouveauProduitPage() {
  return (
    <div>
      <h2 className="mb-6 text-xl font-bold text-gray-900">
        Ajouter un produit
      </h2>
      <ProduitForm />
    </div>
  );
}
