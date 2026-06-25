import ProduitForm from "@/components/admin/ProduitForm";

export const dynamic = "force-dynamic";

export default function ModifierProduitPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div>
      <h2 className="mb-6 text-xl font-bold text-gray-900">
        Modifier le produit
      </h2>
      <ProduitForm produitId={Number(params.id)} />
    </div>
  );
}
